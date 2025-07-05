import { Settings } from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProjectSettingsTabsProps {
  activeTab: string;
}

export const ProjectSettingsTabs = ({ activeTab }: ProjectSettingsTabsProps) => {
  return (
    <TabsList className="grid w-full grid-cols-1 lg:grid-cols-4 backdrop-blur-sm bg-white/60">
      <TabsTrigger value="general" className="flex items-center space-x-2">
        <Settings className="w-4 h-4" />
        <span className="hidden sm:inline">General</span>
      </TabsTrigger>
      <TabsTrigger value="integration" className="flex items-center space-x-2">
        <Settings className="w-4 h-4" />
        <span className="hidden sm:inline">Integration</span>
      </TabsTrigger>
      <TabsTrigger value="timeline" className="flex items-center space-x-2">
        <Settings className="w-4 h-4" />
        <span className="hidden sm:inline">Timeline</span>
      </TabsTrigger>
      <TabsTrigger value="danger" className="flex items-center space-x-2">
        <Settings className="w-4 h-4" />
        <span className="hidden sm:inline">Danger Zone</span>
      </TabsTrigger>
    </TabsList>
  );
};