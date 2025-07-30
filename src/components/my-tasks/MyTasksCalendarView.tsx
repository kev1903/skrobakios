import React, { useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { format, isSameDay, addDays } from 'date-fns';
import { Search, Plus, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { Task } from '../tasks/types';
import { DayTimelineView } from '../tasks/DayTimelineView';
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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'tasks' | 'issues' | 'bugs' | 'features'>('all');
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();

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

  // Filter tasks for backlog (all tasks)
  const getBacklogTasks = () => {
    return tasks.filter(task => {
      const matchesSearch = task.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.projectName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (selectedFilter === 'all') return matchesSearch;
      if (selectedFilter === 'tasks') return matchesSearch && task.taskType === 'Task';
      if (selectedFilter === 'issues') return matchesSearch && task.taskType === 'Issue';
      if (selectedFilter === 'bugs') return matchesSearch && task.taskType === 'Bug';
      if (selectedFilter === 'features') return matchesSearch && task.taskType === 'Feature';
      return matchesSearch;
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

  const handleDragStart = useCallback((start: any) => {
    const taskId = start.draggableId;
    const task = tasks.find(t => t.id === taskId);
    setDraggedTask(task || null);
  }, [tasks]);

  const handleDragEnd = useCallback(async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    setDraggedTask(null);

    if (!destination) return;

    // If dropped on day area, update task date
    if (destination.droppableId === 'day-area' && onTaskUpdate) {
      const task = tasks.find(t => t.id === draggableId);
      if (task) {
        try {
          await onTaskUpdate(task.id, {
            dueDate: currentDate.toISOString().split('T')[0]
          });
        } catch (error) {
          console.error('Failed to update task:', error);
        }
      }
    }
  }, [currentDate, tasks, onTaskUpdate]);

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
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="relative h-full w-full overflow-hidden">
        {/* Left Sidebar - Task Backlog - Absolutely Fixed */}
        <div className="absolute left-0 top-0 w-80 h-full z-10 bg-background">
          <Card className="h-full flex flex-col border-r shadow-sm">{/* Main Calendar Area - Scrollable with left margin */}
            <CardHeader className="pb-4 flex-shrink-0">
              <CardTitle className="text-lg">Task Backlog</CardTitle>
              <Button 
                size="sm" 
                className="w-full justify-start"
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
              <div className="flex gap-1 flex-shrink-0">
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

              {/* Task List - Scrollable */}
              <div className="flex-1 overflow-hidden">
                <Droppable droppableId="backlog">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="space-y-3 overflow-y-auto h-full pr-2"
                    >
                      {backlogTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-3 rounded-lg border bg-card hover:bg-muted/50 cursor-grab active:cursor-grabbing transition-all ${
                                snapshot.isDragging ? 'shadow-lg rotate-2 scale-105' : ''
                              }`}
                              onClick={() => onTaskClick(task)}
                            >
                              <div className="space-y-2">
                                <h4 className="font-medium text-sm">{task.taskName}</h4>
                                <p className="text-xs text-muted-foreground">
                                  {task.projectName}
                                </p>
                                <div className="flex gap-2">
                                  <Badge variant="outline" className={getTypeColor(task.taskType)}>
                                    {task.taskType}
                                  </Badge>
                                  <Badge variant="outline" className={getPriorityColor(task.priority)}>
                                    {task.priority}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                {backlogTasks.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No tasks found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Calendar Area - Scrollable with left margin for sidebar */}
        <div className="ml-80 h-full overflow-y-auto pl-6">
          <div className="space-y-6 pb-6">
            {/* Header */}
            <div className="flex items-center justify-between sticky top-0 bg-background z-10 py-4">
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
                  <Button variant="default" size="sm" className="px-3 py-1.5 h-auto">
                    Day
                  </Button>
                  <Button variant="ghost" size="sm" className="px-3 py-1.5 h-auto">
                    Week
                  </Button>
                  <Button variant="ghost" size="sm" className="px-3 py-1.5 h-auto">
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
              <h2 className="text-2xl font-bold">
                {format(currentDate, 'EEEE, MMMM d, yyyy')}
              </h2>
            </div>

            {/* Day Timeline Content */}
            <DayTimelineView 
              currentDate={currentDate} 
              tasks={tasks}
              onTaskUpdate={onTaskUpdate}
            />
          </div>
        </div>
      </div>

      {/* Drag Feedback */}
      {draggedTask && (
        <div className="fixed bottom-4 right-4 z-50">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-3">
              <div className="text-sm font-medium">
                Moving: {draggedTask.taskName}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </DragDropContext>
  );
};