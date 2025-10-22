import { supabase } from '@/integrations/supabase/client';
import { WBSItem } from '@/types/wbs';
import { Task } from '@/components/tasks/types';

export interface WBSTaskConversion {
  wbsItemId: string;
  taskId: string;
  conversionDate: string;
}

export class WBSTaskConversionService {
  /**
   * Resolve user ID from assigned name by querying profiles table
   */
  private static async resolveUserId(assignedToName: string): Promise<string | null> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('user_id')
        .or(`first_name.ilike.%${assignedToName}%,last_name.ilike.%${assignedToName}%,email.ilike.%${assignedToName}%`)
        .limit(1)
        .single();

      if (error || !profile) {
        console.warn('⚠️ Could not resolve user ID for:', assignedToName);
        return null;
      }

      console.log('✅ Resolved user ID for', assignedToName, ':', profile.user_id);
      return profile.user_id;
    } catch (error) {
      console.error('Error resolving user ID:', error);
      return null;
    }
  }

  /**
   * Convert a WBS Activity to a detailed Task
   */
  static async convertWBSToTask(wbsItem: WBSItem, projectId: string): Promise<any> {
    console.log('🔄 Converting WBS Activity to Task:', wbsItem.id, wbsItem.title);

    // Resolve user ID if assigned
    let assignedToUserId = null;
    if (wbsItem.assigned_to) {
      assignedToUserId = await this.resolveUserId(wbsItem.assigned_to);
    }

    // Prepare due date - always set to midnight for backlog
    let dueDate = null;
    if (wbsItem.end_date) {
      const date = new Date(wbsItem.end_date);
      date.setHours(0, 0, 0, 0); // Set to midnight for backlog
      dueDate = date.toISOString();
    } else {
      // Default to today at midnight if no end date
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dueDate = today.toISOString();
    }

    // Create the task with WBS data
    const taskData = {
      project_id: projectId,
      task_name: wbsItem.title,
      description: wbsItem.description || '',
      task_type: wbsItem.category || 'Task',
      category: wbsItem.category || 'General',
      priority: wbsItem.priority || 'Medium',
      assigned_to_name: wbsItem.assigned_to || null,
      assigned_to_avatar: null,
      assigned_to_user_id: assignedToUserId,
      due_date: dueDate,
      status: 'Not Started', // Always start as "Not Started" for backlog
      progress: 0, // Always start at 0% for new tasks
      wbs_item_id: wbsItem.id, // Link to WBS item
      duration: wbsItem.duration || 0,
      estimated_hours: wbsItem.estimated_hours || 0,
      actual_hours: wbsItem.actual_hours || 0,
      is_milestone: false,
      is_critical_path: false,
      task_number: `TASK-${Date.now() % 100000}`, // Generate a unique task number
    };

    // Insert the task
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .insert(taskData)
      .select('*')
      .single();

    if (taskError) throw taskError;

    console.log('✅ Successfully converted WBS to Task:', task.id);

    // Send email notification if task is assigned to a user (fire and forget)
    if (task.assigned_to_user_id) {
      console.log('📧 Sending task assignment email for task:', task.id);
      supabase.functions
        .invoke('send-task-assignment-email', {
          body: { taskId: task.id }
        })
        .then(({ data, error }) => {
          if (error) {
            console.error('Failed to send task assignment email:', error);
          } else {
            console.log('Task assignment email sent successfully:', data);
          }
        })
        .catch((err) => {
          console.error('Exception sending task assignment email:', err);
        });
    }

    return task;
  }

  /**
   * Check if a WBS item is linked to a task
   */
  static async isWBSLinkedToTask(wbsItemId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('wbs_items')
      .select('is_task_enabled, linked_task_id')
      .eq('id', wbsItemId)
      .single();

    if (error) return false;
    return data?.is_task_enabled === true && data?.linked_task_id != null;
  }

  /**
   * Get the linked task for a WBS item
   */
  static async getLinkedTask(wbsItemId: string): Promise<any | null> {
    const { data: wbsData, error: wbsError } = await supabase
      .from('wbs_items')
      .select('linked_task_id')
      .eq('id', wbsItemId)
      .single();

    if (wbsError || !wbsData?.linked_task_id) return null;

    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', wbsData.linked_task_id)
      .single();

    if (taskError) return null;
    return task;
  }

  /**
   * Remove task linkage from WBS item
   */
  static async unlinkWBSFromTask(wbsItemId: string): Promise<void> {
    // First get the linked task ID to delete it
    const { data: wbsData } = await supabase
      .from('wbs_items')
      .select('linked_task_id')
      .eq('id', wbsItemId)
      .single();

    if (wbsData?.linked_task_id) {
      // Delete the task
      await supabase
        .from('tasks')
        .delete()
        .eq('id', wbsData.linked_task_id);
    }
  }

  /**
   * Map WBS status to Task status
   */
  private static mapWBSStatusToTaskStatus(wbsStatus?: string): string {
    switch (wbsStatus) {
      case 'Completed':
        return 'Completed';
      case 'In Progress':
        return 'In Progress';
      case 'Not Started':
        return 'Not Started';
      case 'Pending':
        return 'Pending';
      default:
        return 'Not Started';
    }
  }

  /**
   * Get WBS items that are linked to tasks
   */
  static async getWBSItemsWithTasks(projectId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('wbs_items')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_task_enabled', true)
      .not('linked_task_id', 'is', null);

    if (error) throw error;
    return data || [];
  }

  /**
   * Bulk convert multiple WBS items to tasks
   */
  static async bulkConvertWBSToTasks(wbsItemIds: string[], projectId: string): Promise<any[]> {
    const tasks: any[] = [];

    for (const wbsItemId of wbsItemIds) {
      // Get the WBS item
      const { data: wbsItem, error } = await supabase
        .from('wbs_items')
        .select('*')
        .eq('id', wbsItemId)
        .single();

      if (error || !wbsItem) continue;

      // Check if already converted
      if (wbsItem.is_task_enabled) continue;

      try {
        const wbsItemWithChildren = { 
          ...wbsItem, 
          children: [],
          status: wbsItem.status as WBSItem['status'],
          health: wbsItem.health as WBSItem['health'],
          progress_status: wbsItem.progress_status as WBSItem['progress_status'],
          category: wbsItem.category as WBSItem['category'],
          linked_tasks: Array.isArray(wbsItem.linked_tasks) 
            ? wbsItem.linked_tasks.map(task => String(task))
            : [],
          predecessors: Array.isArray(wbsItem.predecessors) 
            ? wbsItem.predecessors as unknown as WBSItem['predecessors']
            : [],
          priority: wbsItem.priority as WBSItem['priority'],
          text_formatting: wbsItem.text_formatting ? (wbsItem.text_formatting as any) : null
        };
        const task = await this.convertWBSToTask(wbsItemWithChildren, projectId);
        tasks.push(task);
      } catch (error) {
        console.error(`Failed to convert WBS item ${wbsItemId}:`, error);
      }
    }

    return tasks;
  }
}