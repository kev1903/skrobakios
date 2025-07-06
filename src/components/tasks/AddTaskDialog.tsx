
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTaskContext } from './TaskContext';
import { supabase } from '@/integrations/supabase/client';

interface AddTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  status: string;
  projectId: string;
}

export const AddTaskDialog = ({ isOpen, onClose, status, projectId }: AddTaskDialogProps) => {
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDigitalObject, setSelectedDigitalObject] = useState('');
  const [digitalObjects, setDigitalObjects] = useState<Array<{id: string, name: string, stage: string}>>([]);
  const { addTask } = useTaskContext();

  // Fetch digital objects on component mount
  useEffect(() => {
    const fetchDigitalObjects = async () => {
      const { data, error } = await supabase
        .from('digital_objects')
        .select('id, name, stage')
        .order('stage')
        .order('name');
      
      if (error) {
        console.error('Error fetching digital objects:', error);
      } else {
        setDigitalObjects(data || []);
      }
    };

    if (isOpen) {
      fetchDigitalObjects();
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!taskName.trim() || !selectedDigitalObject) return;

    const newTask = {
      project_id: projectId,
      taskName: taskName.trim(),
      priority: 'Medium' as const,
      assignedTo: { name: '', avatar: '' },
      dueDate: new Date().toISOString().split('T')[0],
      status: status as 'Completed' | 'In Progress' | 'Pending' | 'Not Started',
      progress: 0,
      description: description.trim() || undefined,
      category: 'General',
      digitalObjectId: selectedDigitalObject
    };

    addTask(newTask);
    console.log(`Added new task: ${taskName} to ${status} column`);
    
    // Reset form and close dialog
    setTaskName('');
    setDescription('');
    setSelectedDigitalObject('');
    onClose();
  };

  const handleCancel = () => {
    setTaskName('');
    setDescription('');
    setSelectedDigitalObject('');
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
            <Label htmlFor="digital-object">Digital Object *</Label>
            <Select value={selectedDigitalObject} onValueChange={setSelectedDigitalObject}>
              <SelectTrigger>
                <SelectValue placeholder="Select a digital object..." />
              </SelectTrigger>
              <SelectContent>
                {digitalObjects.map((obj) => (
                  <SelectItem key={obj.id} value={obj.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{obj.name}</span>
                      <span className="text-xs text-muted-foreground">{obj.stage}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="task-name">Task Name *</Label>
            <Input
              id="task-name"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="Enter task name..."
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
          <Button onClick={handleSubmit} disabled={!taskName.trim() || !selectedDigitalObject}>
            Add Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
