import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Task } from './types';
import { GripVertical, Circle, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface BoardViewProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onTaskClick: (task: Task) => void;
}

type StatusColumn = 'To Do' | 'In Progress' | 'Done';

export function BoardView({ tasks, onTaskUpdate, onTaskClick }: BoardViewProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const columns: StatusColumn[] = ['To Do', 'In Progress', 'Done'];

  const getTasksByStatus = (status: StatusColumn) => {
    return tasks.filter(task => {
      if (status === 'To Do') return task.status === 'Not Started' || task.status === 'Pending';
      if (status === 'In Progress') return task.status === 'In Progress';
      if (status === 'Done') return task.status === 'Completed';
      return false;
    });
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: StatusColumn) => {
    e.preventDefault();
    
    if (!draggedTask) return;

    const newStatus = targetStatus === 'To Do' ? 'Not Started' : 
                     targetStatus === 'In Progress' ? 'In Progress' : 'Completed';

    if (draggedTask.status !== newStatus) {
      await onTaskUpdate(draggedTask.id, { status: newStatus });
    }
    
    setDraggedTask(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getTaskTypeColor = (taskType: string) => {
    switch (taskType) {
      case 'Task':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Bug':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Feature':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Issue':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="h-full flex gap-4 overflow-x-auto pb-4">
      {columns.map((status) => {
        const columnTasks = getTasksByStatus(status);
        
        return (
          <div
            key={status}
            className="flex-1 min-w-[320px] flex flex-col"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
          >
            {/* Column Header */}
            <div className="bg-muted/50 rounded-t-lg p-4 border border-border">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground font-inter">
                  {status}
                </h3>
                <span className="px-2 py-1 rounded-md text-xs font-medium bg-background text-muted-foreground border border-border">
                  {columnTasks.length}
                </span>
              </div>
            </div>

            {/* Column Content */}
            <div className="flex-1 bg-card border-x border-b border-border rounded-b-lg p-3 space-y-3 overflow-y-auto">
              {columnTasks.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No tasks
                </div>
              ) : (
                columnTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    onClick={() => onTaskClick(task)}
                    className={cn(
                      "bg-background border border-border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md hover:border-primary/50 group",
                      draggedTask?.id === task.id && "opacity-50"
                    )}
                  >
                    {/* Task Header */}
                    <div className="flex items-start gap-2 mb-3">
                      <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                          {task.taskName}
                        </h4>
                        {task.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Task Metadata */}
                    <div className="space-y-2">
                      {/* Project Name */}
                      {task.projectName && (
                        <div className="text-xs text-muted-foreground truncate">
                          📁 {task.projectName}
                        </div>
                      )}

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5">
                        <span className={cn("px-2 py-0.5 rounded text-xs font-medium border", getTaskTypeColor(task.taskType))}>
                          {task.taskType}
                        </span>
                        <span className={cn("px-2 py-0.5 rounded text-xs font-medium border", getPriorityColor(task.priority))}>
                          {task.priority}
                        </span>
                      </div>

                      {/* Due Date */}
                      {task.dueDate && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {format(new Date(task.dueDate), 'MMM d, yyyy')}
                        </div>
                      )}

                      {/* Assignee */}
                      {task.assignedTo && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border">
                          {task.assignedTo.avatar ? (
                            <img 
                              src={task.assignedTo.avatar} 
                              alt={task.assignedTo.name}
                              className="w-6 h-6 rounded-full"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                              {task.assignedTo.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="text-xs text-muted-foreground truncate">
                            {task.assignedTo.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
