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
   * Convert a WBS Activity to a detailed Task
   */
  static async convertWBSToTask(wbsItem: WBSItem, projectId: string): Promise<any> {
    console.log('🔄 Converting WBS Activity to Task:', wbsItem.id, wbsItem.title);

    // Create the task with WBS data
    const taskData = {
      project_id: projectId,
      task_name: wbsItem.title,
      description: wbsItem.description || '',
      task_type: wbsItem.category || 'General',
      priority: wbsItem.priority || 'Medium',
      assigned_to: wbsItem.assigned_to || null,
      due_date: wbsItem.end_date || null,
      status: this.mapWBSStatusToTaskStatus(wbsItem.status),
      progress: wbsItem.progress || 0,
      wbs_item_id: wbsItem.id, // Link to WBS item
      estimated_hours: wbsItem.estimated_hours,
      actual_hours: wbsItem.actual_hours,
    };

    // Insert the task
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .insert(taskData)
      .select('*')
      .single();

    if (taskError) throw taskError;

    // Update WBS item to link back to task
    const { error: wbsError } = await supabase
      .from('wbs_items')
      .update({
        linked_task_id: task.id,
        is_task_enabled: true,
        task_conversion_date: new Date().toISOString(),
      })
      .eq('id', wbsItem.id);

    if (wbsError) throw wbsError;

    console.log('✅ Successfully converted WBS to Task:', task.id);
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

    // Update WBS item to remove linkage
    await supabase
      .from('wbs_items')
      .update({
        linked_task_id: null,
        is_task_enabled: false,
        task_conversion_date: null,
      })
      .eq('id', wbsItemId);
  }

  /**
   * Map WBS status to Task status
   */
  private static mapWBSStatusToTaskStatus(wbsStatus?: string): string {
    switch (wbsStatus) {
      case 'Completed':
        return 'completed';
      case 'In Progress':
        return 'in_progress';
      case 'On Hold':
        return 'on_hold';
      case 'Not Started':
      default:
        return 'not_started';
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
          priority: wbsItem.priority as WBSItem['priority']
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