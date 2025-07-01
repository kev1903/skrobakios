
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Project } from "@/hooks/useProjects";
import { BIMPageHeader } from "@/components/bim/BIMPageHeader";
import { BIM3DViewerSection } from "@/components/bim/BIM3DViewerSection";
import { BIMStatsCards } from "@/components/bim/BIMStatsCards";
import { BIMModelsList } from "@/components/bim/BIMModelsList";
import { BIMPropertiesPanel } from "@/components/bim/BIMPropertiesPanel";

interface ProjectBIMPageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

export const ProjectBIMPage = ({ project, onNavigate }: ProjectBIMPageProps) => {
  const [activeTab, setActiveTab] = useState("3d-view");
  const [performanceMode, setPerformanceMode] = useState(true); // Start in performance mode

  // Simplified BIM data
  const bimStats = {
    totalModels: 3,
    currentModels: 2,
    totalSize: "45.2 MB",
    lastUpdated: "Today"
  };

  const handleResetView = () => {
    console.log("Reset view");
  };

  const handleTogglePerformance = () => {
    setPerformanceMode(!performanceMode);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <BIMPageHeader project={project} onNavigate={onNavigate} />

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="3d-view">3D Viewer</TabsTrigger>
              <TabsTrigger value="models">Model Library</TabsTrigger>
              <TabsTrigger value="properties">Properties</TabsTrigger>
            </TabsList>

            <TabsContent value="3d-view" className="space-y-6">
              <BIM3DViewerSection
                performanceMode={performanceMode}
                onResetView={handleResetView}
                onTogglePerformance={handleTogglePerformance}
              />
            </TabsContent>

            <TabsContent value="models" className="space-y-6">
              <BIMStatsCards stats={bimStats} />
              <BIMModelsList />
            </TabsContent>

            <TabsContent value="properties" className="space-y-6">
              <BIMPropertiesPanel />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
