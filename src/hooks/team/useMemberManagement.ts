
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TeamMember } from "./types";

export const useMemberManagement = (
  teamMembers: TeamMember[],
  setTeamMembers: (members: TeamMember[]) => void
) => {
  const { toast } = useToast();

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

  return {
    removeMember,
    updateMemberRole
  };
};
