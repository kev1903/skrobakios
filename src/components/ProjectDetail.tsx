import { useState, useEffect, useMemo, useRef } from "react";
import { useProjects, Project } from "@/hooks/useProjects";
import { ProjectSidebar } from "./ProjectSidebar";
import { ProjectHeader } from "./ProjectHeader";
import { ProjectInfo } from "./ProjectInfo";
import { ProjectProgress } from "./ProjectProgress";
import { ProjectMetrics } from "./ProjectMetrics";
import { LatestUpdates } from "./LatestUpdates";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { safeJsonParse } from "@/utils/secureJson";
import { useCompany } from "@/contexts/CompanyContext";
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
  const { currentCompany } = useCompany();
  // Reset banner state immediately on project change to avoid showing stale images
  useEffect(() => {
    setBannerImage("");
    setBannerPosition({ x: 0, y: 0, scale: 1 });
  }, [projectId]);

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
    let isActive = true;

    // Set timeout for loading state
    timeoutRef.current = setTimeout(() => {
      if (!isActive) return;
      setLocalLoading(false);
    }, 5000); // Extended timeout to allow for project auto-selection

    const fetchProject = async () => {
      if (!isActive) return;
      setLocalLoading(true);
      
      if (!projectId) {
        // No projectId provided - wait a bit for auto-selection to happen
        setTimeout(() => {
          if (!isActive) return;
          setLocalLoading(false);
        }, 2000); // Wait 2 seconds for auto-selection
        return;
      }
      
      try {
        const foundProject = await getProject(projectId);
        if (!isActive) return; // Prevent stale updates when switching projects quickly
        if (foundProject) {
          // Enforce company scope to avoid showing projects from other businesses
          if (currentCompany?.id && foundProject.company_id !== currentCompany.id) {
            console.warn(`Project ${foundProject.id} does not belong to current company ${currentCompany.id}. Clearing state.`);
            setProject(null);
            setBannerImage("");
            setBannerPosition({ x: 0, y: 0, scale: 1 });
            return;
          }

          setProject(foundProject);
          
          // Load banner data from database (with fallback to localStorage for legacy)
          if (foundProject.banner_image && foundProject.banner_image.trim() !== "") {
            // Accept both base64 data URIs and URL paths (e.g. /lovable-uploads/... or http urls)
            const isValidBase64Image = /^data:image\/(jpeg|jpg|png|gif|webp|bmp);base64,/.test(foundProject.banner_image);
            const isUrlImage = /^(https?:\/\/|\/)/.test(foundProject.banner_image);
            
            if (isValidBase64Image || isUrlImage) {
              console.log(`Loading valid banner from database for project ${foundProject.id}`);
              setBannerImage(foundProject.banner_image);
              
              // Load banner position from database
              if (foundProject.banner_position && typeof foundProject.banner_position === 'object') {
                const pos = foundProject.banner_position as { x: number; y: number; scale: number };
                if (typeof pos.x === "number" && typeof pos.y === "number" && typeof pos.scale === "number") {
                  setBannerPosition(pos);
                } else {
                  setBannerPosition({ x: 0, y: 0, scale: 1 });
                }
              } else {
                setBannerPosition({ x: 0, y: 0, scale: 1 });
              }
            } else {
              console.warn(`Invalid banner data found in database for project ${foundProject.id}`);
              setBannerImage("");
              setBannerPosition({ x: 0, y: 0, scale: 1 });
            }
          } else {
            // Fallback to localStorage for legacy banner data
            const savedBanner = localStorage.getItem(`project_banner_${foundProject.id}`);
            if (savedBanner && savedBanner.trim() !== "") {
              console.log(`Loading banner from localStorage for project ${foundProject.id}`);
              setBannerImage(savedBanner);
              
              const savedBannerPosition = localStorage.getItem(`project_banner_position_${foundProject.id}`);
              if (savedBannerPosition) {
                const position = safeJsonParse(savedBannerPosition, { fallback: null });
                if (position && typeof position.x === "number" && typeof position.y === "number" && typeof position.scale === "number") {
                  setBannerPosition(position);
                } else {
                  setBannerPosition({ x: 0, y: 0, scale: 1 });
                }
              } else {
                setBannerPosition({ x: 0, y: 0, scale: 1 });
              }
            } else {
              console.log(`No banner found for project ${foundProject.id}`);
              setBannerImage("");
              setBannerPosition({ x: 0, y: 0, scale: 1 });
            }
          }
        } else {
          // Project not found, clear state
          setProject(null);
          setBannerImage("");
          setBannerPosition({ x: 0, y: 0, scale: 1 });
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        if (!isActive) return;
        // Set to null on error
        setProject(null);
      } finally {
        if (!isActive) return;
        setLocalLoading(false);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      }
    };

    fetchProject();

    return () => {
      isActive = false;
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
      <div className="h-screen flex bg-gradient-to-br from-slate-50 to-slate-100 border border-gray-200/50">
        <div className="flex items-center justify-center w-full">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-slate-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-slate-600">Loading project details...</div>
          </div>
        </div>
      </div>
    );
  }

  // Show error message if no project found and not loading
  if (!project && !localLoading) {
    return (
      <div className="h-screen flex bg-gradient-to-br from-slate-50 to-slate-100 border border-gray-200/50">
        <div className="flex items-center justify-center w-full">
          <div className="text-center">
            <div className="text-slate-700 text-lg mb-4">
              {!projectId ? "No project selected" : "Project not found"}
            </div>
            <p className="text-slate-600 mb-4">
              {!projectId 
                ? "Please select a project to view its details" 
                : "The requested project could not be found"
              }
            </p>
            <button 
              onClick={() => onNavigate("projects")}
              className="bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 px-4 py-2 rounded-lg transition-all duration-300 shadow-md"
            >
              View All Projects
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
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-slate-100 border border-gray-200/50">
      {/* Project Sidebar */}
      <ProjectSidebar
        project={project}
        onNavigate={onNavigate}
        getStatusColor={getStatusColor}
        getStatusText={getStatusText}
        activeSection="insights"
      />

      {/* Main Content */}
      <div className="flex-1 ml-48 bg-white/80 backdrop-blur-sm border-l border-gray-200/30">
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
