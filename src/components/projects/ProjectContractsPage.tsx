import { ContractSummaryPage } from "@/components/contracts/ContractSummaryPage";
import { Project } from "@/hooks/useProjects";
import { ProjectSidebar } from "../ProjectSidebar";
import { getStatusColor, getStatusText } from "./utils";

interface ProjectContractsPageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

export const ProjectContractsPage = ({ project, onNavigate }: ProjectContractsPageProps) => {
  return (
    <div className="h-screen flex bg-background">
      {/* Fixed Project Sidebar */}
      <div className="fixed left-0 top-0 h-full w-48 z-40">
        <ProjectSidebar
          project={project}
          onNavigate={onNavigate}
          getStatusColor={getStatusColor}
          getStatusText={getStatusText}
          activeSection="contracts"
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-48 h-screen overflow-y-auto bg-background">
        <ContractSummaryPage contractId={project.id} />
      </div>
    </div>
  );
};