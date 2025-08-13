import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Calendar, Building } from "lucide-react";
import { MyTasksGridViewProps } from './types';
import { getTaskPriorityColor, getTaskStatusColor } from './utils';

export const MyTasksGridView = ({ 
  tasks, 
  selectedTasks, 
  onSelectTask, 
  onTaskClick 
}: MyTasksGridViewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tasks.map((task) => (
        <div key={task.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
               <h3 className="text-lg font-semibold text-gray-900 mb-1">
                 <button
                   onClick={() => onTaskClick(task)}
                   className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left transition-colors duration-200"
                 >
                   {task.taskName}
                 </button>
               </h3>
               <div className="flex items-center text-sm text-gray-600 mb-2">
                 <Building className="w-3 h-3 mr-1" />
                 {task.projectName}
               </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all duration-200">
                   <MoreHorizontal className="w-4 h-4" />
                 </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white border border-gray-200 shadow-lg">
                <DropdownMenuItem 
                  className="flex items-center space-x-2 text-gray-700 hover:bg-gray-50 focus:bg-gray-50 transition-colors duration-200"
                  onClick={() => onTaskClick(task)}
                >
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex items-center space-x-2 mb-4">
            <Badge 
              variant="outline" 
              className={getTaskPriorityColor(task.priority)}
            >
              {task.priority}
            </Badge>
            <Badge 
              variant="outline" 
              className={getTaskStatusColor(task.status)}
            >
              {task.status}
            </Badge>
          </div>

          <div className="flex items-center space-x-3 mb-4">
            <Avatar className="w-8 h-8">
              <AvatarImage src={task.assignedTo.avatar} />
              <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                {task.assignedTo.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-600">{task.assignedTo.name}</span>
          </div>

          <div className="space-y-2">
            {task.dueDate && (
              <div className="flex items-center justify-between">
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span>Due Date</span>
                </div>
                <span className="text-xs text-gray-900">{task.dueDate}</span>
              </div>
            )}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Progress</span>
                <span className="text-xs text-gray-900">{task.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${task.progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="text-xs text-gray-500">
              {task.status}
            </div>
            <input
              type="checkbox"
              checked={selectedTasks.includes(task.id)}
              onChange={(e) => onSelectTask(task.id, e.target.checked)}
              className="rounded border-gray-300 bg-white text-blue-600 focus:ring-blue-500/30"
            />
          </div>
        </div>
      ))}
    </div>
  );
};