import { useState, useEffect } from 'react';
import { WBSItem, WBSItemInput } from '@/types/wbs';
import { WBSService } from '@/services/wbsService';
import { useCompany } from '@/contexts/CompanyContext';
import { 
  calculateDuration, 
  findWBSItem, 
  generateWBSId, 
  updateItemsRecursively, 
  removeItemRecursively 
} from '@/utils/wbsUtils';

export const useWBS = (projectId: string) => {
  const { currentCompany } = useCompany();
  const [wbsItems, setWBSItems] = useState<WBSItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load WBS items for a project
  const loadWBSItems = async () => {
    if (!projectId) return;
    
    console.log('🔄 useWBS.loadWBSItems called with:', { projectId, companyId: currentCompany.id });
    
    setLoading(true);
    setError(null);
    
    try {
      const items = await WBSService.loadWBSItems(projectId, currentCompany.id);
      console.log('✅ useWBS.loadWBSItems received items:', items.length, 'for project:', projectId);
      setWBSItems(items);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load WBS items';
      setError(errorMessage);
      console.error('Error loading WBS items:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create a new WBS item (optimistic, no full reload)
  const createWBSItem = async (itemData: WBSItemInput) => {
    const tempId = `temp-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const optimisticItem: WBSItem = {
      id: tempId,
      company_id: itemData.company_id,
      project_id: itemData.project_id,
      parent_id: itemData.parent_id,
      wbs_id: itemData.wbs_id,
      title: itemData.title,
      description: itemData.description || '',
      assigned_to: itemData.assigned_to,
      start_date: itemData.start_date,
      end_date: itemData.end_date,
      duration: itemData.duration,
      budgeted_cost: itemData.budgeted_cost,
      actual_cost: itemData.actual_cost,
      progress: itemData.progress ?? 0,
      status: (itemData as any).status ?? 'Not Started',
      health: (itemData as any).health ?? 'Good',
      progress_status: (itemData as any).progress_status ?? 'On Track',
      at_risk: (itemData as any).at_risk ?? false,
      level: itemData.level,
      category: itemData.category as any,
      is_expanded: itemData.is_expanded ?? true,
      linked_tasks: itemData.linked_tasks || [],
      predecessors: (itemData as any).predecessors || [],
      priority: (itemData as any).priority,
      children: [],
      created_at: nowIso,
      updated_at: nowIso,
    } as WBSItem;

    // Helper to insert optimistically into tree
    const insertItem = (list: WBSItem[]): WBSItem[] => {
      if (!itemData.parent_id) return [...list, optimisticItem];
      const recurse = (items: WBSItem[]): WBSItem[] =>
        items.map((it) => {
          if (it.id === itemData.parent_id) {
            const children = Array.isArray(it.children) ? [...it.children, optimisticItem] : [optimisticItem];
            return { ...it, is_expanded: true, children };
          }
          return { ...it, children: it.children ? recurse(it.children) : [] };
        });
      return recurse(list);
    };

    // Optimistic update
    setWBSItems((prev) => insertItem(prev));

    try {
      const data = await WBSService.createWBSItem(itemData);
      // Replace temp item id with real id
      setWBSItems((prev) =>
        updateItemsRecursively(prev, tempId, {
          id: data.id,
          created_at: data.created_at,
          updated_at: data.updated_at,
        })
      );
      return data;
    } catch (err) {
      // Rollback on failure
      setWBSItems((prev) => removeItemRecursively(prev, tempId));
      const errorMessage = err instanceof Error ? err.message : 'Failed to create WBS item';
      setError(errorMessage);
      console.error('Error creating WBS item:', err);
      return null;
    }
  };

  // Update a WBS item
  const updateWBSItem = async (id: string, updates: Partial<WBSItem>) => {
    try {
      await WBSService.updateWBSItem(id, updates);

      // Update local state
      setWBSItems(prev => updateItemsRecursively(prev, id, updates));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update WBS item';
      setError(errorMessage);
      console.error('Error updating WBS item:', err);
    }
  };

  // Delete a WBS item
  const deleteWBSItem = async (id: string) => {
    try {
      await WBSService.deleteWBSItem(id);

      // Remove from local state
      setWBSItems(prev => removeItemRecursively(prev, id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete WBS item';
      setError(errorMessage);
      console.error('Error deleting WBS item:', err);
    }
  };

  useEffect(() => {
    loadWBSItems();
  }, [projectId, currentCompany?.id]);

  return {
    wbsItems,
    loading,
    error,
    loadWBSItems,
    createWBSItem,
    updateWBSItem,
    deleteWBSItem,
    calculateDuration,
    generateWBSId: (parentId?: string) => generateWBSId(parentId, wbsItems),
    findWBSItem: (id: string) => findWBSItem(wbsItems, id)
  };
};

// Re-export types for convenience
export type { WBSItem } from '@/types/wbs';