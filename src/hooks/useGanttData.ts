import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

interface Task {
  id: string;
  task_name: string;
  start_date?: string;
  end_date?: string;
  estimated_duration?: number;
  actual_duration?: number;
  progress: number;
  status: string;
  is_milestone: boolean;
  is_critical_path: boolean;
  assigned_to_name?: string;
  assigned_to_avatar?: string;
  project_id: string;
}

interface TaskDependency {
  id: string;
  predecessor_task_id: string;
  successor_task_id: string;
  dependency_type: string;
  lag_days: number;
}

export const useGanttData = (projectId: string) => {
  const queryClient = useQueryClient();

  // Fetch tasks with scheduling data
  const {
    data: tasks = [],
    isLoading: tasksLoading,
    error: tasksError,
  } = useQuery({
    queryKey: ['gantt-tasks', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at');

      if (error) throw error;
      return data as Task[];
    },
    enabled: !!projectId,
  });

  // Fetch task dependencies
  const {
    data: dependencies = [],
    isLoading: dependenciesLoading,
    error: dependenciesError,
  } = useQuery({
    queryKey: ['task-dependencies', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_dependencies')
        .select(`
          *,
          predecessor:tasks!predecessor_task_id(project_id),
          successor:tasks!successor_task_id(project_id)
        `)
        .or(`predecessor.project_id.eq.${projectId},successor.project_id.eq.${projectId}`);

      if (error) throw error;
      return data as TaskDependency[];
    },
    enabled: !!projectId,
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: Partial<Task> }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gantt-tasks', projectId] });
      toast({
        title: 'Task updated',
        description: 'Task has been successfully updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating task',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Create dependency mutation
  const createDependencyMutation = useMutation({
    mutationFn: async ({ 
      predecessorId, 
      successorId, 
      dependencyType = 'finish_to_start',
      lagDays = 0 
    }: { 
      predecessorId: string; 
      successorId: string; 
      dependencyType?: string;
      lagDays?: number;
    }) => {
      const { data, error } = await supabase
        .from('task_dependencies')
        .insert({
          predecessor_task_id: predecessorId,
          successor_task_id: successorId,
          dependency_type: dependencyType,
          lag_days: lagDays,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-dependencies', projectId] });
      toast({
        title: 'Dependency created',
        description: 'Task dependency has been successfully created.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error creating dependency',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete dependency mutation
  const deleteDependencyMutation = useMutation({
    mutationFn: async (dependencyId: string) => {
      const { error } = await supabase
        .from('task_dependencies')
        .delete()
        .eq('id', dependencyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-dependencies', projectId] });
      toast({
        title: 'Dependency deleted',
        description: 'Task dependency has been successfully deleted.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error deleting dependency',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    updateTaskMutation.mutate({ taskId, updates });
  };

  const handleDependencyCreate = (predecessorId: string, successorId: string) => {
    createDependencyMutation.mutate({ predecessorId, successorId });
  };

  const handleDependencyDelete = (dependencyId: string) => {
    deleteDependencyMutation.mutate(dependencyId);
  };

  return {
    tasks,
    dependencies,
    isLoading: tasksLoading || dependenciesLoading,
    error: tasksError || dependenciesError,
    handleTaskUpdate,
    handleDependencyCreate,
    handleDependencyDelete,
  };
};