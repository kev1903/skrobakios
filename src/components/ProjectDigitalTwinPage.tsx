import { Project } from "@/hooks/useProjects";
import { ProjectSidebar } from "./ProjectSidebar";
import { DigitalObjectsCard } from "./project-settings/DigitalObjectsCard";
import { getStatusColor, getStatusText } from "./project-settings/utils";

interface ProjectDigitalTwinPageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

export const ProjectDigitalTwinPage = ({ project, onNavigate }: ProjectDigitalTwinPageProps) => {
  return (
    <div className="h-screen flex backdrop-blur-xl bg-black/20 border border-white/10">
      {/* Project Sidebar */}
      <ProjectSidebar
        project={project}
        onNavigate={onNavigate}
        getStatusColor={getStatusColor}
        getStatusText={getStatusText}
        activeSection="digital-objects"
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto ml-48 backdrop-blur-xl bg-white/5 border-l border-white/10">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Digital Objects</h1>
            <p className="text-white/70">
              Define digital equivalents for real-world items in your construction project
            </p>
          </div>

          {/* Digital Objects Management */}
          <DigitalObjectsCard project={project} />
        </div>
      </div>
    </div>
  );
};