import React, { useState, useRef, useEffect, useCallback } from 'react';
import { format, addDays, differenceInDays, parseISO, startOfDay } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Calendar, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Bot, 
  Save,
  Edit,
  Plus,
  Trash2,
  ArrowLeft,
  GripVertical
} from 'lucide-react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useProjects } from '@/hooks/useProjects';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  task_name: string;
  start_date?: string;
  end_date?: string;
  estimated_duration?: number;
  progress: number;
  status: string;
  is_milestone: boolean;
  is_critical_path: boolean;
  assigned_to_name?: string;
  assigned_to_avatar?: string;
  project_id: string;
}

interface ModernGanttChartProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDependencyCreate: (predecessor: string, successor: string) => void;
  onDependencyDelete: (dependencyId: string) => void;
  projectId: string;
}

export const ModernGanttChart: React.FC<ModernGanttChartProps> = ({
  tasks,
  onTaskUpdate,
  onDependencyCreate,
  onDependencyDelete,
  projectId,
}) => {
  const { toast } = useToast();
  const { getProjects } = useProjects();
  const [project, setProject] = useState<any>(null);

  // Load project data
  useEffect(() => {
    const loadProject = async () => {
      try {
        const projects = await getProjects();
        const foundProject = projects.find(p => p.id === projectId);
        setProject(foundProject);
      } catch (error) {
        console.error('Error loading project:', error);
      }
    };
    loadProject();
  }, [projectId, getProjects]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isSkaiActive, setIsSkaiActive] = useState(false);
  const [editValues, setEditValues] = useState<Record<string, Partial<Task>>>({});
  
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const chartScrollRef = useRef<HTMLDivElement>(null);
  
  // Calculate timeline parameters
  const projectStartDate = tasks.length > 0 
    ? new Date(Math.min(...tasks.map(t => t.start_date ? new Date(t.start_date).getTime() : Date.now())))
    : new Date();
  
  const projectEndDate = tasks.length > 0
    ? new Date(Math.max(...tasks.map(t => t.end_date ? new Date(t.end_date).getTime() : Date.now())))
    : addDays(new Date(), 30);
  
  const totalDays = differenceInDays(projectEndDate, projectStartDate) || 30;
  const dayWidth = 40 * zoomLevel;
  const chartWidth = totalDays * dayWidth;
  const rowHeight = 48;
  
  // Generate timeline headers
  const timelineHeaders = React.useMemo(() => {
    const headers = [];
    let currentDate = startOfDay(projectStartDate);
    
    for (let i = 0; i <= totalDays; i++) {
      headers.push({
        date: new Date(currentDate),
        day: currentDate.getDate(),
        month: format(currentDate, 'MMM'),
        isWeekend: currentDate.getDay() === 0 || currentDate.getDay() === 6,
      });
      currentDate = addDays(currentDate, 1);
    }
    
    return headers;
  }, [projectStartDate, totalDays]);
  
  // Synchronized scrolling
  const handleScroll = useCallback((source: 'table' | 'chart', scrollLeft: number) => {
    setScrollPosition(scrollLeft);
    
    if (source === 'table' && chartScrollRef.current) {
      chartScrollRef.current.scrollLeft = scrollLeft;
    } else if (source === 'chart' && tableScrollRef.current) {
      tableScrollRef.current.scrollLeft = scrollLeft;
    }
  }, []);
  
  // Task position calculations
  const getTaskPosition = (task: Task) => {
    if (!task.start_date || !task.end_date) return null;
    
    const startDate = parseISO(task.start_date);
    const endDate = parseISO(task.end_date);
    const startOffset = differenceInDays(startDate, projectStartDate);
    const duration = differenceInDays(endDate, startDate) || 1;
    
    return {
      left: startOffset * dayWidth,
      width: duration * dayWidth,
    };
  };
  
  // Get task status color
  const getTaskStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'hsl(var(--chart-1))';
      case 'in_progress':
      case 'in progress':
        return 'hsl(var(--chart-2))';
      case 'delayed':
        return 'hsl(var(--destructive))';
      case 'pending':
        return 'hsl(var(--muted))';
      default:
        return 'hsl(var(--primary))';
    }
  };
  
  // Start editing task
  const startEditing = (taskId: string, task: Task) => {
    setEditingTask(taskId);
    setEditValues({ [taskId]: { ...task } });
  };
  
  // Save task changes
  const saveTask = (taskId: string) => {
    const updates = editValues[taskId];
    if (updates) {
      onTaskUpdate(taskId, updates);
      setEditingTask(null);
      setEditValues({});
    }
  };
  
  // Cancel editing
  const cancelEditing = () => {
    setEditingTask(null);
    setEditValues({});
  };
  
  // Update edit value
  const updateEditValue = (taskId: string, field: keyof Task, value: any) => {
    setEditValues(prev => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        [field]: value,
      }
    }));
  };
  
  // Activate Skai for live preview
  const activateSkai = async () => {
    setIsSkaiActive(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('skai-agent', {
        body: {
          command: `Analyze and optimize the project schedule for project ${projectId}. Provide live feedback on task dependencies, critical path analysis, and resource allocation suggestions.`,
          context_type: 'project',
          context_id: projectId,
          project_id: projectId,
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Skai Activated",
        description: "AI assistant is now providing live schedule analysis and optimization suggestions.",
      });
      
    } catch (error) {
      console.error('Error activating Skai:', error);
      toast({
        title: "Skai Activation Failed",
        description: "Failed to activate AI assistant. Please try again.",
        variant: "destructive",
      });
      setIsSkaiActive(false);
    }
  };
  
  // Handle navigation back
  const handleBackClick = () => {
    window.history.back();
  };

  // Zoom controls
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev / 1.2, 0.3));

  if (!project) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Project not found</h2>
          <p className="text-muted-foreground">Unable to load project data.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col bg-background">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-4">
            <Calendar className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-xl font-semibold">Project Schedule</h1>
              <p className="text-sm text-muted-foreground">
                Interactive Gantt chart with live Skai integration
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={isSkaiActive ? "default" : "outline"}
              size="sm"
              onClick={activateSkai}
              className="gap-2"
            >
              <Bot className="w-4 h-4" />
              {isSkaiActive ? 'Skai Active' : 'Activate Skai'}
            </Button>
            
            <div className="flex items-center gap-1 border-l pl-2 ml-2">
              <Button variant="outline" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-xs px-2">{Math.round(zoomLevel * 100)}%</span>
              <Button variant="outline" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
            
            <Button variant="outline" size="sm">
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Task Table Panel */}
            <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
              <div className="h-full border-r border-border bg-card flex flex-col">
                <div className="p-3 border-b border-border">
                  <h3 className="font-medium">Tasks</h3>
                </div>
                
                <div className="flex-1 overflow-auto">
                  {tasks.map((task, index) => (
                    <div
                      key={task.id}
                      className={cn(
                        "border-b border-border p-3 hover:bg-muted/50 transition-colors",
                        index % 2 === 0 ? "bg-background" : "bg-muted/20"
                      )}
                      style={{ height: rowHeight }}
                    >
                      {editingTask === task.id ? (
                        <div className="space-y-2">
                          <Input
                            value={editValues[task.id]?.task_name || task.task_name}
                            onChange={(e) => updateEditValue(task.id, 'task_name', e.target.value)}
                            className="h-6 text-sm"
                          />
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => saveTask(task.id)}>
                              <Save className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={cancelEditing}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{task.task_name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge 
                                variant="secondary" 
                                className="text-xs"
                                style={{ backgroundColor: getTaskStatusColor(task.status) + '20' }}
                              >
                                {task.status}
                              </Badge>
                              {task.is_critical_path && (
                                <Badge variant="outline" className="text-xs border-amber-400 text-amber-600">
                                  Critical
                                </Badge>
                              )}
                            </div>
                            <div className="mt-1">
                              <Progress value={task.progress} className="h-1" />
                              <span className="text-xs text-muted-foreground">{task.progress}%</span>
                            </div>
                          </div>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEditing(task.id, task)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </ResizablePanel>
            
            {/* Resizable Handle */}
            <ResizableHandle className="w-2 bg-border hover:bg-primary/20 transition-colors flex items-center justify-center group">
              <GripVertical className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
            </ResizableHandle>
            
            {/* Chart Area Panel */}
            <ResizablePanel defaultSize={70} minSize={50}>
              <div className="h-full flex flex-col overflow-hidden bg-background">
                {/* Timeline Header */}
                <div className="h-16 border-b border-border bg-card overflow-hidden">
                  <div
                    ref={chartScrollRef}
                    className="h-full overflow-x-auto overflow-y-hidden"
                    onScroll={(e) => handleScroll('chart', e.currentTarget.scrollLeft)}
                  >
                    <div style={{ width: chartWidth, minWidth: '100%' }}>
                      {/* Month headers */}
                      <div className="h-8 flex border-b border-border">
                        {timelineHeaders.reduce((months: any[], header, index) => {
                          const monthKey = `${header.date.getFullYear()}-${header.date.getMonth()}`;
                          const existingMonth = months.find(m => m.key === monthKey);
                          
                          if (!existingMonth) {
                            months.push({
                              key: monthKey,
                              label: format(header.date, 'MMM yyyy'),
                              startIndex: index,
                              count: 1,
                            });
                          } else {
                            existingMonth.count++;
                          }
                          
                          return months;
                        }, []).map(month => (
                          <div
                            key={month.key}
                            className="flex items-center justify-center text-sm font-medium border-r border-border last:border-r-0 bg-muted/50"
                            style={{ width: month.count * dayWidth }}
                          >
                            {month.label}
                          </div>
                        ))}
                      </div>
                      
                      {/* Day headers */}
                      <div className="h-8 flex">
                        {timelineHeaders.map((header, index) => (
                          <div
                            key={index}
                            className={cn(
                              "flex items-center justify-center text-xs border-r border-border last:border-r-0",
                              header.isWeekend ? 'bg-muted text-muted-foreground' : 'bg-background'
                            )}
                            style={{ width: dayWidth }}
                          >
                            {header.day}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Chart Content */}
                <div className="flex-1 overflow-auto">
                  <div
                    ref={tableScrollRef}
                    className="overflow-x-auto overflow-y-hidden"
                    onScroll={(e) => handleScroll('table', e.currentTarget.scrollLeft)}
                  >
                    <div style={{ width: chartWidth, minWidth: '100%' }}>
                      {tasks.map((task, index) => {
                        const position = getTaskPosition(task);
                        
                        return (
                          <div
                            key={task.id}
                            className={cn(
                              "relative border-b border-border hover:bg-muted/20 transition-colors",
                              index % 2 === 0 ? "bg-background" : "bg-muted/10"
                            )}
                            style={{ height: rowHeight }}
                          >
                            {/* Grid background */}
                            <div className="absolute inset-0 flex">
                              {timelineHeaders.map((header, dayIndex) => (
                                <div
                                  key={dayIndex}
                                  className={cn(
                                    "border-r border-border/50 last:border-r-0",
                                    header.isWeekend ? 'bg-muted/30' : ''
                                  )}
                                  style={{ width: dayWidth }}
                                />
                              ))}
                            </div>
                            
                            {/* Task bar */}
                            {position && (
                              <div
                                className="absolute top-2 bottom-2 rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                                style={{
                                  left: position.left,
                                  width: position.width,
                                  backgroundColor: getTaskStatusColor(task.status),
                                  minWidth: '20px',
                                }}
                              >
                                {/* Progress overlay */}
                                <div
                                  className="absolute inset-0 bg-white/20 rounded-md"
                                  style={{ width: `${task.progress}%` }}
                                />
                                
                                {/* Task content */}
                                <div className="absolute inset-0 flex items-center px-2 text-white text-xs font-medium">
                                  <span className="truncate">
                                    {task.task_name}
                                  </span>
                                </div>
                                
                                {/* Resize handles */}
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/30 opacity-0 group-hover:opacity-100 cursor-w-resize" />
                                <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/30 opacity-0 group-hover:opacity-100 cursor-e-resize" />
                              </div>
                            )}
                            
                            {/* Milestone indicator */}
                            {task.is_milestone && position && (
                              <div
                                className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-amber-500 rotate-45 border border-white shadow-sm"
                                style={{ left: position.left + position.width - 6 }}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
        
        {/* Status Bar */}
        <div className="h-8 bg-muted/50 border-t border-border flex items-center justify-between px-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Tasks: {tasks.length}</span>
            <span>Duration: {totalDays} days</span>
            <span>Critical Path: {tasks.filter(t => t.is_critical_path).length} tasks</span>
          </div>
          
          {isSkaiActive && (
            <div className="flex items-center gap-2 text-primary">
              <Bot className="w-3 h-3 animate-pulse" />
              <span>Skai AI Assistant Active</span>
            </div>
          )}
        </div>
    </div>
  );
};