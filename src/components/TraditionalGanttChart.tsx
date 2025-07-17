import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Bot, ZoomIn, ZoomOut, Calendar, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Task {
  id: string;
  task_name: string;
  task_type: string;
  status: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  progress_percentage: number;
  dependencies?: string[];
  is_critical_path?: boolean;
}

interface TraditionalGanttChartProps {
  tasks: Task[];
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
}

export const TraditionalGanttChart: React.FC<TraditionalGanttChartProps> = ({ 
  tasks, 
  onTaskUpdate 
}) => {
  const { toast } = useToast();
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Sample data with dependencies
  const sampleTasks = useMemo(() => [
    {
      id: '1',
      task_name: 'Initial Consultation',
      task_type: 'consultation',
      status: 'complete',
      start_date: '2025-07-13',
      end_date: '2025-07-15',
      duration_days: 3,
      progress_percentage: 100,
      dependencies: [],
      is_critical_path: false
    },
    {
      id: '2', 
      task_name: 'Concept Design',
      task_type: 'design',
      status: 'pending',
      start_date: '2025-07-16',
      end_date: '2025-07-19',
      duration_days: 3,
      progress_percentage: 0,
      dependencies: ['1'],
      is_critical_path: true
    },
    {
      id: '3',
      task_name: 'Detailed Design',
      task_type: 'design', 
      status: 'pending',
      start_date: '2025-07-20',
      end_date: '2025-07-24',
      duration_days: 4,
      progress_percentage: 0,
      dependencies: ['2'],
      is_critical_path: true
    },
    {
      id: '4',
      task_name: 'Review and Approval',
      task_type: 'review',
      status: 'pending',
      start_date: '2025-07-25',
      end_date: '2025-07-27',
      duration_days: 2,
      progress_percentage: 0,
      dependencies: ['3'],
      is_critical_path: true
    }
  ], []);

  const activeTasks = tasks.length > 0 ? tasks : sampleTasks;
  
  const filteredTasks = useMemo(() => {
    if (statusFilter === 'all') return activeTasks;
    return activeTasks.filter(task => task.status === statusFilter);
  }, [activeTasks, statusFilter]);

  const getProjectStart = () => {
    if (filteredTasks.length === 0) return new Date();
    return new Date(Math.min(...filteredTasks.map(t => new Date(t.start_date).getTime())));
  };

  const getProjectEnd = () => {
    if (filteredTasks.length === 0) return new Date();
    return new Date(Math.max(...filteredTasks.map(t => new Date(t.end_date).getTime())));
  };

  const projectStart = getProjectStart();
  const projectEnd = getProjectEnd();
  const totalDays = Math.ceil((projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24)) || 1;

  const getTaskPosition = (task: Task) => {
    const taskStart = new Date(task.start_date);
    const startOffset = Math.ceil((taskStart.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24));
    const left = (startOffset / totalDays) * 100;
    const width = (task.duration_days / totalDays) * 100;
    
    return { left: `${left}%`, width: `${width}%` };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'hsl(var(--primary))';
      case 'in-progress':
        return 'hsl(var(--secondary))';
      case 'delayed':
        return 'hsl(var(--destructive))';
      case 'pending':
        return 'hsl(var(--muted-foreground))';
      default:
        return 'hsl(var(--muted-foreground))';
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      complete: { variant: 'default' as const, label: 'Complete' },
      'in-progress': { variant: 'secondary' as const, label: 'In Progress' },
      pending: { variant: 'outline' as const, label: 'Pending' },
      delayed: { variant: 'destructive' as const, label: 'Delayed' }
    };

    const config = variants[status as keyof typeof variants] || variants.pending;
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-AU', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleOptimizeSchedule = async () => {
    setIsOptimizing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('optimize-schedule', {
        body: { tasks: activeTasks, bufferDays: 2 }
      });

      if (error) throw error;

      if (data?.success === false) {
        toast({
          title: "Optimization Notice",
          description: data.error || 'AI optimization not available. Using current schedule.',
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Schedule Optimized",
        description: "AI-powered schedule optimization completed with 2-day buffer",
      });

      console.log('Optimization result:', data);
      
    } catch (error) {
      console.error('Error optimizing schedule:', error);
      toast({
        title: "Optimization Failed",
        description: "Failed to optimize the schedule. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleTaskBarDrag = (taskId: string, event: React.MouseEvent) => {
    if (!onTaskUpdate) return;
    
    setDraggedTask(taskId);
    setIsDragging(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!timelineRef.current) return;
      
      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      const newStartDays = Math.floor((percentage / 100) * totalDays);
      
      const newStartDate = new Date(projectStart);
      newStartDate.setDate(newStartDate.getDate() + newStartDays);
      
      const task = filteredTasks.find(t => t.id === taskId);
      if (task) {
        const newEndDate = new Date(newStartDate);
        newEndDate.setDate(newEndDate.getDate() + task.duration_days);
        
        onTaskUpdate(taskId, {
          start_date: newStartDate.toISOString().split('T')[0],
          end_date: newEndDate.toISOString().split('T')[0]
        });
      }
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      setDraggedTask(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const renderDependencyArrows = () => {
    const arrows: JSX.Element[] = [];
    
    filteredTasks.forEach((task, taskIndex) => {
      if (task.dependencies && task.dependencies.length > 0) {
        task.dependencies.forEach(depId => {
          const depTaskIndex = filteredTasks.findIndex(t => t.id === depId);
          if (depTaskIndex !== -1) {
            const depPosition = getTaskPosition(filteredTasks[depTaskIndex]);
            const taskPosition = getTaskPosition(task);
            
            const startX = parseFloat(depPosition.left) + parseFloat(depPosition.width);
            const endX = parseFloat(taskPosition.left);
            const startY = (depTaskIndex * 60) + 30;
            const endY = (taskIndex * 60) + 30;
            
            const isCaritical = task.is_critical_path;
            
            arrows.push(
              <svg
                key={`arrow-${depId}-${task.id}`}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                style={{ zIndex: 1 }}
              >
                <defs>
                  <marker
                    id={`arrowhead-${depId}-${task.id}`}
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3.5, 0 7"
                      fill={isCaritical ? '#f59e0b' : '#06b6d4'}
                    />
                  </marker>
                </defs>
                <path
                  d={`M ${startX}% ${startY} Q ${(startX + endX) / 2}% ${(startY + endY) / 2} ${endX}% ${endY}`}
                  stroke={isCaritical ? '#f59e0b' : '#06b6d4'}
                  strokeWidth={isCaritical ? "3" : "2"}
                  fill="none"
                  markerEnd={`url(#arrowhead-${depId}-${task.id})`}
                  className="opacity-80"
                />
              </svg>
            );
          }
        });
      }
    });
    
    return arrows;
  };

  const generateTimelineHeaders = () => {
    const headers = [];
    const dayWidth = 100 / totalDays;
    
    for (let i = 0; i < totalDays; i++) {
      const date = new Date(projectStart);
      date.setDate(date.getDate() + i);
      
      headers.push(
        <div
          key={i}
          className="text-xs text-center py-2 border-r border-border last:border-r-0 text-muted-foreground"
          style={{ width: `${dayWidth * zoom}%`, minWidth: '40px' }}
        >
          {date.getDate()}
          {i % 7 === 0 && (
            <div className="text-xs font-medium">
              {date.toLocaleDateString('en-AU', { month: 'short' })}
            </div>
          )}
        </div>
      );
    }
    
    return headers;
  };

  return (
    <TooltipProvider>
      <Card className="w-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Project Timeline</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Traditional Gantt chart with interactive scheduling • Total: {totalDays} days
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="delayed">Delayed</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                onClick={handleOptimizeSchedule}
                disabled={isOptimizing}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Bot className="h-4 w-4" />
                {isOptimizing ? 'Optimizing...' : 'Optimize Schedule'}
              </Button>
              
              <Button
                onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                variant="outline"
                size="sm"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              
              <Button
                onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                variant="outline"
                size="sm"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="flex h-[500px]">
            {/* Left Table */}
            <div className="w-1/2 border-r border-border bg-muted/30">
              {/* Table Header */}
              <div className="grid grid-cols-6 gap-2 p-4 border-b border-border bg-background font-medium text-sm">
                <div className="col-span-2">Activity Name</div>
                <div>Duration</div>
                <div>Start Date</div>
                <div>End Date</div>
                <div>Status</div>
              </div>
              
              {/* Table Rows */}
              <div className="overflow-y-auto" style={{ height: 'calc(100% - 60px)' }}>
                {filteredTasks.map((task, index) => (
                  <div
                    key={task.id}
                    className={`grid grid-cols-6 gap-2 p-4 border-b border-border hover:bg-muted/50 transition-colors ${
                      task.is_critical_path ? 'bg-amber-50 border-l-4 border-l-amber-400' : ''
                    }`}
                    style={{ height: '60px' }}
                  >
                    <div className="col-span-2 flex items-center">
                      <div>
                        <div className="font-medium text-sm">{(task as any).activity_name || task.task_name}</div>
                        {task.dependencies && task.dependencies.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            Depends on: {task.dependencies.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center text-sm">{task.duration_days}d</div>
                    <div className="flex items-center text-sm">{formatDate(task.start_date)}</div>
                    <div className="flex items-center text-sm">{formatDate(task.end_date)}</div>
                    <div className="flex items-center">
                      {getStatusBadge(task.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Right Timeline */}
            <div className="w-1/2 bg-background">
              {/* Timeline Header */}
              <div className="border-b border-border bg-muted/30 overflow-x-auto">
                <div className="flex" style={{ minWidth: `${100 * zoom}%` }}>
                  {generateTimelineHeaders()}
                </div>
              </div>
              
              {/* Timeline Bars */}
              <div className="relative overflow-auto" style={{ height: 'calc(100% - 60px)' }} ref={timelineRef}>
                {renderDependencyArrows()}
                
                <div className="relative" style={{ minWidth: `${100 * zoom}%` }}>
                  {filteredTasks.map((task, index) => {
                    const position = getTaskPosition(task);
                    
                    return (
                      <div
                        key={task.id}
                        className="relative"
                        style={{ height: '60px' }}
                      >
                        <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2" style={{ zIndex: 2 }}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={`relative h-8 rounded cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-md ${
                                  task.is_critical_path ? 'ring-2 ring-amber-400 ring-opacity-50' : ''
                                } ${isDragging && draggedTask === task.id ? 'opacity-70' : ''}`}
                                style={{
                                  left: position.left,
                                  width: position.width,
                                  backgroundColor: getStatusColor(task.status),
                                  minWidth: '40px'
                                }}
                                onMouseDown={(e) => handleTaskBarDrag(task.id, e)}
                              >
                                {/* Progress Fill */}
                                <div
                                  className="absolute inset-0 bg-white/20 rounded"
                                  style={{ width: `${task.progress_percentage}%` }}
                                />
                                
                                {/* Task Label */}
                                <div className="absolute inset-0 flex items-center px-2 text-white text-xs font-medium truncate">
                                  {task.progress_percentage}%
                                </div>
                                
                                {/* Critical Path Indicator */}
                                {task.is_critical_path && (
                                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-white" />
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="p-2">
                                <p className="font-medium">{task.task_name}</p>
                                <p className="text-sm text-muted-foreground">Type: {task.task_type}</p>
                                <p className="text-sm text-muted-foreground">Duration: {task.duration_days} days</p>
                                <p className="text-sm text-muted-foreground">Progress: {task.progress_percentage}%</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(task.start_date)} - {formatDate(task.end_date)}
                                </p>
                                {task.is_critical_path && (
                                  <p className="text-sm text-amber-600 font-medium">⚠ Critical Path</p>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="border-t border-border p-4 bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(var(--primary))' }}></div>
                  <span>Complete</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(var(--secondary))' }}></div>
                  <span>In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(var(--destructive))' }}></div>
                  <span>Delayed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(var(--muted-foreground))' }}></div>
                  <span>Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
                  <span>Critical Path</span>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground">
                Drag bars to reschedule • Critical path: 15 days total
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};