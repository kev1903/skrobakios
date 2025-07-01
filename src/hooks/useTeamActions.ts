
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

export const useTeamActions = (
  projectId: string,
  teamMembers: TeamMember[],
  setTeamMembers: (members: TeamMember[]) => void,
  accessSettings: ProjectAccessSettings,
  setAccessSettings: (settings: ProjectAccessSettings) => void
) => {
  const { toast } = useToast();

  const handleInviteMember = async (inviteData: { name: string; email: string; role: TeamMember['role'] }) => {
    try {
      // Get project details for the email
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('name')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;

      // First, create the invitation token
      const { data: invitationData, error: invitationError } = await supabase
        .from('team_invitations')
        .insert([{
          project_id: projectId,
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
          project_id: projectId,
          email: inviteData.email,
          name: inviteData.name,
          role: inviteData.role,
          status: 'pending'
        }])
        .select()
        .single();

      if (memberError) throw memberError;

      // Send the invitation email using the edge function
      const { data: emailResponse, error: emailError } = await supabase.functions.invoke('send-invitation', {
        body: {
          email: inviteData.email,
          projectName: projectData.name,
          inviterName: 'Project Admin', // TODO: Replace with actual inviter name when auth is implemented
          token: invitationData.token,
          role: inviteData.role
        }
      });

      if (emailError) {
        console.error('Email sending failed:', emailError);
        // Don't throw here - the invitation was created successfully, just email failed
        toast({
          title: "Invitation Created",
          description: `Invitation created for ${inviteData.email}, but email sending failed. Share this link manually: ${window.location.origin}/accept-invitation?token=${invitationData.token}`,
          duration: 15000
        });
      } else {
        console.log('Invitation email sent successfully:', emailResponse);
        toast({
          title: "Success",
          description: `Invitation sent to ${inviteData.email} successfully!`,
          duration: 5000
        });
      }

      setTeamMembers([memberData, ...teamMembers]);
      
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

  const resendInvitation = async (memberId: string) => {
    try {
      const member = teamMembers.find(m => m.id === memberId);
      if (!member) throw new Error('Member not found');

      // Get project details for the email
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('name')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;

      // Get existing invitation token or create new one
      let invitationToken;
      const { data: existingInvitation, error: invitationFetchError } = await supabase
        .from('team_invitations')
        .select('token')
        .eq('project_id', projectId)
        .eq('email', member.email)
        .eq('used_at', null)
        .single();

      if (invitationFetchError || !existingInvitation) {
        // Create new invitation token
        const { data: newInvitation, error: newInvitationError } = await supabase
          .from('team_invitations')
          .insert([{
            project_id: projectId,
            email: member.email,
            invited_by_email: 'current-user@example.com' // TODO: Replace with actual user email when auth is implemented
          }])
          .select()
          .single();

        if (newInvitationError) throw newInvitationError;
        invitationToken = newInvitation.token;
      } else {
        invitationToken = existingInvitation.token;
      }

      // Send the invitation email using the edge function
      const { data: emailResponse, error: emailError } = await supabase.functions.invoke('send-invitation', {
        body: {
          email: member.email,
          projectName: projectData.name,
          inviterName: 'Project Admin', // TODO: Replace with actual inviter name when auth is implemented
          token: invitationToken,
          role: member.role
        }
      });

      if (emailError) {
        console.error('Email sending failed:', emailError);
        toast({
          title: "Email Failed",
          description: `Failed to send invitation email. Share this link manually: ${window.location.origin}/accept-invitation?token=${invitationToken}`,
          duration: 15000
        });
      } else {
        console.log('Invitation email resent successfully:', emailResponse);
        toast({
          title: "Success",
          description: `Invitation email resent to ${member.email} successfully!`,
          duration: 5000
        });
      }
    } catch (error: any) {
      console.error('Error resending invitation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to resend invitation",
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
          project_id: projectId,
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

  return {
    handleInviteMember,
    resendInvitation,
    removeMember,
    updateMemberRole,
    updateAccessSettings
  };
};
