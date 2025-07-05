
import { ArrowLeft, BarChart3, DollarSign, Calendar, CheckSquare, Folder, Users, Settings, Eye, HelpCircle, Box } from "lucide-react";
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

  const projectNavItems = [
    { id: 'insights', label: 'Dashboard', icon: Eye, page: 'project-detail' },
    { id: 'digital-twin', label: 'Digital Twin', icon: Box, page: 'project-digital-twin' },
    { id: 'cost', label: 'Cost Analysis', icon: DollarSign, page: 'project-cost' },
    { id: 'schedule', label: 'Schedule', icon: Calendar, page: 'project-schedule' },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, page: 'project-tasks' },
    { id: 'files', label: 'Files', icon: Folder, page: 'project-files' },
    { id: 'team', label: 'Team', icon: Users, page: 'project-team' },
    { id: 'wbs', label: 'WBS', icon: BarChart3, page: 'project-wbs' },
  ];

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

        {/* Project Info */}
        <div className="flex-shrink-0 px-3 py-4 border-b border-white/20">
          <div className="text-white text-sm font-medium mb-2 truncate">{project.name}</div>
          <div className="text-white/70 text-xs mb-2">#{project.project_id}</div>
          <Badge 
            variant="outline" 
            className={`${getStatusColor(project.status)} text-xs`}
          >
            {getStatusText(project.status)}
          </Badge>
        </div>

        {/* Project Navigation Items */}
        <div className="flex-1 flex flex-col py-4 space-y-1 overflow-y-auto px-3">
          <div className="text-xs font-medium text-white/60 uppercase tracking-wider px-3 py-2 mb-1">
            Project Navigation
          </div>
          {projectNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigate(item.page)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 text-left ${
                activeSection === item.id 
                  ? 'bg-white/20 text-white border border-white/30' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Project Settings */}
        <div className="border-t border-white/20 px-3 py-4 space-y-1">
          <div className="text-xs font-medium text-white/60 uppercase tracking-wider px-3 py-2">
            Project Settings
          </div>
          <button
            onClick={() => handleNavigate('project-settings')}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200 text-left"
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm font-medium">Settings</span>
          </button>
          <button
            onClick={() => handleNavigate('support')}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200 text-left"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Help</span>
          </button>
        </div>
      </div>
    </div>
  );
};
