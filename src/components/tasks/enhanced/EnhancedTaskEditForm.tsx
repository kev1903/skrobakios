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
    <div className="space-y-4">
      {/* Task Details Section */}
      <div className="space-y-4">
        
        {/* Description - Full Width */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">
            Description
          </Label>
          <Textarea
            id="description"
            value={task.description || ''}
            onChange={(e) => onTaskUpdate({ description: e.target.value })}
            placeholder="Add a detailed description of this task..."
            className="min-h-[80px] resize-none"
            rows={3}
          />
        </div>

        {/* First Row: Task Type, Priority, Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Task Type</Label>
            <Select value={task.taskType} onValueChange={(value: any) => onTaskUpdate({ taskType: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Task">Task</SelectItem>
                <SelectItem value="Issue">Issue</SelectItem>
                <SelectItem value="Bug">Bug</SelectItem>
                <SelectItem value="Feature">Feature</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Priority</Label>
            <Select value={task.priority} onValueChange={(value: any) => onTaskUpdate({ priority: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="High">🔴 High</SelectItem>
                <SelectItem value="Medium">🟡 Medium</SelectItem>
                <SelectItem value="Low">🟢 Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Status</Label>
            <Select value={task.status} onValueChange={(value: any) => onTaskUpdate({ status: value })}>
              <SelectTrigger>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Due Date</Label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : <span>Select due date</span>}
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

          <div className="space-y-2">
            <Label htmlFor="duration" className="text-sm font-medium">
              Estimated Duration (hours)
            </Label>
            <Input
              id="duration"
              type="number"
              value={task.duration || ''}
              onChange={(e) => onTaskUpdate({ duration: parseFloat(e.target.value) || 0 })}
              placeholder="0.5"
              min="0"
              step="0.5"
            />
          </div>
        </div>

        {/* Third Row: Assignment and Progress */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Assigned To</Label>
            <TeamTaskAssignment
              projectId={projectId}
              currentAssignee={task.assignedTo}
              onAssigneeChange={handleAssigneeChange}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Progress</Label>
              <span className="text-sm font-medium text-muted-foreground">{task.progress || 0}%</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Progress 
                  value={task.progress || 0} 
                  className="h-3 w-full"
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={task.progress || 0}
                  onChange={(e) => onTaskUpdate({ progress: parseInt(e.target.value) })}
                  className="absolute top-0 left-0 w-full h-3 opacity-0 cursor-pointer appearance-none"
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
                className="w-16 text-center"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Timestamps Footer */}
      <div className="pt-4 border-t border-border">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground mb-1">Created</p>
            <p className="font-medium">
              {format(new Date(task.created_at), 'MMM dd, yyyy')}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Last Updated</p>
            <p className="font-medium">
              {format(new Date(task.updated_at), 'MMM dd, yyyy')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}