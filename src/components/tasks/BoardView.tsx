import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Task } from './types';
import { GripVertical, Circle, Clock, AlertCircle, Plus } from 'lucide-react';
import { format } from 'date-fns';

interface BoardViewProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onTaskClick: (task: Task) => void;
}

type StatusColumn = 'To Do' | 'In Progress' | 'Done';

export function BoardView({ tasks, onTaskUpdate, onTaskClick }: BoardViewProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<StatusColumn | null>(null);

  const columns: StatusColumn[] = ['To Do', 'In Progress', 'Done'];

  const getTasksByStatus = (status: StatusColumn) => {
    return tasks.filter(task => {
      // Only show tasks that have been scheduled (not at midnight - backlog tasks)
      if (!task.dueDate) return false;
      const taskDateTime = new Date(task.dueDate);
      const isScheduled = !(taskDateTime.getHours() === 0 && taskDateTime.getMinutes() === 0);
      if (!isScheduled) return false; // Keep backlog tasks out of status columns
      
      // Filter by status
      if (status === 'To Do') return task.status === 'Not Started' || task.status === 'Pending';
      if (status === 'In Progress') return task.status === 'In Progress';
      if (status === 'Done') return task.status === 'Completed';
      return false;
    });
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    console.log('🎯 BoardView: Drag started for task:', task.taskName, task.id);
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    // CRITICAL: Set the task ID in dataTransfer so other drop zones can access it
    e.dataTransfer.setData('text/plain', task.id);
  };

  const handleDragOver = (e: React.DragEvent, column: StatusColumn) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(column);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: StatusColumn) => {
    e.preventDefault();
    console.log('📥 BoardView: Drop on column:', targetStatus);
    
    // Get the task ID from the drag data (for tasks dragged from backlog)
    const taskId = e.dataTransfer.getData('text/plain');
    const task = draggedTask || tasks.find(t => t.id === taskId);
    
    console.log('🔍 BoardView: Task ID from drag:', taskId, 'Task found:', task?.taskName);
    
    if (!task) {
      console.warn('⚠️ BoardView: No task found for drop');
      return;
    }

    const newStatus = targetStatus === 'To Do' ? 'Not Started' : 
                     targetStatus === 'In Progress' ? 'In Progress' : 'Completed';

    // Set a non-midnight time to move task out of backlog into status column
    const now = new Date();
    const scheduledDate = task.dueDate ? new Date(task.dueDate) : new Date();
    scheduledDate.setHours(now.getHours(), now.getMinutes(), 0, 0);

    const updates: Partial<Task> = {
      status: newStatus,
      dueDate: scheduledDate.toISOString()
    };

    console.log('✅ BoardView: Updating task with:', updates);
    await onTaskUpdate(task.id, updates);
    
    setDraggedTask(null);
    setDragOverColumn(null);
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
      case 'Review':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="h-full flex gap-4 overflow-x-auto pb-4">
      {columns.map((status) => {
        const columnTasks = getTasksByStatus(status);
        const isDropTarget = dragOverColumn === status;
        
        return (
          <div
            key={status}
            className="flex-1 min-w-[320px] flex flex-col"
            onDragOver={(e) => handleDragOver(e, status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, status)}
          >
            {/* Column Header */}
            <div className={cn(
              "rounded-t-lg p-4 border transition-all duration-200",
              isDropTarget 
                ? "bg-primary/10 border-primary border-2 shadow-lg" 
                : "bg-muted/50 border-border"
            )}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground font-inter">
                  {status}
                </h3>
                <span className={cn(
                  "px-2 py-1 rounded-md text-xs font-medium border transition-all duration-200",
                  isDropTarget 
                    ? "bg-primary text-primary-foreground border-primary" 
                    : "bg-background text-muted-foreground border-border"
                )}>
                  {columnTasks.length}
                </span>
              </div>
            </div>

            {/* Column Content */}
            <div className={cn(
              "flex-1 border-x border-b rounded-b-lg p-3 space-y-3 overflow-y-auto transition-all duration-200 relative",
              isDropTarget 
                ? "bg-primary/5 border-primary border-2 shadow-inner" 
                : "bg-card border-border"
            )}>
              {/* Drop Zone Indicator */}
              {isDropTarget && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 bg-primary/5 rounded-b-lg">
                  <div className="bg-background/95 border-2 border-primary border-dashed rounded-lg px-6 py-4 shadow-lg">
                    <div className="flex items-center gap-2 text-primary font-semibold">
                      <Plus className="w-5 h-5" />
                      <span>Drop here to move to {status}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {columnTasks.length === 0 && !isDropTarget ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No tasks
                </div>
              ) : (
                columnTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    onDragEnd={(e) => {
                      console.log('🏁 BoardView: Drag ended for task:', task.taskName);
                      setDraggedTask(null);
                      setDragOverColumn(null);
                    }}
                    onClick={() => onTaskClick(task)}
                    className={cn(
                      "bg-background border rounded-lg p-4 cursor-move transition-all group relative",
                      draggedTask?.id === task.id 
                        ? "opacity-30 scale-95" 
                        : "hover:shadow-lg hover:border-primary/50 hover:-translate-y-0.5 border-border"
                    )}
                  >
                    {/* Drag Handle */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                    </div>

                    {/* Task Header */}
                    <div className="flex items-start gap-2 mb-3">
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
