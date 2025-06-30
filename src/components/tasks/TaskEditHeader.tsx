
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ThumbsUp, Paperclip, MessageSquare, Link, Maximize2, MoreHorizontal, ArrowRight } from 'lucide-react';
import { Task } from './TaskContext';

interface TaskEditHeaderProps {
  task: Task;
  onMarkComplete: () => void;
}

export const TaskEditHeader = ({ task, onMarkComplete }: TaskEditHeaderProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <>
      {/* Function Buttons Bar */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
        <div className="flex items-center space-x-2">
          <Button
            onClick={onMarkComplete}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2"
          >
            <Check className="w-4 h-4" />
            <span>Mark complete</span>
          </Button>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm">
            <ThumbsUp className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Paperclip className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MessageSquare className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Link className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Maximize2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Task Title and Priority */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{task.taskName}</h2>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className={`${getPriorityColor(task.priority)} text-xs`}>
              {task.priority}
            </Badge>
          </div>
        </div>
      </div>
    </>
  );
};
