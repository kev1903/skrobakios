import React, { useState, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { format, isSameDay, addDays } from 'date-fns';
import { Search, Plus, ChevronLeft, ChevronRight, RotateCcw, GripVertical } from 'lucide-react';
import { Task } from '../tasks/types';
import { DayTimelineView } from '../tasks/DayTimelineView';
import { WeekTimelineView } from '../tasks/WeekTimelineView';
import { MonthTimelineView } from '../tasks/MonthTimelineView';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

interface MyTasksCalendarViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => Promise<void>;
}

export const MyTasksCalendarView: React.FC<MyTasksCalendarViewProps> = ({ 
  tasks, 
  onTaskClick,
  onTaskUpdate 
}) => {
  console.log('🚀 MyTasksCalendarView: Component is rendering');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'tasks' | 'issues' | 'bugs' | 'features'>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'completed' | 'in-progress' | 'pending' | 'not-started'>('all');
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();

  // Update current time every second
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const navigateDate = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Filter tasks for backlog (unscheduled tasks or tasks at midnight)
  const getBacklogTasks = () => {
    return tasks.filter(task => {
      // Check if task is unscheduled (in backlog)
      const isInBacklog = !task.dueDate || (() => {
        const taskDate = new Date(task.dueDate);
        return taskDate.getHours() === 0 && taskDate.getMinutes() === 0;
      })();

      if (!isInBacklog) return false;

      const matchesSearch = task.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.projectName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Apply type filter
      let matchesTypeFilter = false;
      if (selectedFilter === 'all') matchesTypeFilter = true;
      if (selectedFilter === 'tasks') matchesTypeFilter = task.taskType === 'Task';
      if (selectedFilter === 'issues') matchesTypeFilter = task.taskType === 'Issue';
      if (selectedFilter === 'bugs') matchesTypeFilter = task.taskType === 'Bug';
      if (selectedFilter === 'features') matchesTypeFilter = task.taskType === 'Feature';
      
      // Apply status filter
      let matchesStatusFilter = false;
      if (selectedStatusFilter === 'all') matchesStatusFilter = true;
      if (selectedStatusFilter === 'completed') matchesStatusFilter = task.status === 'Completed';
      if (selectedStatusFilter === 'in-progress') matchesStatusFilter = task.status === 'In Progress';
      if (selectedStatusFilter === 'pending') matchesStatusFilter = task.status === 'Pending';
      if (selectedStatusFilter === 'not-started') matchesStatusFilter = task.status === 'Not Started';
      
      return matchesSearch && matchesTypeFilter && matchesStatusFilter;
    });
  };

  // Filter tasks for the selected day
  const getDayTasks = () => {
    return tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return isSameDay(taskDate, currentDate);
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "medium":
        return "bg-warning/10 text-warning border-warning/20";
      case "low":
        return "bg-success/10 text-success border-success/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  // Drag handlers for moving tasks back to backlog
  const handleCalendarTaskDragStart = useCallback((e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleBacklogDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    
    if (!taskId || !onTaskUpdate) return;
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      // Move task back to backlog by setting due_date to midnight
      const resetDate = new Date(task.dueDate || new Date());
      resetDate.setHours(0, 0, 0, 0);
      
      await onTaskUpdate(taskId, {
        dueDate: resetDate.toISOString()
      });
      
      toast({
        title: "Task moved to backlog",
        description: `"${task.taskName}" moved back to backlog.`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error moving task to backlog:', error);
      toast({
        title: "Error",
        description: "Failed to move task to backlog. Please try again.",
        variant: "destructive",
      });
    }
  }, [tasks, onTaskUpdate, toast]);

  const handleBacklogDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "issue":
        return "bg-destructive/10 text-destructive";
      case "task":
        return "bg-primary/10 text-primary";
      case "bug":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300";
      case "feature":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-success/10 text-success border-success/20";
      case "in progress":
        return "bg-primary/10 text-primary border-primary/20";
      case "pending":
        return "bg-warning/10 text-warning border-warning/20";
      case "not started":
        return "bg-muted/10 text-muted-foreground border-muted/20";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  // Reset tasks from current day back to backlog
  const handleResetDay = useCallback(async () => {
    if (isResetting) return;
    
    const tasksToReset = getDayTasks();
    
    if (tasksToReset.length === 0) {
      toast({
        title: "No tasks to reset",
        description: "There are no tasks scheduled for this day.",
        variant: "default",
      });
      return;
    }

    setIsResetting(true);
    
    try {
      // Reset all tasks for the current day to midnight (moves them back to backlog)
      const updates = tasksToReset.map(task => {
        const resetDate = new Date(task.dueDate);
        resetDate.setHours(0, 0, 0, 0); // Set to midnight
        return supabase
          .from('tasks')
          .update({ due_date: resetDate.toISOString() })
          .eq('id', task.id);
      });

      await Promise.all(updates);

      toast({
        title: "Day reset successfully",
        description: `${tasksToReset.length} task${tasksToReset.length > 1 ? 's' : ''} moved back to backlog.`,
        variant: "default",
      });
      
      // Refresh the tasks if onTaskUpdate is available
      if (onTaskUpdate) {
        // Trigger a refresh by updating the first task (this will cause parent to refetch)
        await onTaskUpdate(tasksToReset[0].id, {});
      }
      
    } catch (error) {
      console.error('Failed to reset day:', error);
      toast({
        title: "Error",
        description: "Failed to reset tasks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  }, [currentDate, tasks, isResetting, toast, onTaskUpdate]);

  const backlogTasks = getBacklogTasks();
  const dayTasks = getDayTasks();

  return (
    <div className="drag-drop-wrapper">
      <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
      {/* Left Sidebar - Task Backlog - Absolutely Fixed */}
      <div className="absolute left-0 top-0 w-80 h-full z-10">
        <Card 
          className="h-full flex flex-col border-r shadow-lg bg-gradient-to-b from-card/90 to-card/70 backdrop-blur-xl border-border/30"
          onDrop={handleBacklogDrop}
          onDragOver={handleBacklogDragOver}
        >
          <CardHeader className="pb-4 flex-shrink-0 bg-gradient-to-r from-muted/30 to-muted/10 border-b border-border/20">
            <CardTitle className="text-lg font-semibold text-foreground">Task Backlog</CardTitle>
            <Button 
              size="sm" 
              className="w-full justify-start bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all duration-200"
              onClick={() => {/* Add new task */}}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add to backlog
            </Button>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col space-y-4 overflow-hidden">
            {/* Search */}
            <div className="relative flex-shrink-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Type here to search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Tabs */}
            <div className="space-y-3 flex-shrink-0">
              {/* Type Filter */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Type</label>
                <div className="flex gap-1 flex-wrap">
                  {[
                    { key: 'all', label: 'All' },
                    { key: 'tasks', label: 'Tasks' },
                    { key: 'issues', label: 'Issues' },
                    { key: 'bugs', label: 'Bugs' },
                    { key: 'features', label: 'Features' }
                  ].map((filter) => (
                    <Button
                      key={filter.key}
                      variant={selectedFilter === filter.key ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setSelectedFilter(filter.key as any)}
                      className="text-xs"
                    >
                      {filter.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Status</label>
                <div className="flex gap-1 flex-wrap">
                  {[
                    { key: 'all', label: 'All', icon: null },
                    { key: 'completed', label: 'Completed', icon: 'CheckCircle' },
                    { key: 'in-progress', label: 'In Progress', icon: 'Clock' },
                    { key: 'pending', label: 'Pending', icon: 'Circle' },
                    { key: 'not-started', label: 'Not Started', icon: 'Pause' }
                  ].map((filter) => (
                    <Button
                      key={filter.key}
                      variant={selectedStatusFilter === filter.key ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setSelectedStatusFilter(filter.key as any)}
                      className="text-xs"
                    >
                      {filter.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Task List - Scrollable */}
            <div className="flex-1 overflow-hidden">
              <div className="space-y-3 overflow-y-auto h-full pr-2">
                {backlogTasks.map((task) => (
                  <div
                    key={task.id}
                    className="draggable-task-element p-3 rounded-lg border bg-card transition-all hover:bg-muted/50 cursor-pointer"
                    onClick={() => onTaskClick(task)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 pt-1">
                        <div className="w-4 h-4 text-muted-foreground/60" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <h4 className="font-medium text-sm">{task.taskName}</h4>
                        <p className="text-xs text-muted-foreground">
                          {task.projectName}
                        </p>
                         <div className="flex gap-2 flex-wrap">
                           <Badge variant="outline" className={getTypeColor(task.taskType)}>
                             {task.taskType}
                           </Badge>
                           <Badge variant="outline" className={getPriorityColor(task.priority)}>
                             {task.priority}
                           </Badge>
                           <Badge variant="outline" className={getStatusColor(task.status)}>
                             {task.status}
                           </Badge>
                         </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {backlogTasks.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No tasks found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main Calendar Area - Scrollable with left margin for sidebar */}
      <div className="ml-80 h-full overflow-y-auto pl-6">
        <div className="space-y-2 pb-6">
          {/* Header */}
          <div className="flex items-center justify-between sticky top-0 bg-background z-10 py-2">
            <div className="flex items-center gap-4">
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                New Event
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleResetDay}
                disabled={isResetting || dayTasks.length === 0}
                className="text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                {isResetting ? 'Resetting...' : 'RESET'}
              </Button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Type here to search"
                  className="pl-10 w-64"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* View Toggle */}
              <div className="flex items-center bg-muted rounded-lg p-1">
                <Button 
                  variant={viewMode === 'day' ? 'default' : 'ghost'} 
                  size="sm" 
                  className="px-3 py-1.5 h-auto"
                  onClick={() => setViewMode('day')}
                >
                  Day
                </Button>
                <Button 
                  variant={viewMode === 'week' ? 'default' : 'ghost'} 
                  size="sm" 
                  className="px-3 py-1.5 h-auto"
                  onClick={() => setViewMode('week')}
                >
                  Week
                </Button>
                <Button 
                  variant={viewMode === 'month' ? 'default' : 'ghost'} 
                  size="sm" 
                  className="px-3 py-1.5 h-auto"
                  onClick={() => setViewMode('month')}
                >
                  Month
                </Button>
              </div>

              {/* Date Navigation */}
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigateDate('prev')}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigateDate('next')}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Date Display */}
          <div className="text-center">
            <h2 className="text-2xl font-bold flex items-center justify-center gap-3">
              {format(currentDate, 'EEEE, d MMMM')} 
              <span className="flex items-center gap-1 text-lg">
                🕒 {format(currentTime, 'HH:mm:ss')}
              </span>
            </h2>
          </div>

          {/* Timeline Content */}
          {viewMode === 'week' ? (
            <WeekTimelineView 
              currentDate={currentDate} 
              tasks={tasks}
              onTaskUpdate={onTaskUpdate}
            />
          ) : viewMode === 'month' ? (
            <MonthTimelineView 
              currentDate={currentDate} 
              tasks={tasks}
              onTaskUpdate={onTaskUpdate}
              onDayClick={(day) => {
                setCurrentDate(day);
                setViewMode('day');
              }}
            />
          ) : (
            <DayTimelineView 
              currentDate={currentDate} 
              tasks={tasks}
              onTaskUpdate={onTaskUpdate}
              enableDragDrop={true}
              useOwnDragContext={false}
            />
          )}
        </div>
      </div>

      </div>
    </div>
  );
};