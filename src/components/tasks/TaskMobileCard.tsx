import React from 'react';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Task } from './TaskContext';

interface TaskMobileCardProps {
  task: Task;
  onTaskClick: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  getPriorityColor: (priority: string) => string;
  getStatusColor: (status: string) => string;
}

export const TaskMobileCard = ({ 
  task, 
  onTaskClick, 
  onDeleteTask, 
  getPriorityColor, 
  getStatusColor 
}: TaskMobileCardProps) => {
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow" 
      onClick={() => onTaskClick(task)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-blue-600 truncate">{task.taskName}</h3>
            <p className="text-sm text-gray-500">ID: {task.id}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); }}>
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); onTaskClick(task); }}
                className="cursor-pointer"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Task
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }}
                className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex items-center space-x-2 mb-2">
          <Badge variant="outline" className={getPriorityColor(task.priority)}>
            {task.priority}
          </Badge>
          <Badge variant="outline" className={getStatusColor(task.status)}>
            {task.status}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src={task.assignedTo.avatar} />
              <AvatarFallback className="text-xs">
                {task.assignedTo.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">{task.assignedTo.name}</span>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">{task.dueDate}</p>
            <p className="text-xs text-gray-600">{task.progress}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};