import React, { useState } from 'react';
import { GanttTask } from './GanttChart';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Edit2, 
  Trash2, 
  Calendar,
  User,
  Flag,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TaskHierarchyProps {
  tasks: GanttTask[];
  onTaskUpdate?: (taskId: string, updates: Partial<GanttTask>) => void;
  onTaskAdd?: (task: Omit<GanttTask, 'id'>, parentId?: string) => void;
  onTaskDelete?: (taskId: string) => void;
}

interface TaskNode extends GanttTask {
  children: TaskNode[];
}

export const TaskHierarchy = ({
  tasks,
  onTaskUpdate,
  onTaskAdd,
  onTaskDelete
}: TaskHierarchyProps) => {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    status: 'all',
    priority: 'all',
    assignee: 'all'
  });

  // Build task hierarchy with Project Stages as parents
  const buildHierarchy = (): TaskNode[] => {
    const taskMap = new Map<string, TaskNode>();
    const rootTasks: TaskNode[] = [];

    // First pass: Create all task nodes
    tasks.forEach(task => {
      taskMap.set(task.id, {
        ...task,
        children: [],
        expanded: task.isStage ? true : (task.expanded !== false || expandedTasks.has(task.id))
      });
    });

    // Second pass: Build parent-child relationships
    tasks.forEach(task => {
      const taskNode = taskMap.get(task.id)!;
      
      if (task.parentId && taskMap.has(task.parentId)) {
        // This task has a parent, add it as a child
        const parent = taskMap.get(task.parentId)!;
        parent.children.push(taskNode);
      } else {
        // This is a root task (Project Stage)
        rootTasks.push(taskNode);
      }
    });

    // Sort root tasks - stages first, then other tasks
    rootTasks.sort((a, b) => {
      if (a.isStage && !b.isStage) return -1;
      if (!a.isStage && b.isStage) return 1;
      return a.name.localeCompare(b.name);
    });

    return rootTasks;
  };

  const toggleExpanded = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);

    // Also update the task's expanded state if available
    onTaskUpdate?.(taskId, { expanded: !expandedTasks.has(taskId) });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'in-progress':
        return <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse" />;
      case 'delayed':
        return <div className="w-4 h-4 rounded-full bg-red-500" />;
      default:
        return <div className="w-4 h-4 rounded-full bg-slate-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-50 border-red-200';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const filteredTasks = buildHierarchy().filter(task => {
    if (filter.status !== 'all' && task.status !== filter.status) return false;
    if (filter.priority !== 'all' && task.priority !== filter.priority) return false;
    if (filter.assignee !== 'all' && task.assignee !== filter.assignee) return false;
    return true;
  });

  const uniqueAssignees = Array.from(new Set(tasks.map(t => t.assignee).filter(Boolean)));

  const TaskRow = ({ task, depth = 0 }: { task: TaskNode; depth?: number }) => {
    const [isEditing, setIsEditing] = useState(editingTask === task.id);

    const handleSave = (updates: Partial<GanttTask>) => {
      onTaskUpdate?.(task.id, updates);
      setEditingTask(null);
      setIsEditing(false);
    };

    const indentStyle = { paddingLeft: `${depth * 24}px` };

    if (isEditing) {
      return (
        <Card className="mb-2">
          <CardContent className="p-4">
            <div className="space-y-3">
              <Input
                defaultValue={task.name}
                placeholder="Activity name"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSave({ name: e.currentTarget.value });
                  } else if (e.key === 'Escape') {
                    setIsEditing(false);
                    setEditingTask(null);
                  }
                }}
              />
              
              <div className="grid grid-cols-3 gap-2">
                <Select
                  defaultValue={task.status}
                  onValueChange={(value) => handleSave({ status: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="delayed">Delayed</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  defaultValue={task.priority}
                  onValueChange={(value) => handleSave({ priority: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  min="0"
                  max="100"
                  defaultValue={task.progress}
                  placeholder="Progress %"
                  onBlur={(e) => handleSave({ progress: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="mb-2">
        <CardContent className="p-0">
          {/* Desktop View - Table Format */}
          <div className="hidden md:grid grid-cols-8 gap-4 px-4 py-3 items-center" style={indentStyle}>
            <div className="col-span-2">
              <div className="flex items-center gap-3">
                {/* Expand/Collapse (if has children) */}
                <div className="w-6">
                  {task.children.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpanded(task.id)}
                      className="p-0 h-6 w-6"
                    >
                      {task.expanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>

                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {getStatusIcon(task.status)}
                </div>

                <h3 className={cn(
                  "font-medium truncate",
                  task.isStage ? "text-lg font-bold text-primary" : "text-foreground"
                )}>
                  {task.name}
                </h3>
                
                {task.isStage ? (
                  <Badge variant="default" className="bg-primary">
                    Stage
                  </Badge>
                ) : (
                  <>
                    <Badge 
                      variant="outline"
                      className={getPriorityColor(task.priority)}
                    >
                      <Flag className="w-3 h-3 mr-1" />
                      {task.priority}
                    </Badge>
                    <Badge variant="secondary">
                      {task.status.replace('-', ' ')}
                    </Badge>
                  </>
                )}
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {format(task.startDate, 'MMM d, yyyy')}
            </div>
            
            <div className="text-sm text-muted-foreground">
              {format(task.endDate, 'MMM d, yyyy')}
            </div>
            
            <div className="text-sm text-muted-foreground">
              {Math.ceil((task.endDate.getTime() - task.startDate.getTime()) / (1000 * 3600 * 24))} days
            </div>
            
            <div className="text-sm text-muted-foreground">
              {task.dependencies && task.dependencies.length > 0 
                ? task.dependencies.join(', ') 
                : 'None'
              }
            </div>
            
            <div className="text-sm text-muted-foreground">
              {task.assignee || 'Unassigned'}
            </div>
            
            <div className="flex items-center gap-2">
              <Progress value={task.progress} className="flex-1" />
              <span className="text-sm font-medium">{task.progress}%</span>
              <div className="flex items-center gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingTask(task.id);
                    setIsEditing(true);
                  }}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onTaskDelete?.(task.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile View - Card Format */}
          <div className="md:hidden p-4">
            <div className="flex items-center gap-4 mb-4">
              {/* Expand/Collapse (if has children) */}
              <div className="w-6">
                {task.children.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(task.id)}
                    className="p-0 h-6 w-6"
                  >
                    {task.expanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>

              {/* Status Icon */}
              <div className="flex-shrink-0">
                {getStatusIcon(task.status)}
              </div>

              {/* Task Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h3 className="font-medium text-foreground truncate">{task.name}</h3>
                  
                  <Badge 
                    variant="outline"
                    className={getPriorityColor(task.priority)}
                  >
                    <Flag className="w-3 h-3 mr-1" />
                    {task.priority}
                  </Badge>

                  <Badge variant="secondary">
                    {task.status.replace('-', ' ')}
                  </Badge>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingTask(task.id);
                    setIsEditing(true);
                  }}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onTaskDelete?.(task.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <span className="font-medium">Start:</span> {format(task.startDate, 'MMM d, yyyy')}
              </div>
              <div>
                <span className="font-medium">End:</span> {format(task.endDate, 'MMM d, yyyy')}
              </div>
              <div>
                <span className="font-medium">Duration:</span> {Math.ceil((task.endDate.getTime() - task.startDate.getTime()) / (1000 * 3600 * 24))} days
              </div>
              <div>
                <span className="font-medium">Assignee:</span> {task.assignee || 'Unassigned'}
              </div>
              {task.dependencies && task.dependencies.length > 0 && (
                <div className="col-span-2">
                  <span className="font-medium">Dependencies:</span> {task.dependencies.join(', ')}
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-3 mt-4">
              <Progress value={task.progress} className="flex-1" />
              <span className="text-sm font-medium">{task.progress}%</span>
            </div>

            {task.description && (
              <p className="text-sm text-muted-foreground mt-2">{task.description}</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Recursive component to render task hierarchy
  const TaskHierarchyRenderer = ({ task, depth }: { task: TaskNode; depth: number }) => (
    <div>
      <TaskRow task={task} depth={depth} />
      {/* Render children if expanded */}
      {task.expanded && task.children.map(child => (
        <TaskHierarchyRenderer key={child.id} task={child} depth={depth + 1} />
      ))}
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Filter:</span>
          
          <Select value={filter.status} onValueChange={(value) => setFilter(prev => ({ ...prev, status: value }))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="delayed">Delayed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filter.priority} onValueChange={(value) => setFilter(prev => ({ ...prev, priority: value }))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filter.assignee} onValueChange={(value) => setFilter(prev => ({ ...prev, assignee: value }))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignees</SelectItem>
              {uniqueAssignees.map(assignee => (
                <SelectItem key={assignee} value={assignee}>{assignee}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1" />

        <Button
        onClick={() => onTaskAdd?.({
          name: 'New Activity',
            startDate: new Date(),
            endDate: new Date(),
            progress: 0,
            status: 'pending',
            priority: 'Medium',
            assignee: '',
          })}
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Activity
        </Button>
      </div>

      {/* Table Headers - Desktop Only */}
      <div className="hidden md:block">
        <div className="grid grid-cols-8 gap-4 px-4 py-2 text-xs font-medium text-muted-foreground border-b border-border bg-muted/30 rounded-t-lg">
          <div className="col-span-2">Activity Name</div>
          <div>Start Date</div>
          <div>End Date</div>
          <div>Duration</div>
          <div>Dependencies</div>
          <div>Assignee</div>
          <div>Progress</div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No activities found matching the current filters.</p>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map(task => (
            <TaskHierarchyRenderer key={task.id} task={task} depth={0} />
          ))
        )}
      </div>
    </div>
  );
};