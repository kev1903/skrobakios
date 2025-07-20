import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Plus, Building2, Calendar, MapPin, ChevronRight } from "lucide-react";
import { useProjects, Project } from "@/hooks/useProjects";
import { cn } from "@/lib/utils";

interface ProjectSidePanelProps {
  selectedProjectId?: string;
  onSelectProject: (projectId: string) => void;
  onNavigate: (page: string) => void;
  className?: string;
}

export const ProjectSidePanel = ({ 
  selectedProjectId, 
  onSelectProject, 
  onNavigate,
  className 
}: ProjectSidePanelProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { getProjects } = useProjects();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const fetchedProjects = await getProjects();
        setProjects(fetchedProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [getProjects]);

  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.project_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.location && project.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 'running':
      case 'active':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case 'on-hold':
        return 'bg-orange-500/10 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const handleProjectClick = (project: Project) => {
    onSelectProject(project.id);
    
    // Navigate based on project type
    if (project.project_id === "SK_25008") {
      onNavigate('sk25008-schedule');
    } else {
      onNavigate('project-detail');
    }
  };

  return (
    <div className={cn("w-80 bg-background border-r border-border flex flex-col", className)}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">Projects</h2>
          <Button
            size="sm"
            onClick={() => onNavigate('create-project')}
            className="h-8 px-2"
          >
            <Plus className="w-4 h-4 mr-1" />
            New
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Project Count */}
      <div className="px-4 py-2 text-sm text-muted-foreground border-b border-border">
        {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''} found
      </div>

      {/* Projects List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-muted/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No projects found</p>
              {searchTerm && (
                <p className="text-xs mt-1">Try adjusting your search</p>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => handleProjectClick(project)}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:bg-muted/50 hover:border-primary/30",
                    selectedProjectId === project.id 
                      ? "bg-primary/5 border-primary/30 shadow-sm" 
                      : "bg-background border-border"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className={cn(
                        "font-medium text-sm truncate",
                        selectedProjectId === project.id ? "text-primary" : "text-foreground"
                      )}>
                        {project.name}
                      </h3>
                      <p className="text-xs text-muted-foreground font-mono mt-1">
                        {project.project_id}
                      </p>
                    </div>
                    <ChevronRight className={cn(
                      "w-4 h-4 opacity-0 transition-opacity",
                      selectedProjectId === project.id ? "opacity-100 text-primary" : "group-hover:opacity-100"
                    )} />
                  </div>

                  {/* Status Badge */}
                  <div className="mb-2">
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs", getStatusColor(project.status || 'unknown'))}
                    >
                      {project.status || 'Unknown'}
                    </Badge>
                  </div>

                  {/* Location and Date */}
                  <div className="space-y-1">
                    {project.location && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="truncate">{project.location}</span>
                      </div>
                    )}
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span>
                        Created {new Date(project.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('projects')}
          className="w-full text-xs"
        >
          View All Projects
        </Button>
      </div>
    </div>
  );
};