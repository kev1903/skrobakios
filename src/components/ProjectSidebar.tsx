
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  FolderOpen, 
  Calendar, 
  CheckSquare, 
  Settings, 
  BarChart3,
  FileText,
  Users,
  Share2
} from "lucide-react";
import { Project } from "@/hooks/useProjects";

interface ProjectSidebarProps {
  project: Project;
  onNavigate: (page: string) => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  activeSection?: string;
}

export const ProjectSidebar = ({ 
  project, 
  onNavigate, 
  getStatusColor, 
  getStatusText, 
  activeSection 
}: ProjectSidebarProps) => {
  const menuItems = [
    { id: "overview", label: "Overview", icon: BarChart3, page: "project-detail" },
    { id: "tasks", label: "Tasks", icon: CheckSquare, page: "project-tasks" },
    { id: "schedule", label: "Schedule", icon: Calendar, page: "project-schedule" },
    { id: "files", label: "Files", icon: FolderOpen, page: "project-files" },
    { id: "team", label: "Team", icon: Users, page: "project-team" },
    { id: "setting", label: "Settings", icon: Settings, page: "project-settings" },
  ];

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onNavigate("dashboard")}
          className="mb-3 p-0 h-auto text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <div>
          <h2 className="font-semibold text-gray-900 mb-1">{project.name}</h2>
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-sm text-gray-500">#{project.project_id}</span>
            <Badge variant="outline" className={getStatusColor(project.status)}>
              {getStatusText(project.status)}
            </Badge>
          </div>
          {project.location && (
            <p className="text-sm text-gray-500">{project.location}</p>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <li key={item.id}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => onNavigate(item.page)}
                  className={`w-full justify-start ${
                    isActive ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {item.label}
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Project Info */}
      <div className="p-4 border-t border-gray-200 space-y-3">
        {project.start_date && (
          <div>
            <span className="text-xs text-gray-500">Start Date</span>
            <p className="text-sm font-medium">{formatDate(project.start_date)}</p>
          </div>
        )}
        {project.deadline && (
          <div>
            <span className="text-xs text-gray-500">Deadline</span>
            <p className="text-sm font-medium">{formatDate(project.deadline)}</p>
          </div>
        )}
        {project.contract_price && (
          <div>
            <span className="text-xs text-gray-500">Contract Price</span>
            <p className="text-sm font-medium font-bold text-green-600">{project.contract_price}</p>
          </div>
        )}
      </div>
    </div>
  );
};
