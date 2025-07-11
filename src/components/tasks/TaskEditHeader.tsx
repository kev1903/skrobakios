
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Check, Timer, Paperclip, MessageSquare, Link, Maximize2, Trash2, Save, Edit2 } from 'lucide-react';
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
      className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
      onClick={() => setIsEditing(true)}
    >
      <h2 className="text-xl font-semibold">{taskName}</h2>
      <Edit2 className="w-4 h-4 text-gray-400" />
    </div>
  );
};

export const TaskEditHeader = ({ task, onMarkComplete, onDelete, onTaskNameChange, onSave }: TaskEditHeaderProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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
      {/* Function Buttons Bar */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
        <div className="flex items-center space-x-2">
          <Button
            onClick={onMarkComplete}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <Check className="w-4 h-4" />
            <span>Mark complete</span>
          </Button>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm">
            <Timer className="w-4 h-4" />
          </Button>
          <TaskAttachments taskId={task.id} onSave={onSave} />
          <Button variant="ghost" size="sm">
            <MessageSquare className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Link className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Maximize2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDeleteClick}>
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={onSave}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Save className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Task Title and Priority */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <EditableTaskName 
            taskName={task.taskName} 
            onTaskNameChange={(newName) => onTaskNameChange?.(newName)}
          />
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className={`${getPriorityColor(task.priority)} text-xs`}>
              {task.priority}
            </Badge>
          </div>
        </div>
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
