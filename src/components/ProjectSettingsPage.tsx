import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { Project } from "@/hooks/useProjects";
import { useProjectSettings } from "./project-settings/useProjectSettings";
import { ProjectSettingsHeader } from "./project-settings/ProjectSettingsHeader";
import { ProjectSettingsTabs } from "./project-settings/ProjectSettingsTabs";
import { ProjectSettingsContent } from "./project-settings/ProjectSettingsContent";

interface ProjectSettingsPageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

export const ProjectSettingsPage = ({ project, onNavigate }: ProjectSettingsPageProps) => {
  const {
    activeTab,
    setActiveTab,
    formData,
    handleInputChange,
    handleSave,
    handleDeleteProject,
    loading
  } = useProjectSettings(project);

  const onSaveWithNavigation = async () => {
    const success = await handleSave();
    if (success) {
      // Navigate back to project detail to see the updated data
      setTimeout(() => {
        onNavigate("project-detail");
      }, 1000);
    }
  };

  const onDeleteWithNavigation = async () => {
    const success = await handleDeleteProject();
    if (success) {
      // Navigate back to dashboard after deletion
      onNavigate("dashboard");
    }
    return success;
  };

  return (
    <div className="h-full flex flex-col">
      <ProjectSettingsHeader onNavigate={onNavigate} />

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <ProjectSettingsTabs activeTab={activeTab} />

            <ProjectSettingsContent
              project={project}
              formData={formData}
              onInputChange={handleInputChange}
              onDeleteProject={onDeleteWithNavigation}
              loading={loading}
            />

            {/* Save Button */}
            <div className="mt-8 flex justify-end">
              <Button 
                onClick={onSaveWithNavigation} 
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
