
import { TeamMember, ProjectAccessSettings } from "./team/types";
import { useInvitations } from "./team/useInvitations";
import { useMemberManagement } from "./team/useMemberManagement";
import { useAccessSettings } from "./team/useAccessSettings";

export const useTeamActions = (
  projectId: string,
  teamMembers: TeamMember[],
  setTeamMembers: (members: TeamMember[]) => void,
  accessSettings: ProjectAccessSettings,
  setAccessSettings: (settings: ProjectAccessSettings) => void
) => {
  const { handleInviteMember, resendInvitation } = useInvitations(
    projectId,
    teamMembers,
    setTeamMembers
  );

  const { removeMember, updateMemberRole } = useMemberManagement(
    teamMembers,
    setTeamMembers
  );

  const { updateAccessSettings } = useAccessSettings(
    projectId,
    accessSettings,
    setAccessSettings
  );

  return {
    handleInviteMember,
    resendInvitation,
    removeMember,
    updateMemberRole,
    updateAccessSettings
  };
};

// Export types for backward compatibility
export type { TeamMember, ProjectAccessSettings } from "./team/types";
