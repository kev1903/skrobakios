import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { format, eachDayOfInterval, startOfMonth, endOfMonth, addDays, differenceInDays, isSameDay, addWeeks, startOfWeek, endOfWeek, parseISO, isWithinInterval } from 'date-fns';
import { CentralTask } from '@/services/centralTaskService';
import { cn } from '@/lib/utils';
import { 
  ChevronDown, 
  ChevronRight, 
  MoreHorizontal, 
  Edit, 
  Calendar, 
  Copy, 
  Trash2, 
  Users, 
  CheckCircle2, 
  Circle, 
  Clock,
  ZoomIn,
  ZoomOut,
  Plus,
  Link,
  Target,
  Download,
  Settings,
  PlayCircle,
  PauseCircle,
  AlertTriangle,
  Maximize2,
  GripVertical,
  Indent,
  Outdent
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Separator } from '@/components/ui/separator';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

interface TimelineGanttViewProps {
  tasks: CentralTask[];
  onTaskUpdate?: (taskId: string, updates: Partial<CentralTask>) => void;
  screenSize: 'mobile' | 'tablet' | 'desktop';
}

type TimeScale = 'days' | 'weeks' | 'months';
type ViewMode = 'standard' | 'critical-path' | 'resource-view';

interface TaskDependency {
  id: string;
  predecessorId: string;
  successorId: string;
  type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish';
  lag?: number; // in days
}

interface GanttTask extends Omit<CentralTask, 'dependencies'> {
  children?: GanttTask[];
  dependencies?: TaskDependency[];
  isCritical?: boolean;
  slack?: number;
  earlyStart?: Date;
  earlyFinish?: Date;
  lateStart?: Date;
  lateFinish?: Date;
}

