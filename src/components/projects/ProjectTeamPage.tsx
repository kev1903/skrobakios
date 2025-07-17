import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/hooks/useProjects";
import { useCompany } from "@/contexts/CompanyContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, UserPlus, Mail, Settings, Shield, Users, Clock } from "lucide-react";
import { toast } from "sonner";

interface ProjectTeamPageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

interface TeamMember {
  id: string;
  user_id: string | null;
  email: string | null;
  role: string;
  status: string;
  invited_at: string | null;
  joined_at: string | null;
  created_at: string;
  updated_at: string;
  project_id: string;
  permissions: any;
  invited_by: string;
}

const roleOptions = [
  { value: 'owner', label: 'Owner', description: 'Full access to project' },
  { value: 'manager', label: 'Manager', description: 'Can manage tasks and team' },
  { value: 'member', label: 'Member', description: 'Can view and edit tasks' },
  { value: 'viewer', label: 'Viewer', description: 'Can only view project' }
];

export const ProjectTeamPage = ({ project, onNavigate }: ProjectTeamPageProps) => {
  const { currentCompany } = useCompany();
  const queryClient = useQueryClient();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");

  // Fetch team members
  const { data: teamMembers, isLoading } = useQuery({
    queryKey: ["project-team-members", project.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_members")
        .select("*")
        .eq("project_id", project.id)
        .order("joined_at", { ascending: false });

      if (error) {
        console.error("Error fetching team members:", error);
        throw error;
      }

      return data;
    },
    enabled: !!project.id
  });

  // Invite member mutation
  const inviteMemberMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      const { data, error } = await supabase
        .from("project_invitations")
        .insert({
          project_id: project.id,
          email,
          role,
          invited_by: (await supabase.auth.getUser()).data.user?.id || "",
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          token: crypto.randomUUID()
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Team member invited successfully");
      setIsInviteDialogOpen(false);
      setInviteEmail("");
      setInviteRole("member");
      queryClient.invalidateQueries({ queryKey: ["project-team-members", project.id] });
    },
    onError: (error) => {
      console.error("Error inviting member:", error);
      toast.error("Failed to invite member");
    }
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from("project_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Team member removed successfully");
      queryClient.invalidateQueries({ queryKey: ["project-team-members", project.id] });
    },
    onError: (error) => {
      console.error("Error removing member:", error);
      toast.error("Failed to remove member");
    }
  });

  const handleInviteMember = () => {
    if (!inviteEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    inviteMemberMutation.mutate({
      email: inviteEmail.trim(),
      role: inviteRole
    });
  };

  const getStatusBadge = (member: TeamMember) => {
    switch (member.status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'inactive':
        return <Badge variant="outline">Inactive</Badge>;
      default:
        return <Badge variant="outline">{member.status}</Badge>;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Shield className="w-4 h-4" />;
      case 'manager':
        return <Settings className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getMemberDisplayName = (member: TeamMember) => {
    return member.email || 'Unknown User';
  };

  const getInitials = (member: TeamMember) => {
    const name = getMemberDisplayName(member);
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Team Management</h1>
          <p className="text-muted-foreground">Manage project team members and their roles</p>
        </div>
        
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Invite a new member to join this project team.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex flex-col">
                          <span>{option.label}</span>
                          <span className="text-xs text-muted-foreground">{option.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleInviteMember}
                disabled={inviteMemberMutation.isPending}
              >
                {inviteMemberMutation.isPending ? "Inviting..." : "Send Invitation"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMembers?.length || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <Badge variant="default" className="w-3 h-3 p-0 bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamMembers?.filter(m => m.status === 'active').length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invites</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamMembers?.filter(m => m.status === 'pending').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Current members and their roles in this project
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!teamMembers || teamMembers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No team members yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by inviting team members to collaborate on this project.
              </p>
              <Button onClick={() => setIsInviteDialogOpen(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Invite First Member
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={undefined} />
                      <AvatarFallback>{getInitials(member)}</AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{getMemberDisplayName(member)}</h4>
                        {getStatusBadge(member)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        {member.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getRoleIcon(member.role)}
                      <Badge variant="outline" className="capitalize">
                        {member.role}
                      </Badge>
                    </div>

                    {member.role !== 'owner' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMemberMutation.mutate(member.id)}
                        disabled={removeMemberMutation.isPending}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};