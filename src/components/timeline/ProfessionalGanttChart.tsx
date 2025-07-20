import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  addDays, 
  addMonths,
  differenceInDays, 
  isToday, 
  isSameDay,
  isWeekend,
  startOfWeek,
  endOfWeek,
  startOfYear,
  endOfYear
} from 'date-fns';
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Edit2, 
  Trash2, 
  Calendar,
  User,
  Flag,
  CheckCircle,
  Clock,
  Circle,
  MoreHorizontal,
  ZoomIn,
  ZoomOut,
  Save,
  X,
  Link,
  FileText,
  Settings,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

export interface ProfessionalGanttTask {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'on-hold' | 'delayed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee?: string;
  duration: string;
  category?: string;
  parentId?: string;
  isStage?: boolean;
  isMilestone?: boolean;
  dependencies?: string[];
  description?: string;
  color?: string;
  estimatedHours?: number;
  actualHours?: number;
  budget?: number;
  actualCost?: number;
  tags?: string[];
}

interface ProfessionalGanttChartProps {
  tasks: ProfessionalGanttTask[];
  onTaskUpdate?: (taskId: string, updates: Partial<ProfessionalGanttTask>) => void;
  onTaskAdd?: (task: Omit<ProfessionalGanttTask, 'id'>, parentId?: string) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskDuplicate?: (taskId: string) => void;
  readOnly?: boolean;
}

type ViewMode = 'days' | 'weeks' | 'months' | 'quarters';
type ZoomLevel = 0.5 | 0.75 | 1 | 1.5 | 2;

