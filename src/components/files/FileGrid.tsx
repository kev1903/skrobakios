
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Download } from "lucide-react";
import { FileItem } from "./types";
import { getFileIcon, getFileBadgeColor } from "./fileUtils";

interface FileGridProps {
  files: FileItem[];
  selectedFiles: Set<string>;
  onFileSelect: (fileId: string) => void;
}

export const FileGrid = ({ files, selectedFiles, onFileSelect }: FileGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {files.map((file) => (
        <Card 
          key={file.id} 
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedFiles.has(file.id) ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => onFileSelect(file.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-3 mb-3">
              {getFileIcon(file.type, file.isFolder)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">{file.size}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Badge className={`text-xs ${getFileBadgeColor(file.path)}`}>
                {file.path.includes('sharepoint') ? 'SharePoint' : 'Local'}
              </Badge>
              <div className="flex items-center space-x-1">
                <Button variant="ghost" size="sm">
                  <Eye className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Download className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
