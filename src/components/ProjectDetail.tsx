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
  // Removed local loading state; using global 'loading' from useProjects
  const { getProject, loading } = useProjects();
  const { currentCompany } = useCompany();
  const lastFetchedIdRef = useRef<string | null>(null);
  // Reset banner state immediately on project change and clear any stale cache
  useEffect(() => {
    console.log(`🔄 Project ID changed to: ${projectId}`);
    setBannerImage("");
    setBannerPosition({ x: 0, y: 0, scale: 1 });
    
    // Clear lastFetchedIdRef to force fresh fetch
    lastFetchedIdRef.current = null;
    
    // Clear any stale localStorage entries from previous projects to prevent cross-contamination
    if (projectId) {
      // Only clear if we have a new project ID
      const keys = Object.keys(localStorage);
      const bannerKeys = keys.filter(key => key.startsWith('project_banner_') && !key.includes(projectId));
      bannerKeys.forEach(key => {
        console.log(`🗑️ Clearing stale localStorage key: ${key}`);
        localStorage.removeItem(key);
      });
    }
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

    const fetchProject = async () => {
      if (!isActive) return;

      // If no projectId yet, do nothing
      if (!projectId) {
        return;
      }

      // Avoid redundant fetches for the same project
      if (lastFetchedIdRef.current === projectId) {
        return;
      }

      console.log(`🔄 Fetching project data for: ${projectId}`);
      lastFetchedIdRef.current = projectId;
      
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
          
          // Clear any previous project's banner data first to avoid cross-contamination
          setBannerImage("");
          setBannerPosition({ x: 0, y: 0, scale: 1 });
          
          // Load banner from database if available
          if (foundProject.banner_image) {
            console.log(`✅ Loading banner from database for project ${foundProject.id}`);
            setBannerImage(foundProject.banner_image);
            
            if (foundProject.banner_position) {
              setBannerPosition(foundProject.banner_position);
            }
          } else {
            console.log(`ℹ️ No banner in database for project ${foundProject.id}`);
            // Clear any stale localStorage data for this project to prevent cross-contamination
            const localStorageKey = `project_banner_${foundProject.id}`;
            const positionKey = `project_banner_position_${foundProject.id}`;
            
            // Remove any existing localStorage entries to ensure clean state
            localStorage.removeItem(localStorageKey);
            localStorage.removeItem(positionKey);
            
            // Explicitly set empty banner
            setBannerImage("");
            setBannerPosition({ x: 0, y: 0, scale: 1 });
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
      }
    };

    fetchProject();

    return () => {
      isActive = false;
    };
  }, [projectId, getProject, currentCompany?.id]); // Removed 'project' to prevent infinite loops

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
  if (loading && !project) {
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
  if (!project && !loading) {
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
