import React from 'react';
import { Project } from '@/hooks/useProjects';

interface TaskPageHeaderProps {
  project: Project;
}

export const TaskPageHeader = ({ project }: TaskPageHeaderProps) => {
  return (
    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white mb-2">{project.name} Tasks</h1>
          <p className="text-white/70">#{project.project_id}</p>
        </div>
      </div>
    </div>
  );
};