export const ProfessionalGanttChart = ({
  tasks,
  onTaskUpdate,
  onTaskAdd,
  onTaskDelete,
  onTaskDuplicate,
  readOnly = false
}: ProfessionalGanttChartProps) => {
  // State Management
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [viewStart, setViewStart] = useState(() => {
    const earliest = tasks.reduce((min, task) => task.startDate < min ? task.startDate : min, new Date());
    return startOfMonth(earliest);
  });
  const [viewMode, setViewMode] = useState<ViewMode>('days');
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>(1);
  const [showCriticalPath, setShowCriticalPath] = useState(false);
  const [showDependencies, setShowDependencies] = useState(true);
  const [showWeekends, setShowWeekends] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    assignee: 'all',
    tag: 'all'
  });
  const [dragState, setDragState] = useState<{
    taskId: string;
    type: 'move' | 'resize-start' | 'resize-end' | 'progress';
    startX: number;
    originalStart: Date;
    originalEnd: Date;
    originalProgress: number;
  } | null>(null);

  // Refs
  const ganttContainerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Calculate view configuration
  const getViewConfig = () => {
    const baseConfig = {
      days: { unit: 'day', width: 24, format: 'd', headerFormat: 'MMM yyyy' },
      weeks: { unit: 'week', width: 140, format: 'w', headerFormat: 'MMM yyyy' },
      months: { unit: 'month', width: 120, format: 'MMM', headerFormat: 'yyyy' },
      quarters: { unit: 'quarter', width: 200, format: 'QQQ', headerFormat: 'yyyy' }
    };
    
    const config = baseConfig[viewMode];
    return {
      ...config,
      width: config.width * zoomLevel
    };
  };

  // Generate time periods based on view mode
  const getTimePeriods = useMemo(() => {
    const config = getViewConfig();
    let current = viewStart;
    const end = addMonths(viewStart, viewMode === 'quarters' ? 24 : viewMode === 'months' ? 12 : 6);
    const periods = [];

    while (current <= end) {
      periods.push(new Date(current));
      
      switch (viewMode) {
        case 'days':
          current = addDays(current, 1);
          break;
        case 'weeks':
          current = addDays(current, 7);
          break;
        case 'months':
          current = addMonths(current, 1);
          break;
        case 'quarters':
          current = addMonths(current, 3);
          break;
      }
    }

    return periods.filter(period => {
      if (!showWeekends && viewMode === 'days') {
        return !isWeekend(period);
      }
      return true;
    });
  }, [viewStart, viewMode, showWeekends, zoomLevel]);

  // Build task hierarchy
  const taskHierarchy = useMemo(() => {
    const taskMap = new Map<string, ProfessionalGanttTask & { children: (ProfessionalGanttTask & { children: any[] })[] }>();
    const rootTasks: (ProfessionalGanttTask & { children: any[] })[] = [];

    // Filter tasks
    const filteredTasks = tasks.filter(task => {
      if (filters.status !== 'all' && task.status !== filters.status) return false;
      if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
      if (filters.assignee !== 'all' && task.assignee !== filters.assignee) return false;
      if (filters.tag !== 'all' && (!task.tags || !task.tags.includes(filters.tag))) return false;
      return true;
    });

    // Initialize task map
    filteredTasks.forEach(task => {
      taskMap.set(task.id, { ...task, children: [] });
    });

    // Build hierarchy
    filteredTasks.forEach(task => {
      const taskNode = taskMap.get(task.id)!;
      if (task.parentId && taskMap.has(task.parentId)) {
        const parent = taskMap.get(task.parentId)!;
        parent.children.push(taskNode);
      } else {
        rootTasks.push(taskNode);
      }
    });

    return rootTasks;
  }, [tasks, filters]);

  // Flatten hierarchy for rendering
  const visibleTasks = useMemo(() => {
    const flatTasks: (ProfessionalGanttTask & { depth: number; hasChildren: boolean; isExpanded: boolean })[] = [];
    
    const addTask = (task: ProfessionalGanttTask & { children: any[] }, depth = 0) => {
      const hasChildren = task.children.length > 0;
      const isExpanded = expandedTasks.has(task.id) || task.isStage;
      
      flatTasks.push({
        ...task,
        depth,
        hasChildren,
        isExpanded
      });
      
      if (hasChildren && isExpanded) {
        task.children.forEach(child => addTask(child, depth + 1));
      }
    };

    taskHierarchy.forEach(task => addTask(task));
    return flatTasks;
  }, [taskHierarchy, expandedTasks]);

  // Task positioning calculations
  const getTaskPosition = useCallback((task: ProfessionalGanttTask) => {
    const config = getViewConfig();
    let startOffset = 0;
    let duration = 0;

    switch (viewMode) {
      case 'days':
        startOffset = differenceInDays(task.startDate, viewStart);
        duration = differenceInDays(task.endDate, task.startDate) + 1;
        break;
      case 'weeks':
        startOffset = Math.floor(differenceInDays(task.startDate, viewStart) / 7);
        duration = Math.ceil(differenceInDays(task.endDate, task.startDate) / 7) + 1;
        break;
      case 'months':
        startOffset = task.startDate.getMonth() - viewStart.getMonth() + 
                     (task.startDate.getFullYear() - viewStart.getFullYear()) * 12;
        duration = task.endDate.getMonth() - task.startDate.getMonth() + 
                  (task.endDate.getFullYear() - task.startDate.getFullYear()) * 12 + 1;
        break;
      case 'quarters':
        const startQuarter = Math.floor(task.startDate.getMonth() / 3);
        const endQuarter = Math.floor(task.endDate.getMonth() / 3);
        const viewStartQuarter = Math.floor(viewStart.getMonth() / 3);
        startOffset = startQuarter - viewStartQuarter + 
                     (task.startDate.getFullYear() - viewStart.getFullYear()) * 4;
        duration = endQuarter - startQuarter + 
                  (task.endDate.getFullYear() - task.startDate.getFullYear()) * 4 + 1;
        break;
    }

    return {
      left: Math.max(0, startOffset * config.width),
      width: Math.max(config.width * 0.8, duration * config.width)
    };
  }, [viewStart, viewMode, zoomLevel]);

  // Styling helpers
  const getStatusColor = (status: string) => {
    const colors = {
      'not-started': 'bg-gray-400',
      'in-progress': 'bg-blue-500',
      'completed': 'bg-green-500',
      'on-hold': 'bg-yellow-500',
      'delayed': 'bg-red-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-400';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'low': 'text-green-600 bg-green-50 border-green-200',
      'medium': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'high': 'text-orange-600 bg-orange-50 border-orange-200',
      'critical': 'text-red-600 bg-red-50 border-red-200'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const getStatusIcon = (status: string, progress: number) => {
    if (status === 'completed' || progress === 100) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (status === 'in-progress' || progress > 0) {
      return <Clock className="w-4 h-4 text-blue-500" />;
    }
    if (status === 'delayed') {
      return <Circle className="w-4 h-4 text-red-500" />;
    }
    return <Circle className="w-4 h-4 text-gray-400" />;
  };

  // Event handlers
  const toggleExpanded = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const handleTaskClick = (taskId: string) => {
    setSelectedTask(selectedTask === taskId ? null : taskId);
  };

  const handleTaskEdit = (taskId: string) => {
    setEditingTask(taskId);
    setSelectedTask(taskId);
  };

  const handleTaskSave = (taskId: string, updates: Partial<ProfessionalGanttTask>) => {
    onTaskUpdate?.(taskId, updates);
    setEditingTask(null);
  };

  const handleTaskDrag = useCallback((e: React.MouseEvent, taskId: string, type: 'move' | 'resize-start' | 'resize-end' | 'progress') => {
    if (readOnly) return;
    
    e.preventDefault();
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    setDragState({
      taskId,
      type,
      startX: e.clientX,
      originalStart: task.startDate,
      originalEnd: task.endDate,
      originalProgress: task.progress
    });
  }, [tasks, readOnly]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragState || readOnly) return;

    const deltaX = e.clientX - dragState.startX;
    const config = getViewConfig();
    const deltaPeriods = Math.round(deltaX / config.width);

    let updates: Partial<ProfessionalGanttTask> = {};

    switch (dragState.type) {
      case 'move':
        updates.startDate = addDays(dragState.originalStart, deltaPeriods);
        updates.endDate = addDays(dragState.originalEnd, deltaPeriods);
        break;
      case 'resize-start':
        updates.startDate = addDays(dragState.originalStart, deltaPeriods);
        break;
      case 'resize-end':
        updates.endDate = addDays(dragState.originalEnd, deltaPeriods);
        break;
      case 'progress':
        const rect = e.currentTarget.getBoundingClientRect();
        const relativeX = e.clientX - rect.left;
        const progressPercent = Math.max(0, Math.min(100, (relativeX / rect.width) * 100));
        updates.progress = Math.round(progressPercent);
        break;
    }

    onTaskUpdate?.(dragState.taskId, updates);
  }, [dragState, onTaskUpdate, readOnly]);

  const handleMouseUp = useCallback(() => {
    setDragState(null);
  }, []);

  // Navigation
  const navigateTime = (direction: 'prev' | 'next') => {
    const multiplier = direction === 'next' ? 1 : -1;
    let newStart = viewStart;

    switch (viewMode) {
      case 'days':
        newStart = addDays(viewStart, 30 * multiplier);
        break;
      case 'weeks':
        newStart = addDays(viewStart, 84 * multiplier); // 12 weeks
        break;
      case 'months':
        newStart = addMonths(viewStart, 6 * multiplier);
        break;
      case 'quarters':
        newStart = addMonths(viewStart, 12 * multiplier);
        break;
    }

    setViewStart(newStart);
  };

  // Get unique values for filters
  const uniqueAssignees = Array.from(new Set(tasks.map(t => t.assignee).filter(Boolean)));
  const uniqueTags = Array.from(new Set(tasks.flatMap(t => t.tags || []).filter(Boolean)));

  // Calculate today's position
  const getTodayPosition = () => {
    const config = getViewConfig();
    if (viewMode === 'days') {
      const offset = differenceInDays(new Date(), viewStart);
      return offset * config.width;
    }
    return null;
  };

  const todayPosition = getTodayPosition();

  return (
    <TooltipProvider>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Header Controls */}
        <div className="border-b border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left Side - Navigation */}
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold text-gray-900">Project Timeline</h3>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigateTime('prev')}>
                  ←
                </Button>
                <span className="text-sm font-medium text-gray-600 min-w-[120px] text-center">
                  {format(viewStart, 'MMM yyyy')}
                </span>
                <Button variant="outline" size="sm" onClick={() => navigateTime('next')}>
                  →
                </Button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewStart(startOfMonth(new Date()))}
              >
                Today
              </Button>
            </div>

            {/* Center - View Mode */}
            <div className="flex items-center gap-2">
              <Select value={viewMode} onValueChange={(value: ViewMode) => setViewMode(value)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="days">Days</SelectItem>
                  <SelectItem value="weeks">Weeks</SelectItem>
                  <SelectItem value="months">Months</SelectItem>
                  <SelectItem value="quarters">Quarters</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25) as ZoomLevel)}>
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-xs px-2">{Math.round(zoomLevel * 100)}%</span>
                <Button variant="outline" size="sm" onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.25) as ZoomLevel)}>
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Right Side - Options */}
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-1" />
                    Filters
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="p-2 space-y-2">
                    <div>
                      <Label className="text-xs">Status</Label>
                      <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="not-started">Not Started</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="on-hold">On Hold</SelectItem>
                          <SelectItem value="delayed">Delayed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs">Priority</Label>
                      <Select value={filters.priority} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Priority</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs">Assignee</Label>
                      <Select value={filters.assignee} onValueChange={(value) => setFilters(prev => ({ ...prev, assignee: value }))}>
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Assignees</SelectItem>
                          {uniqueAssignees.map(assignee => (
                            <SelectItem key={assignee} value={assignee!}>{assignee}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <DropdownMenuSeparator />
                  
                  <div className="p-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Show Dependencies</Label>
                      <Switch
                        checked={showDependencies}
                        onCheckedChange={setShowDependencies}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Show Weekends</Label>
                      <Switch
                        checked={showWeekends}
                        onCheckedChange={setShowWeekends}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Critical Path</Label>
                      <Switch
                        checked={showCriticalPath}
                        onCheckedChange={setShowCriticalPath}
                      />
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {!readOnly && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onTaskAdd?.({
                    name: 'New Task',
                    startDate: new Date(),
                    endDate: addDays(new Date(), 1),
                    progress: 0,
                    status: 'not-started',
                    priority: 'medium',
                    duration: '1 day',
                    assignee: '',
                    category: '',
                    description: ''
                  })}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Task
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div 
          className="flex"
          ref={ganttContainerRef}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {/* Task List Panel */}
          <div className="w-96 border-r border-gray-200 bg-white flex-shrink-0">
            {/* Task List Header */}
            <div className="border-b border-gray-200 bg-gray-50 p-3 sticky top-0 z-10">
              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-600 uppercase tracking-wider">
                <div className="col-span-5">Task</div>
                <div className="col-span-2">Duration</div>
                <div className="col-span-2">Assignee</div>
                <div className="col-span-2">Progress</div>
                <div className="col-span-1">Actions</div>
              </div>
            </div>

            {/* Task List Items */}
            <div className="max-h-[600px] overflow-y-auto">
              {visibleTasks.map((task, index) => (
                <TaskListItem
                  key={task.id}
                  task={task}
                  index={index}
                  isSelected={selectedTask === task.id}
                  isEditing={editingTask === task.id}
                  onToggleExpanded={toggleExpanded}
                  onClick={handleTaskClick}
                  onEdit={handleTaskEdit}
                  onSave={handleTaskSave}
                  onDelete={onTaskDelete}
                  onDuplicate={onTaskDuplicate}
                  readOnly={readOnly}
                />
              ))}
            </div>
          </div>

          {/* Timeline Panel */}
          <div className="flex-1 overflow-x-auto" ref={timelineRef}>
            {/* Timeline Header */}
            <div className="border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
              <TimelineHeader
                periods={getTimePeriods}
                viewMode={viewMode}
                config={getViewConfig()}
              />
            </div>

            {/* Timeline Content */}
            <div className="relative">
              {/* Today Line */}
              {todayPosition !== null && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none"
                  style={{ left: todayPosition }}
                />
              )}

              {/* Task Bars */}
              {visibleTasks.map((task, index) => (
                <TaskBar
                  key={task.id}
                  task={task}
                  index={index}
                  position={getTaskPosition(task)}
                  isSelected={selectedTask === task.id}
                  onDrag={handleTaskDrag}
                  getStatusColor={getStatusColor}
                  readOnly={readOnly}
                />
              ))}

              {/* Dependencies */}
              {showDependencies && (
                <DependencyLines
                  tasks={visibleTasks}
                  getTaskPosition={getTaskPosition}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

// Sub-components
const TaskListItem = ({ 
  task, 
  index, 
  isSelected, 
  isEditing, 
  onToggleExpanded, 
  onClick, 
  onEdit, 
  onSave, 
  onDelete, 
  onDuplicate,
  readOnly 
}: any) => {
  const [editValues, setEditValues] = useState({
    name: task.name,
    assignee: task.assignee || '',
    progress: task.progress
  });

  const indentStyle = { paddingLeft: `${task.depth * 16}px` };

  if (isEditing && !readOnly) {
    return (
      <div
        className="border-b border-gray-100 bg-blue-50"
        style={{ height: 52 }}
      >
        <div className="p-3">
          <div className="grid grid-cols-12 gap-2 items-center" style={indentStyle}>
            <div className="col-span-5">
              <Input
                value={editValues.name}
                onChange={(e) => setEditValues(prev => ({ ...prev, name: e.target.value }))}
                className="h-6 text-xs"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onSave(task.id, editValues);
                  } else if (e.key === 'Escape') {
                    onEdit(null);
                  }
                }}
              />
            </div>
            <div className="col-span-2">
              <span className="text-xs text-gray-500">{task.duration}</span>
            </div>
            <div className="col-span-2">
              <Input
                value={editValues.assignee}
                onChange={(e) => setEditValues(prev => ({ ...prev, assignee: e.target.value }))}
                className="h-6 text-xs"
                placeholder="Assignee"
              />
            </div>
            <div className="col-span-2">
              <Input
                type="number"
                min="0"
                max="100"
                value={editValues.progress}
                onChange={(e) => setEditValues(prev => ({ ...prev, progress: parseInt(e.target.value) || 0 }))}
                className="h-6 text-xs"
              />
            </div>
            <div className="col-span-1 flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => onSave(task.id, editValues)}
              >
                <Save className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => onEdit(null)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer",
        isSelected && "bg-blue-50 border-blue-200",
        task.isStage && "bg-blue-50 border-b-blue-200"
      )}
      style={{ height: 52 }}
      onClick={() => onClick(task.id)}
    >
      <div className="p-3">
        <div className="grid grid-cols-12 gap-2 items-center" style={indentStyle}>
          {/* Task Name */}
          <div className="col-span-5 flex items-center gap-2">
            {task.hasChildren && (
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpanded(task.id);
                }}
              >
                {task.isExpanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </Button>
            )}
            
            <div className="flex items-center gap-1">
              {getStatusIcon(task.status, task.progress)}
              
              <span className={cn(
                "text-sm truncate",
                task.isStage ? "font-semibold text-blue-900" : "text-gray-700"
              )}>
                {task.name}
              </span>
              
              {task.isMilestone && (
                <div className="w-3 h-3 rotate-45 bg-yellow-500 border border-yellow-600" />
              )}
            </div>
          </div>

          {/* Duration */}
          <div className="col-span-2">
            <span className="text-xs text-gray-500">{task.duration}</span>
          </div>

          {/* Assignee */}
          <div className="col-span-2">
            {task.assignee ? (
              <div className="flex items-center gap-1">
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-xs font-medium text-white">
                  {task.assignee.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs text-gray-600 truncate">{task.assignee}</span>
              </div>
            ) : (
              <span className="text-xs text-gray-400">Unassigned</span>
            )}
          </div>

          {/* Progress */}
          <div className="col-span-2 flex items-center gap-1">
            <Progress value={task.progress} className="flex-1 h-2" />
            <span className="text-xs font-medium text-gray-600">{task.progress}%</span>
          </div>

          {/* Actions */}
          <div className="col-span-1">
            {!readOnly && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(task.id); }}>
                    <Edit2 className="w-3 h-3 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate?.(task.id); }}>
                    <FileText className="w-3 h-3 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={(e) => { e.stopPropagation(); onDelete?.(task.id); }}
                    className="text-red-600"
                  >
                    <Trash2 className="w-3 h-3 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const TimelineHeader = ({ periods, viewMode, config }: any) => (
  <div className="flex" style={{ width: periods.length * config.width }}>
    {periods.map((period: Date, index: number) => (
      <div
        key={period.toString()}
        className={cn(
          "flex flex-col items-center justify-center border-r border-gray-200 bg-gray-50",
          isToday(period) && "bg-red-50 border-red-200"
        )}
        style={{ width: config.width, minWidth: config.width }}
      >
        <div className="text-xs font-medium text-gray-600 py-2 text-center">
          {viewMode === 'days' ? (
            <div>
              {index === 0 || period.getDate() === 1 ? (
                <div>
                  <div className="text-xs font-semibold text-gray-800">
                    {format(period, 'MMM')}
                  </div>
                  <div className={cn(
                    "text-xs",
                    isToday(period) ? "text-red-600 font-semibold" : "text-gray-600"
                  )}>
                    {format(period, 'd')}
                  </div>
                </div>
              ) : (
                <div className={cn(
                  "text-xs",
                  isToday(period) ? "text-red-600 font-semibold" : "text-gray-600"
                )}>
                  {format(period, 'd')}
                </div>
              )}
            </div>
          ) : viewMode === 'weeks' ? (
            <div>
              <div className="text-xs font-semibold text-gray-800">
                Week {format(period, 'w')}
              </div>
              <div className="text-xs text-gray-600">
                {format(period, 'MMM d')}
              </div>
            </div>
          ) : viewMode === 'months' ? (
            <div>
              <div className="text-xs font-semibold text-gray-800">
                {format(period, 'MMM')}
              </div>
              <div className="text-xs text-gray-600">
                {format(period, 'yyyy')}
              </div>
            </div>
          ) : (
            <div>
              <div className="text-xs font-semibold text-gray-800">
                Q{Math.floor(period.getMonth() / 3) + 1}
              </div>
              <div className="text-xs text-gray-600">
                {format(period, 'yyyy')}
              </div>
            </div>
          )}
        </div>
      </div>
    ))}
  </div>
);

