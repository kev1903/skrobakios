
import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader } from '@/components/ui/sheet';
import { Task, useTaskContext } from './TaskContext';
import { TaskEditHeader } from './TaskEditHeader';
import { TaskEditForm } from './TaskEditForm';
import { TaskEditActions } from './TaskEditActions';
import { SubtasksList } from './subtasks';
import { TaskCommentsActivity } from './TaskCommentsActivity';
import { SubmittalWorkflow } from './SubmittalWorkflow';
import { TaskAttachmentsDisplay } from './TaskAttachmentsDisplay';
import { useIsMobile } from '@/hooks/use-mobile';
import { useProjectMembers } from '@/hooks/useProjectMembers';

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
  const { members } = useProjectMembers(projectId);

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
    console.log('Save button clicked!', { editedTask, hasUnsavedChanges });
    if (editedTask && hasUnsavedChanges) {
      try {
        console.log('Saving task updates:', editedTask);
        await updateTask(editedTask.id, editedTask);
        setHasUnsavedChanges(false);
        console.log('Task saved successfully');
      } catch (error) {
        console.error('Error saving task:', error);
      }
    } else {
      console.log('No changes to save', { editedTask, hasUnsavedChanges });
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
            : '!w-[700px] !max-w-[700px] sm:!w-[700px] sm:!max-w-[700px]'
        } overflow-y-auto`}
        side={isMobile ? "bottom" : "right"}
      >
        <TaskEditHeader 
          task={editedTask} 
          onMarkComplete={handleMarkComplete} 
          onDelete={handleDelete}
          onTaskNameChange={(newName) => handleFieldChange('taskName', newName)}
          onSave={handleSave}
        />

        <SheetHeader>
          <TaskEditForm 
            task={editedTask} 
            onFieldChange={handleFieldChange}
            projectId={projectId}
          />
        </SheetHeader>

        {/* Attachments Section */}
        <TaskAttachmentsDisplay taskId={editedTask.id} />

        {/* Subtasks Section */}
        <div className="mt-8 pt-6 border-t">
          <SubtasksList 
            taskId={editedTask.id}
            projectMembers={members.map(m => ({ name: m.name, avatar: m.avatar }))}
            onSubtaskClick={(subtask) => {
              // Handle opening subtask as new task - for now just log
              console.log('Opening subtask:', subtask);
            }}
          />
        </div>

        {/* Submittal Workflow Section */}
        <div className="mt-8 pt-6 border-t">
          <SubmittalWorkflow 
            taskId={editedTask.id}
            projectMembers={members.map(m => ({ name: m.name, avatar: m.avatar }))}
          />
        </div>

        {/* Comments and Activity Section */}
        <TaskCommentsActivity taskId={editedTask.id} />

        <TaskEditActions 
          onSave={handleSave} 
          onCancel={handleClose} 
        />
      </SheetContent>
    </Sheet>
  );
};
