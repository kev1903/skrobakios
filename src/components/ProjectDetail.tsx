import { useState, useEffect, useMemo, useRef } from "react";
import { useProjects, Project } from "@/hooks/useProjects";
import { ProjectSidebar } from "./ProjectSidebar";
import { ProjectInfo } from "./ProjectInfo";
import { ProjectProgress } from "./ProjectProgress";
import { ProjectMetrics } from "./ProjectMetrics";
import { LatestUpdates } from "./LatestUpdates";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Menu } from "lucide-react";
import { safeJsonParse } from "@/utils/secureJson";
import { useCompany } from "@/contexts/CompanyContext";
import { useScreenSize } from "@/hooks/use-mobile";
interface ProjectDetailProps {
  projectId: string | null;
  onNavigate: (page: string) => void;
}

export const ProjectDetail = ({ projectId, onNavigate }: ProjectDetailProps) => {

  const [project, setProject] = useState<Project | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Removed local loading state; using global 'loading' from useProjects
  const { getProject, loading } = useProjects();
  const { currentCompany } = useCompany();
  const lastFetchedIdRef = useRef<string | null>(null);
  const screenSize = useScreenSize();
  const isMobile = screenSize === 'mobile' || screenSize === 'mobile-small';
  // Reset state on project change
  useEffect(() => {
    console.log(`🔄 Project ID changed to: ${projectId}`);
    lastFetchedIdRef.current = null;
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
            return;
          }

          setProject(foundProject);
        } else {
          // Project not found, clear state
          setProject(null);
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
  }, [projectId, getProject, currentCompany?.id]);

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
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Content */}
      <div className={`flex-1 ${isMobile ? 'ml-0' : 'ml-40'} bg-white/80 backdrop-blur-sm border-l border-gray-200/30`}>
        {/* Mobile Menu Button */}
        {isMobile && (
          <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
              className="h-9 w-9"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground truncate">
              {project.name}
            </h1>
          </div>
        )}
        
        <div className={isMobile ? "p-4" : "p-8"}>
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
