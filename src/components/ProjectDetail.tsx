import { useState, useEffect } from "react";
import { useProjects, Project } from "@/hooks/useProjects";
import { ProjectSidebar } from "./ProjectSidebar";
import { ProjectHeader } from "./ProjectHeader";
import { ProjectInfo } from "./ProjectInfo";
import { ProjectProgress } from "./ProjectProgress";
import { ProjectMetrics } from "./ProjectMetrics";
import { LatestUpdates } from "./LatestUpdates";

interface ProjectDetailProps {
  projectId: string | null;
  onNavigate: (page: string) => void;
}

export const ProjectDetail = ({ projectId, onNavigate }: ProjectDetailProps) => {
  const [project, setProject] = useState<Project | null>(null);
  const [bannerImage, setBannerImage] = useState<string>("");
  const [bannerPosition, setBannerPosition] = useState({ x: 0, y: 0, scale: 1 });
  const { getProjects, loading } = useProjects();

  useEffect(() => {
    const fetchProject = async () => {
      const projects = await getProjects();
      const foundProject = projects.find(p => p.id === projectId);
      if (foundProject) {
        setProject(foundProject);
        
        // Load banner image from localStorage
        const savedBanner = localStorage.getItem(`project_banner_${foundProject.id}`);
        if (savedBanner) {
          setBannerImage(savedBanner);
        }

        // Load banner position from localStorage
        const savedBannerPosition = localStorage.getItem(`project_banner_position_${foundProject.id}`);
        if (savedBannerPosition) {
          try {
            const position = JSON.parse(savedBannerPosition);
            setBannerPosition(position);
          } catch (error) {
            console.error('Error parsing saved banner position:', error);
          }
        }
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  // Fallback project data if no project is found
  const fallbackProject: Project = {
    id: "1",
    project_id: "SK23003",
    name: "Gordon Street, Balwyn",
    location: "Balwyn, VIC",
    created_at: "2024-06-15T00:00:00Z",
    status: "completed",
    contract_price: "$2,450,000",
    start_date: "2024-06-15",
    deadline: "2024-08-30",
    updated_at: "2024-06-15T00:00:00Z",
    priority: "Medium"
  };

  const currentProject = project || fallbackProject;

  const handleProjectUpdate = (updatedProject: Project) => {
    setProject(updatedProject);
  };

  const getProgress = (status: string) => {
    switch (status) {
      case "completed":
        return 100;
      case "running":
        return 65;
      case "pending":
        return 0;
      default:
        return 0;
    }
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

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const progress = getProgress(currentProject.status);
  const wbsCount = Math.floor(Math.random() * 10) + 8;

  if (loading) {
    return (
      <div className="h-screen flex bg-gray-50">
        <div className="flex items-center justify-center w-full">
          <div className="text-gray-500">Loading project details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Project Sidebar */}
      <ProjectSidebar
        project={currentProject}
        onNavigate={onNavigate}
        getStatusColor={getStatusColor}
        getStatusText={getStatusText}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <ProjectHeader
            project={currentProject}
            bannerImage={bannerImage}
            bannerPosition={bannerPosition}
            getStatusColor={getStatusColor}
            getStatusText={getStatusText}
            onProjectUpdate={handleProjectUpdate}
          />

          <ProjectInfo
            project={currentProject}
            getStatusText={getStatusText}
            formatDate={formatDate}
          />

          <ProjectProgress progress={progress} wbsCount={wbsCount} />

          <ProjectMetrics project={currentProject} />

          <LatestUpdates
            project={currentProject}
            progress={progress}
            wbsCount={wbsCount}
          />
        </div>
      </div>
    </div>
  );
};
