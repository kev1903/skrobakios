import React from 'react';
import { ProjectSidePanel } from './ProjectSidePanel';
import { ProjectMainContent } from './ProjectMainContent';
import { Project } from '@/hooks/useProjects';

interface ProjectsWithSidePanelProps {
  onNavigate: (page: string) => void;
  onSelectProject?: (projectId: string) => void;
}

export const ProjectsWithSidePanel = ({ onNavigate, onSelectProject }: ProjectsWithSidePanelProps) => {
  const handleSidePanelProjectSelect = (project: Project) => {
    // Navigate to the specific project details
    onNavigate(`individual-project-dashboard?project=${project.id}`);
  };

  return (
    <div className="flex h-screen bg-background">
      <ProjectSidePanel 
        onNavigate={onNavigate} 
        onSelectProject={handleSidePanelProjectSelect}
      />
      <ProjectMainContent 
        onNavigate={onNavigate} 
        onSelectProject={onSelectProject}
      />
    </div>
  );
};