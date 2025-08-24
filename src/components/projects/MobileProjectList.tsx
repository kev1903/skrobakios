import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, CheckCircle2, Clock, AlertTriangle, Building2, MoreHorizontal } from "lucide-react";
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
    <div className="min-h-screen bg-gray-50">
      {/* Clean Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onNavigate("home")}
            className="text-gray-600 hover:text-gray-800 p-0"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Project List</h1>
            <p className="text-sm text-gray-500">
              Manage and oversee all your projects
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
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
          <div className="bg-white rounded-lg p-3 text-center border border-gray-100">
            <div className="text-lg font-bold text-gray-900">{projectStats.total}</div>
            <div className="text-xs text-gray-500 mt-1">Total Projects</div>
          </div>
          
          <div className="bg-white rounded-lg p-3 text-center border border-gray-100">
            <div className="text-lg font-bold text-orange-600">{projectStats.active}</div>
            <div className="text-xs text-gray-500 mt-1">In Progress</div>
          </div>
          
          <div className="bg-white rounded-lg p-3 text-center border border-gray-100">
            <div className="text-lg font-bold text-green-600">{projectStats.completed}</div>
            <div className="text-xs text-gray-500 mt-1">Completed</div>
          </div>
          
          <div className="bg-white rounded-lg p-3 text-center border border-gray-100">
            <div className="text-lg font-bold text-yellow-600">{projectStats.pending}</div>
            <div className="text-xs text-gray-500 mt-1">Pending</div>
          </div>
        </div>

        {/* Clean Project List */}
        <div className="space-y-3">
          {projects.length === 0 ? (
            <div className="bg-white rounded-lg p-6">
              <ProjectEmptyState onNavigate={onNavigate} />
            </div>
          ) : (
            projects.map((project) => (
              <Card 
                key={project.id} 
                className="bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200"
                onClick={() => handleProjectClick(project.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs px-2 py-1 rounded-full ${getStatusColor(project.status)}`}
                        >
                          {getStatusLabel(project.status)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded">
                          #{project.id.slice(-6).toUpperCase()}
                        </span>
                      </div>
                      
                      <h3 className="font-medium text-gray-900 text-sm leading-tight mb-2 truncate">
                        {project.name}
                      </h3>
                      
                      {project.description && (
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {project.description}
                        </p>
                      )}
                    </div>
                    
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};