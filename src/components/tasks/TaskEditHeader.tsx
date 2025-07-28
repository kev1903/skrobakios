
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Check, Timer, Paperclip, MessageSquare, Link, Maximize2, Trash2, Save, Edit2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Task } from './TaskContext';
import { TaskAttachments } from './TaskAttachments';

interface TaskEditHeaderProps {
  task: Task;
  onMarkComplete: () => void;
  onDelete: () => void;
  onTaskNameChange?: (newName: string) => void;
  onSave?: () => void;
}

interface EditableTaskNameProps {
  taskName: string;
  onTaskNameChange?: (newName: string) => void;
}

const EditableTaskName = ({ taskName, onTaskNameChange }: EditableTaskNameProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(taskName);

  const handleSave = () => {
    if (editValue.trim() && onTaskNameChange) {
      onTaskNameChange(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(taskName);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center space-x-2 flex-1">
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="text-xl font-semibold"
          autoFocus
        />
      </div>
    );
  }

  return (
    <div 
      className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors group"
      onClick={() => setIsEditing(true)}
    >
      <h1 className="text-xl font-semibold text-foreground line-clamp-2">{taskName}</h1>
      <Edit2 className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
    </div>
  );
};

export const TaskEditHeader = ({ task, onMarkComplete, onDelete, onTaskNameChange, onSave }: TaskEditHeaderProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();


  const handleSaveClick = async () => {
    if (onSave) {
      await onSave();
      toast({
        title: "Task Saved",
        description: "All changes have been saved successfully.",
      });
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    onDelete();
    setShowDeleteDialog(false);
  };

  return (
    <>
      {/* Streamlined Header */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button
              onClick={onMarkComplete}
              variant={task.status === 'Completed' ? 'default' : 'outline'}
              size="sm"
              className="flex items-center gap-2"
              disabled={task.status === 'Completed'}
            >
              <Check className="w-4 h-4" />
              <span>{task.status === 'Completed' ? 'Completed' : 'Mark Complete'}</span>
            </Button>
            
            <div className="text-xs text-muted-foreground font-mono">
              #{task.task_number || 'NO-ID'}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <TaskAttachments taskId={task.id} onSave={onSave} />
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <Timer className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <MessageSquare className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <Link className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDeleteClick} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleSaveClick}
              className="ml-2"
            >
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
          </div>
        </div>

        {/* Task Title */}
        <EditableTaskName 
          taskName={task.taskName} 
          onTaskNameChange={(newName) => onTaskNameChange?.(newName)}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the task "{task.taskName}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Delete Task
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
