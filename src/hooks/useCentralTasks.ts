import { useState, useEffect, useCallback } from 'react';
import { CentralTask, CentralTaskService, TaskUpdate } from '@/services/centralTaskService';
import { useToast } from '@/hooks/use-toast';

export const useCentralTasks = (projectId: string, companyId: string) => {
  const [tasks, setTasks] = useState<CentralTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load tasks
  const loadTasks = useCallback(async () => {
    if (!projectId || !companyId) return;
    
    try {
      setLoading(true);
      setError(null);
      const tasksData = await CentralTaskService.loadProjectTasks(projectId, companyId);
      setTasks(tasksData);
    } catch (err) {
      console.error('Error loading tasks:', err);
      setError('Failed to load tasks');
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [projectId, companyId, toast]);

  // Create task
  const createTask = useCallback(async (taskData: Partial<CentralTask>) => {
    try {
      const newTask = await CentralTaskService.createTask(projectId, companyId, taskData);
      setTasks(prev => [...prev, newTask]);
      toast({
        title: "Success",
        description: "Task created successfully"
      });
      return newTask;
    } catch (err) {
      console.error('Error creating task:', err);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive"
      });
      throw err;
    }
  }, [projectId, companyId, toast]);

  // Update task
  const updateTask = useCallback(async (taskId: string, updates: TaskUpdate) => {
    try {
      await CentralTaskService.updateTask(taskId, updates);
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      ));
      toast({
        title: "Success",
        description: "Task updated successfully"
      });
    } catch (err) {
      console.error('Error updating task:', err);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive"
      });
      // Reload tasks to revert optimistic update
      loadTasks();
      throw err;
    }
  }, [toast, loadTasks]);

  // Delete task
  const deleteTask = useCallback(async (taskId: string) => {
    try {
      await CentralTaskService.deleteTask(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
      toast({
        title: "Success",
        description: "Task deleted successfully"
      });
    } catch (err) {
      console.error('Error deleting task:', err);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive"
      });
      throw err;
    }
  }, [toast]);

  // Get tasks grouped by stage
  const getTasksByStage = useCallback(() => {
    const grouped: { [stage: string]: CentralTask[] } = {};
    tasks.forEach(task => {
      if (!grouped[task.stage]) {
        grouped[task.stage] = [];
      }
      grouped[task.stage].push(task);
    });
    return grouped;
  }, [tasks]);

  // Get project cost summary
  const getCostSummary = useCallback(() => {
    let totalBudgeted = 0;
    let totalActual = 0;
    const stages: { [stage: string]: { budgeted: number; actual: number } } = {};

    tasks.forEach(task => {
      const budgeted = task.budgeted_cost || 0;
      const actual = task.actual_cost || 0;
      
      totalBudgeted += budgeted;
      totalActual += actual;

      if (!stages[task.stage]) {
        stages[task.stage] = { budgeted: 0, actual: 0 };
      }
      stages[task.stage].budgeted += budgeted;
      stages[task.stage].actual += actual;
    });

    return {
      totalBudgeted,
      totalActual,
      variance: totalBudgeted - totalActual,
      stages
    };
  }, [tasks]);

  // Listen for real-time updates
  useEffect(() => {
    const handleTaskUpdate = (event: CustomEvent) => {
      const { taskId, updates } = event.detail;
      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      ));
    };

    const handleTaskDelete = (event: CustomEvent) => {
      const { taskId } = event.detail;
      setTasks(prev => prev.filter(task => task.id !== taskId));
    };

    const handleStageUpdate = (event: CustomEvent) => {
      const { projectId: updatedProjectId, oldStage, newStage } = event.detail;
      if (updatedProjectId === projectId) {
        setTasks(prev => prev.map(task => 
          task.stage === oldStage ? { ...task, stage: newStage } : task
        ));
      }
    };

    window.addEventListener('task-updated', handleTaskUpdate as EventListener);
    window.addEventListener('task-deleted', handleTaskDelete as EventListener);
    window.addEventListener('stage-updated', handleStageUpdate as EventListener);

    return () => {
      window.removeEventListener('task-updated', handleTaskUpdate as EventListener);
      window.removeEventListener('task-deleted', handleTaskDelete as EventListener);
      window.removeEventListener('stage-updated', handleStageUpdate as EventListener);
    };
  }, [projectId]);

  // Load tasks on mount
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return {
    tasks,
    loading,
    error,
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
    getTasksByStage,
    getCostSummary
  };
};