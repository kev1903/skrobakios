
import { useState } from "react";
import { Upload, Folder, FolderPlus, File, MoreHorizontal, Download, Search, Grid, List, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface FilePageProps {
  onNavigate: (page: string) => void;
}

interface FolderItem {
  id: string;
  name: string;
  type: "folder";
  createdAt: string;
}

interface FileItem {
  id: string;
  name: string;
  type: "file";
  size: number;
  createdAt: string;
  fileType: string;
}

type Item = FolderItem | FileItem;

export const FilePage = ({ onNavigate }: FilePageProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [items, setItems] = useState<Item[]>([
    {
      id: "1",
      name: "Project Documents",
      type: "folder",
      createdAt: "2024-01-15"
    },
    {
      id: "2",
      name: "Design Files",
      type: "folder",
      createdAt: "2024-01-14"
    },
    {
      id: "3",
      name: "Project_Plan.pdf",
      type: "file",
      size: 2048000,
      createdAt: "2024-01-13",
      fileType: "pdf"
    },
    {
      id: "4",
      name: "Budget_Report.xlsx",
      type: "file",
      size: 1024000,
      createdAt: "2024-01-12",
      fileType: "xlsx"
    }
  ]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    droppedFiles.forEach(file => {
      const newFile: FileItem = {
        id: Date.now().toString() + Math.random().toString(),
        name: file.name,
        type: "file",
        size: file.size,
        createdAt: new Date().toISOString().split('T')[0],
        fileType: file.name.split('.').pop() || "unknown"
      };
      setItems(prev => [...prev, newFile]);
    });
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      selectedFiles.forEach(file => {
        const newFile: FileItem = {
          id: Date.now().toString() + Math.random().toString(),
          name: file.name,
          type: "file",
          size: file.size,
          createdAt: new Date().toISOString().split('T')[0],
          fileType: file.name.split('.').pop() || "unknown"
        };
        setItems(prev => [...prev, newFile]);
      });
    }
  };

  const createFolder = () => {
    if (newFolderName.trim()) {
      const newFolder: FolderItem = {
        id: Date.now().toString(),
        name: newFolderName.trim(),
        type: "folder",
        createdAt: new Date().toISOString().split('T')[0]
      };
      setItems(prev => [...prev, newFolder]);
      setNewFolderName("");
      setIsCreateFolderOpen(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full bg-gray-50" style={{ boxShadow: 'none' }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4" style={{ boxShadow: 'none' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => onNavigate("dashboard")}
              className="flex items-center space-x-2"
              style={{ boxShadow: 'none' }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Files</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search files and folders"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80 bg-gray-50 border-gray-200"
                style={{ boxShadow: 'none' }}
              />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" style={{ boxShadow: 'none' }}>
                  <FolderPlus className="w-4 h-4 mr-2" />
                  New Folder
                </Button>
              </DialogTrigger>
              <DialogContent style={{ boxShadow: 'none' }}>
                <DialogHeader>
                  <DialogTitle>Create New Folder</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="folder-name">Folder Name</Label>
                    <Input
                      id="folder-name"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="Enter folder name"
                      className="mt-1"
                      style={{ boxShadow: 'none' }}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreateFolderOpen(false)} style={{ boxShadow: 'none' }}>
                      Cancel
                    </Button>
                    <Button onClick={createFolder} style={{ boxShadow: 'none' }}>
                      Create
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <input
              type="file"
              multiple
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />
            <Button
              onClick={() => document.getElementById("file-upload")?.click()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              style={{ boxShadow: 'none' }}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Files
            </Button>
            <div className="flex border border-gray-200 rounded-lg" style={{ boxShadow: 'none' }}>
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                style={{ boxShadow: 'none' }}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                style={{ boxShadow: 'none' }}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 mb-6 text-center transition-colors ${
            dragActive 
              ? "border-blue-500 bg-blue-50" 
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">
            Drop files here to upload or click the Upload Files button
          </p>
        </div>

        {/* Files and Folders */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filteredItems.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow cursor-pointer" style={{ boxShadow: 'none' }}>
                <CardContent className="p-4">
                  <div className="flex flex-col items-center space-y-2">
                    {item.type === "folder" ? (
                      <Folder className="w-12 h-12 text-blue-500" />
                    ) : (
                      <File className="w-12 h-12 text-gray-500" />
                    )}
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900 truncate w-full">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.type === "file" && formatFileSize(item.size)}
                      </p>
                      <p className="text-xs text-gray-400">{item.createdAt}</p>
                    </div>
                    <Button variant="ghost" size="sm" style={{ boxShadow: 'none' }}>
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200" style={{ boxShadow: 'none' }}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Modified
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {item.type === "folder" ? (
                            <Folder className="w-5 h-5 text-blue-500 mr-3" />
                          ) : (
                            <File className="w-5 h-5 text-gray-500 mr-3" />
                          )}
                          <span className="text-sm font-medium text-gray-900">
                            {item.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.type === "folder" ? "Folder" : item.fileType?.toUpperCase()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.type === "file" ? formatFileSize(item.size) : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.createdAt}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm" style={{ boxShadow: 'none' }}>
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" style={{ boxShadow: 'none' }}>
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Folder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No files or folders found</p>
          </div>
        )}
      </div>
    </div>
  );
};
