
import { ArrowLeft, BarChart3, Users, Calendar, Clock, AlertCircle, FileCheck, MessageSquare, Settings, FileText, Eye, Box } from "lucide-react";
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
  const sidebarItems = [
    { id: "insights", label: "Insights", icon: BarChart3, active: activeSection === "insights" },
    { id: "tasks", label: "Tasks", icon: FileCheck, active: activeSection === "tasks" },
    { id: "sections", label: "Sections", icon: FileText, active: activeSection === "sections" },
    { id: "team", label: "Team", icon: Users, active: activeSection === "team" },
    { id: "cost", label: "Cost", icon: BarChart3, active: activeSection === "cost" },
    { id: "schedule", label: "Schedule", icon: Calendar, active: activeSection === "schedule" },
    { id: "issues", label: "Issues", icon: AlertCircle, active: activeSection === "issues" },
    { id: "audit", label: "Audit", icon: FileCheck, active: activeSection === "audit" },
    { id: "bim", label: "BIM", icon: Box, active: activeSection === "bim" },
    { id: "files", label: "Files", icon: FileText, active: activeSection === "files" },
    { id: "media", label: "Media", icon: Eye, active: activeSection === "media" },
    { id: "documents", label: "Documents", icon: FileText, active: activeSection === "documents" },
    { id: "setting", label: "Setting", icon: Settings, active: activeSection === "setting" }
  ];

  const handleItemClick = (itemId: string) => {
    if (itemId === "tasks") {
      onNavigate("project-tasks");
    } else if (itemId === "files") {
      onNavigate("project-files");
    } else if (itemId === "setting") {
      onNavigate("project-settings");
    } else if (itemId === "schedule") {
      onNavigate("project-schedule");
    } else if (itemId === "team") {
      onNavigate("project-team");
    } else if (itemId === "bim") {
      onNavigate("project-bim");
    } else {
      // Handle other navigation items as needed
      console.log(`Navigate to ${itemId}`);
    }
  };

  return (
    <div className="w-64 backdrop-blur-xl bg-white/60 border-r border-white/20 shadow-xl flex flex-col rounded-l-2xl">
      <div className="p-4 border-b border-white/20">
        <Button
          variant="ghost"
          onClick={() => onNavigate("projects")}
          className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 hover:bg-white/40 backdrop-blur-sm transition-all duration-200 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium">Back</span>
        </Button>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                item.active
                  ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-700 font-medium backdrop-blur-sm border border-blue-500/20 shadow-lg'
                  : 'text-slate-600 hover:bg-white/20 hover:text-slate-800 hover:backdrop-blur-sm hover:shadow-md'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};
