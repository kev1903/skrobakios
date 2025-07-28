
import React from 'react';
import { Project } from '@/hooks/useProjects';
import { Badge } from '@/components/ui/badge';
import { getStatusColor, getStatusText } from './utils/taskUtils';

interface TaskPageHeaderProps {
  project: Project;
}

export const TaskPageHeader = ({ project }: TaskPageHeaderProps) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Project Tasks</h1>
          <div className="flex items-center gap-4">
            <p className="text-slate-600">{project.name}</p>
            <Badge variant="outline" className={`${getStatusColor(project.status)} text-xs`}>
              {getStatusText(project.status)}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};
