import React, { useState } from 'react';
import { CentralTask } from '@/services/centralTaskService';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronDown, 
  ChevronRight, 
  MoreHorizontal,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, differenceInDays } from 'date-fns';

interface GanttTaskListProps {
  tasks: CentralTask[];
  onTaskUpdate?: (taskId: string, updates: Partial<CentralTask>) => void;
  onTaskToggle?: (taskId: string, completed: boolean) => void;
  className?: string;
}

interface TaskWithChildren extends CentralTask {
  children: TaskWithChildren[];
  expanded: boolean;
}

export const GanttTaskList = ({ 
  tasks, 
  onTaskUpdate, 
  onTaskToggle,
  className 
}: GanttTaskListProps) => {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  // Build hierarchical structure
  const buildTaskHierarchy = (): TaskWithChildren[] => {
    const taskMap = new Map<string, TaskWithChildren>();
    const rootTasks: TaskWithChildren[] = [];

    // First, create all task nodes
    tasks.forEach(task => {
      taskMap.set(task.id, {
        ...task,
        children: [],
        expanded: expandedTasks.has(task.id) || task.is_expanded
      });
    });

    // Build parent-child relationships
    tasks.forEach(task => {
      const taskNode = taskMap.get(task.id)!;
      if (task.parent_id && taskMap.has(task.parent_id)) {
        const parent = taskMap.get(task.parent_id)!;
        parent.children.push(taskNode);
      } else {
        rootTasks.push(taskNode);
      }
    });

    // Sort by stage and level
    rootTasks.sort((a, b) => {
      if (a.stage !== b.stage) {
        return a.stage.localeCompare(b.stage);
      }
      return (a.level || 0) - (b.level || 0);
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
    
    // Update task expanded state in database
    onTaskUpdate?.(taskId, { is_expanded: !expandedTasks.has(taskId) });
  };

  const calculateDuration = (task: CentralTask): string => {
    if (!task.start_date || !task.end_date) return '1 day';
    
    const days = differenceInDays(new Date(task.end_date), new Date(task.start_date)) + 1;
    return `${days} day${days === 1 ? '' : 's'}`;
  };

  const getProgress = (task: CentralTask): number => {
    return task.progress || 0;
  };

  const isStageTask = (task: CentralTask): boolean => {
    return task.level === 0 || !task.parent_id;
  };

  // Recursively render tasks
  const renderTask = (task: TaskWithChildren, depth: number = 0): React.ReactNode => {
    const isStage = isStageTask(task);
    const hasChildren = task.children.length > 0;
    const isExpanded = task.expanded;
    
    return (
      <div key={task.id}>
        {/* Task Row */}
        <div 
          className={cn(
            "flex items-center gap-3 py-2 px-3 hover:bg-muted/50 transition-colors",
            "border-b border-border/50 text-sm",
            isStage && "bg-muted/30 font-medium"
          )}
          style={{ paddingLeft: `${depth * 20 + 12}px` }}
        >
          {/* Expand/Collapse Button */}
          <div className="w-5 h-5 flex items-center justify-center">
            {hasChildren ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 hover:bg-background"
                onClick={() => toggleExpanded(task.id)}
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Button>
            ) : null}
          </div>

          {/* Checkbox */}
          <div className="w-5 h-5 flex items-center justify-center">
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 hover:bg-background"
              onClick={() => {
                const completed = getProgress(task) === 100;
                onTaskToggle?.(task.id, !completed);
                onTaskUpdate?.(task.id, { progress: completed ? 0 : 100 });
              }}
            >
              {getProgress(task) === 100 ? (
                <CheckCircle2 className="h-4 w-4 text-primary" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>

          {/* Task Name */}
          <div className={cn(
            "flex-1 min-w-0",
            isStage ? "font-semibold text-primary" : "text-foreground"
          )}>
            <span className="truncate block">
              {task.name}
            </span>
          </div>

          {/* Duration */}
          <div className="w-16 text-right text-muted-foreground text-xs">
            {calculateDuration(task)}
          </div>

          {/* Progress */}
          <div className="w-12 text-right text-muted-foreground text-xs">
            {getProgress(task)}%
          </div>

          {/* More Actions */}
          <div className="w-6 h-6 flex items-center justify-center">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-background"
            >
              <MoreHorizontal className="h-3 w-3 text-muted-foreground" />
            </Button>
          </div>
        </div>

        {/* Children */}
        {isExpanded && hasChildren && (
          <div>
            {task.children.map(child => renderTask(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const hierarchicalTasks = buildTaskHierarchy();

  return (
    <div className={cn("bg-background border border-border rounded-lg overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center gap-3 py-3 px-3 bg-muted/30 border-b border-border text-xs font-medium text-muted-foreground">
        <div className="w-5"></div> {/* Expand/Collapse space */}
        <div className="w-5"></div> {/* Checkbox space */}
        <div className="flex-1">TASK</div>
        <div className="w-16 text-right">DURATION</div>
        <div className="w-12 text-right">STATUS</div>
        <div className="w-6"></div> {/* More actions space */}
      </div>

      {/* Task List */}
      <div className="max-h-96 overflow-y-auto">
        {hierarchicalTasks.map(task => renderTask(task, 0))}
      </div>
    </div>
  );
};