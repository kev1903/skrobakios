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
    <div className="h-full flex flex-col">
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{task.taskName}</h2>
            <p className="text-white/70 mt-1">Task Details & Collaboration</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge 
              variant="outline" 
              className={getPriorityColor(task.priority)}
            >
              <Flag className="w-3 h-3 mr-1" />
              {task.priority}
            </Badge>
            <Badge 
              variant="outline" 
              className={getStatusColor(task.status)}
            >
              {task.status}
            </Badge>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-6 pt-4">
          <TabsList className="grid w-full grid-cols-3 bg-white/10">
            <TabsTrigger value="details" className="data-[state=active]:bg-white/20 text-white">
              <User className="w-4 h-4 mr-2" />
              Details
            </TabsTrigger>
            <TabsTrigger value="collaboration" className="data-[state=active]:bg-white/20 text-white">
              <MessageSquare className="w-4 h-4 mr-2" />
              Collaboration
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-white/20 text-white">
              <Activity className="w-4 h-4 mr-2" />
              Progress
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <TabsContent value="details" className="space-y-6 mt-0">
            <Card className="backdrop-blur-xl bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-lg">Task Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="taskName" className="text-white/80">Task Name</Label>
                  <Input
                    id="taskName"
                    value={task.taskName}
                    onChange={(e) => onTaskUpdate({ taskName: e.target.value })}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white/80">Description</Label>
                  <Textarea
                    id="description"
                    value={task.description || ''}
                    onChange={(e) => onTaskUpdate({ description: e.target.value })}
                    placeholder="Add task description..."
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white/80">Priority</Label>
                    <Select value={task.priority} onValueChange={(value: any) => onTaskUpdate({ priority: value })}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 backdrop-blur-xl border-white/20">
                        <SelectItem value="High">High Priority</SelectItem>
                        <SelectItem value="Medium">Medium Priority</SelectItem>
                        <SelectItem value="Low">Low Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/80">Status</Label>
                    <Select value={task.status} onValueChange={(value: any) => onTaskUpdate({ status: value })}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white/95 backdrop-blur-xl border-white/20">
                        <SelectItem value="Not Started">Not Started</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-xl bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-lg">Assignment & Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white/80">Assigned To</Label>
                  <TeamTaskAssignment
                    projectId={projectId}
                    currentAssignee={task.assignedTo}
                    onAssigneeChange={handleAssigneeChange}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white/80">Due Date</Label>
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-white/10 border-white/20 text-white hover:bg-white/20",
                          !dueDate && "text-white/50"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white/95 backdrop-blur-xl border-white/20">
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={(date) => {
                          setDueDate(date);
                          setIsCalendarOpen(false);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-white/80">Estimated Duration (hours)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={task.duration || ''}
                    onChange={(e) => onTaskUpdate({ duration: parseFloat(e.target.value) || 0 })}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    placeholder="0"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="collaboration" className="mt-0">
            <TaskCollaborationPanel
              taskId={task.id}
              projectId={projectId}
            />
          </TabsContent>

          <TabsContent value="activity" className="space-y-6 mt-0">
            <Card className="backdrop-blur-xl bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white text-lg">Task Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-white/80">Progress</Label>
                    <span className="text-white text-sm">{task.progress}%</span>
                  </div>
                  <Progress 
                    value={task.progress} 
                    className="h-3 bg-white/20"
                  />
                  <Input
                    type="range"
                    min="0"
                    max="100"
                    value={task.progress}
                    onChange={(e) => onTaskUpdate({ progress: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <Separator className="bg-white/20" />

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="space-y-1">
                    <p className="text-sm text-white/70">Created</p>
                    <p className="text-white font-medium">
                      {format(new Date(task.created_at), 'dd MMM, yyyy')}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-white/70">Last Updated</p>
                    <p className="text-white font-medium">
                      {format(new Date(task.updated_at), 'dd MMM, yyyy')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>

      <div className="p-6 border-t border-white/20">
        <div className="flex justify-end space-x-3">
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            Cancel
          </Button>
          <Button 
            onClick={onSave}
            className="bg-primary hover:bg-primary/90"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}