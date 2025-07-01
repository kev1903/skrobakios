import React from 'react';
import { Edit, MoreHorizontal, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Task } from './TaskContext';

interface TaskTableRowProps {
  task: Task;
  onTaskClick: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  getPriorityColor: (priority: string) => string;
  getStatusColor: (status: string) => string;
}

export const TaskTableRow = ({ 
  task, 
  onTaskClick, 
  onDeleteTask, 
  getPriorityColor, 
  getStatusColor 
}: TaskTableRowProps) => {
  return (
    <TableRow className="hover:bg-gray-50">
      <TableCell>
        <Checkbox />
      </TableCell>
      <TableCell className="font-medium text-blue-600">
        {task.id}
      </TableCell>
      <TableCell 
        className="font-medium cursor-pointer hover:text-blue-600"
        onClick={() => onTaskClick(task)}
      >
        {task.taskName}
      </TableCell>
      <TableCell>
        <Badge 
          variant="outline" 
          className={getPriorityColor(task.priority)}
        >
          {task.priority}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src={task.assignedTo.avatar} />
            <AvatarFallback>
              {task.assignedTo.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">{task.assignedTo.name}</span>
        </div>
      </TableCell>
      <TableCell>{task.dueDate}</TableCell>
      <TableCell>
        <Badge 
          variant="outline" 
          className={getStatusColor(task.status)}
        >
          {task.status}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <div className="w-16 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full" 
              style={{ width: `${task.progress}%` }}
            ></div>
          </div>
          <span className="text-sm text-gray-600">{task.progress}%</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onTaskClick(task)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => onTaskClick(task)}
                className="cursor-pointer"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Task
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDeleteTask(task.id)}
                className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
};