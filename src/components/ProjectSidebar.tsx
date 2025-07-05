
import { ArrowLeft, Briefcase, Calendar, DollarSign, TrendingUp, Map, Settings, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/hooks/useProjects";

interface ProjectSidebarProps {
  project: Project;
  onNavigate: (page: string) => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  activeSection?: string;
}

export const ProjectSidebar = ({ project, onNavigate, getStatusColor, getStatusText, activeSection = "insights" }: ProjectSidebarProps) => {
  const handleNavigate = (page: string) => {
    onNavigate(page);
  };

  return (
    <div className="fixed left-0 top-0 w-48 h-full bg-white/10 backdrop-blur-md border-r border-white/20 shadow-2xl z-40 transition-all duration-300">
      <div className="flex flex-col h-full pt-20">
        {/* Back Button */}
        <div className="flex-shrink-0 px-3 py-4 border-b border-white/20">
          <button
            onClick={() => onNavigate("home")}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white hover:bg-white/30 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Close Page</span>
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 flex flex-col py-4 space-y-1 overflow-y-auto px-3">
          <button
            onClick={() => handleNavigate('projects')}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-white/30 transition-all duration-200 text-left"
          >
            <Briefcase className="w-4 h-4" />
            <span className="text-sm font-medium">Projects</span>
          </button>
          <button
            onClick={() => handleNavigate('tasks')}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-white/30 transition-all duration-200 text-left"
          >
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">Tasks</span>
          </button>
          <button
            onClick={() => handleNavigate('finance')}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-white/30 transition-all duration-200 text-left"
          >
            <DollarSign className="w-4 h-4" />
            <span className="text-sm font-medium">Finance</span>
          </button>
          <button
            onClick={() => handleNavigate('sales')}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-white/30 transition-all duration-200 text-left"
          >
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">Sales</span>
          </button>
          <button
            onClick={() => handleNavigate('bim')}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-white/30 transition-all duration-200 text-left"
          >
            <Map className="w-4 h-4" />
            <span className="text-sm font-medium">BIM</span>
          </button>
        </div>

        {/* Support Section */}
        <div className="border-t border-white/20 px-3 py-4 space-y-1">
          <div className="text-xs font-medium text-white uppercase tracking-wider px-3 py-2">
            Support
          </div>
          <button
            onClick={() => handleNavigate('settings')}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-white/30 transition-all duration-200 text-left"
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm font-medium">Settings</span>
          </button>
          <button
            onClick={() => handleNavigate('support')}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-white/30 transition-all duration-200 text-left"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Help Center</span>
          </button>
        </div>
      </div>
    </div>
  );
};
