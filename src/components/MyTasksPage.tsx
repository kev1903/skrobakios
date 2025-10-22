import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Search, GripVertical, Clock } from "lucide-react";
import { useUser } from '@/contexts/UserContext';
import { Task } from './tasks/types';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { BoardView } from './tasks/BoardView';
import { MyTasksLoadingState } from './my-tasks/MyTasksLoadingState';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useMenuBarSpacing } from '@/hooks/useMenuBarSpacing';

interface MyTasksPageProps {
  onNavigate: (page: string) => void;
}

export const MyTasksPage = ({ onNavigate }: MyTasksPageProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTaskType, setSelectedTaskType] = useState<string>('All');
  const [isDragOverBacklog, setIsDragOverBacklog] = useState(false);
  const { userProfile } = useUser();
  const { toast } = useToast();
  const { spacingClasses, fullHeightClasses } = useMenuBarSpacing();

  // Function to refresh tasks
  const refreshTasks = async () => {
    if (!userProfile.firstName && !userProfile.lastName) {
      console.log('⚠️ MyTasks: No user profile available');
      return;
    }

    try {
      // Get current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('⚠️ MyTasks: No authenticated user');
        return;
      }

      const fullName = `${userProfile.firstName} ${userProfile.lastName}`.trim();
      console.log('📋 MyTasks: Fetching tasks for user:', fullName, 'ID:', user.id);
      
      // Query tasks assigned by user_id OR by name (for backwards compatibility)
      const { data: allTasks, error } = await supabase
        .from('tasks')
        .select(`
          *,
          projects (
            id,
            name,
            project_id
          )
        `)
        .or(`assigned_to_user_id.eq.${user.id},assigned_to_name.ilike.%${fullName}%,assigned_to_name.ilike.%${userProfile.firstName}%,assigned_to_name.ilike.%${userProfile.lastName}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('✅ MyTasks: Fetched', allTasks?.length || 0, 'tasks');

      const mappedTasks: Task[] = (allTasks || []).map(task => ({
        id: task.id,
        project_id: task.project_id,
        projectName: task.projects?.name || 'Unknown Project',
        taskName: task.task_name,
        task_number: task.task_number || '',
        taskType: (task.task_type as 'Task' | 'Bug' | 'Feature' | 'Issue') || 'Task',
        category: task.category || 'General',
        priority: task.priority as 'High' | 'Medium' | 'Low',
        assignedTo: {
          name: task.assigned_to_name || '',
          avatar: task.assigned_to_avatar || ''
        },
        dueDate: task.due_date || '',
        status: task.status as 'Completed' | 'In Progress' | 'Pending' | 'Not Started',
        progress: task.progress,
        description: task.description,
        duration: Number(task.duration) || 0,
        is_milestone: task.is_milestone,
        is_critical_path: task.is_critical_path,
        created_at: task.created_at,
        updated_at: task.updated_at
      }));

      setTasks(mappedTasks);
      console.log('📊 MyTasks: Mapped tasks:', mappedTasks.map(t => ({ name: t.taskName, dueDate: t.dueDate, type: t.taskType })));
    } catch (error) {
      console.error('❌ MyTasks: Error refreshing tasks:', error);
      toast({
        title: "Error loading tasks",
        description: "Failed to fetch your tasks. Please refresh the page.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    // Initial load
    const fetchMyTasks = async () => {
      setLoading(true);
      await refreshTasks();
      setLoading(false);
    };

    fetchMyTasks();

    // Set up real-time subscription for task changes
    const channel = supabase
      .channel('my-tasks-realtime-sync')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'tasks'
        },
        (payload) => {
          console.log('MyTasks: Task change detected:', payload);
          // Refetch tasks when any task changes
          refreshTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userProfile, toast]);

  // Get backlog tasks (tasks without scheduled time - at midnight or no due date)
  const getBacklogTasks = () => {
    return tasks.filter(task => {
      // Filter by search term
      const matchesSearch = !searchTerm || 
        task.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.projectName.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by task type
      const matchesType = selectedTaskType === 'All' || task.taskType === selectedTaskType;
      
      // Tasks without due_date always show in backlog
      if (!task.dueDate) {
        console.log(`Task "${task.taskName}" in backlog (no due date)`);
        return matchesType && matchesSearch;
      }
      
      // Tasks with due_date at midnight (00:00) are considered backlog/unscheduled
      try {
        const taskDateTime = new Date(task.dueDate);
        const isBacklogTask = taskDateTime.getHours() === 0 && taskDateTime.getMinutes() === 0;
        
        if (isBacklogTask) {
          console.log(`Task "${task.taskName}" in backlog (midnight due date: ${task.dueDate})`);
        }
        
        return matchesSearch && matchesType && isBacklogTask;
      } catch (error) {
        console.error('Error parsing due date for task:', task.taskName, error);
        // If date parsing fails, show in backlog
        return matchesType && matchesSearch;
      }
    });
  };

  const handleTaskClick = (task: Task) => {
    onNavigate(`task-edit&taskId=${task.id}&from=my-tasks`);
  };

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          ...(updates.dueDate && { due_date: updates.dueDate }),
          ...(updates.taskName && { task_name: updates.taskName }),
          ...(updates.status && { status: updates.status }),
          ...(updates.priority && { priority: updates.priority }),
          ...(updates.progress !== undefined && { progress: updates.progress }),
        })
        .eq('id', taskId);

      if (error) throw error;
      await refreshTasks();
      
      toast({
        title: "Task updated",
        description: "Task status has been updated successfully",
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const handleDragStartBacklog = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const taskTypes = ['All', 'Task', 'Issue', 'Bug', 'Feature'];

  if (loading) {
    return <MyTasksLoadingState />;
  }

  const backlogTasks = getBacklogTasks();

  return (
    <div>
      {/* Main Background Container */}
      <div className="h-screen relative overflow-hidden bg-white">
        {/* Main Content Container */}
        <div className={cn("relative z-10 flex h-full font-inter", spacingClasses)}>
          {/* Left Sidebar - Task Backlog */}
          <div className={cn(
            "fixed left-0 w-80 bg-gradient-to-b from-card to-muted/20 border-r border-border p-6 space-y-6 overflow-y-auto transition-all duration-300 shadow-sm",
            fullHeightClasses, 
            spacingClasses.includes('pt-') ? 'top-[73px]' : 'top-0'
          )}>
            {/* Return to Home Button */}
            <button 
              onClick={() => onNavigate("home")}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group font-inter"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium text-sm">Return to Home</span>
            </button>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Type here to search" 
                className="pl-10 h-11 text-sm font-inter" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Task Backlog */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-foreground text-base font-inter">Task Backlog</h3>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onNavigate('task-edit&from=my-tasks')}
                    className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors font-inter"
                  >
                    ADD TASK
                  </button>
                </div>
              </div>

              {/* Task Type Filter */}
              <div className="flex flex-wrap gap-2 mb-4">
                {taskTypes.map((type) => (
                  <button 
                    key={type}
                    onClick={() => setSelectedTaskType(type)} 
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 font-inter hover:scale-105", 
                      selectedTaskType === type 
                        ? type === 'All' ? 'bg-primary text-primary-foreground shadow-lg ring-2 ring-primary/20'
                          : type === 'Task' ? 'bg-green-500 text-white shadow-lg ring-2 ring-green-500/20'
                          : type === 'Issue' ? 'bg-orange-500 text-white shadow-lg ring-2 ring-orange-500/20'
                          : type === 'Bug' ? 'bg-red-500 text-white shadow-lg ring-2 ring-red-500/20'
                          : 'bg-purple-500 text-white shadow-lg ring-2 ring-purple-500/20'
                        : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    {type === 'All' ? 'All' : type + 's'}
                  </button>
                ))}
              </div>

              <div 
                className={cn(
                  "space-y-2 min-h-[100px] p-3 rounded-lg border-2 border-dashed transition-all duration-200 relative",
                  isDragOverBacklog 
                    ? "bg-primary/10 border-primary shadow-inner" 
                    : "bg-transparent border-transparent"
                )}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  setIsDragOverBacklog(true);
                }}
                onDragLeave={() => {
                  setIsDragOverBacklog(false);
                }}
                onDrop={async (e) => {
                  e.preventDefault();
                  setIsDragOverBacklog(false);
                  
                  const taskId = e.dataTransfer.getData('text/plain');
                  const task = tasks.find(t => t.id === taskId);
                  
                  if (!task) return;
                  
                  try {
                    // Set to midnight to mark as backlog task
                    const backlogDate = task.dueDate ? new Date(task.dueDate) : new Date();
                    backlogDate.setHours(0, 0, 0, 0);
                    
                    await handleTaskUpdate(taskId, {
                      status: 'Not Started',
                      dueDate: backlogDate.toISOString()
                    });
                    
                    toast({
                      title: "Task moved to backlog",
                      description: "Task status set to 'Not Started'.",
                      duration: 2000,
                    });
                  } catch (error) {
                    console.error('Failed to move task to backlog:', error);
                  }
                }}
              >
                {/* Drop Zone Indicator */}
                {isDragOverBacklog && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 bg-primary/5 rounded-lg">
                    <div className="bg-background/95 border-2 border-primary border-dashed rounded-lg px-6 py-4 shadow-lg">
                      <div className="flex items-center gap-2 text-primary font-semibold">
                        <Plus className="w-5 h-5" />
                        <span>Drop here to move to Backlog (Not Started)</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {loading ? (
                  <div className="text-center py-4">
                    <div className="text-sm text-muted-foreground font-inter">Loading tasks...</div>
                  </div>
                ) : backlogTasks.length === 0 ? (
                  <div className="text-center py-4">
                    <div className="text-sm text-muted-foreground font-inter">No tasks in backlog</div>
                  </div>
                ) : (
                  backlogTasks.map((task) => (
                    <div 
                      key={task.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', task.id);
                        e.currentTarget.classList.add('opacity-50');
                      }}
                      onDragEnd={(e) => {
                        e.currentTarget.classList.remove('opacity-50');
                      }}
                      className="draggable-task-element px-3 py-3 rounded-lg cursor-move transition-all duration-200 group border bg-card border-border hover:bg-accent hover:shadow-md hover:border-primary/50 hover:-translate-y-0.5"
                      onClick={() => handleTaskClick(task)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                          <GripVertical className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-foreground truncate mb-2 cursor-move group-hover:text-primary transition-colors font-inter">
                            {task.taskName}
                          </h4>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-xs text-muted-foreground font-medium truncate font-inter">
                              📁 {task.projectName || 'No Project'}
                            </p>
                            <span className={cn(
                              "px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 font-inter", 
                              task.taskType === 'Task' ? 'bg-green-100 text-green-700 border border-green-200' 
                              : task.taskType === 'Bug' ? 'bg-red-100 text-red-700 border border-red-200' 
                              : task.taskType === 'Feature' ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                              : task.taskType === 'Issue' ? 'bg-orange-100 text-orange-700 border border-orange-200'
                              : 'bg-muted text-muted-foreground border border-border'
                            )}>
                              {task.taskType}
                            </span>
                            <span className="px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 bg-blue-100 text-blue-700 border border-blue-200 font-inter flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {task.dueDate ? format(new Date(task.dueDate), 'MMM d') : 'No date'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Content - Board View */}
          <div className="flex-1 flex flex-col p-6 ml-80 overflow-hidden">
            <div className="flex-1 bg-card rounded-lg border border-border shadow-sm p-6 overflow-hidden">
              <BoardView 
                tasks={tasks}
                onTaskUpdate={handleTaskUpdate}
                onTaskClick={handleTaskClick}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};