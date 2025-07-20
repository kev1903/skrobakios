import React, { useState, useRef, useEffect } from 'react';
import { format, eachDayOfInterval, startOfMonth, endOfMonth, addDays, differenceInDays, isSameDay } from 'date-fns';
import { CentralTask } from '@/services/centralTaskService';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight, MoreHorizontal, Edit, Calendar, Copy, Trash2, Users, CheckCircle2, Circle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

interface TimelineGanttViewProps {
  tasks: CentralTask[];
  onTaskUpdate?: (taskId: string, updates: Partial<CentralTask>) => void;
  screenSize: 'mobile' | 'tablet' | 'desktop';
}

export const TimelineGanttView = ({ 
  tasks,
  onTaskUpdate,
  screenSize 
}: TimelineGanttViewProps) => {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set(tasks.filter(t => t.is_expanded).map(t => t.id)));
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  // Generate timeline dates (showing 3 months)
  const generateTimeScale = () => {
    const start = startOfMonth(new Date());
    const end = endOfMonth(addDays(start, 90)); // 3 months
    return eachDayOfInterval({ start, end });
  };

  const timelineDates = generateTimeScale();
  const dayWidth = screenSize === 'mobile' ? 24 : 32;

  // Task status colors
  const getStatusColor = (progress: number = 0) => {
    if (progress === 100) return 'hsl(142, 76%, 36%)'; // Green for completed
    if (progress > 50) return 'hsl(221, 83%, 53%)'; // Blue for in progress
    if (progress > 0) return 'hsl(38, 92%, 50%)'; // Orange for started
    return 'hsl(220, 8.9%, 46.1%)'; // Gray for not started
  };

  // Get task geometry for timeline positioning
  const getTaskGeometry = (task: CentralTask) => {
    if (!task.start_date || !task.end_date) return null;
    
    const startDate = new Date(task.start_date);
    const endDate = new Date(task.end_date);
    const timelineStart = timelineDates[0];
    const timelineEnd = timelineDates[timelineDates.length - 1];
    
    const startOffset = differenceInDays(startDate, timelineStart);
    const duration = differenceInDays(endDate, startDate) + 1;
    
    return {
      left: Math.max(0, startOffset * dayWidth),
      width: Math.max(dayWidth, duration * dayWidth),
      visible: startDate <= timelineEnd && endDate >= timelineStart
    };
  };

  // Build hierarchical structure
  const buildTaskHierarchy = () => {
    const taskMap = new Map(tasks.map(task => [task.id, { ...task, children: [] as CentralTask[] }]));
    const rootTasks: any[] = [];

    tasks.forEach(task => {
      const taskWithChildren = taskMap.get(task.id)!;
      if (task.parent_id && taskMap.has(task.parent_id)) {
        taskMap.get(task.parent_id)!.children.push(taskWithChildren);
      } else {
        rootTasks.push(taskWithChildren);
      }
    });

    return rootTasks;
  };

  const hierarchicalTasks = buildTaskHierarchy();

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

  // Handle task updates
  const handleTaskUpdate = (taskId: string, updates: Partial<CentralTask>) => {
    onTaskUpdate?.(taskId, updates);
  };

  // Render task row
  const renderTaskRow = (task: any, level: number = 0): React.ReactNode[] => {
    const isExpanded = expandedTasks.has(task.id);
    const hasChildren = task.children && task.children.length > 0;
    const geometry = getTaskGeometry(task);
    const progress = task.progress || 0;
    const statusColor = getStatusColor(progress);

    const rows = [];
    
    // Main task row
    rows.push(
      <div key={task.id} className="group hover:bg-muted/50 transition-colors">
        <div className="flex border-b border-border/30">
          {/* Task details column */}
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
              
              {/* Status indicator */}
              <div className="flex items-center gap-2">
                {progress === 100 ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : progress > 0 ? (
                  <Clock className="h-4 w-4 text-blue-600" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
                
                {/* Task name */}
                <span className="font-medium text-sm">{task.name}</span>
              </div>
            </div>
            
            {/* Task details */}
            <div className="mt-1" style={{ paddingLeft: `${level * 20 + 24}px` }}>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{task.duration || 0} days</span>
                <span>{progress}%</span>
                {task.assigned_to && (
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <Avatar className="h-4 w-4">
                      <AvatarFallback className="text-xs">
                        {task.assigned_to.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Timeline column */}
          <div className="flex-1 relative h-12" style={{ minWidth: `${timelineDates.length * dayWidth}px` }}>
            {/* Grid lines */}
            {timelineDates.map((date, index) => (
              <div
                key={date.toISOString()}
                className="absolute top-0 bottom-0 border-r border-border/10"
                style={{ left: `${index * dayWidth}px` }}
              />
            ))}
            
            {/* Task bar */}
            {geometry && (
              <div
                className="absolute top-2 h-8 rounded-md group/bar cursor-pointer transition-all duration-200 hover:shadow-md"
                style={{
                  left: `${geometry.left}px`,
                  width: `${geometry.width}px`,
                  backgroundColor: statusColor,
                  opacity: 0.8
                }}
                onClick={() => setSelectedTask(task.id)}
              >
                {/* Progress bar */}
                <div 
                  className="h-full bg-white/20 rounded-l-md transition-all"
                  style={{ width: `${progress}%` }}
                />
                
                {/* Task label on bar */}
                <div className="absolute inset-0 flex items-center px-2">
                  <span className="text-white text-xs font-medium truncate">
                    {task.name}
                  </span>
                </div>
                
                {/* Avatar on task bar */}
                {task.assigned_to && (
                  <div className="absolute right-1 top-1">
                    <Avatar className="h-6 w-6 border-2 border-white">
                      <AvatarFallback className="text-xs bg-white/90 text-gray-700">
                        {task.assigned_to.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}
                
                {/* Context menu trigger */}
                <div className="absolute right-1 top-1 opacity-0 group-hover/bar:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 bg-black/20 text-white hover:bg-black/40">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => handleTaskUpdate(task.id, {})}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Calendar className="h-4 w-4 mr-2" />
                        Reschedule
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );

    // Add children if expanded
    if (isExpanded && hasChildren) {
      task.children.forEach((child: any) => {
        rows.push(...renderTaskRow(child, level + 1));
      });
    }

    return rows;
  };

  // Generate month headers for timeline
  const generateMonthHeaders = () => {
    const months = [];
    let currentMonth = '';
    let monthStart = 0;
    let monthWidth = 0;
    
    timelineDates.forEach((date, index) => {
      const monthStr = format(date, 'MMM yyyy');
      if (monthStr !== currentMonth) {
        if (currentMonth) {
          months.push({
            month: currentMonth,
            left: monthStart * dayWidth,
            width: monthWidth * dayWidth
          });
        }
        currentMonth = monthStr;
        monthStart = index;
        monthWidth = 1;
      } else {
        monthWidth++;
      }
    });
    
    // Add the last month
    if (currentMonth) {
      months.push({
        month: currentMonth,
        left: monthStart * dayWidth,
        width: monthWidth * dayWidth
      });
    }
    
    return months;
  };

  const monthHeaders = generateMonthHeaders();

  return (
    <div className="w-full h-full bg-background border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex">
          {/* Task list header */}
          <div className="w-80 flex-shrink-0 border-r border-border/30 bg-muted/50">
            <div className="p-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">Title</span>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Duration</span>
                  <span>Status</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Timeline header */}
          <div className="flex-1 overflow-x-auto" style={{ minWidth: `${timelineDates.length * dayWidth}px` }}>
            {/* Month headers */}
            <div className="relative h-8 bg-muted/30 border-b border-border/30">
              {monthHeaders.map((month, index) => (
                <div
                  key={index}
                  className="absolute top-0 h-full flex items-center justify-center text-xs font-medium border-r border-border/20"
                  style={{
                    left: month.left,
                    width: month.width
                  }}
                >
                  {month.month}
                </div>
              ))}
            </div>
            
            {/* Day headers */}
            <div className="relative h-6 bg-background border-b border-border/30">
              {timelineDates.map((date, index) => (
                <div
                  key={date.toISOString()}
                  className={cn(
                    "absolute top-0 h-full flex items-center justify-center text-xs border-r border-border/10",
                    isSameDay(date, new Date()) && "bg-primary/10 text-primary font-medium"
                  )}
                  style={{
                    left: index * dayWidth,
                    width: dayWidth
                  }}
                >
                  {format(date, 'd')}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Task rows */}
      <div className="overflow-auto max-h-[calc(100vh-300px)]">
        <div className="relative">
          {hierarchicalTasks.length > 0 ? (
            hierarchicalTasks.map(task => renderTaskRow(task))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <div className="text-lg font-medium">No tasks found</div>
              <div className="text-sm mt-1">Create tasks to see your Gantt chart</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};