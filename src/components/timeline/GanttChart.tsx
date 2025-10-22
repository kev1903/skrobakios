import React, { useState, useEffect, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addDays, differenceInDays, parseISO, isWithinInterval, startOfWeek, endOfWeek, isSameWeek } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar, ChevronLeft, ChevronRight, Edit, Plus, Save, X, Settings, ZoomIn, ZoomOut } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { DatePicker } from '@/components/ui/date-picker';
import { cn } from '@/lib/utils';
import { GanttTaskList } from './GanttTaskList';
import { CentralTask } from '@/services/centralTaskService';

export interface GanttTask {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  status: 'pending' | 'in-progress' | 'completed' | 'delayed';
  assignee?: string;
  dependencies?: string[];
  milestone?: boolean;
  category?: string;
  priority: 'High' | 'Medium' | 'Low';
  description?: string;
  parentId?: string;
  level?: number;
  expanded?: boolean;
  isStage?: boolean;
}

export interface GanttMilestone {
  id: string;
  name: string;
  date: Date;
  status: 'upcoming' | 'completed' | 'overdue';
  description?: string;
}

interface GanttChartProps {
  tasks: GanttTask[];
  centralTasks?: CentralTask[];
  milestones?: GanttMilestone[];
  onTaskUpdate?: (taskId: string, updates: Partial<GanttTask>) => void;
  onCentralTaskUpdate?: (taskId: string, updates: Partial<CentralTask>) => void;
  onTaskAdd?: (task: Omit<GanttTask, 'id'>) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskReorder?: (taskIds: string[]) => void;
  onMilestoneUpdate?: (milestoneId: string, updates: Partial<GanttMilestone>) => void;
  editable?: boolean;
  showGrid?: boolean;
  showToday?: boolean;
  compactMode?: boolean;
  showTaskList?: boolean;
}

