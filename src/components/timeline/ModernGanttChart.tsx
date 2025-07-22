
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
  const rowHeight = 48; // Standardized row height

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
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden w-full max-w-full">{/* Ensure no overflow */}
      <div className="flex">
        {/* Task List */}
        <div 
          className="border-r border-gray-200 bg-white relative flex flex-col"
          style={{ width: taskListWidth }}
        >
          {/* Task List Header - Fixed tabs, scrollable columns */}
          <div className="border-b border-gray-200 bg-white flex flex-col" style={{ height: '60px' }}>
            {/* Tab Section - Fixed */}
            <div className="flex h-8 border-b border-gray-200 flex-shrink-0">
              <div className="flex">
                <div className="px-4 py-1 text-xs font-medium text-gray-900 bg-gray-100 border-r border-gray-200">
                  GENERAL
                </div>
                <div className="px-4 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 cursor-pointer">
                  MORE INFO
                </div>
              </div>
            </div>
            {/* Column Headers - Scrollable container */}
            <div className="h-8 overflow-x-auto overflow-y-hidden gantt-header-scroll" ref={taskListHeaderRef}>
              <div className="grid items-center h-full text-xs font-medium text-gray-600 uppercase tracking-wider gap-2 px-2" style={{ gridTemplateColumns: '40px minmax(200px, 1fr) 80px 60px 80px 100px 100px', minWidth: '660px' }}>
                <div className="px-1 text-center">#</div>
                <div className="px-1">EVENT NAME</div>
                <div className="px-1 text-center">START</div>
                <div className="px-1 text-center">END</div>
                <div className="px-1 text-center">DURATION</div>
                <div className="px-1 text-center">% COMPLETE</div>
                <div className="px-1 text-center">PREDECESSORS</div>
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
                  "border-b border-gray-100 hover:bg-gray-50 transition-colors",
                  task.isStage && "bg-blue-50 border-b-blue-200"
                )}
                style={{ height: rowHeight + 4 }}
              >
                <div className="h-full flex items-center px-2">
                  <div className="grid items-center w-full gap-2" style={{ gridTemplateColumns: '40px minmax(200px, 1fr) 80px 60px 80px 100px 100px', minWidth: '660px' }}>
                    {/* Row Number */}
                    <div className="px-1 text-center">
                      <span className="text-xs text-gray-600 font-mono font-medium">
                        {index + 1}
                      </span>
                    </div>

                    {/* Task Name */}
                    <div className="px-1 flex items-center gap-1 min-w-0">
                      <div style={{ paddingLeft: `${task.depth * 16}px` }} className="flex items-center gap-1 min-w-0 w-full">
                        {task.hasChildren && (
                          <button
                            onClick={() => toggleSection(task.id)}
                            className="p-0.5 hover:bg-gray-200 rounded flex-shrink-0"
                          >
                            {expandedSections.has(task.id) || task.isStage ? (
                              <ChevronDown className="w-3 h-3 text-gray-500" />
                            ) : (
                              <ChevronRight className="w-3 h-3 text-gray-500" />
                            )}
                          </button>
                        )}
                        <div className="flex-shrink-0">
                          {getStatusIcon(task.status, task.progress)}
                        </div>
                        <span className={cn(
                          "text-xs truncate min-w-0 flex-1",
                          task.isStage ? "font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded" : "text-gray-700",
                          task.status === 'in-progress' && !task.isStage && "text-orange-600"
                        )} title={task.name}>
                          {task.name}
                        </span>
                      </div>
                    </div>

                    {/* Start Date */}
                    <div className="px-1 text-center">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs text-gray-600 font-mono p-1 hover:bg-gray-100"
                            title="Click to change start date"
                          >
                            {format(task.startDate, 'dd/MM/yy')}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-white shadow-lg border z-50" align="start">
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
                    <div className="px-1 text-center">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs text-gray-600 font-mono p-1 hover:bg-gray-100"
                            title="Click to change end date"
                          >
                            {format(task.endDate, 'dd/MM/yy')}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-white shadow-lg border z-50" align="start">
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
                    <div className="px-1 text-center">
                      <input
                        type="number"
                        min="1"
                        className="w-12 h-6 text-xs text-gray-600 font-mono text-center border border-gray-200 rounded px-1 hover:border-gray-300 focus:border-blue-500 focus:outline-none"
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

                    {/* % Complete */}
                    <div className="px-1 text-center">
                      <span className={cn(
                        "text-xs font-medium",
                        task.progress === 100 ? "text-green-600" : 
                        task.progress > 0 ? "text-blue-600" : "text-gray-500"
                      )}>
                        {Math.round(task.progress)}%
                      </span>
                    </div>

                    {/* Predecessors */}
                    <div className="px-1 text-center">
                      <input
                        type="text"
                        className="w-20 h-6 text-xs text-gray-600 font-mono text-center border border-gray-200 rounded px-1 hover:border-gray-300 focus:border-blue-500 focus:outline-none"
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
          className={`w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize relative transition-colors duration-200 ${
            isResizing ? 'bg-blue-500' : ''
          }`}
          onMouseDown={handleMouseDown}
        >
          {/* Visual indicator */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-8 bg-gray-400 rounded opacity-60" />
        </div>

        {/* Timeline */}
        <div className="flex-1 flex flex-col min-w-0">{/* min-w-0 allows flexbox to shrink */}
          {/* Timeline Header - Scrollable with hidden scrollbars */}
          <div 
            ref={ganttHeaderRef}
            className="border-b border-gray-200 bg-white overflow-x-auto gantt-header-scroll relative z-10"
            style={{ height: '60px' }}
          >
            <div 
              className="flex flex-col relative bg-white"
              style={{ width: timelineWidth, minWidth: timelineWidth }}
            >
              {/* Month Header Section */}
              <div className="flex h-7 border-b border-gray-200 bg-gray-50 relative z-10">
                <div className="flex items-center px-4 text-xs font-medium text-gray-900 bg-gray-50">
                  MARC - 2023
                </div>
              </div>
              
              {/* Days Header Section */}
              <div className="flex h-8 bg-white relative z-10">
                {currentDays.map((day, index) => {
                  const dayOfWeek = format(day, 'EEE').toUpperCase();
                  const dayNumber = format(day, 'd');
                  
                  return (
                    <div
                      key={day.toString()}
                      className={cn(
                        "flex flex-col items-center justify-center border-r border-gray-200 text-xs font-medium py-0.5 flex-shrink-0 relative",
                        isToday(day) ? "bg-blue-50 text-blue-600" : "text-gray-600 bg-white"
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
            className="flex-1 overflow-auto gantt-body-scroll"
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
                  className="absolute w-full border-b border-gray-100"
                  style={{
                    top: index * (rowHeight + 4),
                    height: rowHeight + 4
                  }}
                />
              ))}

              {/* Today Line */}
              {currentDays.some(day => isToday(day)) && (
                <div
                  className="absolute top-0 w-0.5 bg-blue-500 z-20 border-l-2 border-dotted border-blue-500"
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
                        "absolute top-3 h-6 rounded-md shadow-sm flex items-center px-2",
                        getTaskBarColor(task),
                        task.isStage ? "h-8 top-2" : ""
                      )}
                      style={{
                        width: position.width,
                        minWidth: dayWidth
                      }}
                    >
                      {task.assignee && (
                        <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center text-xs font-medium text-gray-700 mr-2">
                          {task.assignee.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-xs font-medium text-white truncate">
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