export const TimelineGanttView = ({ 
  tasks,
  onTaskUpdate,
  screenSize 
}: TimelineGanttViewProps) => {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set(tasks.filter(t => t.is_expanded).map(t => t.id)));
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskName, setEditingTaskName] = useState<string>('');
  const [timeScale, setTimeScale] = useState<TimeScale>('days');
  const [viewMode, setViewMode] = useState<ViewMode>('standard');
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<CentralTask | null>(null);
  const [zoom, setZoom] = useState(1);
  const [showCriticalPath, setShowCriticalPath] = useState(false);
  
  const ganttRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Enhanced time scale configuration
  const getTimeScaleConfig = () => {
    const baseWidth = screenSize === 'mobile' ? 20 : screenSize === 'tablet' ? 28 : 36;
    const scaledWidth = baseWidth * zoom;
    
    switch (timeScale) {
      case 'weeks':
        return {
          dayWidth: scaledWidth * 7,
          interval: 'week' as const,
          format: 'MMM d',
          subFormat: 'EEE'
        };
      case 'months':
        return {
          dayWidth: scaledWidth * 30,
          interval: 'month' as const,
          format: 'MMM yyyy',
          subFormat: 'MMM'
        };
      default:
        return {
          dayWidth: scaledWidth,
          interval: 'day' as const,
          format: 'MMM d',
          subFormat: 'd'
        };
    }
  };

  const timeConfig = getTimeScaleConfig();

  // Generate timeline dates with enhanced range
  const generateTimeScale = useCallback(() => {
    const config = getTimeScaleConfig();
    const now = new Date();
    
    // Find the earliest and latest task dates
    const taskDates = tasks.flatMap(task => [
      task.start_date ? new Date(task.start_date) : null,
      task.end_date ? new Date(task.end_date) : null
    ]).filter(Boolean) as Date[];
    
    const earliestTask = taskDates.length > 0 ? new Date(Math.min(...taskDates.map(d => d.getTime()))) : now;
    const latestTask = taskDates.length > 0 ? new Date(Math.max(...taskDates.map(d => d.getTime()))) : now;
    
    // Add buffer around task dates
    const start = new Date(Math.min(earliestTask.getTime(), startOfMonth(now).getTime()) - (30 * 24 * 60 * 60 * 1000));
    const end = new Date(Math.max(latestTask.getTime(), endOfMonth(addDays(now, 90)).getTime()) + (30 * 24 * 60 * 60 * 1000));
    
    switch (timeScale) {
      case 'weeks':
        return eachDayOfInterval({ start: startOfWeek(start), end: endOfWeek(end) })
          .filter((_, index) => index % 7 === 0);
      case 'months':
        return eachDayOfInterval({ start: startOfMonth(start), end: endOfMonth(end) })
          .filter(date => date.getDate() === 1);
      default:
        return eachDayOfInterval({ start, end });
    }
  }, [tasks, timeScale, zoom]);

  const timelineDates = generateTimeScale();

  // Critical Path Calculation
  const calculateCriticalPath = useCallback((tasksData: CentralTask[]): GanttTask[] => {
    const tasksWithSchedule = tasksData.map(task => {
      const startDate = task.start_date ? new Date(task.start_date) : new Date();
      const endDate = task.end_date ? new Date(task.end_date) : addDays(startDate, task.duration || 1);
      
      const { dependencies, ...taskWithoutDeps } = task;
      return {
        ...taskWithoutDeps,
        dependencies: [], // Convert string[] to TaskDependency[]
        earlyStart: startDate,
        earlyFinish: endDate,
        lateStart: startDate,
        lateFinish: endDate,
        slack: 0,
        isCritical: false
      } as GanttTask;
    });

    // Forward pass - calculate early start/finish
    // Backward pass - calculate late start/finish
    // Identify critical path (tasks with zero slack)
    
    tasksWithSchedule.forEach(task => {
      task.isCritical = task.slack === 0;
    });

    return tasksWithSchedule;
  }, []);

  const enhancedTasks = useMemo(() => calculateCriticalPath(tasks), [tasks, calculateCriticalPath]);

  // Task status colors with enhanced palette
  const getStatusColor = (task: GanttTask) => {
    if (showCriticalPath && task.isCritical) {
      return 'hsl(0, 84%, 60%)'; // Red for critical path
    }
    
    const progress = task.progress || 0;
    if (progress === 100) return 'hsl(142, 76%, 36%)'; // Green for completed
    if (progress > 75) return 'hsl(221, 83%, 53%)'; // Blue for near completion
    if (progress > 50) return 'hsl(38, 92%, 50%)'; // Orange for in progress
    if (progress > 0) return 'hsl(60, 100%, 50%)'; // Yellow for started
    
    // Check if overdue
    const today = new Date();
    const endDate = task.end_date ? new Date(task.end_date) : null;
    if (endDate && endDate < today && progress < 100) {
      return 'hsl(0, 84%, 60%)'; // Red for overdue
    }
    
    return 'hsl(220, 8.9%, 46.1%)'; // Gray for not started
  };

  // Enhanced task geometry calculation
  const getTaskGeometry = (task: GanttTask) => {
    if (!task.start_date || !task.end_date) return null;
    
    const startDate = new Date(task.start_date);
    const endDate = new Date(task.end_date);
    const timelineStart = timelineDates[0];
    const timelineEnd = timelineDates[timelineDates.length - 1];
    
    let startOffset, duration;
    
    if (timeScale === 'weeks') {
      startOffset = Math.floor(differenceInDays(startDate, timelineStart) / 7);
      duration = Math.max(1, Math.ceil(differenceInDays(endDate, startDate) / 7));
    } else if (timeScale === 'months') {
      startOffset = differenceInDays(startDate, timelineStart) / 30;
      duration = Math.max(1, differenceInDays(endDate, startDate) / 30);
    } else {
      startOffset = differenceInDays(startDate, timelineStart);
      duration = Math.max(1, differenceInDays(endDate, startDate) + 1);
    }
    
    return {
      left: Math.max(0, startOffset * timeConfig.dayWidth),
      width: Math.max(timeConfig.dayWidth * 0.8, duration * timeConfig.dayWidth),
      visible: startDate <= timelineEnd && endDate >= timelineStart
    };
  };

  // Enhanced hierarchical structure with dependencies
  const buildTaskHierarchy = useCallback(() => {
    const taskMap = new Map(enhancedTasks.map(task => [task.id, { ...task, children: [] as GanttTask[] }]));
    const rootTasks: GanttTask[] = [];

    enhancedTasks.forEach(task => {
      const taskWithChildren = taskMap.get(task.id)!;
      if (task.parent_id && taskMap.has(task.parent_id)) {
        taskMap.get(task.parent_id)!.children!.push(taskWithChildren);
      } else {
        rootTasks.push(taskWithChildren);
      }
    });

    return rootTasks;
  }, [enhancedTasks]);

  const hierarchicalTasks = buildTaskHierarchy();

  // Drag and drop handlers
  const handleTaskDragStart = (e: React.MouseEvent, taskId: string) => {
    setIsDragging(taskId);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset(e.clientX - rect.left);
  };

  const handleTaskDrag = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !timelineRef.current) return;
    
    e.preventDefault();
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset;
    const dayOffset = Math.round(x / timeConfig.dayWidth);
    
    // Update task position visually during drag
    const taskElement = document.querySelector(`[data-task-id="${isDragging}"]`) as HTMLElement;
    if (taskElement) {
      taskElement.style.transform = `translateX(${x - dragOffset}px)`;
      taskElement.style.zIndex = '1000';
    }
  }, [isDragging, dragOffset, timeConfig.dayWidth]);

  const handleTaskDragEnd = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset;
    const dayOffset = Math.round(x / timeConfig.dayWidth);
    
    // Calculate new dates
    const task = enhancedTasks.find(t => t.id === isDragging);
    if (task && task.start_date) {
      const currentStart = new Date(task.start_date);
      const newStart = addDays(timelineDates[0], dayOffset);
      const duration = task.duration || 1;
      const newEnd = addDays(newStart, duration - 1);
      
      onTaskUpdate?.(isDragging, {
        start_date: newStart.toISOString().split('T')[0],
        end_date: newEnd.toISOString().split('T')[0]
      });
    }
    
    // Reset drag state
    const taskElement = document.querySelector(`[data-task-id="${isDragging}"]`) as HTMLElement;
    if (taskElement) {
      taskElement.style.transform = '';
      taskElement.style.zIndex = '';
    }
    
    setIsDragging(null);
    setDragOffset(0);
  }, [isDragging, dragOffset, timeConfig.dayWidth, timelineDates, enhancedTasks, onTaskUpdate]);

  // Toggle task expansion
  const toggleExpanded = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  // Task editing handlers
  const handleEditTask = (task: GanttTask) => {
    // Convert GanttTask back to CentralTask for editing
    const { children, isCritical, slack, earlyStart, earlyFinish, lateStart, lateFinish, ...centralTask } = task;
    const taskForEditing: CentralTask = {
      ...centralTask,
      dependencies: task.dependencies?.map(dep => dep.predecessorId) || []
    };
    setEditingTask(taskForEditing);
    setShowTaskDialog(true);
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setShowTaskDialog(true);
  };

  const handleSaveTask = (taskData: Partial<CentralTask>) => {
    if (editingTask) {
      onTaskUpdate?.(editingTask.id, taskData);
    } else {
      // Create new task logic
      console.log('Creating new task:', taskData);
    }
    setShowTaskDialog(false);
    setEditingTask(null);
  };

  // Handle inline task name editing
  const handleTaskNameClick = (task: GanttTask, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTaskId(task.id);
    setEditingTaskName(task.name);
  };

  const handleTaskNameSave = () => {
    if (editingTaskId && editingTaskName.trim()) {
      onTaskUpdate?.(editingTaskId, { name: editingTaskName.trim() });
    }
    setEditingTaskId(null);
    setEditingTaskName('');
  };

  const handleTaskNameCancel = () => {
    setEditingTaskId(null);
    setEditingTaskName('');
  };

  const handleTaskNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTaskNameSave();
    } else if (e.key === 'Escape') {
      handleTaskNameCancel();
    }
  };

  // Dependency visualization
  const renderDependencyLines = () => {
    // This would render SVG lines between dependent tasks
    return null; // Placeholder for dependency visualization
  };

  // Handle task indentation
  const handleIndentTask = () => {
    if (!selectedTask) return;
    
    // Find the selected task and the task above it
    const allTasks = [...enhancedTasks];
    const currentTaskIndex = allTasks.findIndex(t => t.id === selectedTask);
    
    if (currentTaskIndex <= 0) return; // Can't indent first task or if not found
    
    const currentTask = allTasks[currentTaskIndex];
    const taskAbove = allTasks[currentTaskIndex - 1];
    
    // Don't indent if the task above is already a child of something at the same level
    if (currentTask.level >= taskAbove.level + 1) return;
    
    // Update the selected task to be a child of the task above
    onTaskUpdate?.(selectedTask, {
      parent_id: taskAbove.id,
      level: (taskAbove.level || 0) + 1
    });
  };

  // Handle task outdentation  
  const handleOutdentTask = () => {
    if (!selectedTask) return;
    
    const currentTask = enhancedTasks.find(t => t.id === selectedTask);
    if (!currentTask || !currentTask.parent_id || (currentTask.level || 0) <= 0) return;
    
    // Find the parent task to get its parent_id and level
    const parentTask = enhancedTasks.find(t => t.id === currentTask.parent_id);
    
    onTaskUpdate?.(selectedTask, {
      parent_id: parentTask?.parent_id || null,
      level: Math.max(0, (currentTask.level || 0) - 1)
    });
  };

  
  // Render task list item (left panel)
  const renderTaskListItem = (task: GanttTask, level: number = 0): React.ReactNode[] => {
    const isExpanded = expandedTasks.has(task.id);
    const hasChildren = task.children && task.children.length > 0;
    const progress = task.progress || 0;
    const isSelected = selectedTask === task.id;
    const isOverdue = task.end_date && new Date(task.end_date) < new Date() && progress < 100;

    const rows = [];
    
    rows.push(
      <div 
        key={task.id} 
        className={cn(
          "p-3 border-b border-border/30 hover:bg-muted/50 transition-colors cursor-pointer",
          isSelected && "bg-primary/10 border-l-4 border-primary"
        )}
        onClick={() => setSelectedTask(task.id)}
      >
        <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 20}px` }}>
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(task.id);
              }}
            >
              {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </Button>
          )}
          
          <div className="flex items-center gap-2 flex-1">
            
            
            {editingTaskId === task.id ? (
              <Input
                value={editingTaskName}
                onChange={(e) => setEditingTaskName(e.target.value)}
                onBlur={handleTaskNameSave}
                onKeyDown={handleTaskNameKeyDown}
                className="font-medium text-sm h-6 px-1 py-0 border-primary"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span 
                className="font-medium text-sm truncate cursor-pointer hover:text-primary transition-colors"
                onClick={(e) => handleTaskNameClick(task, e)}
                title="Click to edit"
              >
                {task.name}
              </span>
            )}
            
            {showCriticalPath && task.isCritical && (
              <Badge variant="destructive" className="text-xs px-1 py-0">
                Critical
              </Badge>
            )}
          </div>
        </div>
      </div>
    );

    if (isExpanded && hasChildren) {
      task.children!.forEach((child: GanttTask) => {
        rows.push(...renderTaskListItem(child, level + 1));
      });
    }

    return rows;
  };

  // Render timeline bars (right panel)
  const renderTimelineBars = (tasks: GanttTask[], level: number = 0): React.ReactNode => {
    return tasks.map((task, taskIndex) => {
      const geometry = getTaskGeometry(task);
      const progress = task.progress || 0;
      const statusColor = getStatusColor(task);
      const isSelected = selectedTask === task.id;
      const rowHeight = 64;
      const barTop = taskIndex * rowHeight + 16;

      return (
        <React.Fragment key={task.id}>
          {/* Grid lines for this row */}
          <div 
            className="absolute border-b border-border/10"
            style={{ 
              top: (taskIndex + 1) * rowHeight,
              left: 0,
              right: 0,
              height: 1
            }}
          />
          
          {/* Task bar */}
          {geometry && (
            <div
              data-task-id={task.id}
              className={cn(
                "absolute h-8 rounded-md group/bar cursor-move transition-all duration-200 hover:shadow-lg",
                isDragging === task.id && "shadow-2xl z-50"
              )}
              style={{
                left: `${geometry.left}px`,
                top: `${barTop}px`,
                width: `${geometry.width}px`,
                backgroundColor: statusColor,
                opacity: isDragging === task.id ? 0.8 : 0.9,
                border: isSelected ? '2px solid hsl(var(--primary))' : 'none'
              }}
              onMouseDown={(e) => handleTaskDragStart(e, task.id)}
              onClick={() => setSelectedTask(task.id)}
            >
              {/* Progress bar */}
              <div 
                className="h-full bg-white/30 rounded-l-md transition-all"
                style={{ width: `${progress}%` }}
              />
              
              {/* Task label */}
              <div className="absolute inset-0 flex items-center px-2">
                <span className="text-white text-xs font-medium truncate">
                  {task.name}
                </span>
              </div>
              
              {/* Progress percentage */}
              {geometry.width > 60 && (
                <div className="absolute right-1 top-0 bottom-0 flex items-center">
                  <span className="text-white text-xs font-bold">
                    {progress}%
                  </span>
                </div>
              )}
            </div>
          )}
        </React.Fragment>
      );
    });
  };

  const renderTaskRow = (task: GanttTask, level: number = 0): React.ReactNode[] => {
    const isExpanded = expandedTasks.has(task.id);
    const hasChildren = task.children && task.children.length > 0;
    const geometry = getTaskGeometry(task);
    const progress = task.progress || 0;
    const statusColor = getStatusColor(task);
    const isSelected = selectedTask === task.id;
    const isOverdue = task.end_date && new Date(task.end_date) < new Date() && progress < 100;

    const rows = [];
    
    // Main task row
    rows.push(
      <div 
        key={task.id} 
        className={cn(
          "group hover:bg-muted/50 transition-colors",
          isSelected && "bg-primary/10 border-l-4 border-primary"
        )}
      >
        <div className="flex border-b border-border/30">
          {/* Enhanced task details column */}
          <div className="w-80 flex-shrink-0 border-r border-border/30 p-3">
            <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 20}px` }}>
              {/* Expand/collapse button */}
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0"
                  onClick={() => toggleExpanded(task.id)}
                >
                  {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </Button>
              )}
              
              {/* Enhanced status indicator */}
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      {progress === 100 ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : isOverdue ? (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      ) : progress > 0 ? (
                        <Clock className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </TooltipTrigger>
                    <TooltipContent>
                      {progress === 100 ? 'Completed' : 
                       isOverdue ? 'Overdue' :
                       progress > 0 ? 'In Progress' : 'Not Started'}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                {/* Critical path indicator */}
                {showCriticalPath && task.isCritical && (
                  <Badge variant="destructive" className="text-xs px-1 py-0">
                    Critical
                  </Badge>
                )}
                
                {/* Task name */}
                <span 
                  className={cn(
                    "font-medium text-sm cursor-pointer hover:text-primary",
                    task.isCritical && showCriticalPath && "text-red-600"
                  )}
                  onClick={() => setSelectedTask(task.id)}
                >
                  {task.name}
                </span>
              </div>
            </div>
            
            
            {/* Task description preview */}
            {task.description && (
              <div className="mt-1 text-xs text-muted-foreground truncate max-w-64">
                {task.description}
              </div>
            )}
          </div>

          {/* Enhanced timeline column */}
          <div 
            className="flex-1 relative h-16" 
            style={{ minWidth: `${timelineDates.length * timeConfig.dayWidth}px` }}
            ref={timelineRef}
            onMouseMove={handleTaskDrag}
            onMouseUp={handleTaskDragEnd}
          >
            {/* Grid lines with weekend highlighting */}
            {timelineDates.map((date, index) => {
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              const isToday = isSameDay(date, new Date());
              
              return (
                <div
                  key={date.toISOString()}
                  className={cn(
                    "absolute top-0 bottom-0 border-r border-border/10",
                    isWeekend && "bg-muted/20",
                    isToday && "bg-primary/10 border-primary/30"
                  )}
                  style={{ left: `${index * timeConfig.dayWidth}px`, width: `${timeConfig.dayWidth}px` }}
                />
              );
            })}
            
            {/* Enhanced task bar */}
            {geometry && (
              <div
                data-task-id={task.id}
                className={cn(
                  "absolute top-4 h-8 rounded-md group/bar cursor-move transition-all duration-200 hover:shadow-lg",
                  isDragging === task.id && "shadow-2xl z-50"
                )}
                style={{
                  left: `${geometry.left}px`,
                  width: `${geometry.width}px`,
                  backgroundColor: statusColor,
                  opacity: isDragging === task.id ? 0.8 : 0.9,
                  border: isSelected ? '2px solid hsl(var(--primary))' : 'none'
                }}
                onMouseDown={(e) => handleTaskDragStart(e, task.id)}
                onClick={() => setSelectedTask(task.id)}
              >
                {/* Enhanced progress bar */}
                <div 
                  className="h-full bg-white/30 rounded-l-md transition-all"
                  style={{ width: `${progress}%` }}
                />
                
                {/* Task label on bar */}
                <div className="absolute inset-0 flex items-center px-2">
                  <span className="text-white text-xs font-medium truncate">
                    {task.name}
                  </span>
                </div>
                
                {/* Progress percentage */}
                {geometry.width > 60 && (
                  <div className="absolute right-1 top-0 bottom-0 flex items-center">
                    <span className="text-white text-xs font-bold">
                      {progress}%
                    </span>
                  </div>
                )}
                
                {/* Avatar on task bar */}
                {task.assigned_to && geometry.width > 80 && (
                  <div className="absolute right-8 top-1">
                    <Avatar className="h-6 w-6 border-2 border-white">
                      <AvatarFallback className="text-xs bg-white/90 text-gray-700">
                        {task.assigned_to.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}
                
                {/* Enhanced context menu trigger */}
                <div className="absolute right-1 top-1 opacity-0 group-hover/bar:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 bg-black/20 text-white hover:bg-black/40">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Task Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => handleEditTask(task)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Calendar className="h-4 w-4 mr-2" />
                        Reschedule
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link className="h-4 w-4 mr-2" />
                        Add Dependency
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Start Task
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Mark Complete
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                {/* Resize handles */}
                <div className="absolute left-0 top-0 bottom-0 w-2 cursor-e-resize opacity-0 group-hover/bar:opacity-100 bg-white/20" />
                <div className="absolute right-0 top-0 bottom-0 w-2 cursor-w-resize opacity-0 group-hover/bar:opacity-100 bg-white/20" />
              </div>
            )}
            
            {/* Milestone indicator */}
            {task.duration === 0 && geometry && (
              <div
                className="absolute top-6 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-yellow-500"
                style={{ left: `${geometry.left}px` }}
              />
            )}
          </div>
        </div>
      </div>
    );

    // Add children if expanded
    if (isExpanded && hasChildren) {
      task.children!.forEach((child: GanttTask) => {
        rows.push(...renderTaskRow(child, level + 1));
      });
    }

    return rows;
  };

  // Enhanced timeline headers
  const generateTimeHeaders = () => {
    const headers = [];
    let currentPeriod = '';
    let periodStart = 0;
    let periodWidth = 0;
    
    timelineDates.forEach((date, index) => {
      const periodStr = format(date, timeConfig.format);
      if (periodStr !== currentPeriod) {
        if (currentPeriod) {
          headers.push({
            period: currentPeriod,
            left: periodStart * timeConfig.dayWidth,
            width: periodWidth * timeConfig.dayWidth
          });
        }
        currentPeriod = periodStr;
        periodStart = index;
        periodWidth = 1;
      } else {
        periodWidth++;
      }
    });
    
    if (currentPeriod) {
      headers.push({
        period: currentPeriod,
        left: periodStart * timeConfig.dayWidth,
        width: periodWidth * timeConfig.dayWidth
      });
    }
    
    return headers;
  };

  const timeHeaders = generateTimeHeaders();

  // Task editing dialog
  const TaskEditDialog = () => (
    <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingTask ? 'Edit Task' : 'Create New Task'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="task-name">Task Name</Label>
              <Input 
                id="task-name" 
                defaultValue={editingTask?.name || ''} 
                placeholder="Enter task name..."
              />
            </div>
            <div>
              <Label htmlFor="task-stage">Stage</Label>
              <Select defaultValue={editingTask?.stage || '4.0 PRELIMINARY'}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1.0 CONCEPT">1.0 Concept</SelectItem>
                  <SelectItem value="2.0 SCHEMATIC">2.0 Schematic</SelectItem>
                  <SelectItem value="3.0 DESIGN DEVELOPMENT">3.0 Design Development</SelectItem>
                  <SelectItem value="4.0 PRELIMINARY">4.0 Preliminary</SelectItem>
                  <SelectItem value="5.0 DETAILED">5.0 Detailed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="task-description">Description</Label>
            <Textarea 
              id="task-description" 
              defaultValue={editingTask?.description || ''} 
              placeholder="Enter task description..."
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input 
                id="start-date" 
                type="date" 
                defaultValue={editingTask?.start_date || ''} 
              />
            </div>
            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Input 
                id="end-date" 
                type="date" 
                defaultValue={editingTask?.end_date || ''} 
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration (days)</Label>
              <Input 
                id="duration" 
                type="number" 
                defaultValue={editingTask?.duration || 1} 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="assigned-to">Assigned To</Label>
              <Input 
                id="assigned-to" 
                defaultValue={editingTask?.assigned_to || ''} 
                placeholder="Enter assignee name..."
              />
            </div>
            <div>
              <Label htmlFor="progress">Progress (%)</Label>
              <Input 
                id="progress" 
                type="number" 
                min="0" 
                max="100" 
                defaultValue={editingTask?.progress || 0} 
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="budgeted-cost">Budgeted Cost</Label>
              <Input 
                id="budgeted-cost" 
                type="number" 
                defaultValue={editingTask?.budgeted_cost || 0} 
              />
            </div>
            <div>
              <Label htmlFor="actual-cost">Actual Cost</Label>
              <Input 
                id="actual-cost" 
                type="number" 
                defaultValue={editingTask?.actual_cost || 0} 
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setShowTaskDialog(false)}>
            Cancel
          </Button>
          <Button onClick={() => handleSaveTask({})}>
            {editingTask ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <TooltipProvider>
      <div className="w-full h-full bg-background border rounded-lg overflow-hidden">
        {/* Simplified Formatting Toolbar */}
        <div className="border-b border-border/30 p-3 bg-background">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Text Formatting Group */}
            <div className="flex items-center gap-1 border-r border-border pr-2">
              <Select defaultValue="arial">
                <SelectTrigger className="w-24 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="arial">Arial</SelectItem>
                  <SelectItem value="times">Times</SelectItem>
                  <SelectItem value="helvetica">Helvetica</SelectItem>
                  <SelectItem value="courier">Courier</SelectItem>
                </SelectContent>
              </Select>
              
              <Select defaultValue="10">
                <SelectTrigger className="w-16 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8">8</SelectItem>
                  <SelectItem value="9">9</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="11">11</SelectItem>
                  <SelectItem value="12">12</SelectItem>
                  <SelectItem value="14">14</SelectItem>
                  <SelectItem value="16">16</SelectItem>
                  <SelectItem value="18">18</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Style Buttons */}
            <div className="flex items-center gap-1 border-r border-border pr-2">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <strong className="text-sm">B</strong>
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <em className="text-sm">I</em>
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <u className="text-sm">U</u>
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <s className="text-sm">S</s>
              </Button>
            </div>

            {/* Color Tools */}
            <div className="flex items-center gap-1 border-r border-border pr-2">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <div className="w-4 h-4 bg-red-500 border"></div>
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <div className="w-4 h-4 bg-yellow-300 border"></div>
              </Button>
            </div>

            {/* Alignment */}
            <div className="flex items-center gap-1 border-r border-border pr-2">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <div className="text-xs">⫸</div>
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <div className="text-xs">≡</div>
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <div className="text-xs">⫷</div>
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <div className="text-xs">≣</div>
              </Button>
            </div>

            {/* Lists */}
            <div className="flex items-center gap-1 border-r border-border pr-2">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <div className="text-xs">•</div>
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <div className="text-xs">1.</div>
              </Button>
            </div>

            {/* Indent Controls */}
            <div className="flex items-center gap-1 border-r border-border pr-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={handleOutdentTask}
                    disabled={!selectedTask}
                  >
                    <Outdent className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Decrease Indent</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={handleIndentTask}
                    disabled={!selectedTask}
                  >
                    <Indent className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Increase Indent</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Insert Tools */}
            <div className="flex items-center gap-1 border-r border-border pr-2">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Edit className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Link className="h-3 w-3" />
              </Button>
            </div>

            {/* View Options */}
            <div className="flex items-center gap-2 border-r border-border pr-2">
              <Select value={timeScale} onValueChange={(value: TimeScale) => setTimeScale(value)}>
                <SelectTrigger className="w-20 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="days">Days</SelectItem>
                  <SelectItem value="weeks">Weeks</SelectItem>
                  <SelectItem value="months">Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-1 border-r border-border pr-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                disabled={zoom <= 0.5}
                className="h-8"
              >
                <ZoomOut className="h-3 w-3" />
              </Button>
              <span className="text-xs px-2">{Math.round(zoom * 100)}%</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.min(3, zoom + 0.25))}
                disabled={zoom >= 3}
                className="h-8"
              >
                <ZoomIn className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="flex items-center gap-1 border-r border-border pr-2">
              <Button
                variant={showCriticalPath ? "default" : "outline"}
                size="sm"
                onClick={() => setShowCriticalPath(!showCriticalPath)}
                className="h-8"
              >
                <Target className="h-3 w-3 mr-1" />
                <span className="text-xs">Critical Path</span>
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-8 text-xs">
                Baselines
              </Button>
              <Button variant="outline" size="sm" className="h-8">
                <Download className="h-3 w-3 mr-1" />
                <span className="text-xs">Export</span>
              </Button>
              <Button size="sm" onClick={handleCreateTask} className="h-8">
                <Plus className="h-3 w-3 mr-1" />
                <span className="text-xs">Add Task</span>
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Settings className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Maximize2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Resizable Panel Layout */}
        <PanelGroup direction="horizontal" className="w-full h-full">
          {/* Task List Panel */}
          <Panel defaultSize={30} minSize={20} maxSize={50}>
            <div className="h-full flex flex-col">
              {/* Task list header */}
              <div className="border-b border-border/30 bg-muted/50">
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">Task Details</span>
                  </div>
                </div>
              </div>

              {/* Task rows scrollable area */}
              <div className="flex-1 overflow-auto">
                {hierarchicalTasks.length > 0 ? (
                  hierarchicalTasks.map(task => renderTaskListItem(task))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <div className="text-lg font-medium">No tasks found</div>
                    <div className="text-sm mt-1">Create tasks to see your Gantt chart</div>
                    <Button className="mt-4" onClick={handleCreateTask}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Task
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Panel>

          {/* Resize Handle */}
          <PanelResizeHandle className="w-2 bg-border/20 hover:bg-border/40 transition-colors duration-200 relative group">
            <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-1 bg-border group-hover:bg-primary/50 transition-colors duration-200" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
          </PanelResizeHandle>

          {/* Timeline Panel */}
          <Panel defaultSize={70} minSize={50}>
            <div className="h-full flex flex-col">
              {/* Timeline header */}
              <div className="border-b border-border/30">
                {/* Period headers */}
                <div className="relative h-8 bg-muted/30 border-b border-border/30 overflow-x-auto" style={{ minWidth: `${timelineDates.length * timeConfig.dayWidth}px` }}>
                  {timeHeaders.map((header, index) => (
                    <div
                      key={index}
                      className="absolute top-0 h-full flex items-center justify-center text-xs font-medium border-r border-border/20"
                      style={{
                        left: header.left,
                        width: header.width
                      }}
                    >
                      {header.period}
                    </div>
                  ))}
                </div>
                
                {/* Day/Week/Month headers */}
                <div className="relative h-6 bg-background border-b border-border/30 overflow-x-auto" style={{ minWidth: `${timelineDates.length * timeConfig.dayWidth}px` }}>
                  {timelineDates.map((date, index) => {
                    const isToday = isSameDay(date, new Date());
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                    
                    return (
                      <div
                        key={date.toISOString()}
                        className={cn(
                          "absolute top-0 h-full flex items-center justify-center text-xs border-r border-border/10",
                          isToday && "bg-primary text-primary-foreground font-bold",
                          isWeekend && !isToday && "bg-muted/50 text-muted-foreground"
                        )}
                        style={{
                          left: index * timeConfig.dayWidth,
                          width: timeConfig.dayWidth
                        }}
                      >
                        {format(date, timeConfig.subFormat)}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Timeline content with task bars */}
              <div className="flex-1 overflow-auto" ref={timelineRef}>
                <div className="relative" style={{ minWidth: `${timelineDates.length * timeConfig.dayWidth}px`, minHeight: `${hierarchicalTasks.length * 64}px` }}>
                  {/* Dependency lines layer */}
                  <div className="absolute inset-0 pointer-events-none z-10">
                    {renderDependencyLines()}
                  </div>
                  
                  {/* Timeline grid and task bars */}
                  {hierarchicalTasks.length > 0 && (
                    renderTimelineBars(hierarchicalTasks)
                  )}
                </div>
              </div>
            </div>
          </Panel>
        </PanelGroup>
        
        {/* Task editing dialog */}
        <TaskEditDialog />
      </div>
    </TooltipProvider>
  );
};