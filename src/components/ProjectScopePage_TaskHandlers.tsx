// Task conversion handlers for ProjectScopePage
// This file contains the handlers for converting WBS activities to tasks

import { WBSTaskConversionService } from '@/services/wbsTaskConversionService';
import { toast } from 'sonner';

export const createTaskConversionHandlers = (
  project: any,
  findWBSItem: (id: string) => any,
  setSelectedTask: (task: any) => void,
  setIsTaskDetailOpen: (open: boolean) => void,
  loadWBSItems: () => Promise<void>,
  updateWBSItem: (itemId: string, updates: any) => Promise<void>,
  onNavigate: (page: string) => void
) => {
  
  const handleConvertToTask = async (itemId: string) => {
    try {
      const wbsItem = findWBSItem(itemId);
      if (!wbsItem) {
        toast.error('WBS item not found');
        return;
      }

      if (wbsItem.is_task_enabled) {
        toast.error('This WBS item is already linked to a task');
        return;
      }

      const task = await WBSTaskConversionService.convertWBSToTask(wbsItem, project.id);
      
      // Immediately update local state to show green icon (like RFQ button)
      await updateWBSItem(itemId, {
        is_task_enabled: true,
        linked_task_id: task.id,
        task_conversion_date: new Date().toISOString()
      });
      
      toast.success(`Successfully converted "${wbsItem.title}" to a detailed task`);
      
    } catch (error) {
      console.error('Error converting WBS to task:', error);
      toast.error('Failed to convert WBS item to task');
    }
  };

  const handleViewTaskDetails = async (itemId: string) => {
    try {
      const task = await WBSTaskConversionService.getLinkedTask(itemId);
      if (!task) {
        toast.error('No linked task found');
        return;
      }

      setSelectedTask(task);
      setIsTaskDetailOpen(true);
      
    } catch (error) {
      console.error('Error fetching linked task:', error);
      toast.error('Failed to load task details');
    }
  };

  const handleUnlinkTask = async (itemId: string) => {
    try {
      await WBSTaskConversionService.unlinkWBSFromTask(itemId);
      
      // Immediately update local state to remove green icon (like RFQ button)
      await updateWBSItem(itemId, {
        is_task_enabled: false,
        linked_task_id: null,
        task_conversion_date: null
      });
      
      toast.success('Task linkage removed successfully');
      
    } catch (error) {
      console.error('Error unlinking task:', error);
      toast.error('Failed to remove task linkage');
    }
  };

  return {
    handleConvertToTask,
    handleViewTaskDetails,
    handleUnlinkTask
  };
};