
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TeamMember } from "./types";

export const useInvitations = (
  projectId: string,
  teamMembers: TeamMember[],
  setTeamMembers: (members: TeamMember[]) => void
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

  return {
    handleInviteMember,
    resendInvitation
  };
};
