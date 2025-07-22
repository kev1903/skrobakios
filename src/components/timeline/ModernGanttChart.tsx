
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addDays, differenceInDays, isToday, isSameMonth } from 'date-fns';
import { ChevronDown, ChevronRight, MoreHorizontal, CheckCircle2, Circle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
  
  // Refs for scroll synchronization
  const ganttHeaderRef = useRef<HTMLDivElement>(null);
  const ganttScrollBodyRef = useRef<HTMLDivElement>(null);
  
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
  const dayWidth = 24; // Increased from 16 for better readability
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

  // Generate days for the current view - show 12 months for guaranteed scrolling
  const currentDays = useMemo(() => {
    try {
      console.log('📅 Calculating currentDays with viewStart:', currentViewStart);
      const start = currentViewStart;
      const end = endOfMonth(addDays(start, 365)); // Show 12 months to force scrolling
      const days = eachDayOfInterval({ start, end });
      console.log('📅 Generated', days.length, 'days for timeline (from', start, 'to', end, ')');
      return days;
    } catch (error) {
      console.error('❌ Error generating currentDays:', error);
      return [];
    }
  }, [currentViewStart]);

  const formatProgress = (progress: number) => `${Math.round(progress)}%`;

  // Calculate total timeline width - force it to be very wide
  const timelineWidth = Math.max(currentDays.length * dayWidth, 8000); // Minimum 8000px width
  console.log('📏 Calculated timeline width:', timelineWidth, 'px (', currentDays.length, 'days x', dayWidth, 'px)');

  // Scroll synchronization effect - keep header and body in sync
  useEffect(() => {
    const ganttHeader = ganttHeaderRef.current;
    const ganttBody = ganttScrollBodyRef.current;
    
    console.log('🔧 Setting up scroll listeners');
    console.log('📏 Timeline width:', timelineWidth, 'px');
    
    if (!ganttHeader || !ganttBody) {
      console.warn('⚠️ Could not find scroll containers');
      return;
    }

    // Wait for layout to complete before checking dimensions
    const checkDimensions = () => {
      console.log('📏 Header - scrollWidth:', ganttHeader.scrollWidth, 'clientWidth:', ganttHeader.clientWidth);
      console.log('📏 Body - scrollWidth:', ganttBody.scrollWidth, 'clientWidth:', ganttBody.clientWidth);
      console.log('📏 Can scroll - Header:', ganttHeader.scrollWidth > ganttHeader.clientWidth);
      console.log('📏 Can scroll - Body:', ganttBody.scrollWidth > ganttBody.clientWidth);
    };

    // Check dimensions immediately and after a delay to ensure content is rendered
    checkDimensions();
    setTimeout(checkDimensions, 100);

    let isScrolling = false;

    const syncScroll = (source: HTMLElement, target: HTMLElement, sourceType: string) => {
      if (isScrolling) return;
      
      isScrolling = true;
      const scrollLeft = source.scrollLeft;
      console.log(`📜 ${sourceType} scroll:`, scrollLeft, 'px');
      
      if (target.scrollLeft !== scrollLeft) {
        target.scrollLeft = scrollLeft;
        console.log(`✅ Synced ${sourceType === 'Header' ? 'Body' : 'Header'}:`, target.scrollLeft, 'px');
      }
      
      // Use setTimeout instead of requestAnimationFrame for more reliable timing
      setTimeout(() => {
        isScrolling = false;
      }, 10);
    };

    const handleHeaderScroll = () => syncScroll(ganttHeader, ganttBody, 'Header');
    const handleBodyScroll = () => syncScroll(ganttBody, ganttHeader, 'Body');

    ganttHeader.addEventListener('scroll', handleHeaderScroll, { passive: true });
    ganttBody.addEventListener('scroll', handleBodyScroll, { passive: true });
    
    console.log('✅ Scroll listeners attached successfully');

    return () => {
      ganttHeader.removeEventListener('scroll', handleHeaderScroll);
      ganttBody.removeEventListener('scroll', handleBodyScroll);
      console.log('🧹 Scroll listeners cleaned up');
    };
  }, [timelineWidth]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-gray-900">Project Timeline</h3>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                ←
              </Button>
              <span className="text-sm font-medium text-gray-600 min-w-[120px] text-center">
                {format(currentViewStart, 'MMM yyyy')}
              </span>
              <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                →
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Task List */}
        <div className="w-96 border-r border-gray-200 bg-white">
          {/* Task List Header */}
          <div className="border-b border-gray-200 bg-gray-50 p-3">
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-600 uppercase tracking-wider">
              <div className="col-span-6">Task</div>
              <div className="col-span-2">Duration</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Progress</div>
            </div>
          </div>

          {/* Task List Items */}
          <div className="max-h-[600px] overflow-y-auto">
            {visibleTasks.map((task, index) => (
              <div
                key={task.id}
                className={cn(
                  "border-b border-gray-100 hover:bg-gray-50 transition-colors",
                  task.isStage && "bg-blue-50 border-b-blue-200"
                )}
                style={{ height: rowHeight + 4 }} // Add 4px for border
              >
                <div className="p-3 h-full flex items-center">
                  <div className="grid grid-cols-12 gap-2 items-center">
                    {/* Task Name */}
                    <div className="col-span-6 flex items-center gap-2">
                      <div style={{ paddingLeft: `${task.depth * 16}px` }} className="flex items-center gap-2">
                        {task.hasChildren && (
                          <button
                            onClick={() => toggleSection(task.id)}
                            className="p-0.5 hover:bg-gray-200 rounded"
                          >
                            {expandedSections.has(task.id) || task.isStage ? (
                              <ChevronDown className="w-3 h-3 text-gray-500" />
                            ) : (
                              <ChevronRight className="w-3 h-3 text-gray-500" />
                            )}
                          </button>
                        )}
                        {getStatusIcon(task.status, task.progress)}
                        <span className={cn(
                          "text-sm",
                          task.isStage ? "font-semibold text-gray-900" : "text-gray-700"
                        )}>
                          {task.name}
                        </span>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="col-span-2">
                      <span className="text-xs text-gray-500">{task.duration}</span>
                    </div>

                    {/* Status */}
                    <div className="col-span-2">
                      <div className="flex items-center gap-1">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          getTaskBarColor(task)
                        )} />
                        <span className="text-xs text-gray-600">{formatProgress(task.progress)}</span>
                      </div>
                    </div>

                    {/* Progress & Actions */}
                    <div className="col-span-2 flex items-center justify-between">
                      <Progress value={task.progress} className="w-8 h-1" />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="w-6 h-6 p-0">
                            <MoreHorizontal className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem>Mark as done</DropdownMenuItem>
                          <DropdownMenuItem>Duplicate</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="flex-1 flex flex-col">
          {/* Timeline Header - Scrollable with hidden scrollbars */}
          <div 
            ref={ganttHeaderRef}
            className="border-b border-gray-200 bg-gray-50 overflow-x-auto gantt-header-scroll"
            style={{ height: '60px' }}
          >
            <div 
              className="flex relative"
              style={{ width: timelineWidth, minWidth: timelineWidth }}
            >
              {/* Visual scroll test - colored background */}
              <div 
                className="absolute top-0 left-0 h-full opacity-20"
                style={{ 
                  width: timelineWidth,
                  background: 'linear-gradient(90deg, red 0%, orange 25%, yellow 50%, green 75%, blue 100%)'
                }}
              />
              {currentDays.map((day, index) => {
                const isFirstOfMonth = day.getDate() === 1;
                const isMonthStart = index === 0 || isFirstOfMonth;
                
                return (
                  <div
                    key={day.toString()}
                    className={cn(
                      "flex flex-col items-center justify-center border-r border-gray-200 bg-gray-50 relative",
                      isToday(day) && "bg-blue-50 border-blue-200",
                      isFirstOfMonth && "border-l-2 border-l-gray-400"
                    )}
                    style={{ width: dayWidth, minWidth: dayWidth, height: '60px' }}
                  >
                    {/* Month header for first day of month */}
                    {isMonthStart && (
                      <div className="absolute -top-6 left-0 text-xs font-bold text-gray-800 bg-gray-100 px-2 py-1 border-b border-gray-300 z-10" 
                           style={{ width: 'auto', minWidth: '60px' }}>
                        {format(day, 'MMM yyyy')}
                      </div>
                    )}
                    
                    <div className="text-xs font-medium text-gray-600 py-2">
                      {isMonthStart ? (
                        <div className="text-center">
                          <div className="text-xs font-semibold text-gray-800">
                            {format(day, 'MMM')}
                          </div>
                          <div className={cn(
                            "text-xs",
                            isToday(day) ? "text-blue-600 font-semibold" : "text-gray-600"
                          )}>
                            {format(day, 'd')}
                          </div>
                        </div>
                      ) : (
                        <div className={cn(
                          "text-xs text-center",
                          isToday(day) ? "text-blue-600 font-semibold" : "text-gray-600"
                        )}>
                          {format(day, 'd')}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline Content - Main scrollable area */}
          <div 
            ref={ganttScrollBodyRef}
            className="flex-1 overflow-x-auto overflow-y-hidden gantt-body-scroll"
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
                  className="absolute top-0 w-0.5 bg-blue-500 z-20"
                  style={{
                    left: currentDays.findIndex(day => isToday(day)) * dayWidth + dayWidth / 2,
                    height: visibleTasks.length * (rowHeight + 4)
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
