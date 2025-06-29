
import { Search, Filter, Grid, List, Plus, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileType } from "./types";

interface FileControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedFileType: FileType;
  onFileTypeChange: (type: FileType) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  onSyncSharePoint: () => void;
  isLoading: boolean;
}

export const FileControls = ({
  searchQuery,
  onSearchChange,
  selectedFileType,
  onFileTypeChange,
  viewMode,
  onViewModeChange,
  onSyncSharePoint,
  isLoading
}: FileControlsProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <select
          value={selectedFileType}
          onChange={(e) => onFileTypeChange(e.target.value as FileType)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="all">All Files</option>
          <option value="pdf">PDF</option>
          <option value="dwg">DWG</option>
          <option value="jpg">Images</option>
          <option value="doc">Documents</option>
          <option value="xls">Spreadsheets</option>
        </select>
        
        <div className="flex items-center border border-gray-300 rounded-md">
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("list")}
            className="rounded-r-none"
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("grid")}
            className="rounded-l-none"
          >
            <Grid className="w-4 h-4" />
          </Button>
        </div>
        
        <Button 
          onClick={onSyncSharePoint}
          disabled={isLoading}
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Sync SharePoint</span>
        </Button>
        
        <Button className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Upload</span>
        </Button>
      </div>
    </div>
  );
};
