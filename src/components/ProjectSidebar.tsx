
import { ArrowLeft, BarChart3, Users, Calendar, Clock, AlertCircle, FileCheck, MessageSquare, Settings, FileText, Eye } from "lucide-react";
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
    { id: "cost", label: "Cost", icon: BarChart3, active: activeSection === "cost" },
    { id: "schedule", label: "Schedule", icon: Calendar, active: activeSection === "schedule" },
    { id: "issues", label: "Issues", icon: AlertCircle, active: activeSection === "issues" },
    { id: "audit", label: "Audit", icon: FileCheck, active: activeSection === "audit" },
    { id: "files", label: "Files", icon: FileText, active: activeSection === "files" },
    { id: "media", label: "Media", icon: Eye, active: activeSection === "media" },
    { id: "documents", label: "Documents", icon: FileText, active: activeSection === "documents" },
    { id: "setting", label: "Setting", icon: Settings, active: activeSection === "setting" }
  ];

  const handleItemClick = (itemId: string) => {
    if (itemId === "files") {
      onNavigate("project-files");
    } else if (itemId === "setting") {
      onNavigate("project-settings");
    } else if (itemId === "schedule") {
      onNavigate("project-schedule");
    } else {
      // Handle other navigation items as needed
      console.log(`Navigate to ${itemId}`);
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col" style={{ boxShadow: 'none' }}>
      <div className="p-4 border-b border-gray-200">
        <Button
          variant="ghost"
          onClick={() => onNavigate("projects")}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Button>
        
        <div className="mb-2">
          <h2 className="text-lg font-semibold text-gray-900">{project.name}</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Badge variant="outline" className={getStatusColor(project.status)}>
              {getStatusText(project.status)}
            </Badge>
            <span>Last Updated 12h Ago</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                item.active
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
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
