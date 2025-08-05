import React, { useState, useEffect } from 'react';
// import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Link } from 'react-router-dom';
import { Search, Plus, Edit2, MoreHorizontal, ArrowLeft, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, ChevronLeft, ChevronRight, Calendar, Home, DollarSign, Monitor, Download, Book, ChevronDown, Clock, MapPin, CheckCircle2, Circle, Settings, CalendarDays, BarChart3 } from 'lucide-react';
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
  console.log('🚀 TasksPage: Component is rendering');
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
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Live time updater
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
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

  // Drag and drop handlers removed since functionality is disabled


  const renderDayView = () => <DayTimelineView 
    currentDate={currentDate} 
    tasks={userTasks} 
    enableDragDrop={true}
    onTaskUpdate={async (taskId, updates) => {
      try {
        await taskService.updateTask(taskId, updates, userProfile);
        // Reload tasks to reflect changes
        const updatedTasks = await taskService.loadTasksAssignedToUser();
        setUserTasks(updatedTasks);
      } catch (error) {
        console.error('Failed to update task:', error);
      }
    }} />;

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

  // Conditionally render Calendar Settings or main Tasks page
  if (showCalendarSettings) {
    return <CalendarSettingsPage onBack={() => setShowCalendarSettings(false)} />;
  }

  return (
    <>
      {/* Glass Morphism Background Container */}
      <div 
        className="min-h-screen relative overflow-hidden"
        style={{
          backgroundImage: `url(${desertDunesBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-black/10 to-black/30 backdrop-blur-[2px]" />
        
        {/* Main Content Container */}
        <div className={cn("relative z-10 flex font-inter", minHeightClasses, spacingClasses)}>
          {/* Left Sidebar - Glass Morphism */}
          <div className={cn(
            "fixed left-0 w-80 glass-sidebar p-6 space-y-6 overflow-y-auto transition-all duration-300",
            fullHeightClasses, 
            spacingClasses.includes('pt-') ? 'top-[73px]' : 'top-0'
          )}>
            {/* Return to Home Button */}
            <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors group font-inter">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium text-sm">Return to Home</span>
            </Link>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input 
                placeholder="Type here to search" 
                className="pl-10 bg-white/10 border-white/20 rounded-xl h-11 text-sm placeholder:text-white/50 text-white backdrop-blur-sm focus:bg-white/15 focus:border-white/30 font-inter" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Task Backlog */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white text-sm font-inter">Task Backlog</h3>
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
                    className="text-orange-400 text-sm font-medium hover:text-orange-300 transition-colors font-inter"
                  >
                    RESET
                  </button>
                  <Link to="/tasks/new" className="text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors font-inter">
                    ADD TASK
                  </Link>
                </div>
              </div>

              {/* Task Type Filter */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button onClick={() => setActiveTab('All')} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all backdrop-blur-sm font-inter", activeTab === 'All' ? 'bg-blue-500/80 text-white shadow-lg' : 'bg-white/10 text-white/70 hover:bg-white/20')}>
                  All
                </button>
                <button onClick={() => setActiveTab('Task')} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all backdrop-blur-sm font-inter", activeTab === 'Task' ? 'bg-green-500/80 text-white shadow-lg' : 'bg-white/10 text-white/70 hover:bg-white/20')}>
                  Tasks
                </button>
                <button onClick={() => setActiveTab('Issue')} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all backdrop-blur-sm font-inter", activeTab === 'Issue' ? 'bg-orange-500/80 text-white shadow-lg' : 'bg-white/10 text-white/70 hover:bg-white/20')}>
                  Issues
                </button>
                <button onClick={() => setActiveTab('Bug')} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all backdrop-blur-sm font-inter", activeTab === 'Bug' ? 'bg-red-500/80 text-white shadow-lg' : 'bg-white/10 text-white/70 hover:bg-white/20')}>
                  Bugs
                </button>
                <button onClick={() => setActiveTab('Feature')} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all backdrop-blur-sm font-inter", activeTab === 'Feature' ? 'bg-purple-500/80 text-white shadow-lg' : 'bg-white/10 text-white/70 hover:bg-white/20')}>
                  Features
                </button>
              </div>

              <div className="space-y-2 min-h-[100px] p-2 rounded-lg">
                {/* Temporarily disabled drag-drop functionality */}
                <div className="space-y-2 min-h-[100px] transition-all rounded-xl border-2 border-transparent">
                  {loading ? (
                    <div className="text-center py-4">
                      <div className="text-sm text-white/60 font-inter">Loading tasks...</div>
                    </div>
                  ) : userTasks.length === 0 ? (
                    <div className="text-center py-4">
                      <div className="text-sm text-white/60 font-inter">No tasks assigned to you</div>
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
                    }).map((task, index) => (
                      <div 
                        key={task.id}
                        className="px-3 py-2 rounded-lg cursor-pointer transition-all group backdrop-blur-sm bg-white/10 border border-white/20 hover:bg-white/20"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                             <h4 
                               className="text-sm font-semibold text-white truncate mb-1 cursor-pointer hover:text-blue-300 transition-colors font-inter"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTaskForEdit(task);
                                setIsTaskEditOpen(true);
                              }}
                            >
                              {task.taskName}
                            </h4>
                            <div className="flex items-center gap-2">
                               <p className="text-xs text-white/70 font-medium truncate font-inter">
                                 {task.projectName || 'No Project'}
                               </p>
                               <span className={cn("px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 backdrop-blur-sm font-inter", task.taskType === 'Task' ? 'bg-green-400/20 text-green-300 border border-green-400/30' : task.taskType === 'Issue' ? 'bg-orange-400/20 text-orange-300 border border-orange-400/30' : task.taskType === 'Bug' ? 'bg-red-400/20 text-red-300 border border-red-400/30' : task.taskType === 'Feature' ? 'bg-purple-400/20 text-purple-300 border border-purple-400/30' : 'bg-white/10 text-white/70 border border-white/20')}>
                                 {task.taskType}
                               </span>
                               <span className="px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 bg-blue-400/20 text-blue-300 border border-blue-400/30 backdrop-blur-sm font-inter">
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
          </div>

          {/* Main Content - Calendar View */}
          <div className="flex-1 p-8 ml-80">
            {/* Calendar Navigation - Glass Morphism */}
            <div className="glass-card p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Dashboard Button */}
                  <Button
                    onClick={() => window.location.href = '/dashboard'}
                    variant="outline"
                    size="sm"
                    className="bg-white/10 border-white/20 hover:bg-white/20 text-white hover:text-white font-medium backdrop-blur-sm font-inter"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>

                  {/* TimeSheet Button */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-blue-500/20 border-blue-400/30 hover:bg-blue-400/30 text-blue-300 hover:text-blue-200 font-medium backdrop-blur-sm font-inter"
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
                    <h2 className="text-lg font-bold text-white flex items-center gap-3 font-inter">
                      {formatDate(currentDate)}
                      <span className="flex items-center gap-1 text-lg text-blue-300 font-inter">
                        🕒 {format(currentTime, 'HH:mm:ss')}
                      </span>
                    </h2>
                  </div>
                  
                  {/* Calendar Settings Button */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-9 h-9 rounded-full p-0 bg-white/10 border-white/20 hover:bg-white/20 text-white backdrop-blur-sm"
                    onClick={() => setShowCalendarSettings(true)}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                  
                  {/* View Mode Toggle */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-1 border border-white/20">
                    <ToggleGroup type="single" value={viewMode} onValueChange={value => value && setViewMode(value as ViewMode)}>
                      <ToggleGroupItem value="day" size="sm" className="flex items-center gap-2 text-white data-[state=on]:bg-white/20 data-[state=on]:text-white hover:bg-white/10 font-inter">
                        <CalendarDays className="w-4 h-4" />
                        Day
                      </ToggleGroupItem>
                      <ToggleGroupItem value="week" size="sm" className="flex items-center gap-2 text-white data-[state=on]:bg-white/20 data-[state=on]:text-white hover:bg-white/10 font-inter">
                        <Calendar className="w-4 h-4" />
                        Week
                      </ToggleGroupItem>
                      <ToggleGroupItem value="month" size="sm" className="flex items-center gap-2 text-white data-[state=on]:bg-white/20 data-[state=on]:text-white hover:bg-white/10 font-inter">
                        <Calendar className="w-4 h-4" />
                        Month
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                  
                  {/* Navigation */}
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="w-9 h-9 rounded-full p-0 bg-white/10 border-white/20 hover:bg-white/20 text-white backdrop-blur-sm" onClick={() => navigate('prev')}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="w-9 h-9 rounded-full p-0 bg-white/10 border-white/20 hover:bg-white/20 text-white backdrop-blur-sm" onClick={() => navigate('next')}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Large Calendar Grid - Glass Morphism */}
            <div className="glass-card p-6">
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

          {/* Drag Feedback */}
          {draggedTask && (
            <div className="fixed bottom-4 right-4 z-50">
              <div className="bg-blue-500/90 backdrop-blur-sm text-white p-3 rounded-lg shadow-2xl border border-blue-400/30">
                <div className="text-sm font-medium font-inter">
                  Moving: {draggedTask.taskName}
                </div>
              </div>
            </div>
          )}

          {/* Timer functionality now handled by MenuBar */}
        </div>
      </div>
    </>
  );
};

export default TasksPage;
