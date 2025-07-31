import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Search, Plus, Edit2, MoreHorizontal, ArrowLeft, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Volume2, ChevronLeft, ChevronRight, Calendar, Home, DollarSign, Monitor, Download, Book, ChevronDown, Clock, MapPin, CheckCircle2, Circle } from 'lucide-react';
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
import { useUser } from '@/contexts/UserContext';
type ViewMode = 'day' | 'week' | 'month';
const TasksPage = () => {
  const {
    userProfile
  } = useUser();
  const [activeTab, setActiveTab] = useState('All');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [userTasks, setUserTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

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

  // Handle drag and drop from backlog to timeline
  const handleDragEnd = async (result: DropResult) => {
    const {
      destination,
      source,
      draggableId
    } = result;
    console.log('🔄 Drag end result:', {
      destination,
      source,
      draggableId
    });
    console.log('🎯 Source droppableId:', source.droppableId);
    console.log('🎯 Destination droppableId:', destination?.droppableId);
    
    if (!destination) {
      console.log('❌ No destination - drag cancelled');
      return;
    }

    // Handle drop on day timeline slots (format: "timeline-SLOTINDEX")
    if (destination.droppableId.startsWith('timeline-')) {
      const slotIndex = parseInt(destination.droppableId.replace('timeline-', ''));
      const hour = Math.floor(slotIndex / 2);
      const minutes = slotIndex % 2 * 30;

      // Handle both backlog-to-timeline and timeline-to-timeline moves
      let taskId;
      if (draggableId.startsWith('backlog-')) {
        taskId = draggableId.replace('backlog-', '');
        console.log('📋 Moving task from backlog to timeline slot');
      } else if (draggableId.startsWith('timeline-')) {
        taskId = draggableId.replace('timeline-', '');
        console.log('🔄 Moving task from timeline slot to another timeline slot');
      } else if (draggableId.startsWith('week-timeline-')) {
        taskId = draggableId.replace('week-timeline-', '');
        console.log('🔄 Moving task from week timeline slot to day timeline slot');
      } else {
        console.error('❌ Unknown draggable ID format:', draggableId);
        return;
      }
      const task = userTasks.find(t => t.id === taskId);
      if (task) {
        console.log('📋 Found task to update:', task.taskName);
        console.log('🎯 Source:', source.droppableId, '→ Destination:', destination.droppableId);

        // Create datetime with the selected 30-minute slot for the current date (using UTC to match timeline display)
        const newDateTime = new Date(currentDate);
        newDateTime.setUTCHours(hour, minutes, 0, 0); // Use UTC with specific minutes

        console.log('⏰ Setting task datetime to:', newDateTime.toISOString(), `(UTC slot: ${hour}:${minutes.toString().padStart(2, '0')})`);
        try {
          await taskService.updateTask(task.id, {
            dueDate: newDateTime.toISOString()
          }, userProfile);
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

    // Handle drop on week timeline slots (format: "week-timeline-SLOTINDEX-DAYINDEX")
    if (destination.droppableId.startsWith('week-timeline-')) {
      const parts = destination.droppableId.replace('week-timeline-', '').split('-');
      const slotIndex = parseInt(parts[0]);
      const dayIndex = parseInt(parts[1]);
      const hour = Math.floor(slotIndex / 2);
      const minutes = slotIndex % 2 * 30;

      // Calculate target date based on day index
      const weekStart = startOfWeek(currentDate);
      const targetDate = addDays(weekStart, dayIndex);
      let taskId;
      if (draggableId.startsWith('backlog-')) {
        taskId = draggableId.replace('backlog-', '');
        console.log('📋 Moving task from backlog to week timeline slot');
      } else if (draggableId.startsWith('timeline-')) {
        taskId = draggableId.replace('timeline-', '');
        console.log('🔄 Moving task from day timeline to week timeline slot');
      } else if (draggableId.startsWith('week-timeline-')) {
        taskId = draggableId.replace('week-timeline-', '');
        console.log('🔄 Moving task within week timeline');
      } else {
        console.error('❌ Unknown draggable ID format:', draggableId);
        return;
      }
      const task = userTasks.find(t => t.id === taskId);
      if (task) {
        console.log('📋 Found task to update:', task.taskName);
        console.log('🎯 Target date:', targetDate, 'Time:', `${hour}:${minutes.toString().padStart(2, '0')}`);

        // Create datetime with the selected 30-minute slot for the target date
        const newDateTime = new Date(targetDate);
        newDateTime.setUTCHours(hour, minutes, 0, 0);
        try {
          await taskService.updateTask(task.id, {
            dueDate: newDateTime.toISOString()
          }, userProfile);
          console.log('✅ Week task update successful');

          // Reload tasks to reflect changes
          const updatedTasks = await taskService.loadTasksAssignedToUser();
          setUserTasks(updatedTasks);
        } catch (error) {
          console.error('❌ Failed to update week task:', error);
        }
      }
    }

    // Handle drop back to task backlog (remove time assignment)
    if (destination.droppableId === 'task-backlog') {
      console.log('🔙 Task dropped back to backlog!');
      let taskId;
      if (draggableId.startsWith('timeline-')) {
        taskId = draggableId.replace('timeline-', '');
      } else if (draggableId.startsWith('week-timeline-')) {
        taskId = draggableId.replace('week-timeline-', '');
      } else {
        console.error('❌ Unknown draggable ID format for backlog drop:', draggableId);
        return;
      }
      console.log('🎯 Task ID extracted:', taskId);
      const task = userTasks.find(t => t.id === taskId);
      if (task) {
        console.log('🔙 Moving task back to backlog:', task.taskName);
        try {
          // Set due date to just the current date without specific time (midnight UTC)
          const dateOnly = new Date(currentDate);
          dateOnly.setUTCHours(0, 0, 0, 0); // Explicitly set UTC midnight

          console.log('⏰ Setting backlog task datetime to:', dateOnly.toISOString());
          await taskService.updateTask(task.id, {
            dueDate: dateOnly.toISOString()
          }, userProfile);
          console.log('✅ Task moved back to backlog successfully');

          // Reload tasks to reflect changes
          const updatedTasks = await taskService.loadTasksAssignedToUser();
          setUserTasks(updatedTasks);
        } catch (error) {
          console.error('❌ Failed to move task back to backlog:', error);
        }
      } else {
        console.error('❌ Task not found for backlog drop:', taskId);
      }
    }
  };
  const renderDayView = () => <DayTimelineView currentDate={currentDate} tasks={userTasks} onTaskUpdate={async (taskId, updates) => {
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
    return <>
        {/* Week Headers */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {weekHeaders.map(day => <div key={day} className="text-center py-3 text-sm font-semibold text-muted-foreground">
              {day}
            </div>)}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
          const dayTasks = getTasksForDate(day);
          const isToday = day && isSameDay(day, new Date());
          return <div key={index} className="aspect-square">
                {day && <div className={cn("h-full min-h-[120px] p-3 rounded-xl border hover:border-gray-200 transition-all cursor-pointer", isToday ? "bg-primary/5 border-primary/20 shadow-sm" : "bg-card hover:bg-muted/30 border-border")} onClick={() => {
              setCurrentDate(day);
              setViewMode('day'); // Switch to day view when clicking a day
            }}>
                    <div className={cn("text-sm font-semibold mb-2", isToday ? "text-primary" : "text-foreground")}>
                      {day.getDate()}
                    </div>
                    
                    <div className="space-y-1">
                      {dayTasks.slice(0, 2).map(task => {
                  const taskTime = new Date(task.dueDate);
                  const hasSpecificTime = !(taskTime.getUTCHours() === 0 && taskTime.getUTCMinutes() === 0);
                  return <div key={task.id} className="text-xs p-1.5 rounded border bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer" title={`${task.taskName} - ${task.projectName || 'No Project'}${hasSpecificTime ? ` at ${format(taskTime, 'HH:mm')}` : ''}`} onClick={e => {
                    e.stopPropagation();
                    // Could add task click handler here
                  }}>
                            <div className="font-medium truncate">{task.taskName}</div>
                            {hasSpecificTime && <div className="text-xs opacity-75">
                                {format(taskTime, 'HH:mm')}
                              </div>}
                          </div>;
                })}
                      {dayTasks.length > 2 && <div className="text-xs text-muted-foreground bg-muted/30 rounded p-1 text-center">
                          +{dayTasks.length - 2} more
                        </div>}
                    </div>
                  </div>}
              </div>;
        })}
        </div>
      </>;
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
  return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex font-sans">
      <DragDropContext onDragStart={(start) => console.log('🚀 Drag started:', start)} onDragEnd={handleDragEnd}>
      {/* Left Sidebar */}
      <div className="w-80 bg-white/70 backdrop-blur-xl border-r border-gray-200/50 p-6 space-y-6 shadow-sm">
        {/* Return to Home Button */}
        <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium text-sm">Return to Home</span>
        </Link>

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

          <Droppable droppableId="task-backlog">
            {(provided, snapshot) => <div ref={provided.innerRef} {...provided.droppableProps} className={cn("space-y-2 min-h-[100px] p-2 rounded-lg transition-colors", snapshot.isDraggingOver ? "bg-green-50 border-2 border-dashed border-green-300" : "border-2 border-transparent")}>
                {loading ? <div className="text-center py-4">
                    <div className="text-sm text-gray-500">Loading tasks...</div>
                  </div> : userTasks.length === 0 ? <div className="text-center py-4">
                    <div className="text-sm text-gray-500">No tasks assigned to you</div>
                  </div> : userTasks.filter(task => {
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
                  console.log('🕐 Backlog filter - Task:', task.taskName, 'Date:', task.dueDate, 'Parsed Hours:', hours, 'Minutes:', minutes, 'Goes to backlog:', isBacklogTask);
                  // Tasks at midnight (00:00 UTC) are considered unscheduled and go to backlog
                  return isBacklogTask;
                } catch (error) {
                  console.error('Error parsing task date for backlog filter:', task.dueDate, error);
                  return true; // If we can't parse the date, show it in backlog as fallback
                }
              }).map((task, index) => <Draggable key={task.id} draggableId={`backlog-${task.id}`} index={index}>
                        {(provided, snapshot) => <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} data-dragging={snapshot.isDragging} className={cn("px-3 py-2 rounded-lg cursor-grab transition-colors group border border-gray-100/50", snapshot.isDragging ? "bg-blue-50 border-blue-200 shadow-xl opacity-90" : "hover:bg-gray-50/50 active:cursor-grabbing")} style={{
                  ...provided.draggableProps.style,
                  // Remove transform offset issues during drag
                  transform: snapshot.isDragging ? provided.draggableProps.style?.transform : provided.draggableProps.style?.transform
                }}>
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-gray-800 truncate mb-1">
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
                          </div>}
                      </Draggable>)}
                {provided.placeholder}
              </div>}
          </Droppable>
        </div>

      </div>

      {/* Main Content - Calendar View */}
      <div className="flex-1 p-8">
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
            {/* New Event Button */}
            <Button className="bg-blue-500 hover:bg-blue-600 rounded-xl px-6 py-2.5 font-medium shadow-lg shadow-blue-500/25">
              <Plus className="w-4 h-4 mr-2" />
              New Event
            </Button>
            
            {/* View Mode Toggle */}
            <ToggleGroup type="single" value={viewMode} onValueChange={value => value && setViewMode(value as ViewMode)}>
              <ToggleGroupItem value="day" size="sm">Day</ToggleGroupItem>
              <ToggleGroupItem value="week" size="sm">Week</ToggleGroupItem>
              <ToggleGroupItem value="month" size="sm">Month</ToggleGroupItem>
            </ToggleGroup>
            
            {/* Navigation */}
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="w-8 h-8 rounded-full" onClick={() => navigate('prev')}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" className="w-8 h-8 rounded-full" onClick={() => navigate('next')}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Large Calendar Grid */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-sm">
          {renderCalendarView()}
        </div>

        {/* Today's Tasks Summary */}
        
      </div>

      {/* Right Sidebar - Only show in Day view */}
      
      </DragDropContext>
    </div>;
};
export default TasksPage;