import React, { useState } from 'react';
import { Edit, MoreHorizontal, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  viewMode?: "grid" | "list";
}

export const TaskListView = ({ projectId, viewMode = "list" }: TaskListViewProps) => {
  const { tasks, deleteTask } = useTaskContext();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleTaskClick = (task: Task) => {
    console.log('Task clicked:', task);
    setSelectedTask(task);
    setIsSidePanelOpen(true);
    console.log('Side panel should open now');
  };

  const handleCloseSidePanel = () => {
    setIsSidePanelOpen(false);
    setSelectedTask(null);
  };

  const handleAddTask = () => {
    setIsAddTaskDialogOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-500/20 text-red-200 border-red-400/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-200 border-yellow-400/30";
      case "low":
        return "bg-green-500/20 text-green-200 border-green-400/30";
      default:
        return "bg-white/20 text-white/80 border-white/30";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-500/20 text-green-200 border-green-400/30";
      case "in progress":
        return "bg-blue-500/20 text-blue-200 border-blue-400/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-200 border-yellow-400/30";
      case "not started":
        return "bg-white/20 text-white/80 border-white/30";
      default:
        return "bg-white/20 text-white/80 border-white/30";
    }
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {/* Add Task Card */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 cursor-pointer hover:bg-white/15 transition-all duration-200 min-h-[200px] flex items-center justify-center" onClick={handleAddTask}>
        <AddTaskButton onAddTask={handleAddTask} />
      </div>
      
      {tasks.map((task, index) => (
        <div key={index} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 cursor-pointer hover:bg-white/15 transition-all duration-200" onClick={() => handleTaskClick(task)}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-white truncate text-lg">{task.taskName}</h3>
            </div>
            <div className="flex items-center space-x-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()} className="text-white/70 hover:text-white hover:bg-white/20">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="backdrop-blur-xl bg-white/90 border border-white/20 shadow-xl">
                  <DropdownMenuItem 
                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Task
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 mb-4">
            <Badge variant="outline" className={getPriorityColor(task.priority)}>
              {task.priority}
            </Badge>
            <Badge variant="outline" className={getStatusColor(task.status)}>
              {task.status}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-3 mb-4">
            <Avatar className="w-8 h-8">
              <AvatarImage src={task.assignedTo.avatar} />
              <AvatarFallback className="bg-white/20 text-white text-xs">
                {task.assignedTo.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-white/80">{task.assignedTo.name}</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/70">Due Date</span>
              <span className="text-xs text-white/90">{task.dueDate}</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/70">Progress</span>
                <span className="text-xs text-white/90">{task.progress}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div 
                  className="bg-white/60 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${task.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl overflow-hidden">
      {isMobile ? (
        // Mobile Card View
        <div className="space-y-3 p-4">
          {/* Add Task Button for Mobile */}
          <div className="mb-4 backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-4">
            <AddTaskButton onAddTask={handleAddTask} />
          </div>
          
          {tasks.map((task, index) => (
            <div key={index} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-4 cursor-pointer hover:bg-white/15 transition-all duration-200" onClick={() => handleTaskClick(task)}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white truncate">{task.taskName}</h3>
                </div>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleTaskClick(task); }} className="text-white/70 hover:text-white hover:bg-white/20">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()} className="text-white/70 hover:text-white hover:bg-white/20">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="backdrop-blur-xl bg-white/90 border border-white/20 shadow-xl">
                      <DropdownMenuItem 
                        className="text-red-600 focus:text-red-600 focus:bg-red-50"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Task
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
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
                    <AvatarFallback className="bg-white/20 text-white text-xs">
                      {task.assignedTo.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-white/80">{task.assignedTo.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/70">{task.dueDate}</p>
                  <p className="text-xs text-white/90">{task.progress}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Desktop Table View
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="backdrop-blur-xl bg-white/10 border-b border-white/20 hover:bg-white/15">
                <TableHead className="w-12 text-white/80">
                  <Checkbox className="border-white/30" />
                </TableHead>
                <TableHead className="text-white/80">Task Name</TableHead>
                <TableHead className="text-white/80">Priority</TableHead>
                <TableHead className="text-white/80">Assigned To</TableHead>
                <TableHead className="text-white/80">Due Date</TableHead>
                <TableHead className="text-white/80">Status</TableHead>
                <TableHead className="text-white/80">Progress</TableHead>
                <TableHead className="text-white/80">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Add Task Row */}
               <TableRow className="hover:bg-white/10 cursor-pointer border-b border-white/10" onClick={handleAddTask}>
                <TableCell colSpan={8} className="p-4">
                  <AddTaskButton onAddTask={handleAddTask} />
                </TableCell>
              </TableRow>
              
              {tasks.map((task, index) => (
                <TableRow key={index} className="hover:bg-white/10 border-b border-white/10">
                  <TableCell>
                    <Checkbox className="border-white/30" />
                  </TableCell>
                  <TableCell 
                    className="font-medium cursor-pointer hover:text-white text-white/90"
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
                        <AvatarFallback className="bg-white/20 text-white">
                          {task.assignedTo.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-white/80">{task.assignedTo.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-white/80">{task.dueDate}</TableCell>
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
                      <div className="w-16 bg-white/20 rounded-full h-2">
                        <div 
                          className="bg-white/60 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-white/80">{task.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleTaskClick(task)}
                        className="text-white/70 hover:text-white hover:bg-white/20"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/20">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="backdrop-blur-xl bg-white/90 border border-white/20 shadow-xl">
                          <DropdownMenuItem 
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
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
    </div>
  );

  return (
    <div className="space-y-6">
      {viewMode === "grid" ? renderGridView() : renderListView()}

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
        projectId={projectId || ''}
      />
    </div>
  );
};
