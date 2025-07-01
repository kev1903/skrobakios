
import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader } from '@/components/ui/sheet';
import { Task, useTaskContext } from './TaskContext';
import { TaskEditHeader } from './TaskEditHeader';
import { TaskEditForm } from './TaskEditForm';
import { TaskEditActions } from './TaskEditActions';
import { useIsMobile } from '@/hooks/use-mobile';

interface TaskEditSidePanelProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskEditSidePanel = ({ task, isOpen, onClose }: TaskEditSidePanelProps) => {
  const { updateTask } = useTaskContext();
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const isMobile = useIsMobile();

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
        />

        <SheetHeader>
          <TaskEditForm 
            task={editedTask} 
            onFieldChange={handleFieldChange} 
          />
        </SheetHeader>

        <TaskEditActions 
          onSave={handleSave} 
          onCancel={onClose} 
        />
      </SheetContent>
    </Sheet>
  );
};
