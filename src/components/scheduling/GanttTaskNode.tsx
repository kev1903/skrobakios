import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TaskNodeData {
  task: {
    id: string;
    task_name: string;
    progress: number;
    status: string;
    is_milestone: boolean;
    is_critical_path: boolean;
    assigned_to_name?: string;
    assigned_to_avatar?: string;
  };
  width: number;
  startDate: Date;
  endDate: Date;
  dayWidth: number;
}

export const GanttTaskNode: React.FC<NodeProps> = ({ data }) => {
  const { task, width, startDate, endDate } = data as unknown as TaskNodeData;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'on_hold':
        return 'bg-yellow-500';
      case 'overdue':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default' as const;
      case 'in_progress':
        return 'secondary' as const;
      case 'on_hold':
        return 'outline' as const;
      default:
        return 'secondary' as const;
    }
  };

  if (task.is_milestone) {
    return (
      <>
        <Handle type="target" position={Position.Left} className="w-2 h-2" />
        <Handle type="source" position={Position.Right} className="w-2 h-2" />
        <div className="flex items-center justify-center w-8 h-8 bg-yellow-500 rotate-45 border-2 border-white shadow-lg">
          <div className="w-2 h-2 bg-white rounded-full -rotate-45" />
        </div>
        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 text-xs font-medium text-center whitespace-nowrap">
          {task.task_name}
        </div>
      </>
    );
  }

  return (
    <>
      <Handle type="target" position={Position.Left} className="w-2 h-2" />
      <Handle type="source" position={Position.Right} className="w-2 h-2" />
      
      <div 
        className={cn(
          "relative h-full rounded-md border shadow-sm",
          task.is_critical_path ? "border-red-500 bg-red-50" : "border-border bg-background"
        )}
        style={{ width }}
      >
        {/* Progress bar background */}
        <div 
          className={cn(
            "absolute inset-0 rounded-md transition-all",
            getStatusColor(task.status),
            "opacity-20"
          )}
        />
        
        {/* Progress indicator */}
        <div 
          className={cn(
            "absolute inset-y-0 left-0 rounded-l-md transition-all",
            getStatusColor(task.status)
          )}
          style={{ width: `${task.progress}%` }}
        />

        {/* Task content */}
        <div className="relative flex items-center justify-between h-full px-2 py-1">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium truncate">
                {task.task_name}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {format(startDate, 'MMM d')} - {format(endDate, 'MMM d')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {task.assigned_to_name && (
              <Avatar className="w-6 h-6">
                <AvatarImage src={task.assigned_to_avatar} />
                <AvatarFallback className="text-xs">
                  {task.assigned_to_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
            
            <Badge variant={getStatusVariant(task.status)} className="text-xs px-1">
              {task.progress}%
            </Badge>
          </div>
        </div>

        {/* Critical path indicator */}
        {task.is_critical_path && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
        )}
      </div>
    </>
  );
};