const TaskBar = ({ task, index, position, isSelected, onDrag, getStatusColor, readOnly }: any) => {
  const isStage = task.isStage;
  const isMilestone = task.isMilestone;

  return (
    <div
      className="relative border-b border-gray-100"
      style={{ height: 52 }}
    >
      {isMilestone ? (
        // Milestone diamond
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className="absolute top-6 w-6 h-6 rotate-45 bg-yellow-500 border-2 border-yellow-600 cursor-pointer"
              style={{ left: position.left }}
              onClick={() => !readOnly && onDrag && console.log('Milestone clicked')}
            />
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">{task.name}</p>
            <p className="text-xs">{format(task.startDate, 'MMM d, yyyy')}</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        // Regular task bar
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                "absolute top-3 h-6 rounded-md shadow-sm flex items-center px-2 cursor-pointer",
                getStatusColor(task.status),
                isStage && "h-8 top-2 border-2 border-blue-600",
                isSelected && "ring-2 ring-blue-400 ring-offset-1",
                !readOnly && "hover:shadow-md transition-shadow"
              )}
              style={{
                left: position.left,
                width: position.width,
                minWidth: 32
              }}
              onMouseDown={(e) => !readOnly && onDrag(e, task.id, 'move')}
            >
              {/* Progress overlay */}
              <div
                className="absolute left-0 top-0 bottom-0 bg-black bg-opacity-20 rounded-l-md"
                style={{ width: `${task.progress}%` }}
              />

              {/* Resize handles */}
              {!readOnly && (
                <>
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize opacity-0 hover:opacity-100 bg-white rounded-l-md"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      onDrag(e, task.id, 'resize-start');
                    }}
                  />
                  <div
                    className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize opacity-0 hover:opacity-100 bg-white rounded-r-md"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      onDrag(e, task.id, 'resize-end');
                    }}
                  />
                </>
              )}

              {/* Task content */}
              <div className="relative z-10 flex items-center gap-1 text-white text-xs font-medium truncate">
                {task.assignee && (
                  <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center text-xs font-medium text-gray-700">
                    {task.assignee.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="truncate">{task.name}</span>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-medium">{task.name}</p>
              <p className="text-xs">
                {format(task.startDate, 'MMM d')} - {format(task.endDate, 'MMM d, yyyy')}
              </p>
              <p className="text-xs">Progress: {task.progress}%</p>
              {task.assignee && <p className="text-xs">Assignee: {task.assignee}</p>}
              {task.description && <p className="text-xs max-w-xs">{task.description}</p>}
            </div>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};

const DependencyLines = ({ tasks, getTaskPosition }: any) => {
  // This would render SVG lines connecting dependent tasks
  // Implementation would require more complex calculations
  return null;
};

// Helper function for status icons
const getStatusIcon = (status: string, progress: number) => {
  if (status === 'completed' || progress === 100) {
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  }
  if (status === 'in-progress' || progress > 0) {
    return <Clock className="w-4 h-4 text-blue-500" />;
  }
  if (status === 'delayed') {
    return <Circle className="w-4 h-4 text-red-500" />;
  }
  return <Circle className="w-4 h-4 text-gray-400" />;
};