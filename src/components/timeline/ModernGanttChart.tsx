
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addDays, differenceInDays, isToday, isSameMonth, isWeekend } from 'date-fns';
import { ChevronDown, ChevronRight, MoreHorizontal, CheckCircle2, Circle, Clock, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Toolbar } from '@/components/ui/toolbar';
import './GanttChart.css';

export interface ModernGanttTask {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  status: 'pending' | 'in-progress' | 'completed' | 'delayed';
  assignee?: string;
  duration: string;
  predecessors?: string[];
  wbs?: string;
  category?: string;
  parentId?: string;
  isStage?: boolean;
  children?: ModernGanttTask[];
}

interface ModernGanttChartProps {
  tasks: ModernGanttTask[];
  onTaskUpdate?: (taskId: string, updates: Partial<ModernGanttTask>) => void;
  onTaskAdd?: (task: Omit<ModernGanttTask, 'id'>) => void;
  onTaskDelete?: (taskId: string) => void;
}

export const ModernGanttChart = ({
  tasks,
  onTaskUpdate,
  onTaskAdd,
  onTaskDelete
}: ModernGanttChartProps) => {
  console.log('🚀 ModernGanttChart rendering with', tasks.length, 'tasks');
  
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [taskListWidth, setTaskListWidth] = useState(384); // 96 * 4 = 384px (w-96)
  const [isResizing, setIsResizing] = useState(false);
  const [openDatePickers, setOpenDatePickers] = useState<Set<string>>(new Set());
  const [editingDuration, setEditingDuration] = useState<Set<string>>(new Set());
  const [durationInputs, setDurationInputs] = useState<Record<string, string>>({});
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  
  // Refs for scroll synchronization
  const ganttHeaderRef = useRef<HTMLDivElement>(null);
  const ganttScrollBodyRef = useRef<HTMLDivElement>(null);
  const taskListBodyRef = useRef<HTMLDivElement>(null);
  const taskListHeaderRef = useRef<HTMLDivElement>(null);
  const resizerRef = useRef<HTMLDivElement>(null);

  // Handle column resizing
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startWidth = taskListWidth;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const newWidth = Math.max(200, Math.min(Math.min(window.innerWidth * 0.8, 1200), startWidth + deltaX)); // Min 200px, max 80% of screen or 1200px
      setTaskListWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [taskListWidth]);
  
  // Calculate view range dynamically based on all tasks
  const viewStart = useMemo(() => {
    if (tasks.length === 0) return startOfMonth(new Date());
    const earliest = tasks.reduce((min, task) => task.startDate < min ? task.startDate : min, tasks[0].startDate);
    return startOfMonth(earliest);
  }, [tasks]);

  // Calculate view end to include all tasks with some buffer
  const viewEnd = useMemo(() => {
    if (tasks.length === 0) return endOfMonth(addDays(new Date(), 60));
    const latest = tasks.reduce((max, task) => task.endDate > max ? task.endDate : max, tasks[0].endDate);
    return endOfMonth(addDays(latest, 30)); // Add 30 days buffer after the latest task
  }, [tasks]);

  const days = eachDayOfInterval({ start: viewStart, end: viewEnd });
  const dayWidth = 32; // Increased for better day name visibility
  const rowHeight = 24; // Minimized row height

  // Initialize expanded stages only once
  useEffect(() => {
    tasks.forEach(task => {
      if (task.isStage && !expandedSections.has(task.id)) {
        setExpandedSections(prev => new Set([...prev, task.id]));
      }
    });
  }, [tasks.map(t => t.id).join(',')]); // Only run when task IDs change

  // Build hierarchical structure
  const hierarchicalTasks = useMemo(() => {
    const taskMap = new Map<string, ModernGanttTask & { children: ModernGanttTask[] }>();
    const rootTasks: (ModernGanttTask & { children: ModernGanttTask[] })[] = [];

    // Initialize all tasks
    tasks.forEach(task => {
      taskMap.set(task.id, { ...task, children: [] });
    });

    // Build hierarchy
    tasks.forEach(task => {
      const taskNode = taskMap.get(task.id)!;
      if (task.parentId && taskMap.has(task.parentId)) {
        const parent = taskMap.get(task.parentId)!;
        parent.children.push(taskNode);
      } else {
        rootTasks.push(taskNode);
      }
    });

    return rootTasks;
  }, [tasks]);

  // Create stable row numbering that persists through expand/collapse
  const allTasksWithRowNumbers = useMemo(() => {
    const flatTasks: (ModernGanttTask & { depth: number; hasChildren: boolean; rowNumber: number })[] = [];
    let rowCounter = 1;
    
    const addTask = (task: ModernGanttTask & { children: ModernGanttTask[] }, depth = 0) => {
      const hasChildren = task.children.length > 0;
      flatTasks.push({ ...task, depth, hasChildren, rowNumber: rowCounter++ });
      
      if (hasChildren) {
        task.children.forEach(child => addTask({ ...child, children: [] }, depth + 1));
      }
    };

    hierarchicalTasks.forEach(task => addTask(task));
    return flatTasks;
  }, [hierarchicalTasks]);

  // Flatten tasks for rendering (only visible ones)
  const visibleTasks = useMemo(() => {
    const flatTasks: (ModernGanttTask & { depth: number; hasChildren: boolean; rowNumber: number })[] = [];
    
    const addTask = (task: ModernGanttTask & { children: ModernGanttTask[]; rowNumber: number }, depth = 0) => {
      const hasChildren = task.children.length > 0;
      flatTasks.push({ ...task, depth, hasChildren });
      
      if (hasChildren && expandedSections.has(task.id)) {
        task.children.forEach(child => {
          // Find the row number for this child from the master list
          const childWithRowNumber = allTasksWithRowNumbers.find(t => t.id === child.id);
          if (childWithRowNumber) {
            addTask({ ...child, children: [], rowNumber: childWithRowNumber.rowNumber }, depth + 1);
          }
        });
      }
    };

    hierarchicalTasks.forEach(task => {
      const taskWithRowNumber = allTasksWithRowNumbers.find(t => t.id === task.id);
      if (taskWithRowNumber) {
        addTask({ ...task, rowNumber: taskWithRowNumber.rowNumber }, 0);
      }
    });
    return flatTasks;
  }, [hierarchicalTasks, expandedSections, allTasksWithRowNumbers]);

  const toggleSection = (taskId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedSections(newExpanded);
  };

  // Helper functions for date and duration management
  const calculateDuration = (startDate: Date, endDate: Date): string => {
    const days = differenceInDays(endDate, startDate) + 1;
    return `${days} day${days !== 1 ? 's' : ''}`;
  };

  const handleDateChange = (taskId: string, field: 'startDate' | 'endDate', newDate: Date) => {
    if (!onTaskUpdate) return;
    
    const task = visibleTasks.find(t => t.id === taskId);
    if (!task) return;

    let updates: Partial<ModernGanttTask> = { [field]: newDate };
    
    // Calculate new duration
    const startDate = field === 'startDate' ? newDate : task.startDate;
    const endDate = field === 'endDate' ? newDate : task.endDate;
    
    // Ensure end date is not before start date
    if (endDate < startDate) {
      if (field === 'startDate') {
        updates.endDate = newDate;
      } else {
        updates.startDate = newDate;
      }
    }
    
    const finalStartDate = updates.startDate || startDate;
    const finalEndDate = updates.endDate || endDate;
    updates.duration = calculateDuration(finalStartDate, finalEndDate);
    
    onTaskUpdate(taskId, updates);
    
    // Close the date picker
    setOpenDatePickers(prev => {
      const newSet = new Set(prev);
      newSet.delete(`${taskId}-${field}`);
      return newSet;
    });
  };

  const toggleDatePicker = (taskId: string, field: 'startDate' | 'endDate') => {
    const key = `${taskId}-${field}`;
    setOpenDatePickers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  // Duration editing functions
  const parseDuration = (durationText: string): number => {
    // Remove extra spaces and convert to lowercase
    const text = durationText.trim().toLowerCase();
    
    // Match patterns like "5 days", "3", "1 day", "10d", etc.
    const match = text.match(/(\d+)\s*(day|days|d)?/);
    if (match) {
      return parseInt(match[1], 10);
    }
    
    // Default to 1 if can't parse
    return 1;
  };

  const handleDurationChange = (taskId: string, durationText: string) => {
    if (!onTaskUpdate) return;
    
    const task = visibleTasks.find(t => t.id === taskId);
    if (!task) return;

    const days = parseDuration(durationText);
    const newEndDate = addDays(task.startDate, days - 1);
    const newDurationString = `${days} day${days !== 1 ? 's' : ''}`;

    onTaskUpdate(taskId, {
      endDate: newEndDate,
      duration: newDurationString
    });
  };

  const startDurationEdit = (taskId: string) => {
    setEditingDuration(prev => new Set([...prev, taskId]));
    setDurationInputs(prev => ({
      ...prev,
      [taskId]: visibleTasks.find(t => t.id === taskId)?.duration || ''
    }));
  };

  const finishDurationEdit = (taskId: string) => {
    const inputValue = durationInputs[taskId];
    if (inputValue && inputValue.trim()) {
      handleDurationChange(taskId, inputValue);
    }
    
    setEditingDuration(prev => {
      const newSet = new Set(prev);
      newSet.delete(taskId);
      return newSet;
    });
    
    setDurationInputs(prev => {
      const newInputs = { ...prev };
      delete newInputs[taskId];
      return newInputs;
    });
  };

  // Indent/Outdent functionality
  const handleIndent = () => {
    if (!selectedTaskId || !onTaskUpdate) return;
    
    const selectedTask = visibleTasks.find(t => t.id === selectedTaskId);
    if (!selectedTask) return;
    
    // Find the task above the selected task to use as potential parent
    const selectedIndex = visibleTasks.findIndex(t => t.id === selectedTaskId);
    if (selectedIndex <= 0) return; // Can't indent first task
    
    const taskAbove = visibleTasks[selectedIndex - 1];
    
    // Check if we can indent (task above should be at same level or higher)
    if (selectedTask.depth > taskAbove.depth) return;
    
    // Update the task to be a child of the task above
    onTaskUpdate(selectedTaskId, {
      parentId: taskAbove.id,
      // Note: depth will be recalculated when hierarchicalTasks is rebuilt
    });
  };

  const handleOutdent = () => {
    if (!selectedTaskId || !onTaskUpdate) return;
    
    const selectedTask = visibleTasks.find(t => t.id === selectedTaskId);
    if (!selectedTask) return;
    
    // Can't outdent if already at root level
    if (selectedTask.depth <= 0) return;
    
    // Find the current parent and make this task a sibling of the parent
    const currentParent = tasks.find(t => t.id === selectedTask.parentId);
    if (!currentParent) {
      // If no parent found, move to root level
      onTaskUpdate(selectedTaskId, { parentId: undefined });
    } else {
      // Move to be sibling of current parent
      onTaskUpdate(selectedTaskId, { parentId: currentParent.parentId });
    }
  };

  const handleRowClick = (taskId: string) => {
    setSelectedTaskId(taskId);
  };

  // Add Stage functionality
  const handleAddStage = () => {
    if (!onTaskAdd) return;
    
    const newStage: Omit<ModernGanttTask, 'id'> = {
      name: `NEW STAGE ${Math.floor(Math.random() * 1000)}`,
      startDate: new Date(),
      endDate: addDays(new Date(), 30),
      progress: 0,
      status: 'pending',
      assignee: 'PM',
      duration: '30 days',
      category: 'Planning',
      isStage: true,
      // No parentId - this makes it a top-level stage
    };
    
    onTaskAdd(newStage);
  };

  const getTaskPosition = (task: ModernGanttTask) => {
    // Normalize dates to remove time component for accurate comparison
    const taskStartDay = new Date(task.startDate.getFullYear(), task.startDate.getMonth(), task.startDate.getDate());
    const taskEndDay = new Date(task.endDate.getFullYear(), task.endDate.getMonth(), task.endDate.getDate());
    
    // Find start index in the currentDays array using the same date comparison as calendar header
    const startIndex = currentDays.findIndex(day => {
      const dayDate = new Date(day.getFullYear(), day.getMonth(), day.getDate());
      return dayDate.getTime() === taskStartDay.getTime();
    });
    
    // Find end index in the currentDays array  
    const endIndex = currentDays.findIndex(day => {
      const dayDate = new Date(day.getFullYear(), day.getMonth(), day.getDate());
      return dayDate.getTime() === taskEndDay.getTime();
    });
    
    // If task dates are outside current view, calculate position relative to currentDays[0]
    // This ensures consistency with the calendar header coordinate system
    if (startIndex === -1 || endIndex === -1) {
      const firstVisibleDay = new Date(currentDays[0].getFullYear(), currentDays[0].getMonth(), currentDays[0].getDate());
      const startOffset = differenceInDays(taskStartDay, firstVisibleDay);
      const duration = differenceInDays(taskEndDay, taskStartDay) + 1;
      
      return {
        left: startOffset * dayWidth,
        width: Math.max(dayWidth, duration * dayWidth)
      };
    }
    
    // Use exact day grid alignment for tasks within the visible range
    const left = startIndex * dayWidth;
    const width = (endIndex - startIndex + 1) * dayWidth;
    
    return {
      left: left,
      width: Math.max(dayWidth, width)
    };
  };

  const getStatusIcon = (status: string, progress: number) => {
    if (status === 'completed' || progress === 100) {
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    }
    if (status === 'in-progress' || progress > 0) {
      return <Clock className="w-4 h-4 text-blue-500" />;
    }
    return <Circle className="w-4 h-4 text-gray-400" />;
  };

  const getTaskBarColor = (task: ModernGanttTask) => {
    if (task.isStage) {
      return 'bg-blue-500';
    }
    switch (task.status) {
      case 'completed':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-blue-500';
      case 'delayed':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  // Dynamic calendar navigation
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0);
  
  // Reset offset when tasks change to ensure we always start with task-relevant view
  useMemo(() => {
    setCurrentMonthOffset(0);
  }, [tasks]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonthOffset(prev => direction === 'next' ? prev + 1 : prev - 1);
  };

  // Calculate the current view start based on tasks + navigation offset
  const currentViewStart = useMemo(() => {
    if (tasks.length === 0) {
      const baseDate = new Date();
      baseDate.setMonth(baseDate.getMonth() + currentMonthOffset);
      return startOfMonth(baseDate);
    }
    
    // Start from the earliest task date and apply month offset
    const baseDate = new Date(viewStart);
    baseDate.setMonth(baseDate.getMonth() + currentMonthOffset);
    return startOfMonth(baseDate);
  }, [viewStart, currentMonthOffset, tasks]);

  // Create timeline with today in the center
  const currentDays = useMemo(() => {
    try {
      console.log('📅 Creating centered timeline...');
      // Create a 60-day timeline with today in the center (30 days before, 30 days after)
      const today = new Date();
      const start = addDays(today, -30); // 30 days before today
      const end = addDays(today, 30);    // 30 days after today
      const days = eachDayOfInterval({ start, end });
      console.log('📅 Created', days.length, 'days with today centered');
      return days;
    } catch (error) {
      console.error('❌ Error creating timeline:', error);
      return [];
    }
  }, []);

  const formatProgress = (progress: number) => `${Math.round(progress)}%`;

  // Calculate responsive timeline width based on available space
  const maxAvailableWidth = typeof window !== 'undefined' ? window.innerWidth - taskListWidth - 100 : 1200;
  const timelineWidth = Math.min(Math.max(currentDays.length * dayWidth, 1000), maxAvailableWidth);
  console.log('📏 Timeline width:', timelineWidth, 'px');

  // Enhanced scroll synchronization with auto-centering on today
  useEffect(() => {
    const header = ganttHeaderRef.current;
    const body = ganttScrollBodyRef.current;
    const taskList = taskListBodyRef.current;
    const taskListHeader = taskListHeaderRef.current;

    console.log('🔧 ModernGantt scroll setup', { header, body, taskList, taskListHeader });

    if (!header || !body || !taskList || !taskListHeader) {
      console.warn('❌ ModernGantt refs not found');
      return;
    }

    console.log('📏 Header scroll dimensions:', header.scrollWidth, 'x', header.clientWidth);
    console.log('📏 Body scroll dimensions:', body.scrollWidth, 'x', body.clientWidth);

    // Auto-scroll to center today's date
    const centerTodayInView = () => {
      const todayIndex = currentDays.findIndex(day => isToday(day));
      if (todayIndex !== -1) {
        const todayPosition = todayIndex * dayWidth + dayWidth / 2;
        const containerWidth = header.clientWidth;
        const scrollPosition = Math.max(0, todayPosition - containerWidth / 2);
        
        console.log('📍 Centering today at index:', todayIndex, 'position:', todayPosition, 'scroll to:', scrollPosition);
        
        // Set both header and body scroll positions
        header.scrollLeft = scrollPosition;
        body.scrollLeft = scrollPosition;
      }
    };

    // Center today on initial load
    setTimeout(centerTodayInView, 100); // Small delay to ensure layout is ready

    // Horizontal scroll sync (header ↔ body)
    const syncHorizontalScroll = (source: HTMLElement, target: HTMLElement, name: string) => {
      console.log(`📜 ModernGantt ${name} horizontal scrolled to:`, source.scrollLeft);
      target.scrollLeft = source.scrollLeft;
    };

    // Vertical scroll sync (task list ↔ gantt body)
    const syncVerticalScroll = (source: HTMLElement, target: HTMLElement, name: string) => {
      console.log(`📜 ModernGantt ${name} vertical scrolled to:`, source.scrollTop);
      target.scrollTop = source.scrollTop;
    };

    const handleHeaderScroll = () => syncHorizontalScroll(header, body, 'Header');
    const handleBodyScroll = (e: Event) => {
      const bodyEl = e.target as HTMLElement;
      syncHorizontalScroll(bodyEl, header, 'Body');
      syncVerticalScroll(bodyEl, taskList, 'Body→TaskList');
    };
    const handleTaskListScroll = (e: Event) => {
      const listEl = e.target as HTMLElement;
      syncVerticalScroll(listEl, body, 'TaskList→Body');
      // Sync horizontal scroll with task list header
      syncHorizontalScroll(listEl, taskListHeader, 'TaskList→Header');
    };
    const handleTaskListHeaderScroll = () => syncHorizontalScroll(taskListHeader, taskList, 'TaskListHeader→Body');

    header.addEventListener('scroll', handleHeaderScroll);
    body.addEventListener('scroll', handleBodyScroll);
    taskList.addEventListener('scroll', handleTaskListScroll);
    taskListHeader.addEventListener('scroll', handleTaskListHeaderScroll);

    console.log('✅ ModernGantt scroll listeners attached');

    return () => {
      header.removeEventListener('scroll', handleHeaderScroll);
      body.removeEventListener('scroll', handleBodyScroll);
      taskList.removeEventListener('scroll', handleTaskListScroll);
      taskListHeader.removeEventListener('scroll', handleTaskListHeaderScroll);
      console.log('🧹 ModernGantt scroll cleanup');
    };
  }, [timelineWidth, currentDays, dayWidth]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <Toolbar 
        className="w-fit"
        onBaselineClick={() => console.log('Baselines clicked')}
        onFilterClick={() => console.log('Filter clicked')}
        onSettingsClick={() => console.log('Settings clicked')}
        onExpandClick={() => console.log('Expand clicked')}
        onChartClick={() => console.log('Chart clicked')}
        onCalendarClick={() => console.log('Calendar clicked')}
        onUsersClick={() => console.log('Users clicked')}
        onMoreClick={() => console.log('More clicked')}
        onIndentClick={handleIndent}
        onOutdentClick={handleOutdent}
        onAddTaskClick={() => console.log('Add Task clicked')}
        onAddStageClick={handleAddStage}
      />
      
      {/* Gantt Chart */}
      <div className="bg-white rounded-lg overflow-hidden w-full max-w-full">
        <div className="flex">
          {/* Task List */}
          <div 
            className="border-r border-gray-200 bg-white relative flex flex-col"
            style={{ width: taskListWidth }}
          >
            {/* Task List Header */}
            <div className="bg-white flex flex-col" style={{ height: '60px' }}>
              {/* Tab Section */}
              <div className="flex h-8 flex-shrink-0 bg-gray-50">
                <div className="flex">
                  <div className="px-4 py-1 text-sm font-medium text-blue-600 bg-white cursor-pointer flex items-center gap-2">
                    Gantt
                  </div>
                  <div className="px-4 py-1 text-sm font-medium text-gray-500 hover:text-gray-700 cursor-pointer transition-colors duration-200 flex items-center gap-2">
                    List
                  </div>
                </div>
              </div>
              {/* Column Headers */}
               <div className="h-8 overflow-x-auto overflow-y-hidden gantt-header-scroll" ref={taskListHeaderRef}>
                <div className="grid items-center h-full text-xs font-medium text-gray-600 gap-4 px-4" style={{ gridTemplateColumns: '40px minmax(200px, 1fr) 80px 80px 80px 80px', minWidth: '560px' }}>
                  <div className="text-center">#</div>
                  <div className="text-left">Task name</div>
                  <div className="text-left">Start</div>
                  <div className="text-left">End</div>
                  <div className="text-left">Duration</div>
                  <div className="text-left">Status</div>
                </div>
              </div>
            </div>

          {/* Task List Items */}
          <div 
            ref={taskListBodyRef}
            className="max-h-[600px] overflow-auto"
          >
            {visibleTasks.map((task, index) => (
              <div
                key={task.id}
                className={cn(
                  "hover:bg-gray-50 transition-colors duration-200 cursor-pointer",
                  task.isStage && "bg-blue-50/50",
                  selectedTaskId === task.id && "bg-blue-100 border-l-4 border-blue-500"
                )}
                style={{ height: 40 }}
                onClick={() => handleRowClick(task.id)}
              >
                 <div className="h-full flex items-center px-4">
                   <div className="grid items-center w-full gap-4" style={{ gridTemplateColumns: '40px minmax(200px, 1fr) 80px 80px 80px 80px', minWidth: '560px' }}>
                      {/* Row Number */}
                      <div className="text-center text-sm text-gray-500 font-mono">
                        {task.rowNumber}
                      </div>
                     
                     {/* Task Title with hierarchy */}
                     <div className="flex items-center gap-2 min-w-0">
                      <div style={{ paddingLeft: `${task.depth * 16}px` }} className="flex items-center gap-2 min-w-0 w-full">
                        {task.hasChildren && (
                          <button
                            onClick={() => toggleSection(task.id)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors duration-200 flex-shrink-0"
                          >
                            {expandedSections.has(task.id) ? (
                              <ChevronDown className="w-3 h-3 text-gray-500" />
                            ) : (
                              <ChevronRight className="w-3 h-3 text-gray-500" />
                            )}
                          </button>
                        )}
                        <span className={cn(
                          "text-sm font-normal truncate min-w-0 flex-1 text-gray-700",
                          task.isStage ? "font-medium text-gray-900" : ""
                        )} title={task.name}>
                          {task.name}
                        </span>
                      </div>
                    </div>

                    {/* Start Date */}
                    <div>
                      <Popover 
                        open={openDatePickers.has(`${task.id}-startDate`)} 
                        onOpenChange={(open) => !open && setOpenDatePickers(prev => {
                          const newSet = new Set(prev);
                          newSet.delete(`${task.id}-startDate`);
                          return newSet;
                        })}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            className="text-sm text-gray-600 h-auto p-1 font-normal hover:bg-gray-100"
                            onClick={() => toggleDatePicker(task.id, 'startDate')}
                          >
                            <CalendarIcon className="w-3 h-3 mr-1" />
                            {format(task.startDate, 'MMM d')}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={task.startDate}
                            onSelect={(date) => date && handleDateChange(task.id, 'startDate', date)}
                            className={cn("p-3 pointer-events-auto")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* End Date */}
                    <div>
                      <Popover 
                        open={openDatePickers.has(`${task.id}-endDate`)} 
                        onOpenChange={(open) => !open && setOpenDatePickers(prev => {
                          const newSet = new Set(prev);
                          newSet.delete(`${task.id}-endDate`);
                          return newSet;
                        })}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            className="text-sm text-gray-600 h-auto p-1 font-normal hover:bg-gray-100"
                            onClick={() => toggleDatePicker(task.id, 'endDate')}
                          >
                            <CalendarIcon className="w-3 h-3 mr-1" />
                            {format(task.endDate, 'MMM d')}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={task.endDate}
                            onSelect={(date) => date && handleDateChange(task.id, 'endDate', date)}
                            className={cn("p-3 pointer-events-auto")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Duration */}
                    <div>
                      {editingDuration.has(task.id) ? (
                        <Input
                          value={durationInputs[task.id] || ''}
                          onChange={(e) => setDurationInputs(prev => ({ ...prev, [task.id]: e.target.value }))}
                          onBlur={() => finishDurationEdit(task.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              finishDurationEdit(task.id);
                            } else if (e.key === 'Escape') {
                              setEditingDuration(prev => {
                                const newSet = new Set(prev);
                                newSet.delete(task.id);
                                return newSet;
                              });
                              setDurationInputs(prev => {
                                const newInputs = { ...prev };
                                delete newInputs[task.id];
                                return newInputs;
                              });
                            }
                          }}
                          className="text-sm h-6 px-1 w-full"
                          placeholder="e.g. 5 days"
                          autoFocus
                        />
                      ) : (
                        <Button
                          variant="ghost"
                          className="text-sm text-gray-600 h-auto p-1 font-normal hover:bg-gray-100 w-full justify-start"
                          onClick={() => startDurationEdit(task.id)}
                        >
                          {task.duration}
                        </Button>
                      )}
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 capitalize">
                        {task.status.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resizable Divider */}
        <div
          ref={resizerRef}
          className={`w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize relative transition-colors duration-200 ${
            isResizing ? 'bg-blue-500' : ''
          }`}
          onMouseDown={handleMouseDown}
        >
          {/* Visual indicator */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-8 bg-gray-400 rounded opacity-60" />
        </div>

        {/* Timeline */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Timeline Header */}
          <div 
            ref={ganttHeaderRef}
            className="bg-white overflow-x-auto gantt-header-scroll relative z-10"
            style={{ height: '60px' }}
          >
            <div 
              className="flex flex-col relative bg-white"
              style={{ width: timelineWidth, minWidth: timelineWidth }}
            >
              {/* Month Header Section */}
              <div className="flex h-7 bg-gray-50 relative z-10">
                <div className="flex items-center px-4 text-xs font-medium text-gray-600">
                  April 2024
                </div>
              </div>
              
              {/* Days Header Section */}
              <div className="flex h-8 bg-white relative z-10">
                {currentDays.map((day, index) => {
                  const dayOfWeek = format(day, 'EEE').toUpperCase();
                  const dayNumber = format(day, 'd');
                  const isWeekendDay = isWeekend(day);
                  
                  return (
                    <div
                      key={day.toString()}
                      className={cn(
                        "flex flex-col items-center justify-center text-xs font-medium py-0.5 flex-shrink-0 relative transition-colors duration-200",
                        isToday(day) 
                          ? "bg-blue-100 text-blue-600" 
                          : isWeekendDay 
                            ? "text-gray-600 bg-gray-100 hover:bg-gray-150" 
                            : "text-gray-600 bg-white hover:bg-gray-50"
                      )}
                      style={{ width: `${dayWidth}px`, minWidth: `${dayWidth}px`, height: '100%' }}
                    >
                      <div className="text-[9px] leading-none font-medium">{dayOfWeek.charAt(0)}</div>
                      <div className={cn(
                        "text-[10px] leading-none mt-0.5",
                        isToday(day) ? "font-semibold" : ""
                      )}>
                        {dayNumber.padStart(2, '0')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Timeline Content */}
          <div 
            ref={ganttScrollBodyRef}
            className="flex-1 overflow-auto gantt-body-scroll bg-white"
            style={{ maxHeight: '600px' }}
          >
            <div 
              className="relative" 
              style={{ 
                height: visibleTasks.length * 40, 
                width: timelineWidth, 
                minWidth: timelineWidth 
              }}
            >

              {/* Today Line */}
              {currentDays.some(day => isToday(day)) && (
                <div
                  className="absolute top-0 w-0.5 bg-blue-500 z-20"
                  style={{
                    left: currentDays.findIndex(day => isToday(day)) * dayWidth + dayWidth / 2,
                    height: visibleTasks.length * 40
                  }}
                />
              )}

              {/* Task Bars */}
              {visibleTasks.map((task, index) => {
                const position = getTaskPosition(task);
                // Different colors for different tasks to match reference
                const getBarColor = (taskIndex: number) => {
                  const colors = ['bg-blue-500', 'bg-cyan-400', 'bg-green-500'];
                  return colors[taskIndex % colors.length];
                };
                
                return (
                  <div
                    key={`${task.id}-bar`}
                    className="absolute"
                    style={{
                      top: index * 40 + 8,
                      left: position.left,
                      width: position.width,
                      height: 24
                    }}
                  >
                    <div
                      className={cn(
                        "h-full rounded-md flex items-center px-2 text-white text-xs font-medium",
                        getBarColor(index)
                      )}
                      style={{
                        width: position.width,
                        minWidth: dayWidth * 2
                      }}
                    >
                      {task.assignee && (
                        <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-[10px] font-medium mr-2">
                          {task.assignee.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="truncate">
                        {task.name}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Weekend background columns only */}
              {currentDays.map((day, index) => {
                const isWeekendDay = isWeekend(day);
                return (
                  isWeekendDay && (
                    <div
                      key={`weekend-${index}`}
                      className="absolute top-0 bg-gray-50/50"
                      style={{
                        left: index * dayWidth,
                        width: dayWidth,
                        height: visibleTasks.length * 40
                      }}
                    />
                  )
                );
               })}
             </div>
           </div>
         </div>
         {/* End Task List section */}
         
         {/* End Timeline section */}
        </div>
      {/* End Gantt Chart container */}
      </div>
    {/* End space-y-4 container */}
    </div>
  );
};
