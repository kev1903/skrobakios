
import { useState } from "react";
import { Upload, Folder, FolderPlus, File, MoreHorizontal, Download, Search, Grid, List, ArrowLeft, Eye, Trash2, Settings, BarChart3, Calendar, AlertCircle, FileCheck, FileText, Users } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface FilePageProps {
  onNavigate: (page: string) => void;
}

interface FolderItem {
  id: string;
  name: string;
  type: "folder";
  createdAt: string;
  children?: Item[];
  expanded?: boolean;
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
  const [newFolderName, setNewFolderName] = useState("");
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string | null>("project-files");
  const [activeTab, setActiveTab] = useState("folders");

  // Sidebar navigation items
  const sidebarItems = [
    { id: "insights", label: "Insights", icon: BarChart3, active: false },
    { id: "tasks", label: "Tasks", icon: FileCheck, active: false },
    { id: "sections", label: "Sections", icon: FileText, active: false },
    { id: "cost", label: "Cost", icon: BarChart3, active: false },
    { id: "schedule", label: "Schedule", icon: Calendar, active: false },
    { id: "issues", label: "Issues", icon: AlertCircle, active: false },
    { id: "audit", label: "Audit", icon: FileCheck, active: false },
    { id: "files", label: "Files", icon: FileText, active: true },
    { id: "media", label: "Media", icon: Eye, active: false },
    { id: "documents", label: "Documents", icon: FileText, active: false },
    { id: "setting", label: "Setting", icon: Settings, active: false }
  ];

  // Folder structure
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

  // Sample CAD files
  const [cadFiles] = useState<FileItem[]>([
    {
      id: "1",
      name: "200914 - 2 - S11 rev P4.pdf",
      type: "file",
      size: 465300,
      createdAt: "20 Aug, 2023",
      fileType: "pdf"
    },
    {
      id: "2",
      name: "200914 - 2 - S11 rev P4.pdf",
      type: "file",
      size: 465300,
      createdAt: "20 Aug, 2023",
      fileType: "pdf"
    },
    {
      id: "3",
      name: "200914 - 2 - S11 rev P4.dwg",
      type: "file",
      size: 465300,
      createdAt: "20 Aug, 2023",
      fileType: "dwg"
    },
    {
      id: "4",
      name: "200914 - 2 - S11 rev P4.dwg200914 - 2 - S.jpg",
      type: "file",
      size: 465300,
      createdAt: "20 Aug, 2023",
      fileType: "jpg"
    },
    {
      id: "5",
      name: "200914 - 2 - S11 rev P4.jpg",
      type: "file",
      size: 465300,
      createdAt: "20 Aug, 2023",
      fileType: "jpg"
    },
    {
      id: "6",
      name: "200914 - 2 - v - S32 - Roof Framing.dwg",
      type: "file",
      size: 465300,
      createdAt: "20 Aug, 2023",
      fileType: "dwg"
    },
    {
      id: "7",
      name: "200914 - 2 - S11 rev P4.ifc",
      type: "file",
      size: 465300,
      createdAt: "20 Aug, 2023",
      fileType: "ifc"
    },
    {
      id: "8",
      name: "200914 - 2 - S11 rev P4.dwg",
      type: "file",
      size: 465300,
      createdAt: "20 Aug, 2023",
      fileType: "dwg"
    },
    {
      id: "9",
      name: "200914 - 2 - v - S31 - Level 3 - Mez.dwg",
      type: "file",
      size: 465300,
      createdAt: "20 Aug, 2023",
      fileType: "dwg"
    }
  ]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const toggleFolder = (folderId: string, folders: FolderItem[]): FolderItem[] => {
    return folders.map(folder => {
      if (folder.id === folderId) {
        return { ...folder, expanded: !folder.expanded };
      }
      if (folder.children) {
        return { ...folder, children: toggleFolder(folderId, folder.children as FolderItem[]) };
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
            setSelectedFolder(folder.id);
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
            {renderFolderTree(folder.children as FolderItem[], level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Project Sidebar */}
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">SK 23003 - Gordon Street, Balwyn</h1>
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                Active
              </Badge>
              <span className="text-sm text-gray-500">Last Updated 12h Ago</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" className="text-gray-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
              <Button variant="outline" className="text-gray-600">
                <Settings className="w-4 h-4 mr-2" />
                Setting
              </Button>
              <Button variant="outline" className="text-gray-600">
                <Eye className="w-4 h-4 mr-2" />
                3D View
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
              onClick={() => setActiveTab("folders")}
            >
              Folders
            </button>
            <button
              className={`pb-2 border-b-2 ${
                activeTab === "holding" 
                  ? "border-blue-500 text-blue-600 font-medium" 
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("holding")}
            >
              Holding Area
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex">
          {/* Left Panel - Folder Tree */}
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

          {/* Right Panel - File List */}
          <div className="flex-1 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" className="text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline" className="text-gray-600">
                  <Download className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline">
                  <Grid className="w-4 h-4 mr-2" />
                </Button>
                <Button variant="outline">
                  <List className="w-4 h-4 mr-2" />
                </Button>
                <Button className="bg-blue-600 text-white">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </Button>
              </div>
            </div>

            {/* CAD File Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">CAD File</h3>
              
              <div className="bg-white rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-12">
                        <input type="checkbox" className="rounded" />
                      </TableHead>
                      <TableHead>File Name</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Last Update</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cadFiles.map((file) => (
                      <TableRow key={file.id} className="hover:bg-gray-50">
                        <TableCell>
                          <input type="checkbox" className="rounded" />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <File className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">{file.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatFileSize(file.size)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {file.createdAt}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Folder Dialog */}
      <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
        <DialogContent>
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
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateFolderOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsCreateFolderOpen(false)}>
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
