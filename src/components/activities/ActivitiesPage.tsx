import { ActivitiesCanvas } from "./ActivitiesCanvas";
import { ActivityPresets } from "./ActivityPresets";
import { ProjectSidebar } from "@/components/ProjectSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Grid3X3, Activity } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useState, useEffect } from "react";

interface ActivitiesPageProps {
  projectId: string | null;
  onNavigate: (page: string) => void;
}

export function ActivitiesPage({ projectId, onNavigate }: ActivitiesPageProps) {
  const { getProject } = useProjects();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'presets' | 'canvas'>('presets');

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) {
        setLoading(false);
        return;
      }
      
      try {
        const foundProject = await getProject(projectId);
        setProject(foundProject);
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, getProject]);

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

  if (loading) {
    return (
      <div className="h-screen flex backdrop-blur-xl bg-black/20 border border-white/10">
        <div className="flex items-center justify-center w-full">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-white/80">Loading activities...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!project || !projectId) {
    return (
      <div className="h-screen flex backdrop-blur-xl bg-black/20 border border-white/10">
        <div className="flex items-center justify-center w-full">
          <div className="text-center">
            <div className="text-white text-lg mb-4">Project not found</div>
            <Button 
              onClick={() => onNavigate("home")}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex backdrop-blur-xl bg-black/20 border border-white/10">
      {/* Project Sidebar */}
      <ProjectSidebar
        project={project}
        onNavigate={onNavigate}
        getStatusColor={getStatusColor}
        getStatusText={getStatusText}
        activeSection="activities"
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-48 backdrop-blur-xl bg-white/5 border-l border-white/10">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onNavigate(`project-details&projectId=${projectId}`)}
                className="flex items-center space-x-2 text-white/80 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Project</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-white">Activities</h1>
                <p className="text-white/60">Project: {project.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* View Toggle */}
              <div className="flex bg-white/10 rounded-lg p-1">
                <Button
                  variant={activeView === 'presets' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('presets')}
                  className={`${
                    activeView === 'presets' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Presets
                </Button>
                <Button
                  variant={activeView === 'canvas' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('canvas')}
                  className={`${
                    activeView === 'canvas' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Canvas
                </Button>
              </div>
              
              <Badge variant="outline" className="text-white/60 border-white/20">
                Use Skai AI: "Create activity Site Prep: 3d, $500 cost"
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {activeView === 'presets' ? (
            <ActivityPresets 
              projectId={projectId} 
              onActivityCreated={() => {
                // Switch to canvas view after creating activities
                setActiveView('canvas');
              }} 
            />
          ) : (
            <ActivitiesCanvas projectId={projectId} />
          )}
        </div>
      </div>
    </div>
  );
}