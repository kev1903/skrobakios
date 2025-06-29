
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Download, ExternalLink } from "lucide-react";
import { FileItem } from "./types";
import { getFileIcon, getFileBadgeColor } from "./fileUtils";

interface FileListProps {
  files: FileItem[];
  selectedFiles: Set<string>;
  onFileSelect: (fileId: string) => void;
}

export const FileList = ({ files, selectedFiles, onFileSelect }: FileListProps) => {
  return (
    <div className="space-y-2">
      {files.map((file) => (
        <div 
          key={file.id}
          className={`flex items-center space-x-4 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors ${
            selectedFiles.has(file.id) ? 'bg-blue-50 border-blue-200' : ''
          }`}
          onClick={() => onFileSelect(file.id)}
        >
          <div className="flex-shrink-0">
            {getFileIcon(file.type, file.isFolder)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {file.name}
            </p>
            <div className="flex items-center space-x-4 mt-1">
              <span className="text-xs text-gray-500">{file.size}</span>
              <span className="text-xs text-gray-500">Modified: {file.modified}</span>
              <span className="text-xs text-gray-500">By: {file.author}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={`text-xs ${getFileBadgeColor(file.path)}`}>
              {file.path.includes('sharepoint') ? 'SharePoint' : 'Local'}
            </Badge>
            <Button variant="ghost" size="sm">
              <Eye className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Download className="w-4 h-4" />
            </Button>
            {file.path.includes('sharepoint') && (
              <Button variant="ghost" size="sm">
                <ExternalLink className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
