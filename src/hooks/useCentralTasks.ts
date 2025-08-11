import { useState, useEffect, useCallback } from 'react';
import { CentralTask, CentralTaskService, TaskUpdate } from '@/services/centralTaskService';
import { useToast } from '@/hooks/use-toast';

// Demo data for testing
const createDemoTasks = (projectId: string, companyId: string): CentralTask[] => [
  {
    id: '26',
    project_id: projectId,
    company_id: companyId,
    name: 'Excavation',
    description: 'Included in Slab Cost',
    stage: '5.1 BASE STAGE',
    level: 0,
    status: 'TO DO',
    budgeted_cost: 0,
    actual_cost: 0,
    is_expanded: false,
    dependencies: [],
    linked_tasks: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '27',
    project_id: projectId,
    company_id: companyId,
    name: 'Slab',
    description: '',
    stage: '5.1 BASE STAGE',
    level: 0,
    status: 'TO DO',
    budgeted_cost: 110000,
    actual_cost: 0,
    is_expanded: false,
    dependencies: [],
    linked_tasks: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '28',
    project_id: projectId,
    company_id: companyId,
    name: 'Site Clean',
    description: '4 Site Clean',
    stage: '5.1 BASE STAGE',
    level: 0,
    status: 'TO DO',
    budgeted_cost: 6600,
    actual_cost: 0,
    is_expanded: false,
    dependencies: [],
    linked_tasks: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '29',
    project_id: projectId,
    company_id: companyId,
    name: 'Set Out',
    description: '',
    stage: '5.1 BASE STAGE',
    level: 0,
    status: 'TO DO',
    budgeted_cost: 400,
    actual_cost: 0,
    is_expanded: false,
    dependencies: [],
    linked_tasks: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '30',
    project_id: projectId,
    company_id: companyId,
    name: 'Protection Works',
    description: '',
    stage: '5.1 BASE STAGE',
    level: 0,
    status: 'TO DO',
    budgeted_cost: 1200,
    actual_cost: 0,
    is_expanded: false,
    dependencies: [],
    linked_tasks: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '31',
    project_id: projectId,
    company_id: companyId,
    name: 'Planter Boxes',
    description: '',
    stage: '5.1 BASE STAGE',
    level: 0,
    status: 'TO DO',
    budgeted_cost: 3800,
    actual_cost: 0,
    is_expanded: false,
    dependencies: [],
    linked_tasks: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '32',
    project_id: projectId,
    company_id: companyId,
    name: 'Pest Control Part A',
    description: '',
    stage: '5.1 BASE STAGE',
    level: 0,
    status: 'TO DO',
    budgeted_cost: 1200,
    actual_cost: 0,
    is_expanded: false,
    dependencies: [],
    linked_tasks: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '33',
    project_id: projectId,
    company_id: companyId,
    name: 'Fence Painting',
    description: '',
    stage: '5.1 BASE STAGE',
    level: 0,
    status: 'TO DO',
    budgeted_cost: 800,
    actual_cost: 0,
    is_expanded: false,
    dependencies: [],
    linked_tasks: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '34',
    project_id: projectId,
    company_id: companyId,
    name: 'Fence - Rear',
    description: 'At the back',
    stage: '5.1 BASE STAGE',
    level: 0,
    status: 'TO DO',
    budgeted_cost: 500,
    actual_cost: 0,
    is_expanded: false,
    dependencies: [],
    linked_tasks: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

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
      // For demo purposes, use the demo data instead of API call
      const demoTasks = createDemoTasks(projectId, companyId);
      setTasks(demoTasks);
      
      // Uncomment this line and comment the demo data when you want to use real API
      // const tasksData = await CentralTaskService.loadProjectTasks(projectId, companyId);
      // setTasks(tasksData);
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