export const GanttChart = ({
  tasks,
  centralTasks = [],
  milestones = [],
  onTaskUpdate,
  onCentralTaskUpdate,
  onTaskAdd,
  onTaskDelete,
  onTaskReorder,
  onMilestoneUpdate,
  editable = true,
  showGrid = true,
  showToday = true,
  compactMode = false,
  showTaskList = false
}: GanttChartProps) => {
  const [viewStart, setViewStart] = useState(() => {
    const earliest = tasks.reduce((min, task) => task.startDate < min ? task.startDate : min, new Date());
    return startOfMonth(earliest);
  });
  const [editingCell, setEditingCell] = useState<{ taskId: string; field: string } | null>(null);
  const [tableWidth, setTableWidth] = useState(400); // Default table width
  const [isResizing, setIsResizing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [columnWidths, setColumnWidths] = useState({
    name: 192,
    startDate: 96,
    endDate: 96,
    assignee: 100,
    status: 80,
    progress: 80
  });
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1); // Add zoom state
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [dragState, setDragState] = useState<{
    taskId: string;
    type: 'move' | 'resize-start' | 'resize-end';
    startX: number;
    originalStart: Date;
    originalEnd: Date;
  } | null>(null);
  
  // Row drag and drop state
  const [rowDragState, setRowDragState] = useState<{
    draggedTaskId: string;
    draggedIndex: number;
    dropTargetIndex: number | null;
  } | null>(null);

  // Column resize handlers
  const handleColumnResizeStart = (e: React.MouseEvent, columnKey: string) => {
    e.preventDefault();
    setResizingColumn(columnKey);
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!resizingColumn) return;
      
      const rect = (e.target as HTMLElement).closest('.gantt-container')?.getBoundingClientRect();
      if (!rect) return;
      
      const relativeX = e.clientX - rect.left;
      let newWidth = 0;
      
      // Calculate new width based on column position
      if (columnKey === 'name') {
        newWidth = Math.max(100, relativeX - 16);
      } else {
        const nameWidth = columnWidths.name;
        const startDateWidth = columnKey === 'startDate' ? 0 : columnWidths.startDate;
        const endDateWidth = columnKey === 'endDate' ? 0 : (columnKey === 'startDate' ? 0 : columnWidths.endDate);
        const offset = nameWidth + startDateWidth + endDateWidth;
        newWidth = Math.max(60, relativeX - offset);
      }
      
      setColumnWidths(prev => ({
        ...prev,
        [columnKey]: newWidth
      }));
    };
    
    const handleMouseUp = () => {
      setResizingColumn(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Update table width when column widths change
  useEffect(() => {
    const totalWidth = Object.values(columnWidths).reduce((sum, width) => sum + width, 0);
    setTableWidth(totalWidth);
  }, [columnWidths]);

  // Initialize expanded states for stage tasks only on mount
  useEffect(() => {
    const stageIds = new Set<string>();
    tasks.forEach(task => {
      if (task.isStage) {
        stageIds.add(task.id);
      }
    });
    
    // Only set initial expanded state if no state exists (first load)
    setExpandedTasks(prev => {
      if (prev.size === 0 && stageIds.size > 0) {
        return stageIds;
      }
      return prev;
    });
  }, []); // Empty dependency array - only run on mount

  // Build hierarchical task structure for display
  const getVisibleTasks = useMemo(() => {
    interface TaskWithChildren extends GanttTask {
      children: TaskWithChildren[];
    }
    
    const taskMap = new Map<string, TaskWithChildren>();
    const rootTasks: TaskWithChildren[] = [];

    // First pass: Create all task nodes
    tasks.forEach(task => {
      taskMap.set(task.id, { ...task, children: [] });
    });

    // Second pass: Build parent-child relationships
    tasks.forEach(task => {
      const taskNode = taskMap.get(task.id)!;
      if (task.parentId && taskMap.has(task.parentId)) {
        const parent = taskMap.get(task.parentId)!;
        parent.children.push(taskNode);
      } else {
        rootTasks.push(taskNode);
      }
    });

    // Third pass: Flatten hierarchy respecting expansion state
    const flattenTasks = (task: TaskWithChildren, depth = 0): (GanttTask & { depth: number })[] => {
      const result: (GanttTask & { depth: number })[] = [{ ...task, depth }];
      
      if (expandedTasks.has(task.id) && task.children.length > 0) {
        task.children.forEach(child => {
          result.push(...flattenTasks(child, depth + 1));
        });
      }
      
      return result;
    };

    return rootTasks.flatMap(task => flattenTasks(task));
  }, [tasks, expandedTasks]);

  const toggleExpanded = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
    
    // Also notify parent component
    onTaskUpdate?.(taskId, { expanded: !expandedTasks.has(taskId) });
  };

  // Calculate view range (show 6 months)
  const viewEnd = endOfMonth(addDays(viewStart, 180));
  const days = eachDayOfInterval({
    start: viewStart,
    end: viewEnd
  });
  const baseDayWidth = 24; // base pixels per day
  const dayWidth = baseDayWidth * zoomLevel; // dynamic day width based on zoom

  // Zoom functions
  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3)); // Max zoom 3x
  };

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.25)); // Min zoom 0.25x
  };

  // Status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500';
      case 'in-progress':
        return 'bg-blue-500';
      case 'delayed':
        return 'bg-red-500';
      default:
        return 'bg-slate-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'border-l-red-500';
      case 'Medium':
        return 'border-l-yellow-500';
      case 'Low':
        return 'border-l-green-500';
      default:
        return 'border-l-slate-400';
    }
  };

  // Calculate task position and width
  const getTaskGeometry = (task: GanttTask) => {
    const startOffset = differenceInDays(task.startDate, viewStart);
    const duration = differenceInDays(task.endDate, task.startDate) + 1;
    return {
      left: Math.max(0, startOffset * dayWidth),
      width: Math.max(dayWidth, duration * dayWidth),
      visible: isWithinInterval(task.startDate, {
        start: viewStart,
        end: viewEnd
      }) || isWithinInterval(task.endDate, {
        start: viewStart,
        end: viewEnd
      })
    };
  };

  // Mouse handlers for drag operations
  const handleTaskMouseDown = (e: React.MouseEvent, taskId: string, type: 'move' | 'resize-start' | 'resize-end') => {
    if (!editable) return;
    e.preventDefault();
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    setDragState({
      taskId,
      type,
      startX: e.clientX,
      originalStart: task.startDate,
      originalEnd: task.endDate
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState || !onTaskUpdate) return;
    const deltaX = e.clientX - dragState.startX;
    const deltaDays = Math.round(deltaX / dayWidth);
    const task = tasks.find(t => t.id === dragState.taskId);
    if (!task) return;
    let newStart = dragState.originalStart;
    let newEnd = dragState.originalEnd;
    switch (dragState.type) {
      case 'move':
        newStart = addDays(dragState.originalStart, deltaDays);
        newEnd = addDays(dragState.originalEnd, deltaDays);
        break;
      case 'resize-start':
        newStart = addDays(dragState.originalStart, deltaDays);
        if (newStart >= dragState.originalEnd) newStart = addDays(dragState.originalEnd, -1);
        break;
      case 'resize-end':
        newEnd = addDays(dragState.originalEnd, deltaDays);
        if (newEnd <= dragState.originalStart) newEnd = addDays(dragState.originalStart, 1);
        break;
    }
    onTaskUpdate(dragState.taskId, {
      startDate: newStart,
      endDate: newEnd
    });
  };

  const handleMouseUp = () => {
    setDragState(null);
    setIsResizing(false);
  };

  // Resize handlers for the table/gantt divider
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
  };

  // Add effect to handle document mouse events for resizing
  useEffect(() => {
    const handleDocumentMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const rect = document.querySelector('.gantt-container')?.getBoundingClientRect();
        if (rect) {
          const relativeX = e.clientX - rect.left;
          const newWidth = Math.max(300, Math.min(800, relativeX));
          setTableWidth(newWidth);
        }
      }
    };

    const handleDocumentMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleDocumentMouseMove);
      document.addEventListener('mouseup', handleDocumentMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleDocumentMouseMove);
      document.removeEventListener('mouseup', handleDocumentMouseUp);
    };
  }, [isResizing]);

  // Calculate today's position
  const todayOffset = () => {
    const today = new Date();
    const daysDiff = differenceInDays(today, viewStart);
    return daysDiff * dayWidth;
  };

  // Calculate today's absolute position including table width and divider
  const getTodayPosition = () => {
    const currentTableWidth = isCollapsed ? 60 : tableWidth;
    return currentTableWidth + 1 + todayOffset();
  };

  // Row drag and drop handlers
  const handleRowDragStart = (e: React.DragEvent, taskId: string, index: number) => {
    if (!editable || !onTaskReorder) return;
    
    setRowDragState({
      draggedTaskId: taskId,
      draggedIndex: index,
      dropTargetIndex: null
    });
    
    // Set drag data
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', taskId);
    
    // Add a visual effect to the dragged element
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleRowDragEnd = (e: React.DragEvent) => {
    // Reset visual effects
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    
    setRowDragState(null);
  };

  const handleRowDragOver = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (rowDragState) {
      setRowDragState(prev => prev ? {
        ...prev,
        dropTargetIndex: targetIndex
      } : null);
    }
  };

  const handleRowDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    
    if (!rowDragState || !onTaskReorder) return;
    
    const { draggedIndex } = rowDragState;
    
    if (draggedIndex === targetIndex) {
      setRowDragState(null);
      return;
    }
    
    // Create new task order
    const newTasks = [...tasks];
    const [draggedTask] = newTasks.splice(draggedIndex, 1);
    newTasks.splice(targetIndex, 0, draggedTask);
    
    // Notify parent of new order
    onTaskReorder(newTasks.map(task => task.id));
    
    setRowDragState(null);
  };

  // Editable cell component
  const EditableCell = ({ 
    value, 
    taskId, 
    field, 
    className, 
    type = 'text',
    options 
  }: { 
    value: string; 
    taskId: string; 
    field: string; 
    className?: string;
    type?: 'text' | 'date' | 'select' | 'number';
    options?: Array<string | { value: string; label: string }>;
  }) => {
    const isEditing = editingCell?.taskId === taskId && editingCell?.field === field;
    
    const handleSave = (newValue: string) => {
      let updateData: Partial<GanttTask> = {};
      
      if (field === 'startDate' || field === 'endDate') {
        updateData[field] = new Date(newValue);
      } else if (field === 'dependencies') {
        updateData.dependencies = newValue ? newValue.split(', ').map(dep => dep.trim()) : [];
      } else if (field === 'name') {
        updateData.name = newValue;
      } else if (field === 'assignee') {
        updateData.assignee = newValue;
      }
      
      onTaskUpdate?.(taskId, updateData);
      setEditingCell(null);
    };

    const handleDateChange = (date: Date | undefined) => {
      if (date && (field === 'startDate' || field === 'endDate')) {
        let updateData: Partial<GanttTask> = {};
        updateData[field] = date;
        onTaskUpdate?.(taskId, updateData);
      }
      setEditingCell(null);
    };

    if (isEditing) {
      if (type === 'date') {
        // For date fields, get the actual date from the task object
        const task = tasks.find(t => t.id === taskId);
        const currentDate = task && field === 'startDate' ? task.startDate : 
                           task && field === 'endDate' ? task.endDate : undefined;
        return (
          <DatePicker
            date={currentDate}
            onDateChange={handleDateChange}
            className="w-full"
          />
        );
      }
      
      if (type === 'select' && options) {
        return (
          <Select defaultValue={value} onValueChange={handleSave}>
            <SelectTrigger className="text-xs h-6">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map(option => {
                if (typeof option === 'string') {
                  return <SelectItem key={option} value={option}>{option}</SelectItem>;
                } else {
                  return <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>;
                }
              })}
            </SelectContent>
          </Select>
        );
      }
      
      return (
        <Input
          defaultValue={value}
          type={type}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              handleSave(e.currentTarget.value);
            } else if (e.key === 'Escape') {
              setEditingCell(null);
            }
          }}
          onBlur={e => handleSave(e.currentTarget.value)}
          autoFocus
          className="text-xs h-6"
        />
      );
    }

    return (
      <div 
        className={cn("cursor-pointer hover:bg-muted/50 p-1 rounded", className)}
        onClick={() => setEditingCell({ taskId, field })}
      >
        <span className="text-xs">
          {value || '-'}
        </span>
      </div>
    );
  };

  // Dependency lines component
  const DependencyLines = () => {
    return (
      <div className="absolute inset-0 pointer-events-none z-5">
        <svg className="w-full h-full">
          {tasks.map((task, taskIndex) => {
            if (!task.dependencies || task.dependencies.length === 0) return null;
            
            return task.dependencies.map((depId) => {
              const dependencyTask = tasks.find(t => t.id === depId);
              if (!dependencyTask) return null;
              
              const depIndex = tasks.findIndex(t => t.id === depId);
              const taskGeometry = getTaskGeometry(task);
              const depGeometry = getTaskGeometry(dependencyTask);
              
              // Calculate positions
              const startY = (depIndex + 1) * (compactMode ? 28 : 36) + (compactMode ? 14 : 18);
              const endY = (taskIndex + 1) * (compactMode ? 28 : 36) + (compactMode ? 14 : 18);
              const startX = depGeometry.left + depGeometry.width + (isCollapsed ? 60 : tableWidth) + 1;
              const endX = taskGeometry.left + (isCollapsed ? 60 : tableWidth) + 1;
              
              // Create curved path
              const midX = (startX + endX) / 2;
              const pathData = `M ${startX} ${startY} Q ${midX} ${startY} ${midX} ${(startY + endY) / 2} Q ${midX} ${endY} ${endX} ${endY}`;
              
              return (
                <g key={`${task.id}-${depId}`}>
                  {/* Dependency line */}
                  <path
                    d={pathData}
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="4 4"
                    opacity="0.6"
                  />
                  {/* Arrow head */}
                  <polygon
                    points={`${endX-6},${endY-3} ${endX},${endY} ${endX-6},${endY+3}`}
                    fill="hsl(var(--primary))"
                    opacity="0.6"
                  />
                </g>
              );
            });
          })}
        </svg>
      </div>
    );
  };

  // Time header component - split into fixed and scrollable parts
  const TimeHeader = () => 
    <div className="border-b border-border bg-muted/10 flex" style={{ width: isCollapsed ? 60 : tableWidth, height: 72 }}>
      {!isCollapsed && (
        <>
        <div 
          className="px-2 py-2 border-r border-border flex items-center justify-between flex-shrink-0 relative group"
          style={{ width: columnWidths.name }}
        >
          {/* Resize handle */}
          <div
            className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 opacity-0 group-hover:opacity-100 transition-opacity"
            onMouseDown={(e) => handleColumnResizeStart(e, 'name')}
          />
          <span className={cn("font-semibold text-xs text-foreground transition-opacity duration-200", isCollapsed && "opacity-0")}>
            TASK NAME
          </span>
          <div className="flex items-center gap-1">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={zoomOut}
                className="h-4 w-4 p-0"
                title="Zoom Out"
              >
                <ZoomOut className="w-3 h-3" />
              </Button>
              <span className="text-xs text-muted-foreground min-w-8 text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={zoomIn}
                className="h-4 w-4 p-0"
                title="Zoom In"
              >
                <ZoomIn className="w-3 h-3" />
              </Button>
            </div>
            {/* Collapse Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-4 w-4 p-0 flex-shrink-0"
            >
              <ChevronLeft className={cn("w-3 h-3 transition-transform", isCollapsed && "rotate-180")} />
            </Button>
          </div>
        </div>
        <div className="px-2 py-2 border-r border-border flex items-center flex-shrink-0 relative group" style={{ width: columnWidths.startDate }}>
          {/* Resize handle */}
          <div
            className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 opacity-0 group-hover:opacity-100 transition-opacity"
            onMouseDown={(e) => handleColumnResizeStart(e, 'startDate')}
          />
          <span className="font-semibold text-xs text-foreground">
            START DATE
          </span>
        </div>
        <div className="px-2 py-2 border-r border-border flex items-center flex-shrink-0 relative group" style={{ width: columnWidths.endDate }}>
          {/* Resize handle */}
          <div
            className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 opacity-0 group-hover:opacity-100 transition-opacity"
            onMouseDown={(e) => handleColumnResizeStart(e, 'endDate')}
          />
          <span className="font-semibold text-xs text-foreground">
            END DATE
          </span>
        </div>
        <div className="w-20 px-2 py-2 border-r border-border flex items-center flex-shrink-0">
          <span className="font-semibold text-xs text-foreground">
            DURATION
          </span>
        </div>
        <div className="px-2 py-2 border-r border-border flex items-center flex-shrink-0 relative group" style={{ width: columnWidths.assignee }}>
          {/* Resize handle */}
          <div
            className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 opacity-0 group-hover:opacity-100 transition-opacity"
            onMouseDown={(e) => handleColumnResizeStart(e, 'assignee')}
          />
          <span className="font-semibold text-xs text-foreground">
            ASSIGNEE
          </span>
        </div>
        <div className="px-2 py-2 border-r border-border flex items-center flex-shrink-0 relative group" style={{ width: columnWidths.status }}>
          {/* Resize handle */}
          <div
            className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 opacity-0 group-hover:opacity-100 transition-opacity"
            onMouseDown={(e) => handleColumnResizeStart(e, 'status')}
          />
          <span className="font-semibold text-xs text-foreground">
            STATUS
          </span>
        </div>
        <div className="px-2 py-2 flex items-center flex-shrink-0 relative group" style={{ width: columnWidths.progress }}>
          {/* Resize handle */}
          <div
            className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 opacity-0 group-hover:opacity-100 transition-opacity"
            onMouseDown={(e) => handleColumnResizeStart(e, 'progress')}
          />
          <span className="font-semibold text-xs text-foreground">
            PROGRESS
          </span>
        </div>
        </>
      )}
      {isCollapsed && (
        <div className="px-2 py-2 flex items-center justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(false)}
            className="h-4 w-4 p-0"
          >
            <ChevronRight className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>;

  // Milestone component
  const MilestoneMarker = ({
    milestone
  }: {
    milestone: GanttMilestone;
  }) => {
    const offset = differenceInDays(milestone.date, viewStart) * dayWidth;
    if (offset < 0 || offset > days.length * dayWidth) return null;
    return <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="absolute top-0 bottom-0 flex items-start pt-1 z-20" style={{
            left: offset
          }}>
              <div className={cn("w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent", milestone.status === 'completed' ? 'border-b-emerald-500' : milestone.status === 'overdue' ? 'border-b-red-500' : 'border-b-blue-500')} />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <div className="font-medium">{milestone.name}</div>
              <div className="text-muted-foreground">{format(milestone.date, 'MMM d, yyyy')}</div>
              {milestone.description && <div className="text-xs mt-1">{milestone.description}</div>}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>;
  };

  return (
    <div className="border border-border rounded-lg bg-background gantt-container overflow-hidden">
      {/* Header row with table headers and week headers */}
      <div className="flex border-b border-border bg-muted/10">
        {/* Fixed table header */}
        <div className="flex-shrink-0" style={{ width: isCollapsed ? 60 : tableWidth }}>
          <TimeHeader />
        </div>
        
        {/* Resizable divider */}
        <div 
          className="w-1 bg-border cursor-col-resize hover:bg-primary/50 transition-colors"
          onMouseDown={handleResizeStart}
        />
        
        {/* Scrollable week headers aligned with table headers */}
        <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          <div style={{ width: days.length * dayWidth }}>
            {/* Month headers */}
            <div className="flex border-b border-border bg-muted/10 h-8">
              {Array.from(new Set(days.map(day => format(day, 'MMM yyyy')))).map(month => {
                const monthDays = days.filter(day => format(day, 'MMM yyyy') === month);
                return (
                  <div 
                    key={month} 
                    className="bg-primary/10 text-primary font-semibold text-sm flex items-center justify-center border-r border-border" 
                    style={{ width: monthDays.length * dayWidth }}
                  >
                    {month}
                  </div>
                );
              })}
            </div>
            
            {/* Week headers */}
            <div className="flex border-b border-border bg-muted/20 h-6">
              {(() => {
                const weeks: { weekStart: Date; weekDays: Date[] }[] = [];
                let currentWeek: Date[] = [];
                let currentWeekStart: Date | null = null;
                
                days.forEach((day) => {
                  if (currentWeek.length === 0 || !isSameWeek(day, currentWeek[0], { weekStartsOn: 1 })) {
                    if (currentWeek.length > 0) {
                      weeks.push({ weekStart: currentWeekStart!, weekDays: currentWeek });
                    }
                    currentWeek = [day];
                    currentWeekStart = startOfWeek(day, { weekStartsOn: 1 });
                  } else {
                    currentWeek.push(day);
                  }
                });
                
                if (currentWeek.length > 0) {
                  weeks.push({ weekStart: currentWeekStart!, weekDays: currentWeek });
                }
                
                return weeks.map((week, index) => (
                  <div 
                    key={`week-${index}`} 
                    className="text-muted-foreground font-medium text-xs flex items-center justify-center border-r border-border/50" 
                    style={{ width: week.weekDays.length * dayWidth }}
                  >
                    Week {format(week.weekStart, 'w')}
                  </div>
                ));
              })()}
            </div>
            
            {/* Day headers */}
            <div className="flex bg-background" style={{ height: '38px' }}>
              {days.map((day) => (
                <div 
                  key={day.toISOString()} 
                  className={cn(
                    "text-xs text-center py-1 border-r border-border/50 flex flex-col justify-center",
                    format(day, 'E') === 'Sat' || format(day, 'E') === 'Sun' ? 'bg-muted/20' : '',
                    showToday && format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? 'bg-primary/20' : ''
                  )} 
                  style={{ width: dayWidth }}
                >
                  <div className="font-medium">{format(day, 'd')}</div>
                  <div className="text-[10px] opacity-60">{format(day, 'E')}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="relative flex">
        {/* Fixed task table */}
        <div className="flex-shrink-0" style={{ width: isCollapsed ? 60 : tableWidth }}>
          {showTaskList && centralTasks.length > 0 ? (
            <GanttTaskList 
              tasks={centralTasks}
              onTaskUpdate={onCentralTaskUpdate}
              className="h-full"
            />
          ) : (
            <>
              {/* Tasks */}
              {getVisibleTasks.map((task, index) => {
            const geometry = getTaskGeometry(task);
            if (!geometry.visible) return null;
            const rowHeight = compactMode ? 28 : 36;
            const isDraggedOver = rowDragState?.dropTargetIndex === index;
            const isDragging = rowDragState?.draggedTaskId === task.id;
            const hasChildren = tasks.filter(t => t.parentId === task.id).length > 0;
            
            return (
              <div 
                key={task.id} 
                className={cn(
                  "flex border-b border-border transition-colors",
                  isDraggedOver && "bg-primary/10 border-primary/50",
                  isDragging && "opacity-50",
                  "hover:bg-muted/20 cursor-grab active:cursor-grabbing",
                  task.isStage && "bg-muted/5 border-l-4 border-l-primary/60"
                )}
                style={{ height: rowHeight }}
                draggable={editable && !!onTaskReorder}
                onDragStart={(e) => {
                  // Only allow row drag if we're not clicking on the timeline area or interactive elements
                  const target = e.target as HTMLElement;
                  const isTimelineArea = target.closest('.timeline-area');
                  const isInteractiveElement = target.closest('input, button, select, [role="button"]');
                  
                  if (isTimelineArea || isInteractiveElement) {
                    e.preventDefault();
                    return;
                  }
                  handleRowDragStart(e, task.id, index);
                }}
                onDragEnd={handleRowDragEnd}
                onDragOver={(e) => handleRowDragOver(e, index)}
                onDrop={(e) => handleRowDrop(e, index)}
              >
                {/* Task table columns */}
                <div 
                  className="border-r border-border overflow-hidden flex task-info-area" 
                  style={{ width: isCollapsed ? 60 : tableWidth, height: rowHeight }}
                >
                  {/* Task Name */}
                  <div 
                    className="px-2 border-r border-border flex items-center flex-shrink-0 relative group"
                    style={{ width: columnWidths.name, height: rowHeight, paddingLeft: `${8 + (task.depth || 0) * 16}px` }}
                  >
                    {/* Resize handle */}
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 opacity-0 group-hover:opacity-100 transition-opacity"
                      onMouseDown={(e) => handleColumnResizeStart(e, 'name')}
                    />
                    {/* Expand/Collapse button for parent tasks */}
                    {hasChildren && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(task.id)}
                        className="p-0 h-4 w-4 mr-2 flex-shrink-0"
                      >
                        <div className={cn(
                          "w-0 h-0 border-l-4 border-l-foreground border-y-2 border-y-transparent transition-transform",
                          expandedTasks.has(task.id) && "rotate-90"
                        )} />
                      </Button>
                    )}
                    
                    <EditableCell
                      value={task.name}
                      taskId={task.id}
                      field="name"
                      className={cn(
                        "w-full",
                        task.isStage ? "font-bold text-primary" : "font-medium"
                      )}
                    />
                    
                    {/* Dependency indicator */}
                    {task.dependencies && task.dependencies.length > 0 && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="ml-1 w-2 h-2 bg-primary/60 rounded-full flex-shrink-0" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-xs">
                              <div className="font-medium">Dependencies:</div>
                              {task.dependencies.map(depId => {
                                const depTask = tasks.find(t => t.id === depId);
                                return depTask ? (
                                  <div key={depId}>• {depTask.name}</div>
                                ) : (
                                  <div key={depId}>• {depId}</div>
                                );
                              })}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  
                  {/* Start Date */}
                  <div className="px-2 border-r border-border flex items-center flex-shrink-0 relative group" style={{ width: columnWidths.startDate, height: rowHeight }}>
                    {/* Resize handle */}
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 opacity-0 group-hover:opacity-100 transition-opacity"
                      onMouseDown={(e) => handleColumnResizeStart(e, 'startDate')}
                    />
                    <EditableCell
                      value={format(task.startDate, 'dd/MM/yy')}
                      taskId={task.id}
                      field="startDate"
                      type="date"
                      className="text-muted-foreground w-full"
                    />
                  </div>
                  
                  {/* End Date */}
                  <div className="px-2 border-r border-border flex items-center flex-shrink-0 relative group" style={{ width: columnWidths.endDate, height: rowHeight }}>
                    {/* Resize handle */}
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 opacity-0 group-hover:opacity-100 transition-opacity"
                      onMouseDown={(e) => handleColumnResizeStart(e, 'endDate')}
                    />
                    <EditableCell
                      value={format(task.endDate, 'dd/MM/yy')}
                      taskId={task.id}
                      field="endDate"
                      type="date"
                      className="text-muted-foreground w-full"
                    />
                  </div>
                  
                  {/* Duration - Read only display */}
                  <div className="w-20 px-2 border-r border-border flex items-center flex-shrink-0" style={{ height: rowHeight }}>
                    <span className="text-xs text-muted-foreground">
                      {differenceInDays(task.endDate, task.startDate) + 1}d
                    </span>
                  </div>
                  
                  {/* Assignee */}
                  <div className="px-2 border-r border-border flex items-center flex-shrink-0 relative group" style={{ width: columnWidths.assignee, height: rowHeight }}>
                    {/* Resize handle */}
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 opacity-0 group-hover:opacity-100 transition-opacity"
                      onMouseDown={(e) => handleColumnResizeStart(e, 'assignee')}
                    />
                    <EditableCell
                      value={task.assignee || ''}
                      taskId={task.id}
                      field="assignee"
                      className="text-muted-foreground truncate w-full"
                    />
                  </div>
                  
                  {/* Status */}
                  <div className="px-2 border-r border-border flex items-center flex-shrink-0 relative group" style={{ width: columnWidths.status, height: rowHeight }}>
                    {/* Resize handle */}
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 opacity-0 group-hover:opacity-100 transition-opacity"
                      onMouseDown={(e) => handleColumnResizeStart(e, 'status')}
                    />
                    <EditableCell
                      value={task.status}
                      taskId={task.id}
                      field="status"
                      type="select"
                      options={['pending', 'in-progress', 'completed', 'delayed']}
                      className="w-full"
                    />
                  </div>
                  
                  {/* Progress */}
                  <div className="px-2 flex items-center flex-shrink-0 relative group" style={{ width: columnWidths.progress, height: rowHeight }}>
                    {/* Resize handle */}
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 opacity-0 group-hover:opacity-100 transition-opacity"
                      onMouseDown={(e) => handleColumnResizeStart(e, 'progress')}
                    />
                    <EditableCell
                      value={`${task.progress}%`}
                      taskId={task.id}
                      field="progress"
                      type="number"
                      className="text-muted-foreground text-xs w-full"
                    />
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Add task row */}
          {editable && onTaskAdd && (
            <div className="flex border-b border-border">
              <div className="flex" style={{ width: isCollapsed ? 60 : tableWidth }}>
                <div 
                  className="px-2 border-r border-border flex-shrink-0 flex items-center"
                  style={{ width: columnWidths.name, height: compactMode ? 28 : 36 }}
                >
                  <Button variant="ghost" size="sm" onClick={() => {
                    // Simple add task - in real implementation, open a form dialog
                    const newTask: Omit<GanttTask, 'id'> = {
                      name: 'New Task',
                      startDate: new Date(),
                      endDate: addDays(new Date(), 7),
                      progress: 0,
                      status: 'pending',
                      priority: 'Medium',
                      assignee: ''
                    };
                    onTaskAdd(newTask);
                  }} className="w-full justify-start text-muted-foreground">
                    <Plus className="w-4 h-4 mr-2" />
                    {!isCollapsed && <span>Add task</span>}
                  </Button>
                </div>
                <div className="px-2 border-r border-border flex-shrink-0 flex items-center" style={{ width: columnWidths.startDate, height: compactMode ? 28 : 36 }}></div>
                <div className="px-2 border-r border-border flex-shrink-0 flex items-center" style={{ width: columnWidths.endDate, height: compactMode ? 28 : 36 }}></div>
                <div className="w-20 px-2 border-r border-border flex-shrink-0 flex items-center" style={{ height: compactMode ? 28 : 36 }}></div>
                <div className="px-2 border-r border-border flex-shrink-0 flex items-center" style={{ width: columnWidths.assignee, height: compactMode ? 28 : 36 }}></div>
                <div className="px-2 border-r border-border flex-shrink-0 flex items-center" style={{ width: columnWidths.status, height: compactMode ? 28 : 36 }}></div>
                <div className="px-2 flex-shrink-0 flex items-center" style={{ width: columnWidths.progress, height: compactMode ? 28 : 36 }}></div>
              </div>
            </div>
          )}
            </>
          )}
        </div>
        
        {/* Resizable divider */}
        <div 
          className="w-1 bg-border cursor-col-resize hover:bg-primary/50 transition-colors"
          onMouseDown={handleResizeStart}
        />
        
        {/* Scrollable timeline area - content only */}
        <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          <div style={{ width: days.length * dayWidth }}>
            {/* Timeline content area */}
            <div 
              className="relative timeline-area" 
              onMouseMove={handleMouseMove} 
              onMouseUp={handleMouseUp} 
              onMouseLeave={handleMouseUp}
            >
            {/* Dependency Lines */}
            <DependencyLines />

            {/* Milestones */}
            <div className="absolute inset-0 pointer-events-none z-20">
              {milestones.map(milestone => <MilestoneMarker key={milestone.id} milestone={milestone} />)}
            </div>

            {/* Today line - positioned correctly */}
            {showToday && <div 
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none" 
              style={{
                left: todayOffset()
              }} 
            />}

            {/* Timeline for each task */}
            {getVisibleTasks.map((task, index) => {
              // Check if task has valid dates
              const hasValidDates = task.startDate && task.endDate && 
                                   task.startDate instanceof Date && 
                                   task.endDate instanceof Date &&
                                   !isNaN(task.startDate.getTime()) && 
                                   !isNaN(task.endDate.getTime());
              
              // Skip rendering if dates are invalid
              if (!hasValidDates) {
                const rowHeight = compactMode ? 28 : 36;
                return (
                  <div 
                    key={`timeline-${task.id}`}
                    className="border-b border-border relative"
                    style={{ height: rowHeight }}
                  />
                );
              }
              
              const geometry = getTaskGeometry(task);
              if (!geometry.visible) return null;
              const rowHeight = compactMode ? 28 : 36;
              
              return (
                <div 
                  key={`timeline-${task.id}`}
                  className="border-b border-border relative"
                  style={{ height: rowHeight }}
                >
                  <div className="relative h-full">
                    {/* Grid lines */}
                    {showGrid && days.filter((_, i) => i % 7 === 0).map((day, i) => (
                      <div key={i} className="absolute top-0 bottom-0 w-px bg-border/30" style={{
                        left: i * 7 * dayWidth
                      }} />
                    ))}

                    {/* Weekend highlighting */}
                    {days.map((day, i) => (
                      format(day, 'E') === 'Sat' || format(day, 'E') === 'Sun' ? (
                        <div key={i} className="absolute top-0 bottom-0 bg-muted/10 pointer-events-none" style={{
                          left: i * dayWidth,
                          width: dayWidth
                        }} />
                      ) : null
                    ))}

                    {/* Task bar */}
                    <div 
                      className={cn(
                        "absolute flex items-center cursor-move rounded-sm transition-colors",
                        getStatusColor(task.status),
                        dragState?.taskId === task.id && "opacity-80",
                        task.isStage ? "h-4" : "h-3"
                      )}
                      style={{
                        left: geometry.left,
                        width: geometry.width,
                        top: task.isStage ? '6px' : '8px',
                        zIndex: task.isStage ? 2 : 1,
                      }}
                      onMouseDown={(e) => handleTaskMouseDown(e, task.id, 'move')}
                    >
                      {/* Task content */}
                      <div className="flex-1 px-2 overflow-hidden">
                        <span className={cn(
                          "text-xs font-medium text-white truncate",
                          task.isStage && "font-bold"
                        )}>
                          {task.name}
                        </span>
                      </div>

                      {/* Progress overlay */}
                      <div 
                        className="absolute inset-0 bg-white/30 rounded-sm pointer-events-none"
                        style={{ width: `${task.progress}%` }}
                      />

                      {/* Resize handles */}
                      <div 
                        className="absolute left-0 top-0 bottom-0 w-1 cursor-w-resize bg-white/40 opacity-0 hover:opacity-100 transition-opacity"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handleTaskMouseDown(e, task.id, 'resize-start');
                        }}
                      />
                      <div 
                        className="absolute right-0 top-0 bottom-0 w-1 cursor-e-resize bg-white/40 opacity-0 hover:opacity-100 transition-opacity"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          handleTaskMouseDown(e, task.id, 'resize-end');
                        }}
                      />
                    </div>
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