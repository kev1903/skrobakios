
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addDays, differenceInDays, isToday, isSameMonth } from 'date-fns';
import { ChevronDown, ChevronRight, MoreHorizontal, CheckCircle2, Circle, Clock, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
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

  // Flatten tasks for rendering
  const visibleTasks = useMemo(() => {
    const flatTasks: (ModernGanttTask & { depth: number; hasChildren: boolean })[] = [];
    
    const addTask = (task: ModernGanttTask & { children: ModernGanttTask[] }, depth = 0) => {
      const hasChildren = task.children.length > 0;
      flatTasks.push({ ...task, depth, hasChildren });
      
      if (hasChildren && (expandedSections.has(task.id) || task.isStage)) {
        task.children.forEach(child => addTask({ ...child, children: [] }, depth + 1));
      }
    };

    hierarchicalTasks.forEach(task => addTask(task));
    return flatTasks;
  }, [hierarchicalTasks, expandedSections]);

  const toggleSection = (taskId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedSections(newExpanded);
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

  // Enhanced scroll synchronization
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
  }, [timelineWidth]);

  return (
    <div className="bg-background rounded-lg border border-border overflow-hidden w-full max-w-full">
      <div className="flex">
        {/* Task List */}
        <div 
          className="border-r border-border bg-background relative flex flex-col"
          style={{ width: taskListWidth }}
        >
          {/* Task List Header - Updated to match reference */}
          <div className="border-b border-border bg-background flex flex-col" style={{ height: '60px' }}>
            {/* Tab Section - Updated styling */}
            <div className="flex h-8 border-b border-border flex-shrink-0 bg-muted/30">
              <div className="flex">
                <div className="px-4 py-1 text-sm font-medium text-foreground bg-background border-r border-border cursor-pointer flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Gantt
                </div>
                <div className="px-4 py-1 text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-colors duration-200 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  List
                </div>
              </div>
            </div>
            {/* Column Headers */}
            <div className="h-8 overflow-x-auto overflow-y-hidden gantt-header-scroll" ref={taskListHeaderRef}>
              <div className="grid items-center h-full text-xs font-medium text-muted-foreground uppercase tracking-wider gap-4 px-4" style={{ gridTemplateColumns: 'minmax(200px, 1fr) 80px 80px 80px 80px 100px 100px', minWidth: '720px' }}>
                <div className="text-left">Title</div>
                <div className="text-center">Start</div>
                <div className="text-center">End</div>
                <div className="text-center">Duration</div>
                <div className="text-center">Status</div>
                <div className="text-center">% Complete</div>
                <div className="text-center">Predecessors</div>
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
                  "border-b border-border/20 hover:bg-accent/20 transition-colors duration-200 glass-hover",
                  task.isStage && "bg-primary/5 border-b-primary/30"
                )}
                style={{ height: rowHeight + 4 }}
              >
                <div className="h-full flex items-center px-4">
                  <div className="grid items-center w-full gap-4" style={{ gridTemplateColumns: 'minmax(200px, 1fr) 80px 80px 80px 80px 100px 100px', minWidth: '720px' }}>
                    {/* Task Title with hierarchy */}
                    <div className="flex items-center gap-2 min-w-0">
                      <div style={{ paddingLeft: `${task.depth * 20}px` }} className="flex items-center gap-2 min-w-0 w-full">
                        {task.hasChildren && (
                          <button
                            onClick={() => toggleSection(task.id)}
                            className="p-1 hover:bg-accent/30 rounded transition-colors duration-200 flex-shrink-0"
                          >
                            {expandedSections.has(task.id) || task.isStage ? (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            )}
                          </button>
                        )}
                        <div className="flex-shrink-0">
                          {getStatusIcon(task.status, task.progress)}
                        </div>
                        <span className={cn(
                          "text-sm font-medium truncate min-w-0 flex-1",
                          task.isStage ? "font-semibold text-foreground" : "text-foreground"
                        )} title={task.name}>
                          {task.name}
                        </span>
                      </div>
                    </div>

                    {/* Start Date */}
                    <div className="text-center">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-sm text-muted-foreground p-1 hover:bg-accent/30 transition-colors duration-200"
                            title="Click to change start date"
                          >
                            {format(task.startDate, 'dd/MM/yy')}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 border border-border/50 shadow-lg z-50" align="start">
                          <Calendar
                            mode="single"
                            selected={task.startDate}
                            onSelect={(date) => {
                              if (date && onTaskUpdate) {
                                onTaskUpdate(task.id, { startDate: date });
                              }
                            }}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* End Date */}
                    <div className="text-center">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-sm text-muted-foreground p-1 hover:bg-accent/30 transition-colors duration-200"
                            title="Click to change end date"
                          >
                            {format(task.endDate, 'dd/MM/yy')}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 border border-border/50 shadow-lg z-50" align="start">
                          <Calendar
                            mode="single"
                            selected={task.endDate}
                            onSelect={(date) => {
                              if (date && onTaskUpdate) {
                                // Calculate duration when end date changes
                                const startDate = task.startDate;
                                const diffTime = date.getTime() - startDate.getTime();
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                const duration = Math.max(1, diffDays); // Ensure at least 1 day
                                
                                onTaskUpdate(task.id, { 
                                  endDate: date,
                                  duration: `${duration} days`
                                });
                              }
                            }}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Duration */}
                    <div className="text-center">
                      <input
                        type="number"
                        min="1"
                        className="w-12 h-7 text-sm text-muted-foreground text-center border border-border/30 rounded px-1 hover:border-border/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all duration-200"
                        value={parseInt(task.duration.match(/\d+/)?.[0] || '1')}
                        onChange={(e) => {
                          const days = parseInt(e.target.value) || 1;
                          if (onTaskUpdate) {
                            // Calculate end date when duration changes
                            const startDate = task.startDate;
                            const newEndDate = addDays(startDate, days - 1); // Subtract 1 because start day counts as day 1
                            
                            onTaskUpdate(task.id, { 
                              duration: `${days} days`,
                              endDate: newEndDate
                            });
                          }
                        }}
                        title="Duration in days"
                      />
                    </div>

                    {/* Status with Progress Bar */}
                    <div className="flex flex-col gap-1">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={cn(
                            "h-2 rounded-full transition-all duration-300",
                            task.progress === 100 ? "bg-green-500" :
                            task.progress > 50 ? "bg-blue-500" :
                            task.progress > 0 ? "bg-yellow-500" : "bg-muted"
                          )}
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* % Complete */}
                    <div className="text-center">
                      <span className={cn(
                        "text-sm font-medium",
                        task.progress === 100 ? "text-green-600" : 
                        task.progress > 0 ? "text-blue-600" : "text-muted-foreground"
                      )}>
                        {Math.round(task.progress)}%
                      </span>
                    </div>

                    {/* Predecessors */}
                    <div className="text-center">
                      <input
                        type="text"
                        className="w-20 h-7 text-sm text-muted-foreground text-center border border-border/30 rounded px-2 hover:border-border/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all duration-200"
                        value={task.predecessors?.join(', ') || ''}
                        onChange={(e) => {
                          if (onTaskUpdate) {
                            const predecessors = e.target.value
                              .split(',')
                              .map(id => id.trim())
                              .filter(id => id.length > 0);
                            onTaskUpdate(task.id, { predecessors });
                          }
                        }}
                        placeholder="1,2,3"
                        title="Enter predecessor task IDs separated by commas"
                      />
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
          className={`w-1 bg-border/50 hover:bg-primary cursor-col-resize relative transition-colors duration-200 ${
            isResizing ? 'bg-primary' : ''
          }`}
          onMouseDown={handleMouseDown}
        >
          {/* Visual indicator */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-8 bg-border rounded opacity-60" />
        </div>

        {/* Timeline */}
        <div className="flex-1 flex flex-col min-w-0">{/* min-w-0 allows flexbox to shrink */}
          {/* Timeline Header - Scrollable with hidden scrollbars */}
          <div 
            ref={ganttHeaderRef}
            className="border-b border-border/30 glass overflow-x-auto gantt-header-scroll relative z-10 backdrop-blur-sm"
            style={{ height: '60px' }}
          >
            <div 
              className="flex flex-col relative glass-light backdrop-blur-sm"
              style={{ width: timelineWidth, minWidth: timelineWidth }}
            >
              {/* Month Header Section */}
              <div className="flex h-7 border-b border-border/20 bg-card/50 relative z-10">
                <div className="flex items-center px-4 text-xs font-manrope font-medium text-primary">
                  MARC - 2025
                </div>
              </div>
              
              {/* Days Header Section */}
              <div className="flex h-8 bg-card/30 relative z-10 backdrop-blur-sm">
                {currentDays.map((day, index) => {
                  const dayOfWeek = format(day, 'EEE').toUpperCase();
                  const dayNumber = format(day, 'd');
                  
                  return (
                    <div
                      key={day.toString()}
                      className={cn(
                        "flex flex-col items-center justify-center border-r border-border/20 text-xs font-manrope font-medium py-0.5 flex-shrink-0 relative transition-colors duration-200",
                        isToday(day) ? "bg-primary/10 text-primary" : "text-muted-foreground bg-card/20 hover:bg-accent/10"
                      )}
                      style={{ width: `${dayWidth}px`, minWidth: `${dayWidth}px`, height: '100%' }}
                    >
                      <div className="text-[9px] leading-none font-medium">{dayOfWeek}</div>
                      <div className={cn(
                        "text-[10px] leading-none mt-0.5",
                        isToday(day) ? "font-semibold" : ""
                      )}>
                        {dayNumber}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Timeline Content - Main scrollable area */}
          <div 
            ref={ganttScrollBodyRef}
            className="flex-1 overflow-auto gantt-body-scroll glass-light backdrop-blur-sm"
            style={{ maxHeight: '600px' }}
          >
            <div 
              className="relative" 
              style={{ 
                height: visibleTasks.length * (rowHeight + 4), 
                width: timelineWidth, 
                minWidth: timelineWidth 
              }}
            >
              {/* Grid lines for visual alignment */}
              {visibleTasks.map((_, index) => (
                <div
                  key={`grid-${index}`}
                  className="absolute w-full border-b border-border/10"
                  style={{
                    top: index * (rowHeight + 4),
                    height: rowHeight + 4
                  }}
                />
              ))}

              {/* Today Line */}
              {currentDays.some(day => isToday(day)) && (
                <div
                  className="absolute top-0 w-0.5 bg-primary z-20 border-l-2 border-dotted border-primary shadow-md"
                  style={{
                    left: currentDays.findIndex(day => isToday(day)) * dayWidth + dayWidth / 2,
                    height: visibleTasks.length * (rowHeight + 4),
                    background: 'none'
                  }}
                />
              )}

              {/* Task Bars */}
              {visibleTasks.map((task, index) => {
                const position = getTaskPosition(task);
                return (
                  <div
                    key={`${task.id}-bar`}
                    className="absolute"
                    style={{
                      top: index * (rowHeight + 4),
                      left: position.left,
                      width: position.width,
                      height: rowHeight + 4
                    }}
                  >
                    <div
                      className={cn(
                        "absolute top-1 h-4 rounded-md shadow-sm flex items-center px-1 backdrop-blur-sm border border-white/20",
                        getTaskBarColor(task),
                        task.isStage ? "h-5 top-0.5 shadow-md" : "",
                        "transition-all duration-200 hover:shadow-md hover:scale-105"
                      )}
                      style={{
                        width: position.width,
                        minWidth: dayWidth
                      }}
                    >
                      {task.assignee && (
                        <div className="w-4 h-4 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-[10px] font-manrope font-medium text-foreground mr-1 shadow-sm">
                          {task.assignee.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-[10px] font-inter font-medium text-white truncate">
                        {task.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
