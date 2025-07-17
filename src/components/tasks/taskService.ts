import { supabase } from '@/integrations/supabase/client';
import { Task } from './types';

export const taskService = {
  async loadTasksForProject(projectId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Map database fields to component interface
    return (data || []).map(task => ({
      id: task.id,
      project_id: task.project_id,
      taskName: task.task_name,
      priority: task.priority as 'High' | 'Medium' | 'Low',
      assignedTo: {
        name: task.assigned_to_name || '',
        avatar: task.assigned_to_avatar || ''
      },
      dueDate: task.due_date || '',
      status: task.status as 'Completed' | 'In Progress' | 'Pending' | 'Not Started',
      progress: task.progress,
      description: task.description,
      
      digital_object_id: task.digital_object_id,
      created_at: task.created_at,
      updated_at: task.updated_at
    }));
  },

  async updateTask(taskId: string, updates: Partial<Task>, userProfile: any): Promise<void> {
    // Map component fields to database fields
    const dbUpdates: any = {};
    if (updates.taskName !== undefined) dbUpdates.task_name = updates.taskName;
    if (updates.assignedTo !== undefined) {
      dbUpdates.assigned_to_name = updates.assignedTo.name;
      dbUpdates.assigned_to_avatar = updates.assignedTo.avatar;
    }
    if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.progress !== undefined) dbUpdates.progress = updates.progress;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    
    if (updates.digital_object_id !== undefined) dbUpdates.digital_object_id = updates.digital_object_id;

    const { error } = await supabase
      .from('tasks')
      .update(dbUpdates)
      .eq('id', taskId);

    if (error) throw error;

    // Log activity for significant changes
    await this.logTaskActivity(taskId, updates, userProfile);
  },

  async addTask(taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
    // Map component fields to database fields
    const dbTask = {
      project_id: taskData.project_id,
      task_name: taskData.taskName,
      priority: taskData.priority,
      assigned_to_name: taskData.assignedTo?.name || null,
      assigned_to_avatar: taskData.assignedTo?.avatar || null,
      due_date: taskData.dueDate || null,
      status: taskData.status,
      progress: taskData.progress,
      description: taskData.description || null,
      
      digital_object_id: taskData.digital_object_id || null
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert([dbTask])
      .select()
      .single();

    if (error) throw error;

    // Map response back to component interface
    return {
      id: data.id,
      project_id: data.project_id,
      taskName: data.task_name,
      priority: data.priority as 'High' | 'Medium' | 'Low',
      assignedTo: {
        name: data.assigned_to_name || '',
        avatar: data.assigned_to_avatar || ''
      },
      dueDate: data.due_date || '',
      status: data.status as 'Completed' | 'In Progress' | 'Pending' | 'Not Started',
      progress: data.progress,
      description: data.description,
      
      digital_object_id: data.digital_object_id,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  },

  async deleteTask(taskId: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;
  },

  async logTaskActivity(taskId: string, updates: Partial<Task>, userProfile: any): Promise<void> {
    const activityPromises = [];
    const userName = `${userProfile.firstName} ${userProfile.lastName}`.trim() || 'Anonymous User';
    const userAvatar = userProfile.avatarUrl || '';
    
    if (updates.status !== undefined) {
      activityPromises.push(
        supabase.from('task_activity_log').insert({
          task_id: taskId,
          user_name: userName,
          user_avatar: userAvatar,
          action_type: 'status_change',
          action_description: `changed status to ${updates.status}`
        })
      );
    }
    if (updates.assignedTo !== undefined) {
      activityPromises.push(
        supabase.from('task_activity_log').insert({
          task_id: taskId,
          user_name: userName,
          user_avatar: userAvatar,
          action_type: 'assignment_change',
          action_description: `assigned to ${updates.assignedTo.name}`
        })
      );
    }
    if (updates.progress !== undefined && updates.progress === 100) {
      activityPromises.push(
        supabase.from('task_activity_log').insert({
          task_id: taskId,
          user_name: userName,
          user_avatar: userAvatar,
          action_type: 'task_completed',
          action_description: 'completed this task'
        })
      );
    }
    if (updates.taskName !== undefined) {
      activityPromises.push(
        supabase.from('task_activity_log').insert({
          task_id: taskId,
          user_name: userName,
          user_avatar: userAvatar,
          action_type: 'task_updated',
          action_description: 'updated task name'
        })
      );
    }
    if (updates.description !== undefined) {
      activityPromises.push(
        supabase.from('task_activity_log').insert({
          task_id: taskId,
          user_name: userName,
          user_avatar: userAvatar,
          action_type: 'task_updated',
          action_description: 'updated task description'
        })
      );
    }
    if (updates.dueDate !== undefined) {
      activityPromises.push(
        supabase.from('task_activity_log').insert({
          task_id: taskId,
          user_name: userName,
          user_avatar: userAvatar,
          action_type: 'task_updated',
          action_description: 'updated due date'
        })
      );
    }
    
    // Execute activity logging (don't await to avoid blocking UI)
    if (activityPromises.length > 0) {
      Promise.all(activityPromises).catch(console.error);
    }
  }
};