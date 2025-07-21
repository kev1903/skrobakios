import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { CalendarIcon, Clock, Flag, User, MessageSquare, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Task } from '../types';
import { TeamTaskAssignment } from './TeamTaskAssignment';
import { TaskCollaborationPanel } from './TaskCollaborationPanel';

interface EnhancedTaskEditFormProps {
  task: Task;
  projectId: string;
  onTaskUpdate: (updates: Partial<Task>) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function EnhancedTaskEditForm({ 
  task, 
  projectId, 
  onTaskUpdate, 
  onSave, 
  onCancel 
}: EnhancedTaskEditFormProps) {
  const [activeTab, setActiveTab] = useState('details');
  const [dueDate, setDueDate] = useState<Date | undefined>(
    task.dueDate ? new Date(task.dueDate) : undefined
  );
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    if (dueDate) {
      onTaskUpdate({ dueDate: format(dueDate, 'dd MMM, yyyy') });
    }
  }, [dueDate, onTaskUpdate]);

  const handleAssigneeChange = (assignee: { name: string; avatar: string; userId: string }) => {
    onTaskUpdate({ assignedTo: assignee });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "border-red-400/50 bg-red-500/20 text-red-200";
      case "medium":
        return "border-yellow-400/50 bg-yellow-500/20 text-yellow-200";
      case "low":
        return "border-green-400/50 bg-green-500/20 text-green-200";
      default:
        return "border-white/30 bg-white/10 text-white/80";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "border-green-400/50 bg-green-500/20 text-green-200";
      case "in progress":
        return "border-blue-400/50 bg-blue-500/20 text-blue-200";
      case "pending":
        return "border-yellow-400/50 bg-yellow-500/20 text-yellow-200";
      case "not started":
        return "border-white/30 bg-white/10 text-white/80";
      default:
        return "border-white/30 bg-white/10 text-white/80";
    }
  };

  return (
    <div className="space-y-8">
      {/* Details Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
          <User className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900">Details</h3>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description
            </Label>
            <Textarea
              id="description"
              value={task.description || ''}
              onChange={(e) => onTaskUpdate({ description: e.target.value })}
              placeholder="Add a description..."
              className="min-h-[120px] resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              rows={5}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">Task Type</Label>
              <Select value={task.taskType} onValueChange={(value: any) => onTaskUpdate({ taskType: value })}>
                <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Task">Task</SelectItem>
                  <SelectItem value="Issue">Issue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">Priority</Label>
              <Select value={task.priority} onValueChange={(value: any) => onTaskUpdate({ priority: value })}>
                <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High Priority</SelectItem>
                  <SelectItem value="Medium">Medium Priority</SelectItem>
                  <SelectItem value="Low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">Status</Label>
              <Select value={task.status} onValueChange={(value: any) => onTaskUpdate({ status: value })}>
                <SelectTrigger className="border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">Due Date</Label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal border-gray-200 hover:bg-gray-50",
                      !dueDate && "text-gray-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "MMM dd, yyyy") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={(date) => {
                      setDueDate(date);
                      setIsCalendarOpen(false);
                    }}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Assigned To</Label>
            <TeamTaskAssignment
              projectId={projectId}
              currentAssignee={task.assignedTo}
              onAssigneeChange={handleAssigneeChange}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="duration" className="text-sm font-medium text-gray-700">
              Estimated Duration (hours)
            </Label>
            <Input
              id="duration"
              type="number"
              value={task.duration || ''}
              onChange={(e) => onTaskUpdate({ duration: parseFloat(e.target.value) || 0 })}
              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              placeholder="0"
              min="0"
              step="0.5"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-700">Progress</Label>
              <span className="text-sm text-gray-500">{task.progress}%</span>
            </div>
            <div className="space-y-3">
              <Progress 
                value={task.progress} 
                className="h-2"
              />
              <Input
                type="range"
                min="0"
                max="100"
                value={task.progress}
                onChange={(e) => onTaskUpdate({ progress: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Timestamps */}
      <div className="pt-6 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-gray-500 mb-1">Created</p>
            <p className="text-gray-900 font-medium">
              {format(new Date(task.created_at), 'MMM dd, yyyy')}
            </p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Last Updated</p>
            <p className="text-gray-900 font-medium">
              {format(new Date(task.updated_at), 'MMM dd, yyyy')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}