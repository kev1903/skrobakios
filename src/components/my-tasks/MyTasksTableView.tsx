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
import { MoreHorizontal, Eye } from "lucide-react";
import { MyTasksTableViewProps } from './types';
import { getTaskPriorityColor, getTaskStatusColor } from './utils';
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
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 border-border hover:bg-muted transition-colors duration-200 h-8">
            <TableHead className="w-10 py-1">
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={(el) => {
                  if (el) el.indeterminate = isIndeterminate;
                }}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="rounded border-input bg-background text-primary focus:ring-primary/30 scale-90"
              />
            </TableHead>
             <SortableTaskHeader field="taskName" sortField={sortField} sortDirection={sortDirection} onSort={onSort}>Task Name</SortableTaskHeader>
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
            <TableRow key={task.id} className="hover:bg-muted/50 border-border transition-colors duration-200 h-9">
              <TableCell className="py-1">
                <input
                  type="checkbox"
                  checked={selectedTasks.includes(task.id)}
                  onChange={(e) => onSelectTask(task.id, e.target.checked)}
                  className="rounded border-input bg-background text-primary focus:ring-primary/30 scale-90"
                />
              </TableCell>
              <TableCell className="font-medium text-foreground py-1">
                <button
                  onClick={() => onTaskClick(task)}
                  className="text-primary hover:text-primary/80 hover:underline cursor-pointer text-left transition-colors duration-200"
                >
                  {task.taskName}
                </button>
              </TableCell>
              <TableCell className="text-muted-foreground py-1">
                {task.projectName}
              </TableCell>
              <TableCell className="py-1">
                <Badge 
                  variant="outline" 
                  className={getTaskPriorityColor(task.priority)}
                >
                  {task.priority}
                </Badge>
              </TableCell>
              <TableCell className="py-1">
                <div className="flex items-center space-x-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={task.assignedTo.avatar} />
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                      {task.assignedTo.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">{task.assignedTo.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground py-1">
                {task.dueDate || '-'}
              </TableCell>
              <TableCell className="py-1">
                <Badge 
                  variant="outline" 
                  className={getTaskStatusColor(task.status)}
                >
                  {task.status}
                </Badge>
              </TableCell>
              <TableCell className="py-1">
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${task.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-muted-foreground">{task.progress}%</span>
                </div>
              </TableCell>
              <TableCell className="py-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-6 h-6 p-0 text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200">
                      <MoreHorizontal className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-card border border-border shadow-xl">
                    <DropdownMenuItem 
                      className="flex items-center space-x-2 text-foreground hover:bg-muted focus:bg-muted transition-colors duration-200 text-sm"
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