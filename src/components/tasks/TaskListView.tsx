import React, { useState, useMemo } from 'react';
import { Edit, MoreHorizontal, Trash2, Filter } from 'lucide-react';
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
  selectedTaskIds?: string[];
  onTaskSelectionChange?: (selectedIds: string[]) => void;
  isAddTaskDialogOpen?: boolean;
  onCloseAddTaskDialog?: () => void;
}

export const TaskListView = ({ 
  projectId, 
  viewMode = "list", 
  selectedTaskIds = [],
  onTaskSelectionChange,
  isAddTaskDialogOpen = false,
  onCloseAddTaskDialog
}: TaskListViewProps) => {
  const { tasks, deleteTask } = useTaskContext();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [localAddTaskDialogOpen, setLocalAddTaskDialogOpen] = useState(false);
  const [taskTypeFilter, setTaskTypeFilter] = useState<'All' | 'Task' | 'Issue'>('All');
  const isMobile = useIsMobile();

  // Filter tasks based on project and task type
  const filteredTasks = useMemo(() => {
    let filtered = projectId ? tasks.filter(task => task.project_id === projectId) : tasks;
    
    if (taskTypeFilter !== 'All') {
      filtered = filtered.filter(task => task.taskType === taskTypeFilter);
    }
    
    return filtered;
  }, [tasks, projectId, taskTypeFilter]);

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
    // This functionality is now handled by the parent component
    // We keep this function for compatibility but it's not used anymore
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
  };

  const handleTaskSelection = (taskId: string, checked: boolean) => {
    if (!onTaskSelectionChange) return;
    
    if (checked) {
      onTaskSelectionChange([...selectedTaskIds, taskId]);
    } else {
      onTaskSelectionChange(selectedTaskIds.filter(id => id !== taskId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (!onTaskSelectionChange) return;
    
    if (checked) {
      onTaskSelectionChange(filteredTasks.map(task => task.id));
    } else {
      onTaskSelectionChange([]);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-500/30 text-red-100 border-red-400/50 font-medium";
      case "medium":
        return "bg-yellow-500/30 text-yellow-100 border-yellow-400/50 font-medium";
      case "low":
        return "bg-green-500/30 text-green-100 border-green-400/50 font-medium";
      default:
        return "bg-slate-500/30 text-slate-100 border-slate-400/50 font-medium";
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
      
      {filteredTasks.map((task, index) => (
        <div key={index} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6 cursor-pointer hover:bg-white/15 transition-all duration-200" onClick={() => handleTaskClick(task)}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <div className="text-xs font-mono text-slate-500 mb-1">{task.task_number || 'N/A'}</div>
              <h3 className="font-medium text-foreground truncate text-lg">{task.taskName}</h3>
            </div>
            <div className="flex items-center space-x-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()} className="text-muted-foreground hover:text-foreground hover:bg-muted/50">
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
            <Badge variant="outline" className="bg-purple-500/20 text-purple-200 border-purple-400/30">
              {task.taskType}
            </Badge>
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
              <AvatarFallback className="bg-muted text-foreground text-xs">
                {task.assignedTo.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">{task.assignedTo.name}</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Due Date</span>
              <span className="text-xs text-foreground">{task.dueDate}</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Progress</span>
                <span className="text-xs text-foreground">{task.progress}%</span>
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
          
          {filteredTasks.map((task, index) => (
            <div key={index} className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-lg p-4 cursor-pointer hover:bg-white/15 transition-all duration-200" onClick={() => handleTaskClick(task)}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-mono text-slate-500 mb-1">{task.task_number || 'N/A'}</div>
                  <h3 className="font-medium text-foreground truncate">{task.taskName}</h3>
                </div>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleTaskClick(task); }} className="text-muted-foreground hover:text-foreground hover:bg-muted/50">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()} className="text-muted-foreground hover:text-foreground hover:bg-muted/50">
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
                <Badge variant="outline" className="bg-purple-500/20 text-purple-200 border-purple-400/30">
                  {task.taskType}
                </Badge>
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
                    <AvatarFallback className="bg-muted text-foreground text-xs">
                      {task.assignedTo.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">{task.assignedTo.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{task.dueDate}</p>
                  <p className="text-xs text-foreground">{task.progress}%</p>
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
                <TableHead className="w-12 text-foreground p-2">
                  <Checkbox 
                    className="border-slate-400 data-[state=checked]:bg-slate-700 data-[state=checked]:border-slate-700" 
                     checked={selectedTaskIds.length === filteredTasks.length && filteredTasks.length > 0}
                     onCheckedChange={handleSelectAll}
                   />
                </TableHead>
                <TableHead className="text-foreground p-2">Task #</TableHead>
                <TableHead className="text-foreground p-2">Task Name</TableHead>
                <TableHead className="text-foreground p-2">Type</TableHead>
                <TableHead className="text-foreground p-2">Priority</TableHead>
                <TableHead className="text-foreground p-2">Assigned To</TableHead>
                <TableHead className="text-foreground p-2">Due Date</TableHead>
                <TableHead className="text-foreground p-2">Status</TableHead>
                <TableHead className="text-foreground p-2">Progress</TableHead>
                <TableHead className="text-foreground p-2">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              
              {filteredTasks.map((task, index) => (
                <TableRow key={index} className="hover:bg-white/10 border-b border-white/10 h-12">
                  <TableCell className="p-2 w-12">
                    <Checkbox 
                      className="border-slate-400 data-[state=checked]:bg-slate-700 data-[state=checked]:border-slate-700" 
                      checked={selectedTaskIds.includes(task.id)}
                      onCheckedChange={(checked) => handleTaskSelection(task.id, checked === true)}
                    />
                  </TableCell>
                  <TableCell className="p-2 text-xs font-mono text-slate-600">
                    {task.task_number || 'N/A'}
                  </TableCell>
                  <TableCell 
                    className="font-medium cursor-pointer hover:text-foreground text-foreground p-2"
                    onClick={() => handleTaskClick(task)}
                  >
                    {task.taskName}
                  </TableCell>
                  <TableCell className="p-2">
                    <Badge 
                      variant="outline" 
                      className="bg-purple-500/20 text-purple-200 border-purple-400/30"
                    >
                      {task.taskType}
                    </Badge>
                  </TableCell>
                  <TableCell className="p-2">
                    <Badge 
                      variant="outline" 
                      className={getPriorityColor(task.priority)}
                    >
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="p-2">
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={task.assignedTo.avatar} />
                        <AvatarFallback className="bg-muted text-foreground text-xs">
                          {task.assignedTo.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">{task.assignedTo.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground p-2">{task.dueDate}</TableCell>
                  <TableCell className="p-2">
                    <Badge 
                      variant="outline" 
                      className={getStatusColor(task.status)}
                    >
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="p-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-12 bg-white/20 rounded-full h-1.5">
                        <div 
                          className="bg-white/60 h-1.5 rounded-full transition-all duration-300" 
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-muted-foreground">{task.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="p-2">
                    <div className="flex items-center space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleTaskClick(task)}
                        className="text-muted-foreground hover:text-foreground hover:bg-muted/50 h-7 w-7 p-0"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-muted/50 h-7 w-7 p-0">
                            <MoreHorizontal className="w-3 h-3" />
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
      {/* Task Type Filter */}
      <div className="flex items-center gap-2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Filter by Type:</span>
        <div className="flex gap-1">
          {(['All', 'Task', 'Issue'] as const).map((type) => (
            <Button
              key={type}
              variant={taskTypeFilter === type ? "default" : "outline"}
              size="sm"
              onClick={() => setTaskTypeFilter(type)}
              className={`transition-all duration-200 ${
                taskTypeFilter === type 
                  ? 'bg-white/20 text-white border-white/30 hover:bg-white/25' 
                  : 'backdrop-blur-xl bg-white/5 border-white/20 text-muted-foreground hover:bg-white/10 hover:text-foreground'
              }`}
            >
              {type}
              {type !== 'All' && (
                <Badge 
                  variant="secondary" 
                  className="ml-2 bg-white/20 text-white/80 border-white/20"
                >
                  {type === 'Task' 
                    ? tasks.filter(t => (!projectId || t.project_id === projectId) && t.taskType === 'Task').length
                    : tasks.filter(t => (!projectId || t.project_id === projectId) && t.taskType === 'Issue').length
                  }
                </Badge>
              )}
            </Button>
          ))}
        </div>
        {taskTypeFilter !== 'All' && (
          <span className="text-xs text-muted-foreground">
            Showing {filteredTasks.length} {taskTypeFilter.toLowerCase()}{filteredTasks.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {viewMode === "grid" ? renderGridView() : renderListView()}

      <TaskEditSidePanel
        task={selectedTask}
        isOpen={isSidePanelOpen}
        onClose={handleCloseSidePanel}
        projectId={projectId}
      />

      <AddTaskDialog
        isOpen={isAddTaskDialogOpen || localAddTaskDialogOpen}
        onClose={() => {
          if (onCloseAddTaskDialog) onCloseAddTaskDialog();
          setLocalAddTaskDialogOpen(false);
        }}
        status="Not Started"
        projectId={projectId || ''}
      />
    </div>
  );
};
