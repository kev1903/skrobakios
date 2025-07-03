import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight, Calendar, Users, Grip, Plus, Edit, Trash2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export interface GanttTask {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  progress: number;
  color: string;
  level: number;
  children?: GanttTask[];
  expanded?: boolean;
  type: 'milestone' | 'task' | 'group';
  assignee?: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'on-hold' | 'blocked' | 'review';
  dependencies?: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  effort?: number; // in hours
  actualStart?: string;
  actualEnd?: string;
}

interface GanttChartProps {
  tasks: GanttTask[];
  startDate: Date;
  endDate: Date;
  onTaskUpdate?: (task: GanttTask) => void;
  onTaskCreate?: (parentId?: string) => void;
  onTaskDelete?: (taskId: string) => void;
  readOnly?: boolean;
  showWeekends?: boolean;
  zoomLevel?: 'days' | 'weeks' | 'months';
}

interface TimelineUnit {
  start: Date;
  end: Date;
  label: string;
  isWeekend?: boolean;
}

export const GanttChart = ({ 
  tasks, 
  startDate, 
  endDate, 
  onTaskUpdate,
  onTaskCreate,
  onTaskDelete,
  readOnly = false,
  showWeekends = true,
  zoomLevel = 'weeks'
}: GanttChartProps) => {
  const { toast } = useToast();
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set(['project-kickoff', 'research-analysis', 'wireframing', 'visual-design', 'prototyping']));
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);
  const [currentZoom, setCurrentZoom] = useState<'days' | 'weeks' | 'months'>(zoomLevel);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Enhanced date utilities with proper error handling
  const getDateDifference = useCallback((start: Date, end: Date): number => {
    try {
      const diffTime = end.getTime() - start.getTime();
      return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    } catch (error) {
      console.error('Error calculating date difference:', error);
      return 0;
    }
  }, []);

  const isValidDate = useCallback((date: any): boolean => {
    return date instanceof Date && !isNaN(date.getTime());
  }, []);

  const parseDate = useCallback((dateString: string): Date => {
    try {
      const date = new Date(dateString);
      if (!isValidDate(date)) {
        throw new Error(`Invalid date: ${dateString}`);
      }
      return date;
    } catch (error) {
      console.error('Error parsing date:', error);
      return new Date(); // fallback to current date
    }
  }, [isValidDate]);

  // Generate timeline units based on zoom level
  const getTimelineUnits = useCallback((): TimelineUnit[] => {
    const units: TimelineUnit[] = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      let unitEnd: Date;
      let label: string;
      
      switch (currentZoom) {
        case 'days':
          unitEnd = new Date(current);
          unitEnd.setDate(unitEnd.getDate() + 1);
          label = current.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
          break;
        case 'weeks':
          unitEnd = new Date(current);
          unitEnd.setDate(unitEnd.getDate() + 7);
          const weekNum = Math.ceil(getDateDifference(startDate, current) / 7) + 1;
          label = `W${weekNum} ${current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
          break;
        case 'months':
          unitEnd = new Date(current.getFullYear(), current.getMonth() + 1, 1);
          label = current.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          break;
        default:
          unitEnd = new Date(current);
          unitEnd.setDate(unitEnd.getDate() + 7);
          label = 'Week';
      }

      const isWeekend = currentZoom === 'days' && (current.getDay() === 0 || current.getDay() === 6);
      
      units.push({
        start: new Date(current),
        end: unitEnd,
        label,
        isWeekend
      });

      current.setTime(unitEnd.getTime());
    }
    
    return units;
  }, [startDate, endDate, currentZoom, getDateDifference]);

  // Calculate task position with improved accuracy
  const getTaskPosition = useCallback((task: GanttTask): { left: string; width: string; } => {
    try {
      const taskStart = parseDate(task.startDate);
      const taskEnd = parseDate(task.endDate);
      
      if (!isValidDate(taskStart) || !isValidDate(taskEnd)) {
        return { left: '0%', width: '0%' };
      }

      const totalDuration = getDateDifference(startDate, endDate);
      const startOffset = getDateDifference(startDate, taskStart);
      const taskDuration = getDateDifference(taskStart, taskEnd) + 1; // +1 to include end date

      if (totalDuration === 0) {
        return { left: '0%', width: '100%' };
      }

      const leftPercent = Math.max(0, (startOffset / totalDuration) * 100);
      const widthPercent = Math.min(100 - leftPercent, (taskDuration / totalDuration) * 100);

      return {
        left: `${leftPercent}%`,
        width: `${Math.max(1, widthPercent)}%` // Minimum 1% width for visibility
      };
    } catch (error) {
      console.error('Error calculating task position:', error);
      return { left: '0%', width: '1%' };
    }
  }, [startDate, endDate, getDateDifference, parseDate, isValidDate]);

  // Enhanced task flattening with proper hierarchy handling
  const flattenTasks = useCallback((tasks: GanttTask[], parentExpanded = true, parentLevel = -1): GanttTask[] => {
    const result: GanttTask[] = [];
    
    for (const task of tasks) {
      const adjustedTask = { ...task, level: parentLevel + 1 };
      
      if (parentExpanded) {
        result.push(adjustedTask);
        
        if (task.children && task.children.length > 0 && expandedTasks.has(task.id)) {
          result.push(...flattenTasks(task.children, true, adjustedTask.level));
        }
      }
    }
    
    return result;
  }, [expandedTasks]);

  // Task management functions
  const toggleExpanded = useCallback((taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  }, []);

  const handleTaskClick = useCallback((taskId: string) => {
    setSelectedTask(selectedTask === taskId ? null : taskId);
  }, [selectedTask]);

  const handleTaskUpdate = useCallback((taskId: string, updates: Partial<GanttTask>) => {
    if (readOnly || !onTaskUpdate) return;
    
    const findAndUpdateTask = (tasks: GanttTask[]): GanttTask[] => {
      return tasks.map(task => {
        if (task.id === taskId) {
          const updatedTask = { ...task, ...updates };
          onTaskUpdate(updatedTask);
          return updatedTask;
        }
        if (task.children) {
          return { ...task, children: findAndUpdateTask(task.children) };
        }
        return task;
      });
    };

    findAndUpdateTask(tasks);
    
    toast({
      title: "Task Updated",
      description: `Task "${tasks.find(t => t.id === taskId)?.name}" has been updated.`,
    });
  }, [readOnly, onTaskUpdate, tasks, toast]);

  const getStatusColor = useCallback((status: GanttTask['status']): string => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'review': return 'bg-yellow-500';
      case 'on-hold': return 'bg-yellow-500';
      case 'blocked': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  }, []);

  const getPriorityColor = useCallback((priority: GanttTask['priority']): string => {
    switch (priority) {
      case 'critical': return 'border-l-4 border-red-500';
      case 'high': return 'border-l-4 border-orange-500';
      case 'medium': return 'border-l-4 border-yellow-500';
      default: return 'border-l-4 border-gray-300';
    }
  }, []);

  // Zoom controls
  const handleZoomChange = useCallback((newZoom: 'days' | 'weeks' | 'months') => {
    setCurrentZoom(newZoom);
    toast({
      title: "Zoom Changed",
      description: `Timeline view changed to ${newZoom}`,
    });
  }, [toast]);

  const timelineUnits = getTimelineUnits();
  const flatTasks = flattenTasks(tasks);
  const unitWidth = currentZoom === 'days' ? 80 : currentZoom === 'weeks' ? 120 : 160;
  const timelineWidth = timelineUnits.length * unitWidth;

  // Calculate completion percentage
  const completionStats = flatTasks.reduce((acc, task) => {
    if (task.type !== 'group') {
      acc.total++;
      if (task.status === 'completed') acc.completed++;
    }
    return acc;
  }, { total: 0, completed: 0 });

  const completionPercentage = completionStats.total > 0 
    ? Math.round((completionStats.completed / completionStats.total) * 100) 
    : 0;

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Top Header with Filters */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Button 
              size="sm" 
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={() => onTaskCreate && onTaskCreate()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add work
            </Button>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Today</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>All tasks</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>Filter</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>Color: Default</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>Months</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>Gantt Option</span>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-auto" style={{ maxHeight: '70vh' }}>
        {/* Table Header */}
        <div className="flex border-b border-gray-200 sticky top-0 bg-white z-10 shadow-sm">
          <div className="w-80 p-3 border-r border-gray-200 bg-gray-50 flex-shrink-0">
            <span className="text-sm font-medium text-gray-700">Task Name</span>
          </div>
          <div className="w-24 p-3 border-r border-gray-200 bg-gray-50 flex-shrink-0">
            <span className="text-sm font-medium text-gray-700">Status</span>
          </div>
          <div className="w-32 p-3 border-r border-gray-200 bg-gray-50 flex-shrink-0">
            <span className="text-sm font-medium text-gray-700">Contributor</span>
          </div>
          <div className="w-32 p-3 border-r border-gray-200 bg-gray-50 flex-shrink-0">
            <span className="text-sm font-medium text-gray-700">Date range</span>
          </div>
          
          {/* Timeline Headers - May and June */}
          <div className="flex bg-gray-50">
            <div className="w-40 p-3 border-r border-gray-200 text-center">
              <span className="text-sm font-medium text-gray-900">May</span>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                {[21, 22, 23, 24, 25, 26, 27, 28, 29, 30].map(day => (
                  <span key={day} className="w-3 text-center">{day}</span>
                ))}
              </div>
            </div>
            <div className="w-40 p-3 text-center">
              <span className="text-sm font-medium text-gray-900">June</span>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(day => (
                  <span key={day} className="w-3 text-center">{day}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Task Rows */}
        <div className="relative">
          {flatTasks.map((task, index) => {
            const isSelected = selectedTask === task.id;
            const isHovered = hoveredTask === task.id;
            const taskPosition = getTaskPosition(task);
            
            return (
              <div 
                key={task.id} 
                className={cn(
                  "flex border-b border-gray-100 hover:bg-blue-50/50 transition-colors duration-150",
                  isSelected && "bg-blue-100/70 ring-2 ring-blue-300",
                  getPriorityColor(task.priority)
                )}
                onMouseEnter={() => setHoveredTask(task.id)}
                onMouseLeave={() => setHoveredTask(null)}
              >
                {/* Task Name Column */}
                <div className="w-80 p-3 border-r border-gray-200 flex items-center flex-shrink-0">
                  <div 
                    className="flex items-center w-full" 
                    style={{ marginLeft: `${task.level * 16}px` }}
                  >
                    {task.children && task.children.length > 0 && (
                      <button
                        onClick={() => toggleExpanded(task.id)}
                        className="mr-2 p-1 hover:bg-gray-200 rounded transition-colors"
                        aria-label={expandedTasks.has(task.id) ? 'Collapse' : 'Expand'}
                      >
                        {expandedTasks.has(task.id) ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <span 
                        className={cn(
                          "text-sm font-medium truncate cursor-pointer hover:text-blue-600 transition-colors",
                          task.type === 'group' && "font-semibold text-gray-900",
                          task.status === 'completed' && "text-gray-900"
                        )}
                        onClick={() => handleTaskClick(task.id)}
                        title={task.name}
                      >
                        {task.name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Column */}
                <div className="w-24 p-3 border-r border-gray-200 flex items-center flex-shrink-0">
                  <div className={cn("w-2 h-2 rounded-full", getStatusColor(task.status))} title={task.status}></div>
                  <span className="ml-2 text-xs text-gray-600 capitalize">
                    {task.status === 'in-progress' ? 'In progress' : task.status}
                  </span>
                </div>

                {/* Contributor Column */}
                <div className="w-32 p-3 border-r border-gray-200 flex items-center flex-shrink-0">
                  <span className="text-sm text-gray-700">{task.assignee || '-'}</span>
                </div>

                {/* Date Range Column */}
                <div className="w-32 p-3 border-r border-gray-200 flex items-center flex-shrink-0">
                  <span className="text-sm text-gray-700">
                    {task.startDate && task.endDate 
                      ? `${new Date(task.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(task.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                      : task.startDate 
                        ? new Date(task.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : 'Today'
                    }
                  </span>
                </div>

                {/* Timeline Column */}
                <div 
                  className="relative h-12 bg-white flex-shrink-0" 
                  style={{ width: '320px' }}
                >
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex">
                    {/* May Column */}
                    <div className="w-40 border-r border-gray-200 bg-gray-50/30"></div>
                    {/* June Column */}
                    <div className="w-40 bg-gray-50/30"></div>
                  </div>
                  
                  {/* Task Bar */}
                  {task.type !== 'milestone' && task.startDate && task.endDate && (
                    <div
                      className={cn(
                        "absolute top-2 h-8 rounded-md flex items-center px-2 text-xs text-white font-medium shadow-sm transition-all duration-200 cursor-pointer",
                        isHovered && "shadow-lg scale-105 z-10",
                        isSelected && "ring-2 ring-white ring-offset-1 z-10"
                      )}
                      style={{
                        ...getTaskPosition(task),
                        backgroundColor: task.color,
                        minWidth: '20px'
                      }}
                      onClick={() => handleTaskClick(task.id)}
                      title={`${task.name} (${task.progress}% complete)`}
                    >
                      <span className="truncate flex-1">{task.name}</span>
                      
                      {/* Progress Overlay */}
                      {task.progress > 0 && (
                        <div
                          className="absolute top-0 left-0 h-full bg-black bg-opacity-20 rounded-md"
                          style={{ width: `${Math.min(100, task.progress)}%` }}
                        />
                      )}
                    </div>
                  )}

                  {/* Milestone Diamond */}
                  {task.type === 'milestone' && (
                    <div
                      className={cn(
                        "absolute top-4 w-4 h-4 rotate-45 shadow-md transition-all duration-200 cursor-pointer",
                        isHovered && "scale-125 shadow-lg z-10",
                        isSelected && "ring-2 ring-white ring-offset-1 z-10"
                      )}
                      style={{
                        left: taskPosition.left,
                        backgroundColor: task.color
                      }}
                      onClick={() => handleTaskClick(task.id)}
                      title={`Milestone: ${task.name}`}
                    />
                  )}

                  {/* Dependency Lines */}
                  {task.dependencies && task.dependencies.length > 0 && (
                    <div className="absolute inset-0 pointer-events-none">
                      {task.dependencies.map(depId => {
                        const depTask = flatTasks.find(t => t.id === depId);
                        if (!depTask) return null;
                        
                        const depPosition = getTaskPosition(depTask);
                        const taskPos = getTaskPosition(task);
                        
                        return (
                          <svg
                            key={depId}
                            className="absolute inset-0 w-full h-full"
                            style={{ pointerEvents: 'none' }}
                          >
                            <defs>
                              <marker
                                id="arrowhead"
                                markerWidth="10"
                                markerHeight="7"
                                refX="9"
                                refY="3.5"
                                orient="auto"
                              >
                                <polygon
                                  points="0 0, 10 3.5, 0 7"
                                  fill="#6B7280"
                                />
                              </marker>
                            </defs>
                            <line
                              x1={`calc(${depPosition.left} + ${depPosition.width})`}
                              y1="24"
                              x2={taskPos.left}
                              y2="24"
                              stroke="#6B7280"
                              strokeWidth="2"
                              markerEnd="url(#arrowhead)"
                            />
                          </svg>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Details Panel (when selected) */}
      {selectedTask && (() => {
        const task = flatTasks.find(t => t.id === selectedTask);
        if (!task) return null;
        
        return (
          <div className="border-t border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Task Details</h4>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedTask(null)}
              >
                ×
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Start Date:</span>
                <div className="font-medium">{new Date(task.startDate).toLocaleDateString()}</div>
              </div>
              <div>
                <span className="text-gray-500">End Date:</span>
                <div className="font-medium">{new Date(task.endDate).toLocaleDateString()}</div>
              </div>
              <div>
                <span className="text-gray-500">Progress:</span>
                <div className="font-medium">{task.progress}%</div>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <Badge variant="outline" className="ml-1">
                  {task.status.replace('-', ' ')}
                </Badge>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};