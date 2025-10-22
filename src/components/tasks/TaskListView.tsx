import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Edit, MoreHorizontal, Trash2, Filter, Clock, User } from 'lucide-react';
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
import { useTaskContext } from './useTaskContext';
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
  const [localAddTaskDialogOpen, setLocalAddTaskDialogOpen] = useState(false);
  const [taskTypeFilter, setTaskTypeFilter] = useState<'All' | 'Task' | 'Bug' | 'Feature'>('All');
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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
    // Navigate to task edit page
    const currentPage = searchParams.get('page') || 'home';
    navigate(`/?page=task-edit&taskId=${task.id}&from=${currentPage}`);
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
        return "bg-red-50 text-red-700 border-red-200";
      case "medium":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "low":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "in progress":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "not started":
        return "bg-slate-50 text-slate-700 border-slate-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const getTaskTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "bug":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "feature":
        return "bg-violet-50 text-violet-700 border-violet-200";
      case "task":
        return "bg-sky-50 text-sky-700 border-sky-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
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
            <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300 font-medium">
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
    <div className="backdrop-blur-xl bg-white/80 border border-white/40 rounded-lg overflow-hidden shadow-sm">
      {isMobile ? (
        // Mobile Card View - More Compact
        <div className="divide-y divide-border/50">
          {filteredTasks.map((task) => (
            <div 
              key={task.id} 
              className="p-3 hover:bg-accent/50 transition-colors cursor-pointer active:bg-accent"
              onClick={() => handleTaskClick(task)}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-muted-foreground">{task.task_number || 'N/A'}</span>
                    <Badge variant="outline" className={`${getTaskTypeColor(task.taskType)} text-[10px] h-4 px-1.5`}>
                      {task.taskType}
                    </Badge>
                  </div>
                  <h3 className="font-medium text-sm text-foreground line-clamp-1">{task.taskName}</h3>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-32">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleTaskClick(task); }}>
                      <Edit className="w-3.5 h-3.5 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive"
                      onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="flex items-center gap-1.5 mb-2">
                <Badge variant="outline" className={`${getPriorityColor(task.priority)} text-[10px] h-4 px-1.5`}>
                  {task.priority}
                </Badge>
                <Badge variant="outline" className={`${getStatusColor(task.status)} text-[10px] h-4 px-1.5`}>
                  {task.status}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <Avatar className="w-5 h-5">
                    <AvatarImage src={task.assignedTo.avatar} />
                    <AvatarFallback className="text-[10px]">
                      {task.assignedTo.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-muted-foreground truncate max-w-[100px]">{task.assignedTo.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">{task.dueDate}</span>
                  <span className="text-foreground font-medium">{task.progress}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Desktop Table View - More Compact & Modern
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/50 bg-muted/30 hover:bg-muted/30">
                <TableHead className="w-8 h-9 p-2">
                  <Checkbox 
                    className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary" 
                    checked={selectedTaskIds.length === filteredTasks.length && filteredTasks.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="h-9 px-2 text-xs font-semibold text-muted-foreground">ID</TableHead>
                <TableHead className="h-9 px-2 text-xs font-semibold text-muted-foreground">Task</TableHead>
                <TableHead className="h-9 px-2 text-xs font-semibold text-muted-foreground">Type</TableHead>
                <TableHead className="h-9 px-2 text-xs font-semibold text-muted-foreground">Priority</TableHead>
                <TableHead className="h-9 px-2 text-xs font-semibold text-muted-foreground">Assignee</TableHead>
                <TableHead className="h-9 px-2 text-xs font-semibold text-muted-foreground">Due</TableHead>
                <TableHead className="h-9 px-2 text-xs font-semibold text-muted-foreground">Status</TableHead>
                <TableHead className="h-9 px-2 text-xs font-semibold text-muted-foreground text-right">Progress</TableHead>
                <TableHead className="h-9 px-2 w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow 
                  key={task.id} 
                  className="border-b border-border/30 hover:bg-accent/50 transition-colors group h-10"
                >
                  <TableCell className="p-2">
                    <Checkbox 
                      className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary" 
                      checked={selectedTaskIds.includes(task.id)}
                      onCheckedChange={(checked) => handleTaskSelection(task.id, checked === true)}
                    />
                  </TableCell>
                  <TableCell className="px-2 py-1.5">
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {task.task_number || 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell 
                    className="px-2 py-1.5 font-medium cursor-pointer hover:text-primary transition-colors max-w-[300px]"
                    onClick={() => handleTaskClick(task)}
                  >
                    <div className="truncate text-sm">{task.taskName}</div>
                  </TableCell>
                  <TableCell className="px-2 py-1.5">
                    <Badge 
                      variant="outline" 
                      className={`${getTaskTypeColor(task.taskType)} text-[10px] h-5 px-2 font-medium`}
                    >
                      {task.taskType}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-2 py-1.5">
                    <Badge 
                      variant="outline" 
                      className={`${getPriorityColor(task.priority)} text-[10px] h-5 px-2 font-medium`}
                    >
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-2 py-1.5">
                    <div className="flex items-center gap-1.5">
                      <Avatar className="w-5 h-5">
                        <AvatarImage src={task.assignedTo.avatar} />
                        <AvatarFallback className="text-[10px]">
                          {task.assignedTo.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                        {task.assignedTo.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-2 py-1.5">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {task.dueDate}
                    </div>
                  </TableCell>
                  <TableCell className="px-2 py-1.5">
                    <Badge 
                      variant="outline" 
                      className={`${getStatusColor(task.status)} text-[10px] h-5 px-2 font-medium`}
                    >
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-2 py-1.5">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 bg-muted/50 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-primary h-full rounded-full transition-all duration-300" 
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-medium text-foreground w-8 text-right">
                        {task.progress}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-2 py-1.5">
                    <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleTaskClick(task)}
                        className="h-6 w-6 p-0 hover:bg-accent"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-accent">
                            <MoreHorizontal className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32">
                          <DropdownMenuItem onClick={() => handleTaskClick(task)}>
                            <Edit className="w-3.5 h-3.5 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-2" />
                            Delete
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
    <div className="space-y-4">
      {/* Task Type Filter - More Compact */}
      <div className="flex items-center gap-2 backdrop-blur-xl bg-white/80 border border-white/40 rounded-lg p-3 shadow-sm">
        <Filter className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground">Filter:</span>
        <div className="flex gap-1">
          {(['All', 'Task', 'Bug', 'Feature'] as const).map((type) => (
            <Button
              key={type}
              variant={taskTypeFilter === type ? "default" : "ghost"}
              size="sm"
              onClick={() => setTaskTypeFilter(type)}
              className={`h-7 text-xs transition-all ${
                taskTypeFilter === type 
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              {type}
              {type !== 'All' && (
                <Badge 
                  variant="secondary" 
                  className="ml-1.5 h-4 text-[10px] px-1.5 bg-muted"
                >
                  {type === 'Task' 
                    ? tasks.filter(t => (!projectId || t.project_id === projectId) && t.taskType === 'Task').length
                    : type === 'Bug'
                    ? tasks.filter(t => (!projectId || t.project_id === projectId) && t.taskType === 'Bug').length
                    : tasks.filter(t => (!projectId || t.project_id === projectId) && t.taskType === 'Feature').length
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
