
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
      className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors group"
      onClick={() => setIsEditing(true)}
    >
      <h1 className="text-2xl font-semibold text-gray-900">{taskName}</h1>
      <Edit2 className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
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
      {/* Action Buttons Bar */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <Button
            onClick={onMarkComplete}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 border-gray-200 hover:bg-gray-50"
            disabled={task.status === 'Completed'}
          >
            <Check className="w-4 h-4" />
            <span>{task.status === 'Completed' ? 'Completed' : 'Mark complete'}</span>
          </Button>
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 hover:bg-gray-100">
              <Timer className="w-4 h-4" />
            </Button>
            <TaskAttachments taskId={task.id} onSave={onSave} />
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 hover:bg-gray-100">
              <MessageSquare className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 hover:bg-gray-100">
              <Link className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 hover:bg-gray-100">
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDeleteClick} className="text-gray-500 hover:text-red-600 hover:bg-red-50">
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              onClick={onSave}
              className="bg-blue-600 hover:bg-blue-700 text-white ml-2"
            >
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Task Title Section */}
      <div className="p-6 pb-4">
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
