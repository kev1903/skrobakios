import { useState, useEffect } from "react";
import { Users, UserPlus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ProjectSidebar } from "./ProjectSidebar";
import { Project } from "@/hooks/useProjects";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TeamMembersList } from "./team/TeamMembersList";
import { TeamStatistics } from "./team/TeamStatistics";
import { InviteMemberDialog } from "./team/InviteMemberDialog";
import { AccessSettingsDialog } from "./team/AccessSettingsDialog";

interface ProjectTeamPageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

interface TeamMember {
  id: string;
  email: string;
  name?: string;
  role: 'project_admin' | 'editor' | 'viewer' | 'guest';
  status: string;
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

  const handleInviteMember = async (inviteData: { name: string; email: string; role: TeamMember['role'] }) => {
    try {
      // First, create the invitation token
      const { data: invitationData, error: invitationError } = await supabase
        .from('team_invitations')
        .insert([{
          project_id: project.id,
          email: inviteData.email,
          invited_by_email: 'current-user@example.com' // TODO: Replace with actual user email when auth is implemented
        }])
        .select()
        .single();

      if (invitationError) throw invitationError;

      // Then, create the team member record with pending status
      const { data: memberData, error: memberError } = await supabase
        .from('team_members')
        .insert([{
          project_id: project.id,
          email: inviteData.email,
          name: inviteData.name,
          role: inviteData.role,
          status: 'pending'
        }])
        .select()
        .single();

      if (memberError) throw memberError;

      setTeamMembers([memberData, ...teamMembers]);
      setIsInviteDialogOpen(false);
      
      toast({
        title: "Success",
        description: `Invitation sent to ${inviteData.email}. Invitation token: ${invitationData.token}`,
        duration: 10000
      });
      
      console.log('Invitation created:', invitationData);
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
                <AccessSettingsDialog
                  accessSettings={accessSettings}
                  onUpdateSettings={updateAccessSettings}
                />
              </Dialog>

              <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center space-x-2">
                    <UserPlus className="w-4 h-4" />
                    <span>Invite Member</span>
                  </Button>
                </DialogTrigger>
                <InviteMemberDialog onInvite={handleInviteMember} />
              </Dialog>
            </div>
          </div>

          <TeamStatistics teamMembers={teamMembers} accessSettings={accessSettings} />
          
          <TeamMembersList
            teamMembers={teamMembers}
            onRemoveMember={removeMember}
            onUpdateRole={updateMemberRole}
          />
        </div>
      </div>
    </div>
  );
};
