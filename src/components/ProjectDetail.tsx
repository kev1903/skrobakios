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

  // Always call useMemo hooks before any conditional logic
  const progress = useMemo(() => {
    if (!project) return 0;
    switch (project.status) {
      case "completed": return 100;
      case "running": return 65;
      case "pending": return 0;
      default: return 0;
    }
  }, [project?.status]);

  const wbsCount = useMemo(() => {
    if (!project) return 8;
    // Generate consistent count based on project ID to avoid changing on each render
    const hash = project.id.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return Math.abs(hash % 10) + 8;
  }, [project?.id]);

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

  const handleProjectUpdate = (updatedProject: Project) => {
    setProject(updatedProject);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "running":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30";
      case "pending":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
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

  // Show loading state
  if (localLoading && !project) {
    return (
      <div className="h-screen flex backdrop-blur-xl bg-black/20 border border-white/10">
        <div className="flex items-center justify-center w-full">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-white/80">Loading project details...</div>
          </div>
        </div>
      </div>
    );
  }

  // Show error message if no project found and not loading
  if (!project && !localLoading) {
    return (
      <div className="h-screen flex backdrop-blur-xl bg-black/20 border border-white/10">
        <div className="flex items-center justify-center w-full">
          <div className="text-center">
            <div className="text-white text-lg mb-4">Project not found</div>
            <button 
              onClick={() => onNavigate("projects")}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm px-4 py-2 rounded-lg transition-all duration-300"
            >
              Back to Projects
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Ensure we have a valid project before proceeding
  if (!project) {
    return null;
  }

  return (
    <div className="h-screen flex backdrop-blur-xl bg-black/20 border border-white/10">
      {/* Project Sidebar */}
      <ProjectSidebar
        project={project}
        onNavigate={onNavigate}
        getStatusColor={getStatusColor}
        getStatusText={getStatusText}
        activeSection="insights"
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto ml-48 backdrop-blur-xl bg-white/5 border-l border-white/10">
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
