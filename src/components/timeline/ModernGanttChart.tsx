
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
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
  const resizerRef = useRef<HTMLDivElement>(null);

  // Handle column resizing
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startWidth = taskListWidth;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const newWidth = Math.max(200, Math.min(600, startWidth + deltaX)); // Min 200px, max 600px
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

  // Simplified scroll synchronization - exactly like SimpleScrollTest
  useEffect(() => {
    const header = ganttHeaderRef.current;
    const body = ganttScrollBodyRef.current;

    console.log('🔧 ModernGantt scroll setup', { header, body });

    if (!header || !body) {
      console.warn('❌ ModernGantt refs not found');
      return;
    }

    console.log('📏 Header scroll dimensions:', header.scrollWidth, 'x', header.clientWidth);
    console.log('📏 Body scroll dimensions:', body.scrollWidth, 'x', body.clientWidth);

    const syncScroll = (source: HTMLElement, target: HTMLElement, name: string) => {
      console.log(`📜 ModernGantt ${name} scrolled to:`, source.scrollLeft);
      target.scrollLeft = source.scrollLeft;
    };

    const handleHeaderScroll = () => syncScroll(header, body, 'Header');
    const handleBodyScroll = () => syncScroll(body, header, 'Body');

    header.addEventListener('scroll', handleHeaderScroll);
    body.addEventListener('scroll', handleBodyScroll);

    console.log('✅ ModernGantt scroll listeners attached');

    return () => {
      header.removeEventListener('scroll', handleHeaderScroll);
      body.removeEventListener('scroll', handleBodyScroll);
      console.log('🧹 ModernGantt scroll cleanup');
    };
  }, [timelineWidth]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden w-full max-w-full">{/* Ensure no overflow */}
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
        <div 
          className="border-r border-gray-200 bg-white relative"
          style={{ width: taskListWidth }}
        >
          {/* Task List Header */}
          <div className="border-b border-gray-200 bg-gray-50 p-0" style={{ height: '60px' }}>
            <div className="grid items-center h-full text-xs font-medium text-gray-600 uppercase tracking-wider gap-2 px-2" style={{ gridTemplateColumns: '50px minmax(200px, 1fr) 80px 80px 60px 80px 100px 100px' }}>
              <div className="px-1 text-center">WBS</div>
              <div className="px-1">Task</div>
              <div className="px-1 text-center">Start Date</div>
              <div className="px-1 text-center">End Date</div>
              <div className="px-1 text-center">Duration</div>
              <div className="px-1 text-center">% Complete</div>
              <div className="px-1 text-center">Predecessors</div>
              <div className="px-1 text-center">Assigned To</div>
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
                style={{ height: rowHeight + 4 }}
              >
                <div className="h-full flex items-center px-2">
                  <div className="grid items-center w-full gap-2" style={{ gridTemplateColumns: '50px minmax(200px, 1fr) 80px 80px 60px 80px 100px 100px' }}>
                    {/* WBS */}
                    <div className="px-1 text-center">
                      <span className="text-xs text-gray-600 font-mono">
                        {task.wbs || task.id}
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
                      <span className="text-xs text-gray-600 font-mono" title={format(task.startDate, 'dd/MM/yyyy')}>
                        {format(task.startDate, 'dd/MM/yy')}
                      </span>
                    </div>

                    {/* End Date */}
                    <div className="px-1 text-center">
                      <span className="text-xs text-gray-600 font-mono" title={format(task.endDate, 'dd/MM/yyyy')}>
                        {format(task.endDate, 'dd/MM/yy')}
                      </span>
                    </div>

                    {/* Duration */}
                    <div className="px-1 text-center">
                      <span className="text-xs text-gray-600 font-mono" title={task.duration}>
                        {task.duration}
                      </span>
                    </div>

                    {/* % Complete */}
                    <div className="px-1 text-center">
                      <span className={cn(
                        "text-xs font-semibold",
                        task.progress === 100 ? "text-green-600" : 
                        task.progress > 0 ? "text-blue-600" : "text-gray-500"
                      )}>
                        {Math.round(task.progress)}%
                      </span>
                    </div>

                    {/* Predecessors */}
                    <div className="px-1 text-center">
                      <span className="text-xs text-gray-600 font-mono truncate block" title={task.predecessors?.join(', ') || ''}>
                        {task.predecessors?.length ? task.predecessors.join(', ') : ''}
                      </span>
                    </div>

                    {/* Assigned To */}
                    <div className="px-1 text-center">
                      <span className="text-xs text-gray-700 truncate block" title={task.assignee || ''}>
                        {task.assignee || ''}
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
        <div className="flex-1 flex flex-col min-w-0">{/* min-w-0 allows flexbox to shrink */}
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
