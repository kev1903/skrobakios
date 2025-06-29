
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { File, Download, Share2 } from "lucide-react";
import { ProjectSidebar } from "./ProjectSidebar";
import { useToast } from "@/hooks/use-toast";
import { Project } from "@/hooks/useProjects";
import { FileControls } from "./files/FileControls";
import { FileGrid } from "./files/FileGrid";
import { FileList } from "./files/FileList";
import { SharePointIntegration } from "./files/SharePointIntegration";
import { FileType, FileItem } from "./files/types";
import { projectFiles, sampleSharePointFiles } from "./files/sampleData";

interface ProjectFilePageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

export const ProjectFilePage = ({ project, onNavigate }: ProjectFilePageProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFileType, setSelectedFileType] = useState<FileType>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [sharePointFiles, setSharePointFiles] = useState<FileItem[]>([]);
  const { toast } = useToast();

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "in-progress":
        return "In Progress";
      case "pending":
        return "Pending";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <ProjectSidebar 
        project={project} 
        activeSection="files"
        onNavigate={onNavigate}
        getStatusColor={getStatusColor}
        getStatusText={getStatusText}
      />
      
      <main className="flex-1 overflow-hidden">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Project Files</h1>
            <p className="text-gray-600">Manage and organize all project documents and files</p>
          </div>

          {/* Controls */}
          <FileControls
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedFileType={selectedFileType}
            onFileTypeChange={setSelectedFileType}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onSyncSharePoint={handleSyncSharePoint}
            isLoading={isLoading}
          />

          {/* SharePoint Integration Section */}
          <SharePointIntegration sharePointFilesCount={sharePointFiles.length} />

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
                  {viewMode === "grid" ? (
                    <FileGrid 
                      files={filteredFiles}
                      selectedFiles={selectedFiles}
                      onFileSelect={handleFileSelect}
                    />
                  ) : (
                    <FileList 
                      files={filteredFiles}
                      selectedFiles={selectedFiles}
                      onFileSelect={handleFileSelect}
                    />
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};
