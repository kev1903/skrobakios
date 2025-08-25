import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Edit2, MoreHorizontal, ArrowLeft, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, ChevronLeft, ChevronRight, Calendar, Home, DollarSign, Monitor, Download, Book, ChevronDown, Clock, MapPin, CheckCircle2, Circle, Settings, CalendarDays, BarChart3, GripVertical } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { format, startOfWeek, endOfWeek, isSameDay, addDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import desertDunesBg from '@/assets/desert-dunes-bg.jpg';
import { supabase } from '@/integrations/supabase/client';
import { taskService } from '@/components/tasks/taskService';
import { TaskCard } from '@/components/tasks/TaskCard';
import { Task } from '@/components/tasks/types';
import { DayTimelineView } from '@/components/tasks/DayTimelineView';
import { WeekTimelineView } from '@/components/tasks/WeekTimelineView';
import { MonthTimelineView } from '@/components/tasks/MonthTimelineView';
import { CalendarSettingsPage } from '@/components/tasks/CalendarSettingsPage';
import { TaskEditSidePanel } from '@/components/tasks/TaskEditSidePanel';
import { useUser } from '@/contexts/UserContext';
import { useToast } from "@/hooks/use-toast";
import { useMenuBarSpacing } from '@/hooks/useMenuBarSpacing';


type ViewMode = 'day' | 'week' | 'month';

const TasksPage = () => {
  const { userProfile } = useUser();
  const { toast } = useToast();
  const { spacingClasses, minHeightClasses, fullHeightClasses } = useMenuBarSpacing();
  const [activeTab, setActiveTab] = useState('All');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [userTasks, setUserTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showCalendarSettings, setShowCalendarSettings] = useState(false);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState<Task | null>(null);
  const [isTaskEditOpen, setIsTaskEditOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Live time updater - optimized to prevent excessive re-renders
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute instead of every second
    return () => clearInterval(timer);
  }, []);

  // Load tasks assigned to the current user with real-time sync
  useEffect(() => {
    const loadUserTasks = async () => {
      try {
        setLoading(true);
        const tasks = await taskService.loadTasksAssignedToUser();
        setUserTasks(tasks);
      } catch (error) {
        console.error('Error loading user tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    // Initial load
    loadUserTasks();

    // Set up real-time subscription for task changes
    const channel = supabase
      .channel('tasks-realtime-sync')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'tasks'
        },
        (payload) => {
          console.log('Task change detected:', payload);
          // Refetch tasks when any task changes
          loadUserTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Filter tasks based on search term
  const getFilteredTasks = (tasks: Task[]) => {
    if (!searchTerm.trim()) return tasks;
    
    const searchLower = searchTerm.toLowerCase();
    return tasks.filter(task => 
      task.taskName.toLowerCase().includes(searchLower) ||
      (task.projectName && task.projectName.toLowerCase().includes(searchLower)) ||
      (task.description && task.description.toLowerCase().includes(searchLower)) ||
      task.status.toLowerCase().includes(searchLower) ||
      task.priority.toLowerCase().includes(searchLower)
    );
  };

  const getTasksForDate = (date: Date | null) => {
    if (!date) return [];
    const dateString = date.toISOString().split('T')[0];
    const tasksForDate = userTasks.filter(task => {
      if (!task.dueDate) return false;
      // Handle both old date format (YYYY-MM-DD) and new datetime format (ISO string)
      const taskDate = task.dueDate.split('T')[0]; // Extract date part from datetime
      return taskDate === dateString;
    });
    return getFilteredTasks(tasksForDate);
  };

  const getWeekDays = (date: Date) => {
    const weekStart = startOfWeek(date);
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      weekDays.push(addDays(weekStart, i));
    }
    return weekDays;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const formatDate = (date: Date) => {
    switch (viewMode) {
      case 'day':
        return format(date, 'EEEE, d MMMM'); // e.g., "Thursday, 31 July"
      case 'week':
        const weekStart = startOfWeek(date);
        const weekEnd = endOfWeek(date);
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`;
      case 'month':
      default:
        return format(date, 'MMMM yyyy'); // e.g., "July 2024"
    }
  };

  const navigate = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      switch (viewMode) {
        case 'day':
          newDate.setDate(prev.getDate() + (direction === 'next' ? 1 : -1));
          break;
        case 'week':
          newDate.setDate(prev.getDate() + (direction === 'next' ? 7 : -7));
          break;
        case 'month':
        default:
          newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
          break;
      }
      return newDate;
    });
  };

  // Handle HTML5 drag API for calendar drops
  const handleCalendarDrop = async (e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    
    if (!taskId) return;
    
    const task = userTasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      // Extract date and time from slotId
      const parts = slotId.replace('calendar-slot-', '').split('-');
      if (parts.length === 5) {
        const [year, month, day, hour, minute] = parts.map(p => parseInt(p));
        const newDate = new Date(year, month - 1, day, hour, minute);
        
        await taskService.updateTask(taskId, {
          dueDate: newDate.toISOString()
        }, userProfile);
        
        const updatedTasks = await taskService.loadTasksAssignedToUser();
        setUserTasks(updatedTasks);
        
        toast({
          title: "Task scheduled",
          description: `"${task.taskName}" scheduled for ${format(newDate, 'MMM dd, HH:mm')}`,
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error moving task:', error);
      toast({
        title: "Error",
        description: "Failed to move task. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleCalendarDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const renderDayView = () => <DayTimelineView 
    currentDate={currentDate} 
    tasks={userTasks} 
    enableDragDrop={true}
    useOwnDragContext={false}
    onTaskUpdate={async (taskId, updates) => {
      try {
        await taskService.updateTask(taskId, updates, userProfile);
        const updatedTasks = await taskService.loadTasksAssignedToUser();
        setUserTasks(updatedTasks);
      } catch (error) {
        console.error('Failed to update task:', error);
      }
    }}
    onCalendarDrop={handleCalendarDrop}
    onCalendarDragOver={handleCalendarDragOver}
  />;

  const renderWeekView = () => <WeekTimelineView 
    currentDate={currentDate} 
    tasks={userTasks} 
    onTaskUpdate={async (taskId, updates) => {
      try {
        await taskService.updateTask(taskId, updates, userProfile);
        const updatedTasks = await taskService.loadTasksAssignedToUser();
        setUserTasks(updatedTasks);
      } catch (error) {
        console.error('Failed to update task:', error);
      }
    }}
  />;

  const renderMonthView = () => <MonthTimelineView 
    currentDate={currentDate} 
    tasks={userTasks}
    onTaskUpdate={async (taskId, updates) => {
      try {
        await taskService.updateTask(taskId, updates, userProfile);
        // Reload tasks to reflect changes
        const updatedTasks = await taskService.loadTasksAssignedToUser();
        setUserTasks(updatedTasks);
      } catch (error) {
        console.error('Failed to update task:', error);
      }
    }}
    onDayClick={(day) => {
      setCurrentDate(day);
      setViewMode('day');
    }}
  />;

  // Calendar view rendering logic
  const renderCalendarView = () => {
    switch (viewMode) {
      case 'day':
        return renderDayView();
      case 'week':
        return renderWeekView();
      case 'month':
      default:
        return renderMonthView();
    }
  };


  return (
    <div>
        {/* Main Background Container */}
        <div className="h-screen relative overflow-hidden bg-white">
          {/* No background overlay needed for white theme */}
          
          {/* Main Content Container */}
          <div className={cn("relative z-10 flex h-full font-inter", spacingClasses)}>
            {/* Left Sidebar - Light Theme */}
            <div className={cn(
              "fixed left-0 w-80 bg-card border-r border-border p-6 space-y-6 overflow-y-auto transition-all duration-300",
              fullHeightClasses, 
              spacingClasses.includes('pt-') ? 'top-[73px]' : 'top-0'
            )}>
            {/* Return to Home Button */}
            <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group font-inter">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium text-sm">Return to Home</span>
            </Link>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Type here to search" 
                className="pl-10 h-11 text-sm font-inter" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Task Backlog */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground text-sm font-inter">Task Backlog</h3>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={async () => {
                      try {
                        console.log('🔍 Total user tasks:', userTasks.length);
                        console.log('🔍 User tasks with dueDates:', userTasks.map(t => ({ id: t.id, name: t.taskName, dueDate: t.dueDate })));
                        
                        // Find all tasks that have specific times (not at midnight)
                        const scheduledTasks = userTasks.filter(task => {
                          if (!task.dueDate) return false;
                          const taskDateTime = new Date(task.dueDate);
                          const isScheduled = !(taskDateTime.getHours() === 0 && taskDateTime.getMinutes() === 0);
                          console.log(`🔍 Task "${task.taskName}": ${task.dueDate} -> hours: ${taskDateTime.getHours()}, minutes: ${taskDateTime.getMinutes()}, isScheduled: ${isScheduled}`);
                          return isScheduled;
                        });
                        
                        console.log('🔍 Scheduled tasks found:', scheduledTasks.length);
                        
                        if (scheduledTasks.length === 0) {
                          toast({
                            title: "No tasks to reset",
                            description: "All tasks are already in the backlog.",
                            variant: "default",
                          });
                          return;
                        }
                        
                        // Reset all scheduled tasks to midnight (move to backlog)
                        const resetPromises = scheduledTasks.map(task => {
                          const resetDate = new Date(task.dueDate);
                          resetDate.setHours(0, 0, 0, 0); // Set to midnight local time
                          return taskService.updateTask(task.id, {
                            dueDate: resetDate.toISOString()
                          }, userProfile);
                        });
                        
                        await Promise.all(resetPromises);
                        
                        toast({
                          title: "Calendar cleared successfully",
                          description: `${scheduledTasks.length} task${scheduledTasks.length > 1 ? 's' : ''} moved back to backlog.`,
                          variant: "default",
                        });
                        
                        // Reload tasks to reflect changes
                        const updatedTasks = await taskService.loadTasksAssignedToUser();
                        setUserTasks(updatedTasks);
                      } catch (error) {
                        console.error('Failed to reset tasks:', error);
                        toast({
                          title: "Error",
                          description: "Failed to reset tasks. Please try again.",
                          variant: "destructive",
                        });
                      }
                    }}
                    className="text-orange-600 text-sm font-medium hover:text-orange-700 transition-colors font-inter"
                  >
                    RESET
                  </button>
                  <Link to="/tasks/new" className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors font-inter">
                    ADD TASK
                  </Link>
                </div>
              </div>

              {/* Task Type Filter */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button onClick={() => setActiveTab('All')} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all font-inter", activeTab === 'All' ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground')}>
                  All
                </button>
                <button onClick={() => setActiveTab('Task')} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all font-inter", activeTab === 'Task' ? 'bg-green-500 text-white shadow-lg' : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground')}>
                  Tasks
                </button>
                <button onClick={() => setActiveTab('Issue')} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all font-inter", activeTab === 'Issue' ? 'bg-orange-500 text-white shadow-lg' : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground')}>
                  Issues
                </button>
                <button onClick={() => setActiveTab('Bug')} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all font-inter", activeTab === 'Bug' ? 'bg-red-500 text-white shadow-lg' : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground')}>
                  Bugs
                </button>
                <button onClick={() => setActiveTab('Feature')} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all font-inter", activeTab === 'Feature' ? 'bg-purple-500 text-white shadow-lg' : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground')}>
                  Features
                </button>
              </div>

              <div className="space-y-2 min-h-[100px] p-2 rounded-lg">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="text-sm text-muted-foreground font-inter">Loading tasks...</div>
                  </div>
                ) : userTasks.length === 0 ? (
                  <div className="text-center py-4">
                    <div className="text-sm text-muted-foreground font-inter">No tasks assigned to you</div>
                  </div>
                ) : (
                  getFilteredTasks(userTasks).filter(task => {
                    const matchesType = activeTab === 'All' || task.taskType === activeTab;
                    if (!matchesType) return false;
                    if (!task.dueDate) return true;
                    try {
                      const taskDateTime = new Date(task.dueDate);
                      const hours = taskDateTime.getHours();
                      const minutes = taskDateTime.getMinutes();
                      const isBacklogTask = hours === 0 && minutes === 0;
                      return isBacklogTask;
                    } catch (error) {
                      console.error('Error parsing task date for backlog filter:', task.dueDate, error);
                      return true;
                    }
                  }).map((task) => (
                    <div 
                      key={task.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', task.id);
                      }}
                      className="draggable-task-element px-3 py-2 rounded-lg cursor-pointer transition-all group border bg-card border-border hover:bg-accent"
                      onClick={() => {
                        setSelectedTaskForEdit(task);
                        setIsTaskEditOpen(true);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 pt-1">
                          <GripVertical className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 
                            className="text-sm font-semibold text-foreground truncate mb-1 cursor-pointer hover:text-primary transition-colors font-inter"
                          >
                            {task.taskName}
                          </h4>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-muted-foreground font-medium truncate font-inter">
                              {task.projectName || 'No Project'}
                            </p>
                            <span className={cn("px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 font-inter", task.taskType === 'Task' ? 'bg-green-100 text-green-700 border border-green-200' : task.taskType === 'Bug' ? 'bg-red-100 text-red-700 border border-red-200' : task.taskType === 'Feature' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-muted text-muted-foreground border border-border')}>
                              {task.taskType}
                            </span>
                            <span className="px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 bg-blue-100 text-blue-700 border border-blue-200 font-inter">
                              {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'No due date'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                 )}
              </div>
            </div>
          </div>

          {/* Main Content - Calendar View */}
          <div className="flex-1 flex flex-col p-4 ml-80 overflow-hidden">
            {/* Calendar Navigation */}
            <div className="mb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Dashboard Button */}
                  <Button
                    onClick={() => window.location.href = '/dashboard'}
                    variant="outline"
                    size="sm"
                    className="h-9 font-medium font-inter text-sm px-3"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>

                  {/* TimeSheet Button */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-9 font-medium font-inter text-sm px-3"
                    onClick={() => {
                      // Navigate to timesheet page
                      window.location.href = '/timesheet';
                    }}
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    TimeSheet
                  </Button>
                </div>
                
                <div className="flex items-center space-x-4">
                  {/* Date and Time - Moved to Right Side */}
                  <div className="flex items-center gap-3">
                    <h2 className="text-sm font-medium text-foreground flex items-center gap-3 font-inter">
                      {formatDate(currentDate)}
                      <span className="flex items-center gap-1 text-sm text-primary font-inter">
                        🕒 {format(currentTime, 'HH:mm')}
                      </span>
                    </h2>
                  </div>
                  
                  {/* Calendar Settings Button */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-9 w-9 rounded-full p-0"
                    onClick={() => setShowCalendarSettings(true)}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                  
                  {/* View Mode Toggle */}
                  <ToggleGroup type="single" value={viewMode} onValueChange={value => value && setViewMode(value as ViewMode)}>
                    <ToggleGroupItem value="day" size="sm" className="h-9 flex items-center gap-2 font-medium font-inter text-sm px-3">
                      <CalendarDays className="w-4 h-4" />
                      Day
                    </ToggleGroupItem>
                    <ToggleGroupItem value="week" size="sm" className="h-9 flex items-center gap-2 font-medium font-inter text-sm px-3">
                      <Calendar className="w-4 h-4" />
                      Week
                    </ToggleGroupItem>
                    <ToggleGroupItem value="month" size="sm" className="h-9 flex items-center gap-2 font-medium font-inter text-sm px-3">
                      <Calendar className="w-4 h-4" />
                      Month
                    </ToggleGroupItem>
                  </ToggleGroup>
                  
                  {/* Navigation */}
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="h-9 w-9 rounded-full p-0" onClick={() => navigate('prev')}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-9 w-9 rounded-full p-0" onClick={() => navigate('next')}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Large Calendar Grid - Scrollable */}
            <div className="bg-card border border-border rounded-lg p-6 flex-1 overflow-y-auto">
              {renderCalendarView()}
            </div>
          </div>

          {/* Task Edit Panel */}
          <div className="task-edit-panel">
            <TaskEditSidePanel
              task={selectedTaskForEdit}
              isOpen={isTaskEditOpen}
              onClose={() => {
                setIsTaskEditOpen(false);
                setSelectedTaskForEdit(null);
              }}
              updateTask={async (taskId: string, updates: Partial<Task>) => {
                try {
                  await taskService.updateTask(taskId, updates, userProfile);
                  // Reload tasks to reflect changes
                  const updatedTasks = await taskService.loadTasksAssignedToUser();
                  setUserTasks(updatedTasks);
                } catch (error) {
                  console.error('Error updating task:', error);
                  throw error;
                }
              }}
              deleteTask={async (taskId: string) => {
                try {
                  await taskService.deleteTask(taskId);
                  // Reload tasks to reflect changes
                  const updatedTasks = await taskService.loadTasksAssignedToUser();
                  setUserTasks(updatedTasks);
                } catch (error) {
                  console.error('Error deleting task:', error);
                  throw error;
                }
              }}
            />
          </div>

          {/* Timer functionality now handled by MenuBar */}
        </div>
      </div>
    </div>
  );
};

export default TasksPage;