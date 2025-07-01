
import { ProjectSidebar } from "./ProjectSidebar";
import { Project } from "@/hooks/useProjects";
import { useTeamData } from "@/hooks/useTeamData";
import { useTeamActions } from "@/hooks/useTeamActions";
import { TeamMembersList } from "./team/TeamMembersList";
import { TeamStatistics } from "./team/TeamStatistics";
import { TeamPageHeader } from "./team/TeamPageHeader";

interface ProjectTeamPageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

export const ProjectTeamPage = ({ project, onNavigate }: ProjectTeamPageProps) => {
  const {
    teamMembers,
    setTeamMembers,
    accessSettings,
    setAccessSettings,
    loading
  } = useTeamData(project.id);

  const {
    handleInviteMember,
    resendInvitation,
    removeMember,
    updateMemberRole,
    updateAccessSettings
  } = useTeamActions(project.id, teamMembers, setTeamMembers, accessSettings, setAccessSettings);

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
          <TeamPageHeader 
            onInviteMember={handleInviteMember}
            onUpdateSettings={updateAccessSettings}
            accessSettings={accessSettings}
          />

          <TeamStatistics teamMembers={teamMembers} accessSettings={accessSettings} />
          
          <TeamMembersList
            teamMembers={teamMembers}
            onRemoveMember={removeMember}
            onUpdateRole={updateMemberRole}
            onResendInvitation={resendInvitation}
          />
        </div>
      </div>
    </div>
  );
};
