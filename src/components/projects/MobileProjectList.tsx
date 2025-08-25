import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, MoreHorizontal } from "lucide-react";
import { useProjects, Project } from "@/hooks/useProjects";
import { ProjectLoadingState } from "./ProjectLoadingState";
import { ProjectEmptyState } from "./ProjectEmptyState";

interface MobileProjectListProps {
  onNavigate: (page: string) => void;
  onSelectProject?: (projectId: string) => void;
}

export const MobileProjectList = ({ onNavigate, onSelectProject }: MobileProjectListProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const { getProjects, loading } = useProjects();

  useEffect(() => {
    const fetchProjects = async () => {
      const fetchedProjects = await getProjects();
      setProjects(fetchedProjects);
    };

    fetchProjects();
  }, [getProjects]);

  // Calculate project statistics
  const projectStats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'running').length,
    completed: projects.filter(p => p.status === 'completed').length,
    pending: projects.filter(p => p.status === 'pending').length,
  };

  const handleProjectClick = (projectId: string) => {
    if (onSelectProject) {
      onSelectProject(projectId);
    }
    onNavigate("project-detail");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'running': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'running': return 'In Progress';
      case 'pending': return 'Pending';
      default: return status;
    }
  };

  if (loading) {
    return <ProjectLoadingState />;
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Clean Header */}
      <div className="bg-background border-b border-border px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onNavigate("home")}
            className="text-muted-foreground hover:text-foreground p-0"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Project List</h1>
            <p className="text-sm text-muted-foreground">
              Manage and oversee all your projects
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          <Button 
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => onNavigate('create-project')}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
        </div>
      </div>

      {/* Minimal Stats Grid */}
      <div className="px-4 py-6">
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-background rounded-lg p-3 text-center border border-border">
            <div className="text-lg font-bold text-foreground">{projectStats.total}</div>
            <div className="text-xs text-muted-foreground mt-1">Total Projects</div>
          </div>
          
          <div className="bg-background rounded-lg p-3 text-center border border-border">
            <div className="text-lg font-bold text-orange-600">{projectStats.active}</div>
            <div className="text-xs text-muted-foreground mt-1">In Progress</div>
          </div>
          
          <div className="bg-background rounded-lg p-3 text-center border border-border">
            <div className="text-lg font-bold text-green-600">{projectStats.completed}</div>
            <div className="text-xs text-muted-foreground mt-1">Completed</div>
          </div>
          
          <div className="bg-background rounded-lg p-3 text-center border border-border">
            <div className="text-lg font-bold text-yellow-600">{projectStats.pending}</div>
            <div className="text-xs text-muted-foreground mt-1">Pending</div>
          </div>
        </div>

        {/* Simple Project List */}
        <div className="bg-background rounded-lg">
          {projects.length === 0 ? (
            <div className="p-6">
              <ProjectEmptyState onNavigate={onNavigate} />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {projects.map((project) => (
                <div 
                  key={project.id}
                  className="flex items-center justify-between p-4 hover:bg-accent/50 active:bg-accent transition-colors cursor-pointer"
                  onClick={() => handleProjectClick(project.id)}
                >
                  <div className="flex-1 min-w-0 space-y-2">
                    <div>
                      <h3 className="font-medium text-foreground leading-tight mb-2">
                        {project.name}
                      </h3>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(project.status)}`}
                      >
                        {getStatusLabel(project.status)}
                      </Badge>
                      <p className="text-sm text-muted-foreground font-mono">
                        #{project.id.slice(-6).toUpperCase()}
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground flex-shrink-0 ml-2"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};