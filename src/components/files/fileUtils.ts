
import { Folder, File, FileText, Archive, Image } from "lucide-react";
import { FileType } from "./types";

export const getFileIcon = (type: FileType, isFolder?: boolean) => {
  if (isFolder) return <Folder className="w-4 h-4 text-blue-500" />;
  
  switch (type) {
    case "pdf":
      return <FileText className="w-4 h-4 text-red-500" />;
    case "dwg":
      return <Archive className="w-4 h-4 text-green-500" />;
    case "jpg":
      return <Image className="w-4 h-4 text-purple-500" />;
    case "doc":
      return <FileText className="w-4 h-4 text-blue-500" />;
    case "xls":
      return <FileText className="w-4 h-4 text-green-600" />;
    default:
      return <File className="w-4 h-4 text-gray-500" />;
  }
};

export const getFileBadgeColor = (path: string) => {
  if (path.includes('sharepoint')) {
    return 'bg-blue-100 text-blue-800';
  }
  return 'bg-gray-100 text-gray-800';
};
