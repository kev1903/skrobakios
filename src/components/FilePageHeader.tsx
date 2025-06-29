
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Trash2, Settings } from "lucide-react";

interface FilePageHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const FilePageHeader = ({ activeTab, onTabChange }: FilePageHeaderProps) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">Business File Storage</h1>
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
            General Storage
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="text-gray-600">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline" className="text-gray-600">
            <Eye className="w-4 h-4 mr-2" />
            View Options
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-8">
        <button
          className={`pb-2 border-b-2 ${
            activeTab === "folders" 
              ? "border-blue-500 text-blue-600 font-medium" 
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => onTabChange("folders")}
        >
          Folders
        </button>
        <button
          className={`pb-2 border-b-2 ${
            activeTab === "holding" 
              ? "border-blue-500 text-blue-600 font-medium" 
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => onTabChange("holding")}
        >
          Holding Area
        </button>
      </div>
    </div>
  );
};
