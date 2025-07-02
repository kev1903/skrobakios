import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface WBSItem {
  id: string;
  project_id: string;
  parent_id?: string;
  wbs_id: string;
  title: string;
  description?: string;
  assigned_to?: string;
  start_date?: string;
  end_date?: string;
  duration?: number;
  budgeted_cost?: number;
  actual_cost?: number;
  progress?: number;
  level: number;
  is_expanded: boolean;
  linked_tasks: string[];
  children: WBSItem[];
  created_at: string;
  updated_at: string;
}

export const useWBS = (projectId: string) => {
  const [wbsItems, setWBSItems] = useState<WBSItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load WBS items for a project
  const loadWBSItems = async () => {
    if (!projectId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('wbs_items')
        .select('*')
        .eq('project_id', projectId)
        .order('level', { ascending: true })
        .order('wbs_id', { ascending: true });

      if (error) throw error;

      // Transform flat data into hierarchical structure
      const itemsMap = new Map<string, WBSItem>();
      const rootItems: WBSItem[] = [];

      // First pass: create all items
      (data || []).forEach(item => {
        const wbsItem: WBSItem = {
          id: item.id,
          project_id: item.project_id,
          parent_id: item.parent_id,
          wbs_id: item.wbs_id,
          title: item.title,
          description: item.description,
          assigned_to: item.assigned_to,
          start_date: item.start_date,
          end_date: item.end_date,
          duration: item.duration || 0,
          budgeted_cost: item.budgeted_cost ? Number(item.budgeted_cost) : undefined,
          actual_cost: item.actual_cost ? Number(item.actual_cost) : undefined,
          progress: item.progress || 0,
          level: item.level,
          is_expanded: item.is_expanded,
          linked_tasks: Array.isArray(item.linked_tasks) ? (item.linked_tasks as string[]) : [],
          children: [],
          created_at: item.created_at,
          updated_at: item.updated_at
        };
        
        itemsMap.set(item.id, wbsItem);
      });

      // Second pass: build hierarchy
      itemsMap.forEach(item => {
        if (item.parent_id && itemsMap.has(item.parent_id)) {
          const parent = itemsMap.get(item.parent_id)!;
          parent.children.push(item);
        } else {
          rootItems.push(item);
        }
      });

      setWBSItems(rootItems);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load WBS items';
      setError(errorMessage);
      console.error('Error loading WBS items:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create a new WBS item
  const createWBSItem = async (itemData: Omit<WBSItem, 'id' | 'children' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('wbs_items')
        .insert([{
          project_id: itemData.project_id,
          parent_id: itemData.parent_id || null,
          wbs_id: itemData.wbs_id,
          title: itemData.title,
          description: itemData.description,
          assigned_to: itemData.assigned_to,
          start_date: itemData.start_date,
          end_date: itemData.end_date,
          duration: itemData.duration,
          budgeted_cost: itemData.budgeted_cost,
          actual_cost: itemData.actual_cost,
          progress: itemData.progress,
          level: itemData.level,
          is_expanded: itemData.is_expanded,
          linked_tasks: itemData.linked_tasks
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Reload items to update hierarchy
      await loadWBSItems();
      
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create WBS item';
      setError(errorMessage);
      console.error('Error creating WBS item:', err);
      return null;
    }
  };

  // Update a WBS item
  const updateWBSItem = async (id: string, updates: Partial<WBSItem>) => {
    try {
      const dbUpdates: any = {};
      
      // Map fields to database columns
      Object.keys(updates).forEach(key => {
        if (key !== 'children' && key !== 'created_at' && key !== 'updated_at') {
          dbUpdates[key] = updates[key as keyof WBSItem];
        }
      });

      const { error } = await supabase
        .from('wbs_items')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      // Update local state
      const updateItemsRecursively = (items: WBSItem[]): WBSItem[] => {
        return items.map(item => {
          if (item.id === id) {
            return { ...item, ...updates };
          }
          if (item.children.length > 0) {
            return { ...item, children: updateItemsRecursively(item.children) };
          }
          return item;
        });
      };

      setWBSItems(prev => updateItemsRecursively(prev));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update WBS item';
      setError(errorMessage);
      console.error('Error updating WBS item:', err);
    }
  };

  // Delete a WBS item
  const deleteWBSItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('wbs_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Remove from local state
      const removeItemRecursively = (items: WBSItem[]): WBSItem[] => {
        return items.filter(item => {
          if (item.id === id) return false;
          if (item.children.length > 0) {
            item.children = removeItemRecursively(item.children);
          }
          return true;
        });
      };

      setWBSItems(prev => removeItemRecursively(prev));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete WBS item';
      setError(errorMessage);
      console.error('Error deleting WBS item:', err);
    }
  };

  // Calculate duration based on dates
  const calculateDuration = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };

  // Generate WBS ID for new items
  const generateWBSId = (parentId?: string, siblings: WBSItem[] = []) => {
    if (!parentId) {
      // Top level item
      const topLevelCount = wbsItems.length;
      return `${topLevelCount + 1}.0`;
    }

    // Find parent to get its WBS ID
    const findParent = (items: WBSItem[]): WBSItem | null => {
      for (const item of items) {
        if (item.id === parentId) return item;
        const found = findParent(item.children);
        if (found) return found;
      }
      return null;
    };

    const parent = findParent(wbsItems);
    if (parent) {
      const childCount = parent.children.length;
      return `${parent.wbs_id.replace('.0', '')}.${childCount + 1}`;
    }

    return '1.0';
  };

  useEffect(() => {
    loadWBSItems();
  }, [projectId]);

  return {
    wbsItems,
    loading,
    error,
    loadWBSItems,
    createWBSItem,
    updateWBSItem,
    deleteWBSItem,
    calculateDuration,
    generateWBSId
  };
};