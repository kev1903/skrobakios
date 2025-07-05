import { TabsContent } from "@/components/ui/tabs";
import { Project } from "@/hooks/useProjects";
import { ProjectSettingsFormData } from "./types";
import { getStatusColor, getStatusText } from "./utils";
import { ProjectBannerCard } from "./ProjectBannerCard";
import { ProjectInformationCard } from "./ProjectInformationCard";
import { ProjectOverviewCard } from "./ProjectOverviewCard";
import { SharePointIntegrationCard } from "./SharePointIntegrationCard";
import { TimelineStatusCard } from "./TimelineStatusCard";
import { DangerZoneCard } from "./DangerZoneCard";

interface ProjectSettingsContentProps {
  project: Project;
  formData: ProjectSettingsFormData;
  onInputChange: (field: string, value: string | { lat: number; lng: number } | { x: number; y: number; scale: number }) => void;
  onDeleteProject: () => Promise<boolean>;
  loading: boolean;
}

export const ProjectSettingsContent = ({ 
  project, 
  formData, 
  onInputChange, 
  onDeleteProject, 
  loading 
}: ProjectSettingsContentProps) => {
  const handleDeleteProject = async () => {
    await onDeleteProject();
  };

  return (
    <div className="space-y-6">
      <TabsContent value="general" className="space-y-6 mt-0">
        <ProjectBannerCard 
          formData={formData}
          onInputChange={onInputChange}
        />
        <ProjectInformationCard 
          formData={formData}
          onInputChange={onInputChange}
        />
        <ProjectOverviewCard 
          project={project}
          formData={formData}
          onInputChange={onInputChange}
          getStatusColor={getStatusColor}
          getStatusText={getStatusText}
        />
      </TabsContent>

      <TabsContent value="integration" className="space-y-6 mt-0">
        <SharePointIntegrationCard 
          formData={formData}
          onInputChange={onInputChange}
        />
      </TabsContent>

      <TabsContent value="timeline" className="space-y-6 mt-0">
        <TimelineStatusCard 
          formData={formData}
          onInputChange={onInputChange}
        />
      </TabsContent>

      <TabsContent value="danger" className="space-y-6 mt-0">
        <DangerZoneCard 
          project={project}
          onDeleteProject={handleDeleteProject}
          loading={loading}
        />
      </TabsContent>
    </div>
  );
};