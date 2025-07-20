import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { useProjects, Project } from "@/hooks/useProjects";
import { ProjectListHeader } from "./ProjectListHeader";
import { ProjectGridView } from "./ProjectGridView";
import { ProjectTableView } from "./ProjectTableView";
import { ProjectDashboardView } from "./ProjectDashboardView";
import { ProjectLoadingState } from "./ProjectLoadingState";
import { ProjectEmptyState } from "./ProjectEmptyState";
import { useSortPreferences } from "@/hooks/useSortPreferences";
import { SortField, ViewMode } from "./types";

interface ProjectMainContentProps {
  onNavigate: (page: string) => void;
  onSelectProject: (projectId: string) => void;
  selectedProjectId?: string;
}

export const ProjectMainContent = ({ 
  onNavigate, 
  onSelectProject, 
  selectedProjectId 
}: ProjectMainContentProps) => {
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const { getProjects, loading } = useProjects();
  const { sortField, sortDirection, handleSort: handleSortPersistent } = useSortPreferences('projects', 'name' as SortField);

  useEffect(() => {
    const fetchProjects = async () => {
      const fetchedProjects = await getProjects();
      setProjects(fetchedProjects);
    };

    fetchProjects();
  }, [getProjects]);

  const handleSort = (field: SortField) => {
    handleSortPersistent(field);
  };

  const getSortedProjects = () => {
    return [...projects].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (!aValue && !bValue) return 0;
      if (!aValue) return sortDirection === 'asc' ? 1 : -1;
      if (!bValue) return sortDirection === 'asc' ? -1 : 1;

      aValue = String(aValue).toLowerCase();
      bValue = String(bValue).toLowerCase();

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProjects(projects.map(p => p.id));
    } else {
      setSelectedProjects([]);
    }
  };

  const handleSelectProject = (projectId: string, checked: boolean) => {
    if (checked) {
      setSelectedProjects(prev => [...prev, projectId]);
    } else {
      setSelectedProjects(prev => prev.filter(id => id !== projectId));
    }
  };

  const handleProjectClick = (projectId: string) => {
    if (onSelectProject) {
      onSelectProject(projectId);
    }
    
    // Find the project to determine navigation
    const project = projects.find(p => p.id === projectId);
    if (project?.project_id === "SK_25008") {
      onNavigate('sk25008-schedule');
    } else {
      onNavigate('project-detail');
    }
  };

  if (loading) {
    return <ProjectLoadingState />;
  }

  return (
    <div className="flex-1 bg-background overflow-auto">
      <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.15)_1px,transparent_0)] bg-[length:24px_24px] pointer-events-none" />
        <div className="relative z-10 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onNavigate("home")}
                className="flex items-center space-x-2 text-foreground hover:text-primary"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Button>
            </div>
            
            <Button
              onClick={() => onNavigate('create-project')}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </Button>
          </div>

          <ProjectListHeader
            projectsCount={projects.length}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onNavigate={onNavigate}
          />

          {/* Projects Content */}
          {projects.length === 0 ? (
            <ProjectEmptyState onNavigate={onNavigate} />
          ) : viewMode === 'dashboard' ? (
            <ProjectDashboardView projects={getSortedProjects()} />
          ) : viewMode === 'grid' ? (
            <ProjectGridView
              projects={getSortedProjects()}
              selectedProjects={selectedProjects}
              onSelectProject={handleSelectProject}
              onProjectClick={handleProjectClick}
            />
          ) : (
            <ProjectTableView
              projects={getSortedProjects()}
              selectedProjects={selectedProjects}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              onSelectAll={handleSelectAll}
              onSelectProject={handleSelectProject}
              onProjectClick={handleProjectClick}
            />
          )}
        </div>
      </div>
    </div>
  );
};