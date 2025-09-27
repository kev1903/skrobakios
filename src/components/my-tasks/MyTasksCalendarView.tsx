import React, { useState, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format, isSameDay } from 'date-fns';
import { Search, Plus, ChevronLeft, ChevronRight, RotateCcw, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Task } from '../tasks/types';
import { DayTimelineView } from '../tasks/DayTimelineView';
import { WeekTimelineView } from '../tasks/WeekTimelineView';
import { MonthTimelineView } from '../tasks/MonthTimelineView';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { useProfile } from '@/hooks/useProfile';

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
  const [isResetting, setIsResetting] = useState(false);
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);
  const { toast } = useToast();
  const { profile } = useProfile();

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
      // Exclude completed tasks completely from backlog
      if (task.status === 'Completed') return false;
      
      // Only show tasks assigned to current user
      if (!profile) return false;
      
      const currentUserName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
      const currentUserEmail = profile.email;
      
      const isAssignedToCurrentUser = 
        task.assignedTo?.name === currentUserName ||
        task.assignedTo?.name === currentUserEmail ||
        (task.assignedTo?.userId && task.assignedTo.userId === currentUserEmail);
      
      if (!isAssignedToCurrentUser) return false;
      
      // Check if task is unscheduled (in backlog)
      const isInBacklog = !task.dueDate || (() => {
        const taskDate = new Date(task.dueDate);
        return taskDate.getHours() === 0 && taskDate.getMinutes() === 0;
      })();

      if (!isInBacklog) return false;

      // Apply search filter
      const matchesSearch = task.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.projectName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Apply type filter
      let matchesTypeFilter = false;
      if (selectedFilter === 'all') matchesTypeFilter = true;
      if (selectedFilter === 'tasks') matchesTypeFilter = task.taskType === 'Task';
      if (selectedFilter === 'bugs') matchesTypeFilter = task.taskType === 'Bug';
      if (selectedFilter === 'features') matchesTypeFilter = task.taskType === 'Feature';
      
      return matchesSearch && matchesTypeFilter;
    });
  };

  // Filter tasks for the selected day
  const getDayTasks = () => {
    return tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return isSameDay(taskDate, currentDate);
    });
  };

  // Drag handlers for moving tasks back to backlog
  const handleCalendarTaskDragStart = useCallback((e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleBacklogDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverSlot(null);
    console.log('🗂️ Backlog drop detected');
    
    const taskId = e.dataTransfer.getData('text/plain');
    const calendarTaskId = e.dataTransfer.getData('application/x-calendar-task');
    
    const finalTaskId = taskId || calendarTaskId;
    console.log('🗂️ Task ID from drag data:', finalTaskId);
    
    if (!finalTaskId || !onTaskUpdate) {
      console.log('🗂️ No task ID or onTaskUpdate missing');
      return;
    }
    
    const task = tasks.find(t => t.id === finalTaskId);
    if (!task) {
      console.log('🗂️ Task not found:', finalTaskId);
      return;
    }

    console.log('🗂️ Moving task to backlog:', task.taskName);

    try {
      // Move task back to backlog by setting due_date to midnight
      const resetDate = new Date(task.dueDate || new Date());
      resetDate.setHours(0, 0, 0, 0);
      
      await onTaskUpdate(finalTaskId, {
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
    setDragOverSlot('backlog');
  }, []);

  const handleBacklogDragLeave = useCallback((e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverSlot(null);
    }
  }, []);

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
      const updates = tasksToReset.map(task => {
        const resetDate = new Date(task.dueDate);
        resetDate.setHours(0, 0, 0, 0);
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
      
      if (onTaskUpdate) {
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
    <div className="min-h-screen bg-white">
      <div className="relative h-full w-full overflow-hidden bg-white">
        {/* Left Sidebar - Task Backlog - Clean White Design */}
        <div className="absolute left-0 top-0 w-80 h-full z-10">
          <div 
            className={cn(
              "h-full flex flex-col border-r bg-white shadow-sm border-gray-200 transition-all duration-300",
              dragOverSlot === 'backlog' && "ring-2 ring-blue-500/50 bg-blue-50/50"
            )}
            onDrop={handleBacklogDrop}
            onDragOver={handleBacklogDragOver}
            onDragLeave={handleBacklogDragLeave}
          >
            <div className="pb-4 flex-shrink-0 bg-white border-b border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 font-playfair">Task Backlog</h3>
              <Button 
                size="sm" 
                className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                onClick={() => {/* Add new task */}}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add to backlog
              </Button>
            </div>
            
            <div className="flex-1 flex flex-col p-6 min-h-0 bg-white">
              {/* Search */}
              <div className="relative flex-shrink-0 mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Type here to search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>

              {/* Clean White Filters */}
              <div className="flex-shrink-0 mb-6 bg-gray-50 rounded-xl border border-gray-200 p-4">
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-900 block mb-3">Task Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'all', label: 'All Types' },
                      { key: 'tasks', label: 'Tasks' },
                      { key: 'issues', label: 'Issues' },
                      { key: 'bugs', label: 'Bugs' },
                      { key: 'features', label: 'Features' }
                    ].map((filter) => (
                      <Button
                        key={filter.key}
                        variant={selectedFilter === filter.key ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          console.log('Type filter clicked:', filter.key);
                          setSelectedFilter(filter.key as any);
                        }}
                        className={`text-sm px-3 py-2 h-9 justify-start ${
                          selectedFilter === filter.key 
                            ? 'bg-blue-600 text-white hover:bg-blue-700' 
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {filter.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Backlog Info */}
                <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-600">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Backlog Rules</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Shows all <span className="font-medium text-gray-900">incomplete tasks</span> (any status except "Completed") that are unscheduled or at midnight.
                  </p>
                  <div className="mt-3 text-sm">
                    <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-md font-medium">
                      {backlogTasks.length} incomplete tasks
                    </span>
                  </div>
                </div>
              </div>

              {/* Task List - Clean White Cards */}
              <div className="flex-1 overflow-hidden">
                <div className="space-y-3 overflow-y-auto h-full pr-2">
                  {backlogTasks.map((task) => (
                    <div
                      key={task.id}
                      className="draggable-task-element p-4 rounded-xl border border-gray-200 bg-white transition-all hover:bg-gray-50 hover:shadow-md cursor-grab active:cursor-grabbing"
                      draggable
                      onDragStart={(e) => handleCalendarTaskDragStart(e, task.id)}
                      onClick={() => onTaskClick(task)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 pt-1">
                          <GripVertical className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <h4 className="font-medium text-gray-900">{task.taskName}</h4>
                          <p className="text-sm text-gray-600">
                            {task.projectName}
                          </p>
                          <div className="flex gap-2 flex-wrap">
                            <Badge variant="outline" className={`text-xs ${
                              task.taskType === 'Task' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              task.taskType === 'Bug' ? 'bg-red-50 text-red-700 border-red-200' :
                              task.taskType === 'Feature' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                              'bg-gray-50 text-gray-700 border-gray-200'
                            }`}>
                              {task.taskType}
                            </Badge>
                            <Badge variant="outline" className={`text-xs ${
                              task.priority === 'High' ? 'bg-red-50 text-red-700 border-red-200' :
                              task.priority === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                              'bg-green-50 text-green-700 border-green-200'
                            }`}>
                              {task.priority}
                            </Badge>
                            <Badge variant="outline" className={`text-xs ${
                              task.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' :
                              task.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              task.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                              'bg-gray-50 text-gray-700 border-gray-200'
                            }`}>
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
                <div className="text-center py-12">
                  <p className="text-gray-600">No tasks found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Calendar Area - Clean White Design */}
        <div className="ml-80 h-full overflow-y-auto pl-8 bg-white mr-8 pr-8" style={{ marginRight: 'calc(var(--ai-chat-offset, 0px) + 2rem)' }}>
          <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="flex items-center justify-between sticky top-0 bg-white z-10 py-4 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <Button size="sm" variant="outline" className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50">
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
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Type here to search"
                    className="pl-10 w-64 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* View Toggle */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <Button 
                    variant={viewMode === 'day' ? 'default' : 'ghost'} 
                    size="sm" 
                    onClick={() => setViewMode('day')}
                    className={`text-sm ${viewMode === 'day' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
                  >
                    Day
                  </Button>
                  <Button 
                    variant={viewMode === 'week' ? 'default' : 'ghost'} 
                    size="sm" 
                    onClick={() => setViewMode('week')}
                    className={`text-sm ${viewMode === 'week' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
                  >
                    Week
                  </Button>
                  <Button 
                    variant={viewMode === 'month' ? 'default' : 'ghost'} 
                    size="sm" 
                    onClick={() => setViewMode('month')}
                    className={`text-sm ${viewMode === 'month' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-200'}`}
                  >
                    Month
                  </Button>
                </div>

                {/* Date Navigation */}
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => navigateDate('prev')}
                    className="w-8 h-8 p-0 bg-white border-gray-300 hover:bg-gray-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={goToToday}
                    className="px-4 bg-white border-gray-300 hover:bg-gray-50 text-gray-700"
                  >
                    Today
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => navigateDate('next')}
                    className="w-8 h-8 p-0 bg-white border-gray-300 hover:bg-gray-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                {/* Current Date Display */}
                <div className="text-lg font-medium text-gray-900 font-playfair">
                  {format(currentDate, 'EEEE, MMMM do, yyyy')}
                </div>
              </div>
            </div>

            {/* Timeline View Container - Clean White */}
            <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm">
              {viewMode === 'day' && (
                <DayTimelineView
                  currentDate={currentDate}
                  tasks={getDayTasks()}
                  onTaskUpdate={onTaskUpdate}
                />
              )}
              {viewMode === 'week' && (
                <WeekTimelineView
                  currentDate={currentDate}
                  tasks={tasks}
                  onTaskUpdate={onTaskUpdate}
                />
              )}
              {viewMode === 'month' && (
                <MonthTimelineView
                  currentDate={currentDate}
                  tasks={tasks}
                  onTaskUpdate={onTaskUpdate}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};