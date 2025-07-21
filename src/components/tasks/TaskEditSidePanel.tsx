
import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Task, useTaskContext } from './TaskContext';
import { TaskEditHeader } from './TaskEditHeader';
import { TaskEditForm } from './TaskEditForm';
import { EnhancedTaskEditForm } from './enhanced/EnhancedTaskEditForm';
import { TaskEditActions } from './TaskEditActions';
import { SubtasksList } from './subtasks';
import { TaskCommentsActivity } from './TaskCommentsActivity';
import { SubmittalWorkflow } from './SubmittalWorkflow';
import { TaskAttachmentsDisplay } from './TaskAttachmentsDisplay';
import { useIsMobile } from '@/hooks/use-mobile';

import { useToast } from '@/hooks/use-toast';

interface TaskEditSidePanelProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
}

export const TaskEditSidePanel = ({ task, isOpen, onClose, projectId }: TaskEditSidePanelProps) => {
  const { updateTask, deleteTask } = useTaskContext();
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const isMobile = useIsMobile();
  // Simplified - no team member assignments
  const { toast } = useToast();

  useEffect(() => {
    if (task) {
      setEditedTask({ ...task });
      setHasUnsavedChanges(false);
    } else {
      setEditedTask(null);
      setHasUnsavedChanges(false);
    }
  }, [task, isOpen]);

  if (!editedTask) {
    return null;
  }

  const handleSave = async () => {
    if (editedTask && hasUnsavedChanges) {
      try {
        // Save immediately without blocking UI
        updateTask(editedTask.id, editedTask);
        setHasUnsavedChanges(false);
        // Remove the success toast to make it completely seamless
      } catch (error) {
        toast({
          title: "Error saving task",
          description: "There was an error saving your changes. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleFieldChange = (field: keyof Task, value: any) => {
    if (editedTask) {
      setEditedTask({
        ...editedTask,
        [field]: value
      });
      setHasUnsavedChanges(true);
    }
  };

  const handleMarkComplete = async () => {
    if (editedTask) {
      const updates = {
        status: 'Completed' as const,
        progress: 100
      };
      
      // Update local state immediately
      setEditedTask({
        ...editedTask,
        ...updates
      });
      
      // Save to database immediately
      try {
        await updateTask(editedTask.id, updates);
      } catch (error) {
        console.error('Error marking task as complete:', error);
      }
    }
  };

  const handleDelete = async () => {
    if (editedTask) {
      await deleteTask(editedTask.id);
      onClose();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent 
        className={`${
          isMobile 
            ? '!w-full !max-w-full' 
            : '!w-[600px] !max-w-[600px] sm:!w-[600px] sm:!max-w-[600px]'
        } overflow-y-auto bg-white border-l border-gray-200 p-0`}
        side={isMobile ? "bottom" : "right"}
      >
        {/* Header Section */}
        <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
          <TaskEditHeader 
            task={editedTask} 
            onMarkComplete={handleMarkComplete} 
            onDelete={handleDelete}
            onTaskNameChange={(newName) => handleFieldChange('taskName', newName)}
            onSave={handleSave}
          />
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto space-y-0">
          {/* Task Type and Priority Row */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Badge 
                variant="secondary" 
                className="bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                {editedTask.taskType}
              </Badge>
              <Badge 
                variant="outline" 
                className={`border ${
                  editedTask.priority === 'High' ? 'border-red-200 bg-red-50 text-red-700' :
                  editedTask.priority === 'Medium' ? 'border-yellow-200 bg-yellow-50 text-yellow-700' :
                  'border-green-200 bg-green-50 text-green-700'
                }`}
              >
                {editedTask.priority}
              </Badge>
            </div>
          </div>

          {/* Enhanced Task Details Form */}
          <div className="px-6 py-6">
            <EnhancedTaskEditForm
              task={editedTask}
              projectId={projectId || ''}
              onTaskUpdate={(updates) => {
                setEditedTask(prev => prev ? { ...prev, ...updates } : prev);
                setHasUnsavedChanges(true);
              }}
              onSave={handleSave}
              onCancel={handleClose}
            />
          </div>

          {/* Attachments Section */}
          <div className="border-t border-gray-100 px-6 py-6">
            <TaskAttachmentsDisplay taskId={editedTask.id} />
          </div>

          {/* Subtasks Section */}
          <div className="border-t border-gray-100 px-6 py-6">
            <SubtasksList 
              taskId={editedTask.id}
              projectMembers={[]}
              onSubtaskClick={(subtask) => {
                console.log('Opening subtask:', subtask);
              }}
            />
          </div>

          {/* Submittal Workflow Section */}
          <div className="border-t border-gray-100 px-6 py-6">
            <SubmittalWorkflow 
              taskId={editedTask.id}
              projectMembers={[]}
            />
          </div>

          {/* Comments and Activity Section */}
          <div className="border-t border-gray-100 px-6 py-6">
            <TaskCommentsActivity taskId={editedTask.id} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
