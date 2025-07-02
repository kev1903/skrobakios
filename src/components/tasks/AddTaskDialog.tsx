
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTaskContext } from './TaskContext';

interface AddTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  status: string;
  projectId: string;
}

export const AddTaskDialog = ({ isOpen, onClose, status, projectId }: AddTaskDialogProps) => {
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const { addTask } = useTaskContext();

  const handleSubmit = () => {
    if (!taskName.trim()) return;

    const newTask = {
      project_id: projectId,
      taskName: taskName.trim(),
      priority: 'Medium' as const,
      assignedTo: { name: 'Unassigned', avatar: '' },
      dueDate: new Date().toISOString().split('T')[0],
      status: status as 'Completed' | 'In Progress' | 'Pending' | 'Not Started',
      progress: 0,
      description: description.trim() || undefined,
      category: 'General'
    };

    addTask(newTask);
    console.log(`Added new task: ${taskName} to ${status} column`);
    
    // Reset form and close dialog
    setTaskName('');
    setDescription('');
    onClose();
  };

  const handleCancel = () => {
    setTaskName('');
    setDescription('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="task-name">Task Name *</Label>
            <Input
              id="task-name"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="Enter task name..."
              autoFocus
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description (optional)..."
              rows={3}
            />
          </div>
          <div className="text-sm text-gray-600">
            Status: <span className="font-medium">{status}</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!taskName.trim()}>
            Add Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
