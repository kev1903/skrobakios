
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTaskContext } from './TaskContext';
import { useDigitalObjectsContext } from '@/contexts/DigitalObjectsContext';

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
  const [open, setOpen] = useState(false);
  const { addTask } = useTaskContext();
  const { digitalObjects } = useDigitalObjectsContext();

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
      digital_object_id: selectedDigitalObject
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
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {selectedDigitalObject
                    ? digitalObjects.find((obj) => obj.id === selectedDigitalObject)?.name
                    : "Select a digital object..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 z-50 bg-white border border-gray-200 shadow-lg">
                <Command>
                  <CommandInput placeholder="Search digital objects..." />
                  <CommandList>
                    <CommandEmpty>No digital object found.</CommandEmpty>
                    <CommandGroup>
                      {digitalObjects.map((obj) => (
                        <CommandItem
                          key={obj.id}
                          value={`${obj.name} ${obj.stage}`}
                          onSelect={() => {
                            setSelectedDigitalObject(obj.id);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedDigitalObject === obj.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span className="font-medium">{obj.name}</span>
                            <span className="text-xs text-muted-foreground">{obj.stage}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
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
