
import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader } from '@/components/ui/sheet';
import { Task, useTaskContext } from './TaskContext';
import { TaskEditHeader } from './TaskEditHeader';
import { TaskEditForm } from './TaskEditForm';
import { TaskEditActions } from './TaskEditActions';
import { SubtasksList } from './SubtasksList';
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
  const isMobile = useIsMobile();
  const { members } = useProjectMembers(projectId);

  useEffect(() => {
    if (task) {
      setEditedTask({ ...task });
    }
  }, [task]);

  if (!task || !editedTask) return null;

  const handleSave = () => {
    if (editedTask) {
      updateTask(editedTask.id, editedTask);
      onClose();
    }
  };

  const handleFieldChange = (field: keyof Task, value: any) => {
    if (editedTask) {
      setEditedTask({
        ...editedTask,
        [field]: value
      });
    }
  };

  const handleMarkComplete = () => {
    handleFieldChange('status', 'Completed');
    handleFieldChange('progress', 100);
  };

  const handleDelete = async () => {
    if (editedTask) {
      await deleteTask(editedTask.id);
      onClose();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
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
        />

        <SheetHeader>
          <TaskEditForm 
            task={editedTask} 
            onFieldChange={handleFieldChange}
            projectId={projectId}
          />
        </SheetHeader>

        {/* Subtasks Section */}
        <div className="mt-8 pt-6 border-t">
          <SubtasksList 
            taskId={editedTask.id}
            projectMembers={members.map(m => ({ name: m.name, avatar: m.avatar }))}
          />
        </div>

        <TaskEditActions 
          onSave={handleSave} 
          onCancel={onClose} 
        />
      </SheetContent>
    </Sheet>
  );
};
