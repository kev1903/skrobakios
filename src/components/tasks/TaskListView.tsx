import React, { useState } from 'react';
import { Edit, MoreHorizontal, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTaskContext } from './TaskContext';
import { TaskEditSidePanel } from './TaskEditSidePanel';
import { AddTaskButton } from './AddTaskButton';
import { AddTaskDialog } from './AddTaskDialog';
import { Task } from './TaskContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface TaskListViewProps {
  projectId?: string;
}

export const TaskListView = ({ projectId }: TaskListViewProps) => {
  const { tasks, deleteTask } = useTaskContext();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsSidePanelOpen(true);
  };

  const handleCloseSidePanel = () => {
    setIsSidePanelOpen(false);
    setSelectedTask(null);
  };

  const handleAddTask = () => {
    setIsAddTaskDialogOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
  };

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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "in progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "not started":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Tasks Table */}
      <Card>
        <CardContent className="p-0">
          {isMobile ? (
            // Mobile Card View
            <div className="space-y-3 p-4">
              {/* Add Task Button for Mobile */}
              <div className="mb-4">
                <AddTaskButton onAddTask={handleAddTask} />
              </div>
              
              {tasks.map((task, index) => (
                <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleTaskClick(task)}>
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
                            onClick={(e) => { e.stopPropagation(); handleTaskClick(task); }}
                            className="cursor-pointer"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Task
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
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
              ))}
            </div>
          ) : (
            // Desktop Table View
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-12">
                      <Checkbox />
                    </TableHead>
                    <TableHead>Task ID</TableHead>
                    <TableHead>Task Name</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Add Task Row */}
                  <TableRow className="hover:bg-gray-50 cursor-pointer" onClick={handleAddTask}>
                    <TableCell colSpan={9} className="p-4">
                      <AddTaskButton onAddTask={handleAddTask} />
                    </TableCell>
                  </TableRow>
                  
                  {tasks.map((task, index) => (
                    <TableRow key={index} className="hover:bg-gray-50">
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                      <TableCell className="font-medium text-blue-600">
                        {task.id}
                      </TableCell>
                      <TableCell 
                        className="font-medium cursor-pointer hover:text-blue-600"
                        onClick={() => handleTaskClick(task)}
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
                            onClick={() => handleTaskClick(task)}
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
                                onClick={() => handleTaskClick(task)}
                                className="cursor-pointer"
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Task
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteTask(task.id)}
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
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <TaskEditSidePanel
        task={selectedTask}
        isOpen={isSidePanelOpen}
        onClose={handleCloseSidePanel}
        projectId={projectId}
      />

      <AddTaskDialog
        isOpen={isAddTaskDialogOpen}
        onClose={() => setIsAddTaskDialogOpen(false)}
        status="Not Started"
      />
    </div>
  );
};
