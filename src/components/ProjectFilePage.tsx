import { useState, useEffect } from "react";
import { Upload, Download, Search, Grid, List, File, Eye, Trash2, Users, ExternalLink, Folder, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Project } from "@/hooks/useProjects";

interface FileItem {
  id: string;
  name: string;
  type: "file";
  size: number;
  createdAt: string;
  fileType: string;
}

interface ProjectFilePageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

export const ProjectFilePage = ({ project, onNavigate }: ProjectFilePageProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sharePointLink, setSharePointLink] = useState("");
  
  const [projectFiles] = useState<FileItem[]>([
    {
      id: "1",
      name: `${project.project_id} - Architectural Plans.pdf`,
      type: "file",
      size: 2450000,
      createdAt: "25 Jun, 2025",
      fileType: "pdf"
    },
    {
      id: "2",
      name: `${project.project_id} - Site Survey.dwg`,
      type: "file",
      size: 1850000,
      createdAt: "24 Jun, 2025",
      fileType: "dwg"
    },
    {
      id: "3",
      name: `${project.project_id} - Foundation Plans.pdf`,
      type: "file",
      size: 1200000,
      createdAt: "23 Jun, 2025",
      fileType: "pdf"
    },
    {
      id: "4",
      name: `${project.project_id} - Elevation Views.jpg`,
      type: "file",
      size: 3400000,
      createdAt: "22 Jun, 2025",
      fileType: "jpg"
    },
    {
      id: "5",
      name: `${project.project_id} - Structural Details.dwg`,
      type: "file",
      size: 2100000,
      createdAt: "21 Jun, 2025",
      fileType: "dwg"
    }
  ]);

  // SharePoint files based on the screenshot
  const [sharePointFiles] = useState<FileItem[]>([
    {
      id: "sp1",
      name: "SK 002 - Architectural Plans.pdf",
      type: "file",
      size: 2300000,
      createdAt: "25 Jun, 2025",
      fileType: "pdf"
    },
    {
      id: "sp2",
      name: "SK 002 - Site Survey.dwg",
      type: "file",
      size: 1800000,
      createdAt: "24 Jun, 2025",
      fileType: "dwg"
    },
    {
      id: "sp3",
      name: "SK 002 - Foundation Plans.pdf",
      type: "file",
      size: 1100000,
      createdAt: "23 Jun, 2025",
      fileType: "pdf"
    },
    {
      id: "sp4",
      name: "SK 002 - Elevation Views.jpg",
      type: "file",
      size: 3200000,
      createdAt: "22 Jun, 2025",
      fileType: "jpg"
    },
    {
      id: "sp5",
      name: "SK 002 - Structural Details.dwg",
      type: "file",
      size: 2000000,
      createdAt: "21 Jun, 2025",
      fileType: "dwg"
    }
  ]);

  useEffect(() => {
    // Load SharePoint link from localStorage
    const savedLink = localStorage.getItem(`project_sharepoint_${project.id}`);
    if (savedLink) {
      setSharePointLink(savedLink);
    }
  }, [project.id]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "running":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "pending":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "running":
        return "In Progress";
      case "pending":
        return "Pending";
      default:
        return "Active";
    }
  };

  const handleSharePointAccess = () => {
    if (sharePointLink) {
      window.open(sharePointLink, "_blank");
    } else {
      window.open("https://enassee.sharepoint.com/:f:/s/SkrobakiProjects/Emw1CavunZZGqup2TMoIcd0BdA8uQDzqHGoqX4x4TI22qg?e=Ey0bOj", "_blank");
    }
  };

  const allFiles = [...projectFiles, ...sharePointFiles];
  const totalSharePointFiles = sharePointFiles.length;
  const totalSharePointSize = sharePointFiles.reduce((total, file) => total + file.size, 0);
  const sharePointFileTypes = [...new Set(sharePointFiles.map(f => f.fileType))].length;

  const filteredFiles = projectFiles.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSharePointFiles = sharePointFiles.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Project Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <Button
            variant="ghost"
            onClick={() => onNavigate("project-detail")}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Project</span>
          </Button>
          
          <div className="mb-2">
            <h2 className="text-lg font-semibold text-gray-900">{project.name}</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Badge variant="outline" className={getStatusColor(project.status)}>
                {getStatusText(project.status)}
              </Badge>
              <span>Project Files</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              File Sources
            </div>
            <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left text-gray-600 hover:bg-gray-100 hover:text-gray-900">
              <File className="w-4 h-4" />
              <span className="text-sm font-medium">Local Files</span>
              <span className="ml-auto text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                {projectFiles.length}
              </span>
            </button>
            <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left bg-blue-50 text-blue-700 border border-blue-200">
              <Folder className="w-4 h-4" />
              <span className="text-sm font-medium">SharePoint</span>
              <span className="ml-auto text-xs bg-blue-200 text-blue-700 px-2 py-1 rounded-full">
                {sharePointFiles.length}
              </span>
            </button>
            
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 mt-4">
              File Categories
            </div>
            <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left text-gray-600 hover:bg-gray-100 hover:text-gray-900">
              <File className="w-4 h-4" />
              <span className="text-sm font-medium">All Files</span>
              <span className="ml-auto text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                {allFiles.length}
              </span>
            </button>
            <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left text-gray-600 hover:bg-gray-100 hover:text-gray-900">
              <File className="w-4 h-4" />
              <span className="text-sm font-medium">PDFs</span>
              <span className="ml-auto text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                {allFiles.filter(f => f.fileType === 'pdf').length}
              </span>
            </button>
            <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left text-gray-600 hover:bg-gray-100 hover:text-gray-900">
              <File className="w-4 h-4" />
              <span className="text-sm font-medium">CAD Files</span>
              <span className="ml-auto text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                {allFiles.filter(f => f.fileType === 'dwg').length}
              </span>
            </button>
            <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left text-gray-600 hover:bg-gray-100 hover:text-gray-900">
              <File className="w-4 h-4" />
              <span className="text-sm font-medium">Images</span>
              <span className="ml-auto text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                {allFiles.filter(f => f.fileType === 'jpg').length}
              </span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{project.name} - Files</h1>
              <p className="text-gray-600">Project ID: {project.project_id}</p>
              {sharePointLink && (
                <p className="text-sm text-blue-600 mt-1">
                  Connected to SharePoint folder
                </p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search project files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" className="text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" className="text-gray-600">
                  <Download className="w-4 h-4 mr-2" />
                  Download All
                </Button>
                <Button className="bg-blue-600 text-white">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-auto">
          {/* SharePoint Integration Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {sharePointLink ? 'Connected SharePoint Folder' : 'SharePoint Integration'}
              </h3>
              <Button 
                onClick={handleSharePointAccess}
                variant="outline"
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in SharePoint
              </Button>
            </div>
            
            <div className="bg-white rounded-lg border">
              <div className="p-4 border-b border-gray-200 bg-blue-50">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Folder className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {sharePointLink ? `${project.name} - SharePoint` : "Gordon Street - SharePoint"}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {sharePointLink 
                        ? "Files from your configured SharePoint folder"
                        : "Access project files stored in SharePoint"
                      }
                    </p>
                    {sharePointLink && (
                      <p className="text-xs text-blue-600 mt-1 font-mono truncate">
                        {sharePointLink.length > 60 ? `${sharePointLink.substring(0, 60)}...` : sharePointLink}
                      </p>
                    )}
                  </div>
                  {!sharePointLink && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onNavigate("project-settings")}
                      className="text-blue-600 border-blue-200"
                    >
                      Configure SharePoint
                    </Button>
                  )}
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-12">
                      <input type="checkbox" className="rounded" />
                    </TableHead>
                    <TableHead>File Name</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Last Modified</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSharePointFiles.map((file) => (
                    <TableRow key={file.id} className="hover:bg-gray-50">
                      <TableCell>
                        <input type="checkbox" className="rounded" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <File className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium">{file.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatFileSize(file.size)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {file.createdAt}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {file.fileType.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Local Project Files Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Local Project Files</h3>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Grid className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-12">
                      <input type="checkbox" className="rounded" />
                    </TableHead>
                    <TableHead>File Name</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Last Modified</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFiles.map((file) => (
                    <TableRow key={file.id} className="hover:bg-gray-50">
                      <TableCell>
                        <input type="checkbox" className="rounded" />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <File className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium">{file.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatFileSize(file.size)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {file.createdAt}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {file.fileType.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* File Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Folder className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{totalSharePointFiles}</h4>
                  <p className="text-sm text-gray-500">SharePoint Files</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <File className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{projectFiles.length}</h4>
                  <p className="text-sm text-gray-500">Local Files</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Folder className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    {formatFileSize(totalSharePointSize)}
                  </h4>
                  <p className="text-sm text-gray-500">SharePoint Size</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Eye className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{sharePointFileTypes}</h4>
                  <p className="text-sm text-gray-500">File Types</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
