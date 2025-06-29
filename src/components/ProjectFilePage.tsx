
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Folder, 
  File, 
  Download, 
  Eye, 
  Plus, 
  Search, 
  Filter,
  Grid,
  List,
  Calendar,
  User,
  FileText,
  Image,
  Archive,
  Share2,
  Upload,
  RefreshCw,
  ExternalLink
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ProjectSidebar } from "./ProjectSidebar";
import { useToast } from "@/hooks/use-toast";
import { Project } from "@/hooks/useProjects";

interface ProjectFilePageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

type FileType = "pdf" | "dwg" | "jpg" | "doc" | "xls" | "all";

interface FileItem {
  id: string;
  name: string;
  type: FileType;
  size: string;
  modified: string;
  author: string;
  isFolder?: boolean;
  path: string;
}

export const ProjectFilePage = ({ project, onNavigate }: ProjectFilePageProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFileType, setSelectedFileType] = useState<FileType>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [sharePointFiles, setSharePointFiles] = useState<FileItem[]>([]);
  const { toast } = useToast();

  // Sample project files data
  const projectFiles: FileItem[] = [
    {
      id: "1",
      name: "Architectural Plans",
      type: "pdf",
      size: "2.4 MB",
      modified: "2024-06-20",
      author: "John Smith",
      isFolder: false,
      path: "/project/architectural"
    },
    {
      id: "2",
      name: "Site Survey",
      type: "dwg",
      size: "5.1 MB",
      modified: "2024-06-18",
      author: "Mike Johnson",
      isFolder: false,
      path: "/project/survey"
    },
    {
      id: "3",
      name: "Photos",
      type: "jpg",
      size: "Folder",
      modified: "2024-06-22",
      author: "Various",
      isFolder: true,
      path: "/project/photos"
    },
    {
      id: "4",
      name: "Contract Documents",
      type: "doc",
      size: "1.2 MB",
      modified: "2024-06-15",
      author: "Legal Team",
      isFolder: false,
      path: "/project/contracts"
    }
  ];

  // Sample SharePoint files
  const sampleSharePointFiles: FileItem[] = [
    {
      id: "sp1",
      name: "Project Specifications.docx",
      type: "doc",
      size: "3.2 MB",
      modified: "2024-06-25",
      author: "SharePoint User",
      path: "/sharepoint/specs"
    },
    {
      id: "sp2",
      name: "Budget Analysis.xlsx",
      type: "xls",
      size: "1.8 MB",
      modified: "2024-06-24",
      author: "Finance Team",
      path: "/sharepoint/finance"
    },
    {
      id: "sp3",
      name: "Meeting Notes Q2.pdf",
      type: "pdf",
      size: "890 KB",
      modified: "2024-06-23",
      author: "Project Manager",
      path: "/sharepoint/meetings"
    }
  ];

  useEffect(() => {
    // Simulate loading SharePoint files
    const timer = setTimeout(() => {
      setSharePointFiles(sampleSharePointFiles);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const allFiles = [...projectFiles, ...sharePointFiles];

  const filteredFiles = allFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedFileType === "all" || file.type === selectedFileType;
    return matchesSearch && matchesType;
  });

  const handleFileSelect = (fileId: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    setSelectedFiles(newSelected);
  };

  const handleSyncSharePoint = async () => {
    setIsLoading(true);
    try {
      // Simulate SharePoint sync
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSharePointFiles(sampleSharePointFiles);
      toast({
        title: "SharePoint Sync Complete",
        description: "Successfully synced files from SharePoint.",
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to sync SharePoint files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getFileIcon = (type: FileType, isFolder?: boolean) => {
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

  const getFileBadgeColor = (path: string) => {
    if (path.includes('sharepoint')) {
      return 'bg-blue-100 text-blue-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  const renderFileGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredFiles.map((file) => (
        <Card 
          key={file.id} 
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedFiles.has(file.id) ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => handleFileSelect(file.id)}
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

  const renderFileList = () => (
    <div className="space-y-2">
      {filteredFiles.map((file) => (
        <div 
          key={file.id}
          className={`flex items-center space-x-4 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors ${
            selectedFiles.has(file.id) ? 'bg-blue-50 border-blue-200' : ''
          }`}
          onClick={() => handleFileSelect(file.id)}
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

  return (
    <div className="min-h-screen flex bg-gray-50">
      <ProjectSidebar 
        project={project} 
        currentPage="project-files" 
        onNavigate={onNavigate} 
      />
      
      <main className="flex-1 overflow-hidden">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Project Files</h1>
            <p className="text-gray-600">Manage and organize all project documents and files</p>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <select
                value={selectedFileType}
                onChange={(e) => setSelectedFileType(e.target.value as FileType)}
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
                  onClick={() => setViewMode("list")}
                  className="rounded-r-none"
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-l-none"
                >
                  <Grid className="w-4 h-4" />
                </Button>
              </div>
              
              <Button 
                onClick={handleSyncSharePoint}
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

          {/* SharePoint Integration Section */}
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-blue-800">
                <Share2 className="w-5 h-5" />
                <span>SharePoint Integration</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 mb-1">
                    Connected to SharePoint folder: <strong>Construction Projects/Gordon Street</strong>
                  </p>
                  <p className="text-xs text-blue-600">
                    {sharePointFiles.length} files synced • Last sync: Just now
                  </p>
                </div>
                <Button variant="outline" size="sm" className="text-blue-700 border-blue-300">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in SharePoint
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Files Display */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Files ({filteredFiles.length})</CardTitle>
                {selectedFiles.size > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {selectedFiles.size} selected
                    </span>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {filteredFiles.length === 0 ? (
                <div className="text-center py-12">
                  <File className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
                  <p className="text-gray-600">Try adjusting your search or filter criteria</p>
                </div>
              ) : (
                <>
                  {viewMode === "grid" ? renderFileGrid() : renderFileList()}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};
