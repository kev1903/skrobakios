import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProjectSettingsHeaderProps {
  onNavigate: (page: string) => void;
}

export const ProjectSettingsHeader = ({ onNavigate }: ProjectSettingsHeaderProps) => {
  return (
    <div className="relative backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border-b border-white/20 dark:border-slate-700/20 shadow-sm">
      <div className="px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('dashboard')}
              className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 hover:bg-white/40 backdrop-blur-sm transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Back</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">
                Project Settings
              </h1>
              <p className="text-sm text-slate-500 mt-1">Manage your project configuration and details</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};