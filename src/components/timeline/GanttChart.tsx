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
  
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [dragState, setDragState] = useState<{
    taskId: string;
    type: 'move' | 'resize-start' | 'resize-end';
    startX: number;
    originalStart: Date;
    originalEnd: Date;
  } | null>(null);

  // Calculate view range (show 6 months)
  const viewEnd = endOfMonth(addDays(viewStart, 180));
  const days = eachDayOfInterval({ start: viewStart, end: viewEnd });
  const dayWidth = 24; // pixels per day

  // Status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500';
      case 'in-progress': return 'bg-blue-500';
      case 'delayed': return 'bg-red-500';
      default: return 'bg-slate-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'border-l-red-500';
      case 'Medium': return 'border-l-yellow-500';
      case 'Low': return 'border-l-green-500';
      default: return 'border-l-slate-400';
    }
  };

  // Calculate task position and width
  const getTaskGeometry = (task: GanttTask) => {
    const startOffset = differenceInDays(task.startDate, viewStart);
    const duration = differenceInDays(task.endDate, task.startDate) + 1;
    
    return {
      left: Math.max(0, startOffset * dayWidth),
      width: Math.max(dayWidth, duration * dayWidth),
      visible: isWithinInterval(task.startDate, { start: viewStart, end: viewEnd }) || 
               isWithinInterval(task.endDate, { start: viewStart, end: viewEnd })
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

    onTaskUpdate(dragState.taskId, { startDate: newStart, endDate: newEnd });
  };

  const handleMouseUp = () => {
    setDragState(null);
  };

  // Time header component
  const TimeHeader = () => (
    <div className="flex border-b border-border">
      {/* Left column for task names */}
      <div className="w-80 bg-muted/30 border-r border-border p-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewStart(addDays(viewStart, -30))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium">
            {format(viewStart, 'MMM yyyy')} - {format(viewEnd, 'MMM yyyy')}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewStart(addDays(viewStart, 30))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Timeline header */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex" style={{ width: days.length * dayWidth }}>
          {/* Month headers */}
          <div className="flex w-full">
            {Array.from(new Set(days.map(day => format(day, 'MMM yyyy')))).map(month => {
              const monthDays = days.filter(day => format(day, 'MMM yyyy') === month);
              return (
                <div
                  key={month}
                  className="bg-primary/10 text-primary font-medium text-sm flex items-center justify-center border-r border-border"
                  style={{ width: monthDays.length * dayWidth }}
                >
                  {month}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Day headers */}
        <div className="flex border-t border-border">
          {days.map((day, index) => (
            <div
              key={day.toISOString()}
              className={cn(
                "text-xs text-center py-1 border-r border-border/50 bg-background",
                format(day, 'E') === 'Sat' || format(day, 'E') === 'Sun' ? 'bg-muted/20' : '',
                showToday && format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? 'bg-primary/20' : ''
              )}
              style={{ width: dayWidth }}
            >
              <div>{format(day, 'd')}</div>
              <div className="text-[10px] opacity-60">{format(day, 'E')}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Milestone component
  const MilestoneMarker = ({ milestone }: { milestone: GanttMilestone }) => {
    const offset = differenceInDays(milestone.date, viewStart) * dayWidth;
    
    if (offset < 0 || offset > days.length * dayWidth) return null;
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="absolute top-0 bottom-0 flex items-start pt-1 z-20"
              style={{ left: offset }}
            >
              <div className={cn(
                "w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent",
                milestone.status === 'completed' ? 'border-b-emerald-500' :
                milestone.status === 'overdue' ? 'border-b-red-500' : 'border-b-blue-500'
              )} />
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
      </TooltipProvider>
    );
  };

  return (
    <div className="border border-border rounded-lg bg-background">
      <TimeHeader />
      
      <div 
        className="relative"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Milestones */}
        <div className="absolute inset-0 pointer-events-none">
          {milestones.map(milestone => (
            <MilestoneMarker key={milestone.id} milestone={milestone} />
          ))}
        </div>

        {/* Today line */}
        {showToday && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none"
            style={{ 
              left: differenceInDays(new Date(), viewStart) * dayWidth 
            }}
          />
        )}

        {/* Task rows */}
        {tasks.map((task, index) => {
          const geometry = getTaskGeometry(task);
          
          if (!geometry.visible) return null;

          return (
            <div key={task.id} className="flex border-b border-border hover:bg-muted/20">
              {/* Task info column */}
              <div className="w-80 border-r border-border p-2 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  {editingTask === task.id ? (
                    <div className="space-y-1">
                      <Input
                        defaultValue={task.name}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            onTaskUpdate?.(task.id, { name: e.currentTarget.value });
                            setEditingTask(null);
                          } else if (e.key === 'Escape') {
                            setEditingTask(null);
                          }
                        }}
                        autoFocus
                      />
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setEditingTask(null)}>
                          <Save className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingTask(null)}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="font-medium text-sm truncate">{task.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {task.assignee && <span>{task.assignee}</span>}
                        {task.assignee && task.progress !== undefined && <span> • </span>}
                        {task.progress !== undefined && <span>{task.progress}%</span>}
                      </div>
                    </div>
                  )}
                </div>
                
                {editable && editingTask !== task.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingTask(task.id)}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                )}
              </div>

              {/* Timeline column */}
              <div className="flex-1 relative p-2" style={{ height: compactMode ? 40 : 60 }}>
                <div className="relative h-full">
                  {/* Grid lines */}
                  {showGrid && days.filter((_, i) => i % 7 === 0).map((day, i) => (
                    <div
                      key={i}
                      className="absolute top-0 bottom-0 w-px bg-border/30"
                      style={{ left: i * 7 * dayWidth }}
                    />
                  ))}

                  {/* Task bar */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "absolute top-1/2 -translate-y-1/2 rounded cursor-pointer border-l-4",
                            getStatusColor(task.status),
                            getPriorityColor(task.priority),
                            "hover:shadow-md transition-shadow"
                          )}
                          style={{
                            left: geometry.left,
                            width: geometry.width,
                            height: compactMode ? 20 : 32
                          }}
                          onMouseDown={(e) => handleMouseDown(e, task.id, 'move')}
                        >
                          {/* Progress bar */}
                          {task.progress > 0 && (
                            <div
                              className="absolute inset-0 bg-primary/30 rounded-r"
                              style={{ width: `${task.progress}%` }}
                            />
                          )}
                          
                          {/* Task label */}
                          <div className="absolute inset-0 flex items-center px-2 text-xs font-medium text-white">
                            <span className="truncate">{task.name}</span>
                          </div>

                          {/* Resize handles */}
                          {editable && (
                            <>
                              <div
                                className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-white/20"
                                onMouseDown={(e) => {
                                  e.stopPropagation();
                                  handleMouseDown(e, task.id, 'resize-start');
                                }}
                              />
                              <div
                                className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-white/20"
                                onMouseDown={(e) => {
                                  e.stopPropagation();
                                  handleMouseDown(e, task.id, 'resize-end');
                                }}
                              />
                            </>
                          )}
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
            </div>
          );
        })}

        {/* Add task row */}
        {editable && onTaskAdd && (
          <div className="flex border-b border-border bg-muted/10">
            <div className="w-80 border-r border-border p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Simple add task - in real implementation, open a form dialog
                  const newTask: Omit<GanttTask, 'id'> = {
                    name: 'New Task',
                    startDate: new Date(),
                    endDate: addDays(new Date(), 7),
                    progress: 0,
                    status: 'pending',
                    priority: 'Medium',
                    assignee: '',
                  };
                  onTaskAdd(newTask);
                }}
                className="w-full justify-start text-muted-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add task
              </Button>
            </div>
            <div className="flex-1 p-2"></div>
          </div>
        )}
      </div>
    </div>
  );
};