import React, { useState } from 'react';
import { ProjectSidePanel } from './ProjectSidePanel';
import { ProjectMainContent } from './ProjectMainContent';

interface ProjectsWithSidePanelProps {
  onNavigate: (page: string) => void;
  onSelectProject: (projectId: string) => void;
}

export const ProjectsWithSidePanel = ({ onNavigate, onSelectProject }: ProjectsWithSidePanelProps) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>();

  const handleProjectSelection = (projectId: string) => {
    setSelectedProjectId(projectId);
    onSelectProject(projectId);
  };

  return (
    <div className="fixed inset-0 bg-background z-40 flex">
      <ProjectSidePanel
        selectedProjectId={selectedProjectId}
        onSelectProject={handleProjectSelection}
        onNavigate={onNavigate}
      />
      <ProjectMainContent
        onNavigate={onNavigate}
        onSelectProject={handleProjectSelection}
        selectedProjectId={selectedProjectId}
      />
    </div>
  );
};