import React from 'react';
import { GanttTask, TaskPosition } from '@/types/gantt';
import { getTaskStatusColor } from '@/utils/ganttUtils';
import { cn } from '@/lib/utils';

interface GanttTaskBarProps {
  task: GanttTask;
  position: TaskPosition;
  onTaskClick?: (taskId: string) => void;
}

export const GanttTaskBar: React.FC<GanttTaskBarProps> = ({
  task,
  position,
  onTaskClick
}) => {
  const statusColor = getTaskStatusColor(task.status);

  const handleClick = () => {
    onTaskClick?.(task.id);
  };

  if (task.level === 0) {
    // Stage bar - different styling
    return (
      <div
        className="absolute cursor-pointer"
        style={{
          left: position.left,
          top: position.top,
          width: position.width,
          height: position.height
        }}
        onClick={handleClick}
      >
        <div className="h-full bg-slate-300 rounded-sm flex items-center px-3 shadow-sm">
          <span className="text-sm font-medium text-slate-700 truncate">
            {task.name}
          </span>
        </div>
      </div>
    );
  }

  // Regular task bar
  return (
    <div
      className="absolute cursor-pointer group"
      style={{
        left: position.left,
        top: position.top,
        width: position.width,
        height: position.height
      }}
      onClick={handleClick}
    >
      <div className={cn(
        "h-full rounded-md flex items-center px-2 text-white text-xs font-medium shadow-sm transition-opacity group-hover:opacity-90",
        statusColor
      )}>
        {/* Progress overlay */}
        <div 
          className="absolute inset-0 bg-white/20 rounded-md transition-all duration-300"
          style={{ width: `${task.progress}%` }}
        />
        
        {/* Assignee avatar */}
        {task.assignee && (
          <div className="w-5 h-5 bg-white/30 rounded-full flex items-center justify-center text-[10px] font-bold mr-2 relative z-10">
            {task.assignee.charAt(0).toUpperCase()}
          </div>
        )}
        
        {/* Task name */}
        <span className="truncate relative z-10">
          {task.name}
        </span>
        
        {/* Progress percentage */}
        {task.progress > 0 && (
          <span className="ml-auto text-[10px] opacity-80 relative z-10">
            {Math.round(task.progress)}%
          </span>
        )}
      </div>
    </div>
  );
};