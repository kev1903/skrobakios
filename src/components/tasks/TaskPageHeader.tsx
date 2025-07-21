import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Project } from '@/hooks/useProjects';
import { AddTaskDialog } from './AddTaskDialog';

interface TaskPageHeaderProps {
  project: Project;
}

export const TaskPageHeader = ({ project }: TaskPageHeaderProps) => {
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false);

  return (
    <>
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">{project.name} Tasks</h1>
            <p className="text-muted-foreground">#{project.project_id}</p>
          </div>
          <div>
            <Button 
              onClick={() => setShowAddTaskDialog(true)}
              className="bg-primary hover:bg-primary/80 text-primary-foreground border border-border"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </div>
        </div>
      </div>
      
      <AddTaskDialog 
        isOpen={showAddTaskDialog}
        onClose={() => setShowAddTaskDialog(false)}
        projectId={project.id}
        status="Not Started"
      />
    </>
  );
};