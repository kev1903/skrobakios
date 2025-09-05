import React, { useState, useMemo } from 'react';
import { format, eachDayOfInterval, addDays, differenceInDays, isSameDay } from 'date-fns';
import { CentralTask } from '@/services/centralTaskService';
import { cn } from '@/lib/utils';
import { 
  ChevronDown, 
  ChevronRight,
  Calendar,
  User,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ProfessionalTimelineViewProps {
  tasks: CentralTask[];
  onTaskUpdate?: (taskId: string, updates: Partial<CentralTask>) => void;
  screenSize: 'mobile-small' | 'mobile' | 'tablet' | 'desktop';
}

interface TaskWithHierarchy extends CentralTask {
  children?: TaskWithHierarchy[];
  level: number;
}

export const ProfessionalTimelineView = ({ 
  tasks,
  onTaskUpdate,
  screenSize 
}: ProfessionalTimelineViewProps) => {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  // Priority color mapping for professional appearance
  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return '#DC2626'; // Clean red
      case 'medium':
        return '#2563EB'; // Professional blue
      case 'low':
        return '#16A34A'; // Professional green
      default:
        return '#64748B'; // Neutral gray
    }
  };

  // Build task hierarchy
  const hierarchicalTasks = useMemo((): TaskWithHierarchy[] => {
    const taskMap = new Map<string, TaskWithHierarchy>();
    
    // Initialize all tasks with level 0
    tasks.forEach(task => {
      taskMap.set(task.id, { ...task, children: [], level: 0 });
    });

    const rootTasks: TaskWithHierarchy[] = [];

    tasks.forEach(task => {
      const currentTask = taskMap.get(task.id)!;
      
      if (task.parent_id && taskMap.has(task.parent_id)) {
        const parent = taskMap.get(task.parent_id)!;
        parent.children!.push(currentTask);
        currentTask.level = parent.level + 1;
      } else {
        rootTasks.push(currentTask);
      }
    });

    return rootTasks;
  }, [tasks]);

  // Generate timeline dates
  const timelineDates = useMemo(() => {
    if (tasks.length === 0) return [];
    
    const startDates = tasks.map(t => t.start_date ? new Date(t.start_date) : new Date()).filter(Boolean);
    const endDates = tasks.map(t => t.end_date ? new Date(t.end_date) : new Date()).filter(Boolean);
    
    const earliest = new Date(Math.min(...startDates.map(d => d.getTime())));
    const latest = new Date(Math.max(...endDates.map(d => d.getTime())));
    
    return eachDayOfInterval({
      start: addDays(earliest, -7),
      end: addDays(latest, 14)
    });
  }, [tasks]);

  const dayWidth = screenSize === 'mobile' || screenSize === 'mobile-small' ? 24 : 32;

  // Calculate task bar geometry
  const getTaskBarGeometry = (task: TaskWithHierarchy) => {
    if (!task.start_date || !task.end_date || timelineDates.length === 0) return null;
    
    const startDate = new Date(task.start_date);
    const endDate = new Date(task.end_date);
    
    const startIndex = timelineDates.findIndex(date => 
      isSameDay(date, startDate)
    );
    const endIndex = timelineDates.findIndex(date => 
      isSameDay(date, endDate)
    );
    
    if (startIndex === -1 || endIndex === -1) return null;
    
    return {
      left: startIndex * dayWidth,
      width: Math.max(dayWidth, (endIndex - startIndex + 1) * dayWidth)
    };
  };

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

  // Flatten tasks for rendering
  const flattenTasks = (tasks: TaskWithHierarchy[]): TaskWithHierarchy[] => {
    const result: TaskWithHierarchy[] = [];
    
    const processTask = (task: TaskWithHierarchy) => {
      result.push(task);
      if (expandedTasks.has(task.id) && task.children && task.children.length > 0) {
        task.children.forEach(processTask);
      }
    };
    
    tasks.forEach(processTask);
    return result;
  };

  const flatTasks = flattenTasks(hierarchicalTasks);

  // Render task row
  const renderTaskRow = (task: TaskWithHierarchy, index: number) => {
    const hasChildren = task.children && task.children.length > 0;
    const isExpanded = expandedTasks.has(task.id);
    const isSelected = selectedTask === task.id;
    const isEven = index % 2 === 0;
    const geometry = getTaskBarGeometry(task);

    return (
      <div
        key={task.id}
        className={cn(
          "border-b border-slate-200 transition-all duration-150 cursor-pointer relative group",
          isSelected && "bg-blue-50 border-l-4 border-blue-500",
          !isSelected && isEven && "bg-white hover:bg-blue-25",
          !isSelected && !isEven && "bg-slate-50/60 hover:bg-blue-25"
        )}
        onClick={() => setSelectedTask(task.id)}
      >
        <div className="grid grid-cols-12 min-h-[48px] items-center">
          {/* Task List Section (Left) */}
          <div className="col-span-5 p-3 border-r border-slate-200">
            <div className="flex items-center gap-3" style={{ paddingLeft: `${task.level * 20}px` }}>
              {/* Priority Indicator */}
              <div 
                className="w-1 h-6 rounded-full flex-shrink-0"
                style={{ backgroundColor: getPriorityColor(task.stage) }}
              />
              
              {/* Expand/Collapse Button */}
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 flex-shrink-0 hover:bg-blue-100 rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpanded(task.id);
                  }}
                >
                  {isExpanded ? 
                    <ChevronDown className="h-4 w-4 text-slate-600" /> : 
                    <ChevronRight className="h-4 w-4 text-slate-600" />
                  }
                </Button>
              )}
              
              {/* Task Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-slate-800 truncate">
                    {task.name}
                  </span>
                  {task.stage && (
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs px-2 py-0.5 border-0 font-medium rounded-md",
                        task.stage.toLowerCase() === 'high' && "bg-red-100 text-red-700",
                        task.stage.toLowerCase() === 'medium' && "bg-blue-100 text-blue-700", 
                        task.stage.toLowerCase() === 'low' && "bg-green-100 text-green-700",
                        !['high', 'medium', 'low'].includes(task.stage.toLowerCase()) && "bg-slate-100 text-slate-700"
                      )}
                    >
                      {task.stage}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-xs text-slate-600">
                  {task.start_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{format(new Date(task.start_date), 'MMM d')}</span>
                    </div>
                  )}
                  {task.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{task.duration}d</span>
                    </div>
                  )}
                  {task.assigned_to && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{task.assigned_to}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Section (Right) */}
          <div className="col-span-7 relative h-full" style={{ minHeight: '48px' }}>
            {geometry && (
              <div
                className={cn(
                  "absolute top-2 h-8 rounded-md transition-all duration-200 shadow-sm",
                  "border border-opacity-20"
                )}
                style={{
                  left: `${geometry.left}px`,
                  width: `${geometry.width}px`,
                  backgroundColor: getPriorityColor(task.stage),
                  borderColor: getPriorityColor(task.stage)
                }}
              >
                {/* Progress Bar */}
                <div 
                  className="h-full bg-white/30 rounded-l-md transition-all"
                  style={{ width: `${task.progress || 0}%` }}
                />
                
                {/* Task Name on Bar */}
                {geometry.width > 60 && (
                  <div className="absolute inset-0 flex items-center px-2">
                    <span className="text-white text-xs font-medium truncate">
                      {task.name}
                    </span>
                  </div>
                )}
                
                {/* Progress Percentage */}
                {geometry.width > 80 && (
                  <div className="absolute right-2 top-0 bottom-0 flex items-center">
                    <span className="text-white text-xs font-bold">
                      {task.progress || 0}%
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render timeline header
  const renderTimelineHeader = () => {
    if (timelineDates.length === 0) return null;

    return (
      <div className="border-b border-slate-200 bg-slate-50">
        <div className="grid grid-cols-12 min-h-[40px] items-center">
          {/* Task List Header */}
          <div className="col-span-5 p-3 border-r border-slate-200 bg-slate-100">
            <h3 className="text-sm font-semibold text-slate-700">Task Name</h3>
          </div>
          
          {/* Timeline Header */}
          <div className="col-span-7 relative" style={{ minWidth: `${timelineDates.length * dayWidth}px` }}>
            <div className="flex">
              {timelineDates.map((date, index) => {
                const isToday = isSameDay(date, new Date());
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                
                return (
                  <div
                    key={date.toISOString()}
                    className={cn(
                      "flex-shrink-0 h-10 flex items-center justify-center text-xs font-medium border-r border-slate-200",
                      isToday && "bg-blue-500 text-white",
                      isWeekend && !isToday && "bg-slate-200 text-slate-600",
                      !isWeekend && !isToday && "text-slate-700"
                    )}
                    style={{ width: `${dayWidth}px` }}
                  >
                    {format(date, 'd')}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (flatTasks.length === 0) {
    return (
      <div className="border border-slate-200 rounded-lg bg-white">
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No tasks found</h3>
          <p className="text-slate-600">Create tasks to see your project timeline</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-slate-200 rounded-lg bg-white shadow-sm overflow-hidden">
      {/* Header */}
      {renderTimelineHeader()}
      
      {/* Task Rows */}
      <div className="overflow-auto max-h-[600px]">
        {flatTasks.map((task, index) => renderTaskRow(task, index))}
      </div>
      
      {/* Today Line */}
      {timelineDates.length > 0 && (() => {
        const today = new Date();
        const todayIndex = timelineDates.findIndex(date => isSameDay(date, today));
        if (todayIndex >= 0) {
          const leftPosition = (todayIndex * dayWidth) + (dayWidth / 2);
          return (
            <div
              className="absolute top-10 bottom-0 w-0.5 bg-blue-500 z-10 pointer-events-none"
              style={{ left: `${leftPosition + (window.innerWidth * 0.417)}px` }} // Adjust for left columns
            />
          );
        }
        return null;
      })()}
    </div>
  );
};