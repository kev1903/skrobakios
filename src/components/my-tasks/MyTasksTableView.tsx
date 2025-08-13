import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Target } from "lucide-react";
import { MyTasksTableViewProps } from './types';
import { SortableTaskHeader } from './SortableTaskHeader';

export const MyTasksTableView = ({
  tasks,
  selectedTasks,
  sortField,
  sortDirection,
  onSort,
  onSelectAll,
  onSelectTask,
  onTaskClick,
}: MyTasksTableViewProps) => {
  const isAllSelected = selectedTasks.length === tasks.length && tasks.length > 0;
  const isIndeterminate = selectedTasks.length > 0 && selectedTasks.length < tasks.length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-200 hover:bg-gray-50 transition-colors duration-200">
            <TableHead className="w-10 py-1">
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={(el) => {
                  if (el) el.indeterminate = isIndeterminate;
                }}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="rounded border-gray-300 bg-white text-blue-600 focus:ring-blue-500/30 scale-90"
              />
            </TableHead>
             <SortableTaskHeader field="taskName" sortField={sortField} sortDirection={sortDirection} onSort={onSort}>Task Name</SortableTaskHeader>
             <TableHead className="py-1">Type</TableHead>
             <SortableTaskHeader field="projectName" sortField={sortField} sortDirection={sortDirection} onSort={onSort}>Project</SortableTaskHeader>
             <SortableTaskHeader field="priority" sortField={sortField} sortDirection={sortDirection} onSort={onSort}>Priority</SortableTaskHeader>
             <SortableTaskHeader field="assignedTo" sortField={sortField} sortDirection={sortDirection} onSort={onSort}>Assigned To</SortableTaskHeader>
             <SortableTaskHeader field="dueDate" sortField={sortField} sortDirection={sortDirection} onSort={onSort}>Due Date</SortableTaskHeader>
             <SortableTaskHeader field="status" sortField={sortField} sortDirection={sortDirection} onSort={onSort}>Status</SortableTaskHeader>
            <TableHead className="py-1">Progress</TableHead>
            <TableHead className="w-10 py-1"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id} className="hover:bg-gray-50 border-gray-200 transition-colors duration-200">
              <TableCell className="py-1">
                <input
                  type="checkbox"
                  checked={selectedTasks.includes(task.id)}
                  onChange={(e) => onSelectTask(task.id, e.target.checked)}
                  className="rounded border-gray-300 bg-white text-blue-600 focus:ring-blue-500/30 scale-90"
                />
              </TableCell>
               <TableCell className="font-medium text-gray-900 py-1">
                 <div className="flex items-center space-x-2">
                   {task.is_milestone && (
                     <div title="Milestone">
                       <Target className="w-4 h-4 text-yellow-600" />
                     </div>
                   )}
                   <button
                     onClick={() => onTaskClick(task)}
                     className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left transition-colors duration-200"
                   >
                     {task.taskName}
                   </button>
                 </div>
               </TableCell>
               <TableCell className="py-1">
                 <Badge 
                   variant="outline" 
                   className={task.taskType === 'Issue' ? 'border-red-200 bg-red-50 text-red-700' : 'border-blue-200 bg-blue-50 text-blue-700'}
                 >
                   {task.taskType}
                 </Badge>
               </TableCell>
               <TableCell className="text-gray-600 py-1">
                 {task.projectName}
               </TableCell>
              <TableCell className="py-1">
                <Badge 
                  variant="outline" 
                  className={
                    task.priority === 'High' ? 'bg-red-50 text-red-700 border-red-200' :
                    task.priority === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                    'bg-green-50 text-green-700 border-green-200'
                  }
                >
                  {task.priority}
                </Badge>
              </TableCell>
              <TableCell className="py-1">
                <div className="flex items-center space-x-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={task.assignedTo.avatar} />
                    <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                      {task.assignedTo.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-600">{task.assignedTo.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-gray-600 py-1">
                {task.dueDate || '-'}
              </TableCell>
              <TableCell className="py-1">
                <Badge 
                  variant="outline" 
                  className={
                    task.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' :
                    task.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    task.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                    'bg-gray-50 text-gray-700 border-gray-200'
                  }
                >
                  {task.status}
                </Badge>
              </TableCell>
              <TableCell className="py-1">
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${task.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600">{task.progress}%</span>
                </div>
              </TableCell>
              <TableCell className="py-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-6 h-6 p-0 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all duration-200">
                      <MoreHorizontal className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white border border-gray-200 shadow-lg">
                    <DropdownMenuItem 
                      className="flex items-center space-x-2 text-gray-700 hover:bg-gray-50 focus:bg-gray-50 transition-colors duration-200 text-sm"
                      onClick={() => onTaskClick(task)}
                    >
                      <Eye className="w-3 h-3" />
                      <span className="text-sm">View Details</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};