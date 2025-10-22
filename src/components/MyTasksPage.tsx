import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Search } from "lucide-react";
import { useUser } from '@/contexts/UserContext';
import { Task } from './tasks/types';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { BoardView } from './tasks/BoardView';
import { MyTasksLoadingState } from './my-tasks/MyTasksLoadingState';
import { cn } from '@/lib/utils';

interface MyTasksPageProps {
  onNavigate: (page: string) => void;
}

export const MyTasksPage = ({ onNavigate }: MyTasksPageProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTaskType, setSelectedTaskType] = useState<string>('all');
  const { userProfile } = useUser();
  const { toast } = useToast();

  // Function to refresh tasks
  const refreshTasks = async () => {
    if (!userProfile.firstName && !userProfile.lastName) {
      return;
    }

    try {
      // Get current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fullName = `${userProfile.firstName} ${userProfile.lastName}`.trim();
      
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

      const mappedTasks: Task[] = (allTasks || []).map(task => ({
        id: task.id,
        project_id: task.project_id,
        projectName: task.projects?.name || 'Unknown Project',
        taskName: task.task_name,
        task_number: task.task_number || '',
        taskType: (task.task_type as 'Task' | 'Bug' | 'Feature') || 'Task',
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
    } catch (error) {
      console.error('Error refreshing tasks:', error);
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

  // Get backlog tasks (incomplete tasks)
  const getBacklogTasks = () => {
    return tasks.filter(task => {
      // Filter by search term
      const matchesSearch = !searchTerm || 
        task.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.projectName.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by task type
      const matchesType = selectedTaskType === 'all' || task.taskType === selectedTaskType;
      
      // Show incomplete tasks
      const isIncomplete = task.status !== 'Completed';
      
      return matchesSearch && matchesType && isIncomplete;
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

  const taskTypes = ['all', 'Task', 'Bug', 'Feature', 'Issue'];

  if (loading) {
    return <MyTasksLoadingState />;
  }

  const backlogTasks = getBacklogTasks();

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-background via-accent/20 to-muted/30"></div>
      
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 pt-6 pb-4 px-6 border-b border-border/50">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onNavigate("home")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground font-playfair">
                My <span className="text-primary">Tasks</span>
              </h1>
              <p className="text-muted-foreground mt-1">{tasks.length} tasks assigned to you</p>
            </div>
            <Button onClick={() => onNavigate('task-edit&from=my-tasks')} className="gap-2">
              <Plus className="w-4 h-4" />
              New Task
            </Button>
          </div>
        </div>

        {/* Main Content - Split Layout */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex gap-6 p-6">
            {/* Left Side - Task Backlog */}
            <div className="w-80 flex-shrink-0 flex flex-col">
              <Card className="flex-1 flex flex-col border-border/50 shadow-lg">
                <CardContent className="p-6 flex flex-col h-full">
                  <h2 className="text-xl font-bold text-foreground mb-4 font-playfair">Task Backlog</h2>
                  
                  <Button 
                    onClick={() => onNavigate('task-edit&from=my-tasks')}
                    className="w-full mb-4 bg-primary hover:bg-primary/90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add to backlog
                  </Button>

                  {/* Search */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Type here to search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  {/* Task Type Filter */}
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Task Type</h3>
                    <div className="flex flex-wrap gap-2">
                      {taskTypes.map((type) => (
                        <Button
                          key={type}
                          variant={selectedTaskType === type ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedTaskType(type)}
                          className={cn(
                            "text-xs",
                            selectedTaskType === type && "bg-primary text-primary-foreground"
                          )}
                        >
                          {type === 'all' ? 'All Types' : type}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Backlog Rules Info */}
                  <div className="mb-4 p-3 bg-muted/30 rounded-lg border border-border/30">
                    <h3 className="text-sm font-semibold text-foreground mb-1">Backlog Rules</h3>
                    <p className="text-xs text-muted-foreground">
                      Shows all incomplete tasks (any status except "Completed")
                    </p>
                  </div>

                  {/* Task List */}
                  <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                    {backlogTasks.length === 0 ? (
                      <div className="text-center py-8 text-sm text-muted-foreground">
                        No tasks in backlog
                      </div>
                    ) : (
                      backlogTasks.map((task) => (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStartBacklog(e, task)}
                          onClick={() => handleTaskClick(task)}
                          className="bg-background border border-border rounded-lg p-3 cursor-move hover:shadow-md hover:border-primary/50 transition-all group"
                        >
                          <h4 className="font-semibold text-sm text-foreground mb-2 line-clamp-2">
                            {task.taskName}
                          </h4>
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {task.taskType}
                            </Badge>
                            <Badge 
                              variant={task.priority === 'High' ? 'destructive' : 'secondary'}
                              className="text-xs"
                            >
                              {task.priority}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {task.projectName}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Side - Kanban Board */}
            <div className="flex-1 overflow-hidden">
              <Card className="h-full border-border/50 shadow-lg">
                <CardContent className="p-6 h-full">
                  <BoardView 
                    tasks={tasks}
                    onTaskUpdate={handleTaskUpdate}
                    onTaskClick={handleTaskClick}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};