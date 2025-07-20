import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addDays, differenceInDays, isToday, isSameMonth } from 'date-fns';
import { ChevronDown, ChevronRight, MoreHorizontal, CheckCircle2, Circle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

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
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  
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
  const dayWidth = 16; // Reduced from 32 to zoom out 50%

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

  // Reset offset when tasks change to ensure we always start with task-relevant view
  const [viewOffset, setViewOffset] = useState(0);
  
  // Reset offset when tasks change
  useMemo(() => {
    setViewOffset(0);
  }, [tasks]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setViewOffset(prev => direction === 'next' ? prev + 30 : prev - 30);
  };

  // Calculate the current view start based on tasks + navigation offset
  const currentViewStart = useMemo(() => {
    return startOfMonth(addDays(viewStart, viewOffset));
  }, [viewStart, viewOffset]);

  // Generate days for the current view (3 months)
  const currentDays = useMemo(() => {
    const start = currentViewStart;
    const end = addDays(start, 90); // Show 3 months
    return eachDayOfInterval({ start, end });
  }, [currentViewStart]);

  const formatProgress = (progress: number) => `${Math.round(progress)}%`;

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
                style={{ height: 52 }}
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
        <div className="flex-1 overflow-x-auto">
          {/* Timeline Header */}
          <div className="border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
            <div className="flex" style={{ width: currentDays.length * dayWidth }}>
              {currentDays.map((day, index) => (
                <div
                  key={day.toString()}
                  className={cn(
                    "flex flex-col items-center justify-center border-r border-gray-200 bg-gray-50",
                    isToday(day) && "bg-blue-50 border-blue-200"
                  )}
                  style={{ width: dayWidth, minWidth: dayWidth }}
                >
                  <div className="text-xs font-medium text-gray-600 py-2">
                    {index === 0 || day.getDate() === 1 ? (
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
              ))}
            </div>
          </div>

          {/* Timeline Content */}
          <div className="relative" style={{ height: visibleTasks.length * 52 }}>
            {/* Grid lines for visual alignment */}
            {visibleTasks.map((_, index) => (
              <div
                key={`grid-${index}`}
                className="absolute w-full border-b border-gray-100"
                style={{
                  top: index * 52,
                  height: 52
                }}
              />
            ))}

            {/* Today Line */}
            {currentDays.some(day => isToday(day)) && (
              <div
                className="absolute top-0 w-0.5 bg-blue-500 z-20"
                style={{
                  left: currentDays.findIndex(day => isToday(day)) * dayWidth + dayWidth / 2,
                  height: visibleTasks.length * 52
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
                    top: index * 52,
                    left: position.left,
                    width: position.width,
                    height: 52
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
  );
};