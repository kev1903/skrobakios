import React, { useState, useEffect, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addDays, differenceInDays, parseISO, isWithinInterval } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Calendar, ChevronLeft, ChevronRight, Edit, Plus, Save, X, Settings } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
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
  milestones?: GanttMilestone[];
  onTaskUpdate?: (taskId: string, updates: Partial<GanttTask>) => void;
  onTaskAdd?: (task: Omit<GanttTask, 'id'>) => void;
  onTaskDelete?: (taskId: string) => void;
  onMilestoneUpdate?: (milestoneId: string, updates: Partial<GanttMilestone>) => void;
  editable?: boolean;
  showGrid?: boolean;
  showToday?: boolean;
  compactMode?: boolean;
}
export const GanttChart = ({
  tasks,
  milestones = [],
  onTaskUpdate,
  onTaskAdd,
  onTaskDelete,
  onMilestoneUpdate,
  editable = true,
  showGrid = true,
  showToday = true,
  compactMode = false
}: GanttChartProps) => {
  const [viewStart, setViewStart] = useState(() => {
    const earliest = tasks.reduce((min, task) => task.startDate < min ? task.startDate : min, new Date());
    return startOfMonth(earliest);
  });
  const [editingCell, setEditingCell] = useState<{ taskId: string; field: string } | null>(null);
  const [tableWidth, setTableWidth] = useState(400); // Default table width
  const [isResizing, setIsResizing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dragState, setDragState] = useState<{
    taskId: string;
    type: 'move' | 'resize-start' | 'resize-end';
    startX: number;
    originalStart: Date;
    originalEnd: Date;
  } | null>(null);

  // Calculate view range (show 6 months)
  const viewEnd = endOfMonth(addDays(viewStart, 180));
  const days = eachDayOfInterval({
    start: viewStart,
    end: viewEnd
  });
  const dayWidth = 24; // pixels per day

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
  const handleMouseDown = (e: React.MouseEvent, taskId: string, type: 'move' | 'resize-start' | 'resize-end') => {
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
    type?: 'text' | 'date' | 'select';
    options?: string[];
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

    if (isEditing) {
      if (type === 'select' && options) {
        return (
          <Select defaultValue={value} onValueChange={handleSave}>
            <SelectTrigger className="text-xs h-6">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
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
        <span className={cn("text-xs", isCollapsed && "opacity-0")}>
          {value || '-'}
        </span>
      </div>
    );
  };

  // Time header component
  const TimeHeader = () => <div className="flex border-b border-border">
      {/* Table headers for task information */}
      <div className="flex bg-muted/30 border-r border-border" style={{ width: tableWidth }}>
        <div className="w-48 px-2 py-2 border-r border-border flex items-center justify-between">
          <span className={cn("font-semibold text-xs text-foreground", isCollapsed && "opacity-0")}>
            TASK NAME
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-4 w-4 p-0"
          >
            <ChevronLeft className={cn("w-3 h-3 transition-transform", isCollapsed && "rotate-180")} />
          </Button>
        </div>
        <div className="w-24 px-2 py-2 border-r border-border flex items-center">
          <span className={cn("font-semibold text-xs text-foreground", isCollapsed && "opacity-0")}>
            START DATE
          </span>
        </div>
        <div className="w-24 px-2 py-2 border-r border-border flex items-center">
          <span className={cn("font-semibold text-xs text-foreground", isCollapsed && "opacity-0")}>
            END DATE
          </span>
        </div>
        <div className="w-20 px-2 py-2 border-r border-border flex items-center">
          <span className={cn("font-semibold text-xs text-foreground", isCollapsed && "opacity-0")}>
            DURATION
          </span>
        </div>
        <div className="w-28 px-2 py-2 border-r border-border flex items-center">
          <span className={cn("font-semibold text-xs text-foreground", isCollapsed && "opacity-0")}>
            ASSIGNEE
          </span>
        </div>
        <div className="w-32 px-2 py-2 flex items-center">
          <span className={cn("font-semibold text-xs text-foreground", isCollapsed && "opacity-0")}>
            DEPENDENCIES
          </span>
        </div>
      </div>
      
      {/* Resizable divider */}
      <div 
        className="w-1 bg-border cursor-col-resize hover:bg-primary/50 transition-colors"
        onMouseDown={handleResizeStart}
        title="Drag to resize table"
      />
      
      {/* Timeline header */}
      <div className="flex-1 overflow-hidden">
        <div className="flex" style={{
        width: days.length * dayWidth
      }}>
          {/* Month headers */}
          <div className="flex w-full">
            {Array.from(new Set(days.map(day => format(day, 'MMM yyyy')))).map(month => {
            const monthDays = days.filter(day => format(day, 'MMM yyyy') === month);
            return <div key={month} className="bg-primary/10 text-primary font-medium text-sm flex items-center justify-center border-r border-border" style={{
              width: monthDays.length * dayWidth
            }}>
                  {month}
                </div>;
          })}
          </div>
        </div>
        
        {/* Day headers */}
        <div className="flex border-t border-border">
          {days.map((day, index) => <div key={day.toISOString()} className={cn("text-xs text-center py-1 border-r border-border/50 bg-background", format(day, 'E') === 'Sat' || format(day, 'E') === 'Sun' ? 'bg-muted/20' : '', showToday && format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? 'bg-primary/20' : '')} style={{
          width: dayWidth
        }}>
              <div>{format(day, 'd')}</div>
              <div className="text-[10px] opacity-60">{format(day, 'E')}</div>
            </div>)}
        </div>
      </div>
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
  return <div className="border border-border rounded-lg bg-background gantt-container">
      <TimeHeader />
      
      <div className="relative" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
        {/* Milestones */}
        <div className="absolute inset-0 pointer-events-none">
          {milestones.map(milestone => <MilestoneMarker key={milestone.id} milestone={milestone} />)}
        </div>

        {/* Today line - positioned correctly */}
        {showToday && <div 
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none" 
          style={{
            left: tableWidth + 1 + todayOffset() // Account for table width and divider
          }} 
        />}

        {/* Task rows */}
        {tasks.map((task, index) => {
        const geometry = getTaskGeometry(task);
        if (!geometry.visible) return null;
        return <div key={task.id} className="flex border-b border-border hover:bg-muted/20">
              {/* Task table columns */}
              <div className="flex border-r border-border" style={{ width: tableWidth }}>
                {/* Task Name */}
                <div className="w-48 px-2 py-2 border-r border-border flex items-center">
                  <EditableCell
                    value={task.name}
                    taskId={task.id}
                    field="name"
                    className="font-medium w-full"
                  />
                </div>
                
                {/* Start Date */}
                <div className="w-24 px-2 py-2 border-r border-border flex items-center">
                  <EditableCell
                    value={format(task.startDate, 'yyyy-MM-dd')}
                    taskId={task.id}
                    field="startDate"
                    type="date"
                    className="text-muted-foreground w-full"
                  />
                </div>
                
                {/* End Date */}
                <div className="w-24 px-2 py-2 border-r border-border flex items-center">
                  <EditableCell
                    value={format(task.endDate, 'yyyy-MM-dd')}
                    taskId={task.id}
                    field="endDate"
                    type="date"
                    className="text-muted-foreground w-full"
                  />
                </div>
                
                {/* Duration - Read only display */}
                <div className="w-20 px-2 py-2 border-r border-border flex items-center">
                  <span className={cn("text-xs text-muted-foreground", isCollapsed && "opacity-0")}>
                    {differenceInDays(task.endDate, task.startDate) + 1}d
                  </span>
                </div>
                
                {/* Assignee */}
                <div className="w-28 px-2 py-2 border-r border-border flex items-center">
                  <EditableCell
                    value={task.assignee || ''}
                    taskId={task.id}
                    field="assignee"
                    className="text-muted-foreground truncate w-full"
                  />
                </div>
                
                {/* Dependencies */}
                <div className="w-32 px-2 py-2 flex items-center">
                  <EditableCell
                    value={task.dependencies?.join(', ') || ''}
                    taskId={task.id}
                    field="dependencies"
                    className="text-muted-foreground truncate w-full"
                  />
                </div>
              </div>

              {/* Resizable divider */}
              <div 
                className="w-1 bg-border cursor-col-resize hover:bg-primary/50 transition-colors"
                onMouseDown={handleResizeStart}
              />

              {/* Timeline column */}
              <div className="flex-1 relative p-2" style={{
            height: compactMode ? 40 : 60
          }}>
                <div className="relative h-full">
                  {/* Grid lines */}
                  {showGrid && days.filter((_, i) => i % 7 === 0).map((day, i) => <div key={i} className="absolute top-0 bottom-0 w-px bg-border/30" style={{
                left: i * 7 * dayWidth
              }} />)}

                  {/* Task bar */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className={cn("absolute top-1/2 -translate-y-1/2 rounded cursor-pointer border-l-4", getStatusColor(task.status), getPriorityColor(task.priority), "hover:shadow-md transition-shadow")} style={{
                      left: geometry.left,
                      width: geometry.width,
                      height: compactMode ? 20 : 32
                    }} onMouseDown={e => handleMouseDown(e, task.id, 'move')}>
                          {/* Progress bar */}
                          {task.progress > 0 && <div className="absolute inset-0 bg-primary/30 rounded-r" style={{
                        width: `${task.progress}%`
                      }} />}
                          
                          {/* Task label */}
                          <div className="absolute inset-0 flex items-center px-2 text-xs font-medium text-white">
                            <span className="truncate">{task.name}</span>
                          </div>

                          {/* Resize handles */}
                          {editable && <>
                              <div className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-white/20" onMouseDown={e => {
                          e.stopPropagation();
                          handleMouseDown(e, task.id, 'resize-start');
                        }} />
                              <div className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-white/20" onMouseDown={e => {
                          e.stopPropagation();
                          handleMouseDown(e, task.id, 'resize-end');
                        }} />
                            </>}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1 text-sm">
                          <div className="font-medium">{task.name}</div>
                          <div>{format(task.startDate, 'MMM d')} - {format(task.endDate, 'MMM d, yyyy')}</div>
                          <div>{differenceInDays(task.endDate, task.startDate) + 1} days</div>
                          {task.assignee && <div>Assigned to: {task.assignee}</div>}
                          <div>Progress: {task.progress}%</div>
                          <Badge variant="outline" className="text-xs">
                            {task.status}
                          </Badge>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>;
      })}

        {/* Add task row */}
        {editable && onTaskAdd && <div className="flex border-b border-border bg-muted/10">
            <div className="flex border-r border-border" style={{ width: tableWidth }}>
              <div className="w-48 px-2 py-2 border-r border-border">
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
                  Add task
                </Button>
              </div>
              <div className="w-24 px-2 py-2 border-r border-border"></div>
              <div className="w-24 px-2 py-2 border-r border-border"></div>
              <div className="w-20 px-2 py-2 border-r border-border"></div>
              <div className="w-28 px-2 py-2 border-r border-border"></div>
              <div className="w-32 px-2 py-2"></div>
            </div>
            
            {/* Resizable divider */}
            <div 
              className="w-1 bg-border cursor-col-resize hover:bg-primary/50 transition-colors"
              onMouseDown={handleResizeStart}
            />
            
            <div className="flex-1 p-2"></div>
          </div>}
      </div>
    </div>;
};