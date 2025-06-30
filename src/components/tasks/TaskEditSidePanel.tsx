
import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, User, Clock, Tag, FileText, X } from 'lucide-react';
import { Task, useTaskContext } from './TaskContext';

interface TaskEditSidePanelProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskEditSidePanel = ({ task, isOpen, onClose }: TaskEditSidePanelProps) => {
  const { updateTask } = useTaskContext();
  const [editedTask, setEditedTask] = useState<Task | null>(null);

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

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[500px] sm:w-[540px] overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-semibold">
              {editedTask.taskName}
            </SheetTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className={`${getPriorityColor(editedTask.priority)} text-xs`}>
                {editedTask.priority}
              </Badge>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Task Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              Task Name
            </label>
            <Input
              value={editedTask.taskName}
              onChange={(e) => handleFieldChange('taskName', e.target.value)}
              placeholder="Enter task name..."
            />
          </div>

          {/* Assignee */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <User className="w-4 h-4 mr-2" />
              Assignee
            </label>
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Avatar className="w-8 h-8">
                <AvatarImage src={editedTask.assignedTo.avatar} />
                <AvatarFallback className="text-xs">
                  {editedTask.assignedTo.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{editedTask.assignedTo.name}</span>
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Due Date
            </label>
            <Input
              type="date"
              value={editedTask.dueDate}
              onChange={(e) => handleFieldChange('dueDate', e.target.value)}
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <Tag className="w-4 h-4 mr-2" />
              Priority
            </label>
            <Select
              value={editedTask.priority}
              onValueChange={(value) => handleFieldChange('priority', value as 'High' | 'Medium' | 'Low')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Status
            </label>
            <Select
              value={editedTask.status}
              onValueChange={(value) => handleFieldChange('status', value as Task['status'])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Not Started">Not Started</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Progress ({editedTask.progress}%)
            </label>
            <Input
              type="range"
              min="0"
              max="100"
              value={editedTask.progress}
              onChange={(e) => handleFieldChange('progress', parseInt(e.target.value))}
              className="w-full"
            />
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${editedTask.progress}%` }}
              ></div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Description
            </label>
            <Textarea
              value={editedTask.description || ''}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder="What is this task about?"
              className="min-h-[100px]"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Category
            </label>
            <Input
              value={editedTask.category || ''}
              onChange={(e) => handleFieldChange('category', e.target.value)}
              placeholder="Enter category..."
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
