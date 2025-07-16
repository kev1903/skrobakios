import React from 'react';
import { ModernGanttChart } from './ModernGanttChart';
import { useGanttData } from '@/hooks/useGanttData';
import { Loader2 } from 'lucide-react';

interface GanttContainerProps {
  projectId: string;
  onClose?: () => void;
}

export const GanttContainer: React.FC<GanttContainerProps> = ({ 
  projectId,
  onClose 
}) => {
  const {
    tasks,
    dependencies,
    isLoading,
    error,
    handleTaskUpdate,
    handleDependencyCreate,
    handleDependencyDelete,
  } = useGanttData(projectId);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading project schedule...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load project data</p>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <ModernGanttChart
      tasks={tasks}
      onTaskUpdate={handleTaskUpdate}
      onDependencyCreate={handleDependencyCreate}
      onDependencyDelete={handleDependencyDelete}
      projectId={projectId}
    />
  );
};