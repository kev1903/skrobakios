
import { useState, useEffect } from "react";
import { Users, UserPlus, Mail, Phone, MoreVertical, Shield, User, Settings, Eye, FileText, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ProjectSidebar } from "./ProjectSidebar";
import { Project } from "@/hooks/useProjects";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProjectTeamPageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

interface TeamMember {
  id: string;
  email: string;
  name?: string;
  role: 'project_admin' | 'editor' | 'viewer' | 'guest';
  status: 'active' | 'pending' | 'inactive';
  invited_at: string;
  joined_at?: string;
  notify_on_task_added?: boolean;
  avatar_url?: string;
}

interface ProjectAccessSettings {
  access_level: 'private_to_members' | 'public' | 'restricted';
  allow_member_invites: boolean;
  require_approval_for_join: boolean;
}

export const ProjectTeamPage = ({ project, onNavigate }: ProjectTeamPageProps) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [accessSettings, setAccessSettings] = useState<ProjectAccessSettings>({
    access_level: 'private_to_members',
    allow_member_invites: true,
    require_approval_for_join: false
  });
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    role: "viewer" as const
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchTeamMembers();
    fetchAccessSettings();
  }, [project.id]);

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('project_id', project.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast({
        title: "Error",
        description: "Failed to load team members",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAccessSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('project_access_settings')
        .select('*')
        .eq('project_id', project.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setAccessSettings({
          access_level: data.access_level,
          allow_member_invites: data.allow_member_invites || true,
          require_approval_for_join: data.require_approval_for_join || false
        });
      }
    } catch (error) {
      console.error('Error fetching access settings:', error);
    }
  };

  const handleInviteMember = async () => {
    if (!inviteForm.name || !inviteForm.email || !inviteForm.role) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('team_members')
        .insert([{
          project_id: project.id,
          email: inviteForm.email,
          name: inviteForm.name,
          role: inviteForm.role,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;

      setTeamMembers([data, ...teamMembers]);
      setInviteForm({ name: "", email: "", role: "viewer" });
      setIsInviteDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Team member invited successfully"
      });
    } catch (error: any) {
      console.error('Error inviting member:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to invite team member",
        variant: "destructive"
      });
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      setTeamMembers(teamMembers.filter(member => member.id !== memberId));
      toast({
        title: "Success",
        description: "Team member removed successfully"
      });
    } catch (error: any) {
      console.error('Error removing member:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove team member",
        variant: "destructive"
      });
    }
  };

  const updateMemberRole = async (memberId: string, newRole: TeamMember['role']) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;

      setTeamMembers(teamMembers.map(member => 
        member.id === memberId ? { ...member, role: newRole } : member
      ));
      
      toast({
        title: "Success",
        description: "Member role updated successfully"
      });
    } catch (error: any) {
      console.error('Error updating member role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update member role",
        variant: "destructive"
      });
    }
  };

  const updateAccessSettings = async (settings: Partial<ProjectAccessSettings>) => {
    try {
      const updatedSettings = { ...accessSettings, ...settings };
      
      const { error } = await supabase
        .from('project_access_settings')
        .upsert({
          project_id: project.id,
          access_level: updatedSettings.access_level,
          allow_member_invites: updatedSettings.allow_member_invites,
          require_approval_for_join: updatedSettings.require_approval_for_join
        });

      if (error) throw error;

      setAccessSettings(updatedSettings);
      toast({
        title: "Success",
        description: "Access settings updated successfully"
      });
    } catch (error: any) {
      console.error('Error updating access settings:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update access settings",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-700 bg-green-100 border-green-200";
      case "in_progress":
        return "text-blue-700 bg-blue-100 border-blue-200";
      case "pending":
        return "text-yellow-700 bg-yellow-100 border-yellow-200";
      default:
        return "text-gray-700 bg-gray-100 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'project_admin':
        return Shield;
      case 'editor':
        return FileText;
      case 'viewer':
        return Eye;
      case 'guest':
        return Clock;
      default:
        return User;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'project_admin':
        return 'bg-purple-100 text-purple-800';
      case 'editor':
        return 'bg-blue-100 text-blue-800';
      case 'viewer':
        return 'bg-green-100 text-green-800';
      case 'guest':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex bg-gray-50">
        <ProjectSidebar
          project={project}
          onNavigate={onNavigate}
          getStatusColor={getStatusColor}
          getStatusText={getStatusText}
          activeSection="team"
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading team members...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <ProjectSidebar
        project={project}
        onNavigate={onNavigate}
        getStatusColor={getStatusColor}
        getStatusText={getStatusText}
        activeSection="team"
      />
      
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
              <p className="text-gray-600">Manage project team members and their roles</p>
            </div>
            
            <div className="flex space-x-2">
              <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Project Access Settings</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="access-level">Access Level</Label>
                      <Select
                        value={accessSettings.access_level}
                        onValueChange={(value: any) => updateAccessSettings({ access_level: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="private_to_members">Private to Members</SelectItem>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="restricted">Restricted</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="allow-invites">Allow Member Invites</Label>
                      <Switch
                        id="allow-invites"
                        checked={accessSettings.allow_member_invites}
                        onCheckedChange={(checked) => updateAccessSettings({ allow_member_invites: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="require-approval">Require Approval for Join</Label>
                      <Switch
                        id="require-approval"
                        checked={accessSettings.require_approval_for_join}
                        onCheckedChange={(checked) => updateAccessSettings({ require_approval_for_join: checked })}
                      />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center space-x-2">
                    <UserPlus className="w-4 h-4" />
                    <span>Invite Member</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        value={inviteForm.name}
                        onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={inviteForm.email}
                        onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Role *</Label>
                      <Select value={inviteForm.role} onValueChange={(value: any) => setInviteForm({ ...inviteForm, role: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="project_admin">Project Admin</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="guest">Guest</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleInviteMember}>
                        Send Invite
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Team Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Members</p>
                    <p className="text-2xl font-bold text-gray-900">{teamMembers.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Shield className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Members</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {teamMembers.filter(m => m.status === 'active').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <UserPlus className="w-8 h-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pending Invites</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {teamMembers.filter(m => m.status === 'pending').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Settings className="w-8 h-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Access Level</p>
                    <p className="text-lg font-semibold text-gray-900 capitalize">
                      {accessSettings.access_level.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Team Members List */}
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              {teamMembers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No team members yet. Start by inviting someone!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {teamMembers.map((member) => {
                    const RoleIcon = getRoleIcon(member.role);
                    return (
                      <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage src={member.avatar_url} />
                            <AvatarFallback>
                              {member.name ? member.name.split(' ').map(n => n[0]).join('') : member.email[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-gray-900">{member.name || member.email}</h3>
                              <Badge className={getStatusBadgeColor(member.status)}>
                                {member.status}
                              </Badge>
                              <Badge className={getRoleBadgeColor(member.role)}>
                                {member.role.replace('_', ' ')}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                              <div className="flex items-center space-x-1">
                                <RoleIcon className="w-4 h-4" />
                                <span className="capitalize">{member.role.replace('_', ' ')}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Mail className="w-4 h-4" />
                                <span>{member.email}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>Invited {new Date(member.invited_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => updateMemberRole(member.id, 'project_admin')}>
                              Make Project Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateMemberRole(member.id, 'editor')}>
                              Make Editor
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateMemberRole(member.id, 'viewer')}>
                              Make Viewer
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateMemberRole(member.id, 'guest')}>
                              Make Guest
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => removeMember(member.id)}
                            >
                              Remove Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
