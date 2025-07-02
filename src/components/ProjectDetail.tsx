import { useState, useEffect, useMemo, useRef } from "react";
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
  const [localLoading, setLocalLoading] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { getProject, loading } = useProjects();

  useEffect(() => {
    // Set timeout for loading state
    timeoutRef.current = setTimeout(() => {
      setLocalLoading(false);
    }, 3000); // 3 second timeout

    const fetchProject = async () => {
      setLocalLoading(true);
      
      if (!projectId) {
        // No projectId provided, show message or redirect
        setLocalLoading(false);
        return;
      }
      
      try {
        const foundProject = await getProject(projectId);
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
        } else {
          // Project not found, set to null
          setProject(null);
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        // Set to null on error
        setProject(null);
      } finally {
        setLocalLoading(false);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      }
    };

    fetchProject();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [projectId, getProject]);

  // Show loading or error message if no project is available
  if (localLoading && !project) {
    return (
      <div className="h-screen flex bg-gray-50">
        <div className="flex items-center justify-center w-full">
          <div className="text-gray-500">Loading project details...</div>
        </div>
      </div>
    );
  }

  // Show error message if no project found and not loading
  if (!project && !localLoading) {
    return (
      <div className="h-screen flex bg-gray-50">
        <div className="flex items-center justify-center w-full">
          <div className="text-center">
            <div className="text-gray-500 text-lg mb-2">Project not found</div>
            <button 
              onClick={() => onNavigate("project-dashboard")}
              className="text-blue-600 hover:text-blue-800"
            >
              Back to Projects
            </button>
          </div>
        </div>
      </div>
    );
  }

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

  // Ensure we have a valid project before proceeding
  if (!project) {
    return null;
  }

  const progress = useMemo(() => getProgress(project.status), [project.status]);
  const wbsCount = useMemo(() => {
    // Generate consistent count based on project ID to avoid changing on each render
    const hash = project.id.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return Math.abs(hash % 10) + 8;
  }, [project.id]);

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Project Sidebar */}
      <ProjectSidebar
        project={project}
        onNavigate={onNavigate}
        getStatusColor={getStatusColor}
        getStatusText={getStatusText}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <ProjectHeader
            project={project}
            bannerImage={bannerImage}
            bannerPosition={bannerPosition}
            getStatusColor={getStatusColor}
            getStatusText={getStatusText}
            onProjectUpdate={handleProjectUpdate}
          />

          <ProjectInfo
            project={project}
            getStatusText={getStatusText}
            formatDate={formatDate}
          />

          <ProjectProgress progress={progress} wbsCount={wbsCount} />

          <ProjectMetrics project={project} />

          <LatestUpdates
            project={project}
            progress={progress}
            wbsCount={wbsCount}
          />
        </div>
      </div>
    </div>
  );
};
