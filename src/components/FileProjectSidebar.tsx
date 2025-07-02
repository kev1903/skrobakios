
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BarChart3, Calendar, AlertCircle, FileCheck, FileText, Users, Eye, Settings } from "lucide-react";

interface FileProjectSidebarProps {
  onNavigate: (page: string) => void;
}

export const FileProjectSidebar = ({ onNavigate }: FileProjectSidebarProps) => {
  const sidebarItems = [
    { id: "insights", label: "Insights", icon: BarChart3, active: false },
    { id: "tasks", label: "Tasks", icon: FileCheck, active: false },
    { id: "sections", label: "WBS", icon: FileText, active: false },
    { id: "cost", label: "Cost", icon: BarChart3, active: false },
    { id: "schedule", label: "Schedule", icon: Calendar, active: false },
    { id: "issues", label: "Issues", icon: AlertCircle, active: false },
    { id: "audit", label: "Audit", icon: FileCheck, active: false },
    { id: "files", label: "Files", icon: FileText, active: true },
    { id: "media", label: "Media", icon: Eye, active: false },
    { id: "documents", label: "Documents", icon: FileText, active: false },
    { id: "setting", label: "Setting", icon: Settings, active: false }
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <Button
          variant="ghost"
          onClick={() => onNavigate("dashboard")}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Button>
        
        <div className="mb-2">
          <h2 className="text-lg font-semibold text-gray-900">SK 23003 - Gordon Street, Balwyn</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
              Active
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
