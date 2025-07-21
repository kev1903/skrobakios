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
    <div className="space-y-2">
      {/* Compact Details Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
          <User className="w-4 h-4 text-gray-500" />
          <h3 className="text-base font-medium text-gray-900">Details</h3>
        </div>
        
        <div className="space-y-2">
          {/* Description - Full Width */}
          <div className="space-y-1">
            <Label htmlFor="description" className="text-xs font-medium text-gray-700">
              Description
            </Label>
            <Textarea
              id="description"
              value={task.description || ''}
              onChange={(e) => onTaskUpdate({ description: e.target.value })}
              placeholder="Add a description..."
              className="min-h-[50px] resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm"
              rows={2}
            />
          </div>

          {/* First Row: Task Type, Priority, Status */}
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-700">Task Type</Label>
              <Select value={task.taskType} onValueChange={(value: any) => onTaskUpdate({ taskType: value })}>
                <SelectTrigger className="h-7 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Task">Task</SelectItem>
                  <SelectItem value="Issue">Issue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-700">Priority</Label>
              <Select value={task.priority} onValueChange={(value: any) => onTaskUpdate({ priority: value })}>
                <SelectTrigger className="h-7 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-700">Status</Label>
              <Select value={task.status} onValueChange={(value: any) => onTaskUpdate({ status: value })}>
                <SelectTrigger className="h-7 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-xs">
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
          </div>

          {/* Second Row: Due Date, Duration */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-700">Due Date</Label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal border-gray-200 hover:bg-gray-50 h-7 text-xs",
                      !dueDate && "text-gray-500"
                    )}
                  >
                    <CalendarIcon className="mr-1 h-3 w-3" />
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

            <div className="space-y-1">
              <Label htmlFor="duration" className="text-xs font-medium text-gray-700">
                Duration (hours)
              </Label>
              <Input
                id="duration"
                type="number"
                value={task.duration || ''}
                onChange={(e) => onTaskUpdate({ duration: parseFloat(e.target.value) || 0 })}
                className="h-7 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-xs"
                placeholder="0"
                min="0"
                step="0.5"
              />
            </div>
          </div>

          {/* Assigned To - Full Width */}
          <div className="space-y-1">
            <Label className="text-xs font-medium text-gray-700">Assigned To</Label>
            <TeamTaskAssignment
              projectId={projectId}
              currentAssignee={task.assignedTo}
              onAssigneeChange={handleAssigneeChange}
              className="w-full h-7"
            />
          </div>

          {/* Progress - Compact */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-gray-700">Progress</Label>
              <span className="text-xs text-gray-500">{task.progress || 0}%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <Progress 
                  value={task.progress || 0} 
                  className="h-2 w-full"
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={task.progress || 0}
                  onChange={(e) => onTaskUpdate({ progress: parseInt(e.target.value) })}
                  className="absolute top-0 left-0 w-full h-2 opacity-0 cursor-pointer appearance-none"
                  style={{ background: 'transparent' }}
                />
              </div>
              <Input
                type="number"
                min="0"
                max="100"
                value={task.progress || 0}
                onChange={(e) => {
                  const value = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                  onTaskUpdate({ progress: value });
                }}
                className="w-12 h-6 text-xs border-gray-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Compact Timestamps */}
      <div className="pt-2 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-gray-500">Created</p>
            <p className="text-gray-900 font-medium">
              {format(new Date(task.created_at), 'MMM dd, yyyy')}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Last Updated</p>
            <p className="text-gray-900 font-medium">
              {format(new Date(task.updated_at), 'MMM dd, yyyy')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}