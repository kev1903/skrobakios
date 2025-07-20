import React from 'react';
import { ProjectList } from '@/components/ProjectList';

interface ProjectMainContentProps {
  onNavigate: (page: string) => void;
  onSelectProject?: (projectId: string) => void;
}

export const ProjectMainContent = ({ onNavigate, onSelectProject }: ProjectMainContentProps) => {
  return (
    <div className="flex-1 h-full">
      <ProjectList onNavigate={onNavigate} onSelectProject={onSelectProject} />
    </div>
  );
};