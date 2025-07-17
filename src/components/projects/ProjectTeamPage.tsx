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
import { Textarea } from "@/components/ui/textarea";
import { Trash2, UserPlus, Mail, Settings, Shield, Users, Clock, UserX, Edit3 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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
  // Additional profile information we'll fetch separately
  profile?: {
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
    professional_title?: string;
    phone?: string;
    skills?: string[];
  };
}

interface ManualMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  professionalTitle?: string;
  skills?: string[];
  notes?: string;
  addedAt: string;
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
  
  // Manual member addition state
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [manualMembers, setManualMembers] = useState<ManualMember[]>([]);
  const [memberForm, setMemberForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "member",
    professionalTitle: "",
    skills: "",
    notes: ""
  });

  // Fetch team members with profile information
  const { data: teamMembers, isLoading } = useQuery({
    queryKey: ["project-team-members", project.id],
    queryFn: async () => {
      // First get project members
      const { data: members, error: membersError } = await supabase
        .from("project_members")
        .select("*")
        .eq("project_id", project.id)
        .order("joined_at", { ascending: false });

      if (membersError) {
        console.error("Error fetching team members:", membersError);
        throw membersError;
      }

      // Then get profile information for each member
      const membersWithProfiles = await Promise.all(
        (members || []).map(async (member) => {
          if (member.user_id) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("first_name, last_name, avatar_url, professional_title, phone, skills")
              .eq("user_id", member.user_id)
              .single();
            
            return { ...member, profile };
          }
          return member;
        })
      );

      return membersWithProfiles as TeamMember[];
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
      toast({
        title: "Success",
        description: "Team member invited successfully",
      });
      setIsInviteDialogOpen(false);
      setInviteEmail("");
      setInviteRole("member");
      queryClient.invalidateQueries({ queryKey: ["project-team-members", project.id] });
    },
    onError: (error) => {
      console.error("Error inviting member:", error);
      toast({
        title: "Error",
        description: "Failed to invite member",
        variant: "destructive",
      });
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
      toast({
        title: "Success",
        description: "Team member removed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["project-team-members", project.id] });
    },
    onError: (error) => {
      console.error("Error removing member:", error);
      toast({
        title: "Error", 
        description: "Failed to remove member",
        variant: "destructive",
      });
    }
  });

  const handleInviteMember = () => {
    if (!inviteEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    inviteMemberMutation.mutate({
      email: inviteEmail.trim(),
      role: inviteRole
    });
  };

  // Manual member handlers
  const handleAddManualMember = () => {
    if (!memberForm.firstName.trim() || !memberForm.lastName.trim() || !memberForm.email.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields (First Name, Last Name, Email)",
        variant: "destructive",
      });
      return;
    }

    const newMember: ManualMember = {
      id: crypto.randomUUID(),
      firstName: memberForm.firstName.trim(),
      lastName: memberForm.lastName.trim(),
      email: memberForm.email.trim(),
      phone: memberForm.phone.trim() || undefined,
      role: memberForm.role,
      professionalTitle: memberForm.professionalTitle.trim() || undefined,
      skills: memberForm.skills.trim() ? memberForm.skills.split(',').map(s => s.trim()) : undefined,
      notes: memberForm.notes.trim() || undefined,
      addedAt: new Date().toISOString()
    };

    setManualMembers(prev => [...prev, newMember]);
    setMemberForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "member",
      professionalTitle: "",
      skills: "",
      notes: ""
    });
    setIsAddMemberDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Team member details added. You can send invitations later.",
    });
  };

  const handleRemoveManualMember = (memberId: string) => {
    setManualMembers(prev => prev.filter(m => m.id !== memberId));
    toast({
      title: "Success",
      description: "Manual member entry removed",
    });
  };

  const handleSendInvitesToManualMembers = () => {
    manualMembers.forEach(member => {
      inviteMemberMutation.mutate({
        email: member.email,
        role: member.role
      });
    });
    
    // Clear manual members after sending invites
    setManualMembers([]);
    
    toast({
      title: "Success",
      description: `Invitations sent to ${manualMembers.length} team members`,
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
    if (member.profile?.first_name || member.profile?.last_name) {
      return `${member.profile.first_name || ''} ${member.profile.last_name || ''}`.trim();
    }
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
        
        <div className="flex gap-2">
          <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Edit3 className="w-4 h-4" />
                Add Members
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Team Member Details</DialogTitle>
                <DialogDescription>
                  Manually enter team member details. You can send invitations later.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={memberForm.firstName}
                      onChange={(e) => setMemberForm({...memberForm, firstName: e.target.value})}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={memberForm.lastName}
                      onChange={(e) => setMemberForm({...memberForm, lastName: e.target.value})}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="memberEmail">Email Address *</Label>
                    <Input
                      id="memberEmail"
                      type="email"
                      value={memberForm.email}
                      onChange={(e) => setMemberForm({...memberForm, email: e.target.value})}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={memberForm.phone}
                      onChange={(e) => setMemberForm({...memberForm, phone: e.target.value})}
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="memberRole">Role</Label>
                    <Select value={memberForm.role} onValueChange={(value) => setMemberForm({...memberForm, role: value})}>
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
                  <div>
                    <Label htmlFor="professionalTitle">Professional Title</Label>
                    <Input
                      id="professionalTitle"
                      value={memberForm.professionalTitle}
                      onChange={(e) => setMemberForm({...memberForm, professionalTitle: e.target.value})}
                      placeholder="e.g., Senior Engineer"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="skills">Skills</Label>
                  <Input
                    id="skills"
                    value={memberForm.skills}
                    onChange={(e) => setMemberForm({...memberForm, skills: e.target.value})}
                    placeholder="Enter skills separated by commas"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={memberForm.notes}
                    onChange={(e) => setMemberForm({...memberForm, notes: e.target.value})}
                    placeholder="Any additional notes about this team member"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddMemberDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddManualMember}>
                  Add Member Details
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

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
      </div>

      {/* Manual Members Section */}
      {manualMembers.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Draft Members</CardTitle>
                <CardDescription>
                  Team members added manually. Send invitations when ready.
                </CardDescription>
              </div>
              <Button onClick={handleSendInvitesToManualMembers} className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Send Invitations ({manualMembers.length})
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {manualMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback>
                        {member.firstName[0]}{member.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{member.firstName} {member.lastName}</h4>
                        <Badge variant="outline">Draft</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        {member.email}
                      </div>
                      {member.professionalTitle && (
                        <div className="text-sm text-muted-foreground">
                          {member.professionalTitle}
                        </div>
                      )}
                      {member.phone && (
                        <div className="text-sm text-muted-foreground">
                          📞 {member.phone}
                        </div>
                      )}
                      {member.skills && member.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {member.skills.slice(0, 3).map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {member.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{member.skills.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getRoleIcon(member.role)}
                      <Badge variant="outline" className="capitalize">
                        {member.role}
                      </Badge>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveManualMember(member.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <UserX className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(teamMembers?.length || 0) + manualMembers.length}</div>
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
              {(teamMembers?.filter(m => m.status === 'pending').length || 0) + manualMembers.length}
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
                      <AvatarImage src={member.profile?.avatar_url || undefined} />
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
                      {member.profile?.professional_title && (
                        <div className="text-sm text-muted-foreground">
                          {member.profile.professional_title}
                        </div>
                      )}
                      {member.profile?.phone && (
                        <div className="text-sm text-muted-foreground">
                          📞 {member.profile.phone}
                        </div>
                      )}
                      {member.profile?.skills && member.profile.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {member.profile.skills.slice(0, 3).map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {member.profile.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{member.profile.skills.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
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