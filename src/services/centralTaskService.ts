import { supabase } from '@/integrations/supabase/client';

export interface CentralTask {
  id: string;
  project_id: string;
  company_id: string;
  name: string;
  description?: string;
  stage: string;
  parent_id?: string;
  level: number;
  
  // Timeline data
  start_date?: string;
  end_date?: string;
  duration?: number;
  progress?: number;
  
  // Cost data
  budgeted_cost?: number;
  actual_cost?: number;
  
  // Status and organization
  status?: string;
  priority?: string;
  assigned_to?: string;
  is_expanded: boolean;
  sort_order?: number;
  
  // Dependencies
  dependencies: string[];
  linked_tasks: string[];
  
  // Metadata
  created_at: string;
  updated_at: string;
}

export interface TaskUpdate {
  name?: string;
  description?: string;
  stage?: string;
  start_date?: string;
  end_date?: string;
  duration?: number;
  progress?: number;
  budgeted_cost?: number;
  actual_cost?: number;
  status?: string;
  priority?: string;
  assigned_to?: string;
  is_expanded?: boolean;
  dependencies?: string[];
}

export class CentralTaskService {
  // Load all tasks for a project
  static async loadProjectTasks(projectId: string, companyId: string): Promise<CentralTask[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('project_id', projectId)
      .eq('company_id', companyId)
      .order('level', { ascending: true })
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (data || []).map(activity => this.mapActivityToCentralTask(activity));
  }

  // Create a new task
  static async createTask(
    projectId: string, 
    companyId: string, 
    taskData: Partial<CentralTask>
  ): Promise<CentralTask> {
    const { data, error } = await supabase
      .from('activities')
      .insert({
        project_id: projectId,
        company_id: companyId,
        name: taskData.name || 'New Task',
        description: taskData.description,
        stage: taskData.stage || '4.0 PRELIMINARY',
        parent_id: taskData.parent_id,
        level: taskData.level || 0,
        start_date: taskData.start_date,
        end_date: taskData.end_date,
        duration: taskData.duration,
        cost_est: taskData.budgeted_cost,
        cost_actual: taskData.actual_cost,
        dependencies: taskData.dependencies || [],
        is_expanded: taskData.is_expanded !== false,
        sort_order: taskData.sort_order || 0
      })
      .select()
      .single();

    if (error) throw error;

    return this.mapActivityToCentralTask(data);
  }

  // Update a task
  static async updateTask(taskId: string, updates: TaskUpdate): Promise<void> {
    const dbUpdates: any = {};
    
    // Map updates to database columns
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.stage !== undefined) dbUpdates.stage = updates.stage;
    if (updates.start_date !== undefined) dbUpdates.start_date = updates.start_date;
    if (updates.end_date !== undefined) dbUpdates.end_date = updates.end_date;
    if (updates.duration !== undefined) dbUpdates.duration = updates.duration;
    if (updates.budgeted_cost !== undefined) dbUpdates.cost_est = updates.budgeted_cost;
    if (updates.actual_cost !== undefined) dbUpdates.cost_actual = updates.actual_cost;
    if (updates.dependencies !== undefined) dbUpdates.dependencies = updates.dependencies;
    if (updates.is_expanded !== undefined) dbUpdates.is_expanded = updates.is_expanded;

    const { error } = await supabase
      .from('activities')
      .update(dbUpdates)
      .eq('id', taskId);

    if (error) throw error;

    // Notify all subscribers of the change
    await this.notifyTaskUpdate(taskId, updates);
  }

  // Delete a task
  static async deleteTask(taskId: string): Promise<void> {
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', taskId);

    if (error) throw error;

    await this.notifyTaskDelete(taskId);
  }

  // Get tasks by stage
  static async getTasksByStage(projectId: string, stage: string): Promise<CentralTask[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('project_id', projectId)
      .eq('stage', stage)
      .order('sort_order', { ascending: true });

    if (error) throw error;

    return (data || []).map(activity => this.mapActivityToCentralTask(activity));
  }

  // Get all unique stages for a project
  static async getProjectStages(projectId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('activities')
      .select('stage')
      .eq('project_id', projectId)
      .not('stage', 'is', null);

    if (error) throw error;

    const stages = [...new Set((data || []).map(item => item.stage))];
    return stages.filter(Boolean);
  }

  // Calculate cost totals for a project
  static async getProjectCostSummary(projectId: string): Promise<{
    totalBudgeted: number;
    totalActual: number;
    variance: number;
    stages: { [stage: string]: { budgeted: number; actual: number } };
  }> {
    const tasks = await this.loadProjectTasks(projectId, ''); // We'll get company_id from context
    
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
  }

  // Synchronize stage updates across all tasks in that stage
  static async updateStage(projectId: string, oldStage: string, newStage: string): Promise<void> {
    const { error } = await supabase
      .from('activities')
      .update({ stage: newStage })
      .eq('project_id', projectId)
      .eq('stage', oldStage);

    if (error) throw error;

    // Notify all components of stage change
    await this.notifyStageUpdate(projectId, oldStage, newStage);
  }

  // Private helper methods
  private static mapActivityToCentralTask(activity: any): CentralTask {
    return {
      id: activity.id,
      project_id: activity.project_id,
      company_id: activity.company_id,
      name: activity.name,
      description: activity.description,
      stage: activity.stage,
      parent_id: activity.parent_id,
      level: activity.level,
      start_date: activity.start_date,
      end_date: activity.end_date,
      duration: activity.duration,
      progress: 0, // This could be calculated or stored separately
      budgeted_cost: activity.cost_est,
      actual_cost: activity.cost_actual,
      status: activity.stage, // Map stage to status for now
      priority: 'Medium', // Default priority
      assigned_to: '', // This could be stored separately
      is_expanded: activity.is_expanded,
      sort_order: activity.sort_order,
      dependencies: activity.dependencies || [],
      linked_tasks: [],
      created_at: activity.created_at,
      updated_at: activity.updated_at
    };
  }

  private static async notifyTaskUpdate(taskId: string, updates: TaskUpdate): Promise<void> {
    // Emit custom events for real-time updates across components
    const event = new CustomEvent('task-updated', {
      detail: { taskId, updates }
    });
    window.dispatchEvent(event);
  }

  private static async notifyTaskDelete(taskId: string): Promise<void> {
    const event = new CustomEvent('task-deleted', {
      detail: { taskId }
    });
    window.dispatchEvent(event);
  }

  private static async notifyStageUpdate(projectId: string, oldStage: string, newStage: string): Promise<void> {
    const event = new CustomEvent('stage-updated', {
      detail: { projectId, oldStage, newStage }
    });
    window.dispatchEvent(event);
  }
}