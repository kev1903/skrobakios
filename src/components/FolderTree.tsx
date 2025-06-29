
import { useState } from "react";
import { Folder, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FolderItem {
  id: string;
  name: string;
  type: "folder";
  createdAt: string;
  children?: FolderItem[];
  expanded?: boolean;
}

interface FolderTreeProps {
  selectedFolder: string | null;
  onFolderSelect: (folderId: string) => void;
}

export const FolderTree = ({ selectedFolder, onFolderSelect }: FolderTreeProps) => {
  const [folderStructure, setFolderStructure] = useState<FolderItem[]>([
    {
      id: "project-files",
      name: "Project Files",
      type: "folder",
      createdAt: "2024-01-15",
      expanded: true,
      children: [
        {
          id: "05-incomings",
          name: "05-Incomings",
          type: "folder",
          createdAt: "2024-01-14",
          expanded: false,
          children: [
            {
              id: "architecture",
              name: "Architecture",
              type: "folder",
              createdAt: "2024-01-13",
              children: []
            },
            {
              id: "engineering",
              name: "Engineering",
              type: "folder",
              createdAt: "2024-01-12",
              expanded: false,
              children: [
                {
                  id: "3d-model",
                  name: "3D Model",
                  type: "folder",
                  createdAt: "2024-01-11",
                  children: []
                },
                {
                  id: "cad-file",
                  name: "CAD File",
                  type: "folder",
                  createdAt: "2024-01-10",
                  children: []
                },
                {
                  id: "pdf",
                  name: "PDF",
                  type: "folder",
                  createdAt: "2024-01-09",
                  children: []
                }
              ]
            }
          ]
        }
      ]
    }
  ]);

  const toggleFolder = (folderId: string, folders: FolderItem[]): FolderItem[] => {
    return folders.map(folder => {
      if (folder.id === folderId) {
        return { ...folder, expanded: !folder.expanded };
      }
      if (folder.children) {
        return { ...folder, children: toggleFolder(folderId, folder.children) };
      }
      return folder;
    });
  };

  const renderFolderTree = (folders: FolderItem[], level = 0) => {
    return folders.map(folder => (
      <div key={folder.id}>
        <div 
          className={`flex items-center space-x-2 py-1 px-2 cursor-pointer hover:bg-gray-100 rounded ${
            selectedFolder === folder.id ? 'bg-blue-100 text-blue-700' : ''
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => {
            onFolderSelect(folder.id);
            if (folder.children && folder.children.length > 0) {
              setFolderStructure(prev => toggleFolder(folder.id, prev));
            }
          }}
        >
          <Folder className={`w-4 h-4 ${selectedFolder === folder.id ? 'text-blue-500' : 'text-gray-500'}`} />
          <span className="text-sm">{folder.name}</span>
        </div>
        {folder.expanded && folder.children && (
          <div>
            {renderFolderTree(folder.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Folder className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-gray-700">Project Files</span>
        </div>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="space-y-1">
        {renderFolderTree(folderStructure)}
      </div>
    </div>
  );
};
