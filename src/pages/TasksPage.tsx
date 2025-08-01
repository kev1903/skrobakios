import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Link } from 'react-router-dom';
import { Search, Plus, Edit2, MoreHorizontal, ArrowLeft, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, ChevronLeft, ChevronRight, Calendar, Home, DollarSign, Monitor, Download, Book, ChevronDown, Clock, MapPin, CheckCircle2, Circle, Settings, CalendarDays, BarChart3 } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { format, startOfWeek, endOfWeek, isSameDay, addDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { taskService } from '@/components/tasks/taskService';
import { TaskCard } from '@/components/tasks/TaskCard';
import { Task } from '@/components/tasks/types';
import { DayTimelineView } from '@/components/tasks/DayTimelineView';
import { WeekTimelineView } from '@/components/tasks/WeekTimelineView';
import { CalendarSettingsPage } from '@/components/tasks/CalendarSettingsPage';
import { TaskEditSidePanel } from '@/components/tasks/TaskEditSidePanel';
import { useUser } from '@/contexts/UserContext';

type ViewMode = 'day' | 'week' | 'month';

const TasksPage = () => {
  const { userProfile } = useUser();
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

  // Live time updater
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load tasks assigned to the current user
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
    loadUserTasks();
  }, []);

  const getTasksForDate = (date: Date | null) => {
    if (!date) return [];
    const dateString = date.toISOString().split('T')[0];
    return userTasks.filter(task => {
      if (!task.dueDate) return false;
      // Handle both old date format (YYYY-MM-DD) and new datetime format (ISO string)
      const taskDate = task.dueDate.split('T')[0]; // Extract date part from datetime
      return taskDate === dateString;
    });
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

  // Handle drag start
  const handleDragStart = (start: any) => {
    let taskId = start.draggableId;
    if (taskId.startsWith('backlog-')) {
      taskId = taskId.replace('backlog-', '');
    }
    const task = userTasks.find(t => t.id === taskId);
    setDraggedTask(task || null);
  };

  // Handle drag end
  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    console.log('🔄 Drag end result:', { destination, source, draggableId });
    setDraggedTask(null);

    if (!destination) {
      console.log('❌ No destination - drag cancelled');
      return;
    }

    // Handle timeline drops (works for all droppableIds that start with 'timeline-')
    if (destination.droppableId.startsWith('timeline-')) {
      console.log('📅 Dropping on timeline slot:', destination.droppableId);
      const slotHour = destination.droppableId.replace('timeline-', '');
      
      // Extract task ID from draggableId (handle prefixed IDs)
      let taskId = draggableId;
      if (draggableId.startsWith('backlog-')) {
        taskId = draggableId.replace('backlog-', '');
      }
      
      const task = userTasks.find(t => t.id === taskId);
      console.log('🎯 Found task to update:', task);
      
      if (task) {
        try {
          let newDate = new Date(currentDate);
          
          if (slotHour === '-1') {
            // Combined night slot (00:00-05:00), default to 02:30
            newDate.setHours(2, 30, 0, 0);
            console.log('🌙 Setting night slot time to 02:30');
          } else {
            // Calculate hour and minutes from slot index
            const slotIndex = parseInt(slotHour);
            const hour = Math.floor(slotIndex / 2);
            const minutes = (slotIndex % 2) * 30;
            newDate.setHours(hour, minutes, 0, 0);
            console.log(`⏰ Setting time to ${hour}:${minutes.toString().padStart(2, '0')} (slot ${slotIndex})`);
          }
          
          console.log('📝 Updating task with new date:', newDate.toISOString());
          await taskService.updateTask(task.id, { dueDate: newDate.toISOString() }, userProfile);
          console.log('✅ Task update successful');
          
          // Reload tasks to reflect changes
          const updatedTasks = await taskService.loadTasksAssignedToUser();
          console.log('🔄 Reloaded tasks count:', updatedTasks.length);
          setUserTasks(updatedTasks);
        } catch (error) {
          console.error('❌ Failed to update task:', error);
        }
      } else {
        console.error('❌ Task not found for ID:', taskId);
      }
    }
  };


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

  const renderWeekView = () => <WeekTimelineView currentDate={currentDate} tasks={userTasks} onTaskUpdate={async (taskId, updates) => {
    try {
      await taskService.updateTask(taskId, updates, userProfile);
      // Reload tasks to reflect changes
      const updatedTasks = await taskService.loadTasksAssignedToUser();
      setUserTasks(updatedTasks);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  }} />;

  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate);
    const weekHeaders = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return (
      <>
        {/* Week Headers */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {weekHeaders.map(day => (
            <div key={day} className="text-center py-3 text-sm font-semibold text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const dayTasks = getTasksForDate(day);
            const isToday = day && isSameDay(day, new Date());
            return (
              <div key={index} className="aspect-square">
                {day && (
                  <div 
                    className={cn(
                      "h-full min-h-[120px] p-3 rounded-xl border hover:border-gray-200 transition-all cursor-pointer", 
                      isToday ? "bg-primary/5 border-primary/20 shadow-sm" : "bg-card hover:bg-muted/30 border-border"
                    )} 
                    onClick={() => {
                      setCurrentDate(day);
                      setViewMode('day'); // Switch to day view when clicking a day
                    }}
                  >
                    <div className={cn("text-sm font-semibold mb-2", isToday ? "text-primary" : "text-foreground")}>
                      {day.getDate()}
                    </div>
                    
                    <div className="space-y-1">
                      {dayTasks.slice(0, 2).map(task => {
                        const taskTime = new Date(task.dueDate);
                        const hasSpecificTime = !(taskTime.getUTCHours() === 0 && taskTime.getUTCMinutes() === 0);
                        return (
                          <div 
                            key={task.id} 
                            className="text-xs p-1.5 rounded border bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer" 
                            title={`${task.taskName} - ${task.projectName || 'No Project'}${hasSpecificTime ? ` at ${format(taskTime, 'HH:mm')}` : ''}`} 
                            onClick={e => {
                              e.stopPropagation();
                              // Could add task click handler here
                            }}
                          >
                            <div className="font-medium truncate">{task.taskName}</div>
                            {hasSpecificTime && (
                              <div className="text-xs opacity-75">
                                {format(taskTime, 'HH:mm')}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {dayTasks.length > 2 && (
                        <div className="text-xs text-muted-foreground bg-muted/30 rounded p-1 text-center">
                          +{dayTasks.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </>
    );
  };

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
    <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex font-sans">
        {/* Left Sidebar */}
        <div className="fixed top-0 left-0 w-80 h-screen bg-gradient-to-b from-white/90 via-purple-50/70 to-blue-50/70 backdrop-blur-xl border-r border-purple-200/50 p-6 space-y-6 shadow-lg overflow-y-auto">
          {/* Return to Home Button */}
          <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-sm">Return to Home</span>
          </Link>

          {/* Dashboard Button */}
          <Button
            onClick={() => window.location.href = '/dashboard'}
            variant="outline"
            size="sm"
            className="w-full justify-start border-primary/20 hover:bg-primary/5 text-gray-700 hover:text-primary"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Dashboard
          </Button>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Type here to search" className="pl-10 bg-gray-50/50 border-gray-200/50 rounded-xl h-11 text-sm placeholder:text-gray-400" />
          </div>

          {/* Task Backlog */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 text-sm">Task Backlog</h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={async () => {
                    try {
                      // Find all tasks that have specific times (not at midnight)
                      const scheduledTasks = userTasks.filter(task => {
                        if (!task.dueDate) return false;
                        const taskDateTime = new Date(task.dueDate);
                        return !(taskDateTime.getUTCHours() === 0 && taskDateTime.getUTCMinutes() === 0);
                      });
                      
                      if (scheduledTasks.length === 0) {
                        console.log('No scheduled tasks to reset');
                        return;
                      }
                      
                      // Reset all scheduled tasks to midnight (move to backlog)
                      const resetPromises = scheduledTasks.map(task => {
                        const resetDate = new Date(task.dueDate);
                        resetDate.setUTCHours(0, 0, 0, 0); // Set to midnight UTC
                        return taskService.updateTask(task.id, {
                          dueDate: resetDate.toISOString()
                        }, userProfile);
                      });
                      
                      await Promise.all(resetPromises);
                      console.log(`Reset ${scheduledTasks.length} tasks to backlog`);
                      
                      // Reload tasks to reflect changes
                      const updatedTasks = await taskService.loadTasksAssignedToUser();
                      setUserTasks(updatedTasks);
                    } catch (error) {
                      console.error('Failed to reset tasks:', error);
                    }
                  }}
                  className="text-orange-500 text-sm font-medium hover:text-orange-600 transition-colors"
                >
                  RESET
                </button>
                <Link to="/tasks/new" className="text-blue-500 text-sm font-medium hover:text-blue-600 transition-colors">
                  ADD TASK
                </Link>
              </div>
            </div>

            {/* Task Type Filter */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button onClick={() => setActiveTab('All')} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-colors", activeTab === 'All' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                All
              </button>
              <button onClick={() => setActiveTab('Task')} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-colors", activeTab === 'Task' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                Tasks
              </button>
              <button onClick={() => setActiveTab('Issue')} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-colors", activeTab === 'Issue' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                Issues
              </button>
              <button onClick={() => setActiveTab('Bug')} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-colors", activeTab === 'Bug' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                Bugs
              </button>
              <button onClick={() => setActiveTab('Feature')} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-colors", activeTab === 'Feature' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                Features
              </button>
            </div>

            <div className="space-y-2 min-h-[100px] p-2 rounded-lg">
              <Droppable droppableId="task-backlog">
                {(provided, snapshot) => (
                  <div 
                    ref={provided.innerRef} 
                    {...provided.droppableProps} 
                    className={cn(
                      "space-y-2 min-h-[100px] transition-colors", 
                      snapshot.isDraggingOver ? "bg-green-50 border-2 border-dashed border-green-300" : "border-2 border-transparent"
                    )}
                  >
                    {loading ? (
                      <div className="text-center py-4">
                        <div className="text-sm text-gray-500">Loading tasks...</div>
                      </div>
                    ) : userTasks.length === 0 ? (
                      <div className="text-center py-4">
                        <div className="text-sm text-gray-500">No tasks assigned to you</div>
                      </div>
                    ) : (
                      userTasks.filter(task => {
                        // First filter by task type
                        const matchesType = activeTab === 'All' || task.taskType === activeTab;
                        if (!matchesType) return false;

                        // Then filter to show only unscheduled tasks (no specific time) in backlog
                        if (!task.dueDate) return true; // Tasks without due date go to backlog

                        try {
                          const taskDateTime = new Date(task.dueDate);
                          const hours = taskDateTime.getUTCHours();
                          const minutes = taskDateTime.getUTCMinutes();
                          const isBacklogTask = hours === 0 && minutes === 0;
                          // Tasks at midnight (00:00 UTC) are considered unscheduled and go to backlog
                          return isBacklogTask;
                        } catch (error) {
                          console.error('Error parsing task date for backlog filter:', task.dueDate, error);
                          return true; // If we can't parse the date, show it in backlog as fallback
                        }
                      }).map((task, index) => (
                        <Draggable key={task.id} draggableId={`backlog-${task.id}`} index={index}>
                          {(provided, snapshot) => (
                            <div 
                              ref={provided.innerRef} 
                              {...provided.draggableProps} 
                              {...provided.dragHandleProps} 
                              className={cn(
                                "px-3 py-2 rounded-lg cursor-grab transition-colors group border border-gray-100/50",
                                snapshot.isDragging 
                                  ? "bg-blue-50 border-blue-200 shadow-lg opacity-90 z-50" 
                                  : "hover:bg-gray-50/50 active:cursor-grabbing"
                              )} 
                              style={{
                                ...provided.draggableProps.style,
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <h4 
                                    className="text-sm font-semibold text-gray-800 truncate mb-1 cursor-pointer hover:text-blue-600 transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedTaskForEdit(task);
                                      setIsTaskEditOpen(true);
                                    }}
                                  >
                                    {task.taskName}
                                  </h4>
                                  <div className="flex items-center gap-2">
                                    <p className="text-xs text-gray-500 font-medium truncate">
                                      {task.projectName || 'No Project'}
                                    </p>
                                    <span className={cn("px-2 py-0.5 rounded text-xs font-medium flex-shrink-0", task.taskType === 'Task' ? 'bg-green-50 text-green-600' : task.taskType === 'Issue' ? 'bg-orange-50 text-orange-600' : task.taskType === 'Bug' ? 'bg-red-50 text-red-600' : task.taskType === 'Feature' ? 'bg-purple-50 text-purple-600' : 'bg-gray-50 text-gray-600')}>
                                      {task.taskType}
                                    </span>
                                    <span className="px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 bg-blue-50 text-blue-600">
                                      {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'No due date'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        </div>

        {/* Main Content - Calendar View */}
        <div className="flex-1 p-8 ml-80">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            {/* Empty div to maintain spacing */}
            <div></div>
          </div>

          {/* Calendar Navigation */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                {formatDate(currentDate)}
                <span className="flex items-center gap-1 text-lg">
                  🕒 {format(currentTime, 'HH:mm:ss')}
                </span>
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              {/* Calendar Settings Button */}
              <Button 
                variant="outline" 
                size="sm" 
                className="w-9 h-9 rounded-full p-0"
                onClick={() => setShowCalendarSettings(true)}
              >
                <Settings className="w-4 h-4" />
              </Button>
              
              {/* View Mode Toggle */}
              <ToggleGroup type="single" value={viewMode} onValueChange={value => value && setViewMode(value as ViewMode)}>
                <ToggleGroupItem value="day" size="sm" className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" />
                  Day
                </ToggleGroupItem>
                <ToggleGroupItem value="week" size="sm" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Week
                </ToggleGroupItem>
                <ToggleGroupItem value="month" size="sm" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Month
                </ToggleGroupItem>
              </ToggleGroup>
              
              {/* Navigation */}
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="w-9 h-9 rounded-full p-0" onClick={() => navigate('prev')}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" className="w-9 h-9 rounded-full p-0" onClick={() => navigate('next')}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Large Calendar Grid */}
          <div className="bg-gradient-to-br from-white/90 via-purple-50/50 to-blue-50/50 backdrop-blur-xl rounded-2xl p-6 border border-purple-200/30 shadow-xl">
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
            <div className="bg-primary text-primary-foreground p-3 rounded-lg shadow-lg">
              <div className="text-sm font-medium">
                Moving: {draggedTask.taskName}
              </div>
            </div>
          </div>
        )}
      </div>
    </DragDropContext>
  );
};

export default TasksPage;
