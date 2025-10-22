import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Edit, MoreHorizontal, Trash2, Clock, User } from 'lucide-react';
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
  taskTypeFilter?: 'All' | 'Task' | 'Bug' | 'Feature';
}

export const TaskListView = ({ 
  projectId, 
  viewMode = "list", 
  selectedTaskIds = [],
  onTaskSelectionChange,
  isAddTaskDialogOpen = false,
  onCloseAddTaskDialog,
  taskTypeFilter = 'All'
}: TaskListViewProps) => {
  const { tasks, deleteTask } = useTaskContext();
  const [localAddTaskDialogOpen, setLocalAddTaskDialogOpen] = useState(false);
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
        return "bg-rose-50/80 text-rose-700 border border-rose-200/50 backdrop-blur-sm";
      case "medium":
        return "bg-amber-50/80 text-amber-700 border border-amber-200/50 backdrop-blur-sm";
      case "low":
        return "bg-emerald-50/80 text-emerald-700 border border-emerald-200/50 backdrop-blur-sm";
      default:
        return "bg-slate-50/80 text-slate-700 border border-slate-200/50 backdrop-blur-sm";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-emerald-50/80 text-emerald-700 border border-emerald-200/50 backdrop-blur-sm";
      case "in progress":
        return "bg-blue-50/80 text-blue-700 border border-blue-200/50 backdrop-blur-sm";
      case "pending":
        return "bg-amber-50/80 text-amber-700 border border-amber-200/50 backdrop-blur-sm";
      case "not started":
        return "bg-slate-50/80 text-slate-700 border border-slate-200/50 backdrop-blur-sm";
      default:
        return "bg-slate-50/80 text-slate-700 border border-slate-200/50 backdrop-blur-sm";
    }
  };

  const getTaskTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "bug":
        return "bg-rose-50/80 text-rose-700 border border-rose-200/50 backdrop-blur-sm";
      case "feature":
        return "bg-violet-50/80 text-violet-700 border border-violet-200/50 backdrop-blur-sm";
      case "task":
        return "bg-luxury-champagne/60 text-luxury-gold-dark border border-luxury-gold/30 backdrop-blur-sm";
      default:
        return "bg-slate-50/80 text-slate-700 border border-slate-200/50 backdrop-blur-sm";
    }
  };

  // Circular progress component
  const CircularProgress = ({ progress }: { progress: number }) => {
    const radius = 8;
    const circumference = 2 * Math.PI * radius;
    const progressOffset = circumference - (progress / 100) * circumference;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg className="w-5 h-5 transform -rotate-90" viewBox="0 0 20 20">
          <circle
            cx="10"
            cy="10"
            r={radius}
            fill="none"
            stroke="hsl(var(--accent))"
            strokeWidth="2"
          />
          <circle
            cx="10"
            cy="10"
            r={radius}
            fill="none"
            stroke="hsl(var(--luxury-gold))"
            strokeWidth="2"
            strokeDasharray={circumference}
            strokeDashoffset={progressOffset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <span className="absolute text-[6px] font-semibold text-[hsl(var(--foreground))]">
          {progress}
        </span>
      </div>
    );
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
    <div className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.04)] border border-[hsl(var(--border))]">
      {isMobile ? (
        // Mobile Luxury Card View
        <div className="divide-y divide-border/30">
          {filteredTasks.map((task) => (
            <div 
              key={task.id} 
              className="p-4 hover:bg-accent/30 transition-all duration-200 cursor-pointer active:bg-accent/50 group"
              onClick={() => handleTaskClick(task)}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <CircularProgress progress={task.progress} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono text-muted-foreground tracking-wider">{task.task_number || 'N/A'}</span>
                      <Badge variant="outline" className={`${getTaskTypeColor(task.taskType)} text-[10px] h-4 px-1.5 font-medium`}>
                        {task.taskType}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-sm text-foreground line-clamp-1 tracking-tight">{task.taskName}</h3>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-luxury-gold/10 transition-all duration-200 group-hover:opacity-100 opacity-60">
                      <MoreHorizontal className="w-4 h-4 text-luxury-gold" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36 backdrop-blur-xl bg-white/95 border-border/50 shadow-lg">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleTaskClick(task); }}>
                      <Edit className="w-3.5 h-3.5 mr-2" />
                      Edit Task
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive focus:bg-destructive/10"
                      onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="flex items-center gap-1.5 mb-3">
                <Badge variant="outline" className={`${getPriorityColor(task.priority)} text-[10px] h-5 px-2 font-medium`}>
                  {task.priority}
                </Badge>
                <Badge variant="outline" className={`${getStatusColor(task.status)} text-[10px] h-5 px-2 font-medium`}>
                  {task.status}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6 border border-border/50">
                    <AvatarImage src={task.assignedTo.avatar} />
                    <AvatarFallback className="text-[10px] bg-luxury-champagne text-luxury-gold-dark">
                      {task.assignedTo.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-muted-foreground truncate max-w-[120px] font-medium tracking-wide">{task.assignedTo.name}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span className="font-medium">{task.dueDate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Desktop Table View - Luxury Modern Design
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/50 bg-accent/20 hover:bg-accent/20">
                <TableHead className="w-10 h-11 px-4">
                  <Checkbox 
                    className="border-border/70 data-[state=checked]:bg-luxury-gold data-[state=checked]:border-luxury-gold transition-all duration-200" 
                    checked={selectedTaskIds.length === filteredTasks.length && filteredTasks.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="h-11 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">ID</TableHead>
                <TableHead className="h-11 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Task</TableHead>
                <TableHead className="h-11 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Type</TableHead>
                <TableHead className="h-11 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Priority</TableHead>
                <TableHead className="h-11 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Assignee</TableHead>
                <TableHead className="h-11 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Due Date</TableHead>
                <TableHead className="h-11 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Status</TableHead>
                <TableHead className="h-11 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-center">Progress</TableHead>
                <TableHead className="h-11 px-4 w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow 
                  key={task.id} 
                  className="border-b border-border/30 hover:bg-accent/30 transition-all duration-200 group h-14"
                >
                  <TableCell className="px-4">
                    <Checkbox 
                      className="border-border/70 data-[state=checked]:bg-luxury-gold data-[state=checked]:border-luxury-gold transition-all duration-200" 
                      checked={selectedTaskIds.includes(task.id)}
                      onCheckedChange={(checked) => handleTaskSelection(task.id, checked === true)}
                    />
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <span className="text-[11px] font-mono text-muted-foreground tracking-wider">
                      {task.task_number || 'N/A'}
                    </span>
                  </TableCell>
                  <TableCell 
                    className="px-4 py-3 font-semibold cursor-pointer hover:text-luxury-gold transition-colors max-w-[350px]"
                    onClick={() => handleTaskClick(task)}
                  >
                    <div className="flex items-center gap-2">
                      <CircularProgress progress={task.progress} />
                      <div className="truncate text-sm tracking-tight">{task.taskName}</div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge 
                      variant="outline" 
                      className={`${getTaskTypeColor(task.taskType)} text-[10px] h-6 px-2.5 font-medium shadow-sm`}
                    >
                      {task.taskType}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge 
                      variant="outline" 
                      className={`${getPriorityColor(task.priority)} text-[10px] h-6 px-2.5 font-medium shadow-sm`}
                    >
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-7 h-7 border border-border/50">
                        <AvatarImage src={task.assignedTo.avatar} />
                        <AvatarFallback className="text-[10px] bg-luxury-champagne text-luxury-gold-dark font-medium">
                          {task.assignedTo.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground truncate max-w-[140px] font-medium tracking-wide">
                        {task.assignedTo.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {task.dueDate}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Badge 
                      variant="outline" 
                      className={`${getStatusColor(task.status)} text-[10px] h-6 px-2.5 font-medium shadow-sm`}
                    >
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center justify-center">
                      <div className="relative w-12 h-12">
                        <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 48 48">
                          <circle
                            cx="24"
                            cy="24"
                            r="20"
                            fill="none"
                            stroke="hsl(var(--accent))"
                            strokeWidth="4"
                          />
                          <circle
                            cx="24"
                            cy="24"
                            r="20"
                            fill="none"
                            stroke="url(#goldGradient)"
                            strokeWidth="4"
                            strokeDasharray={2 * Math.PI * 20}
                            strokeDashoffset={2 * Math.PI * 20 - (task.progress / 100) * 2 * Math.PI * 20}
                            strokeLinecap="round"
                            className="transition-all duration-500"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[10px] font-semibold text-foreground">{task.progress}%</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleTaskClick(task)}
                        className="h-8 w-8 p-0 hover:bg-luxury-gold/10 hover:text-luxury-gold transition-all duration-200"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-luxury-gold/10 hover:text-luxury-gold transition-all duration-200">
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36 backdrop-blur-xl bg-white/95 border-border/50 shadow-lg">
                          <DropdownMenuItem onClick={() => handleTaskClick(task)}>
                            <Edit className="w-3.5 h-3.5 mr-2" />
                            Edit Task
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive focus:bg-destructive/10"
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
    <div className="space-y-5">
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
