
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GripVertical } from 'lucide-react';
import { Task } from './TaskContext';

interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
}

export const TaskCard = ({ task, onClick }: TaskCardProps) => {
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

  const handleClick = () => {
    if (onClick) {
      onClick(task);
    }
  };

  return (
    <Card className="hover:shadow-md transition-all group" onClick={handleClick}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h4 className="font-medium text-sm flex-1 pr-2">{task.taskName}</h4>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className={`${getPriorityColor(task.priority)} text-xs`}>
                {task.priority}
              </Badge>
              <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src={task.assignedTo?.avatar || ''} />
                <AvatarFallback className="text-xs">
                  {task.assignedTo?.name ? task.assignedTo.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">{task.assignedTo?.name || 'Unassigned'}</span>
            </div>
            <span className="text-xs text-muted-foreground">{task.dueDate || ''}</span>
          </div>
          
          {task.progress > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Progress</span>
                <span>{task.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${task.progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
