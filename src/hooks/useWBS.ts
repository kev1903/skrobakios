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

  // Create sample data for demonstration
  const createSampleData = async (): Promise<WBSItem[]> => {
    const sampleItems = [
      {
        project_id: projectId,
        parent_id: null,
        wbs_id: '1.0',
        title: 'Site Preparation',
        description: 'Initial site preparation and setup activities',
        assigned_to: 'John Smith',
        start_date: '2024-07-15',
        end_date: '2024-08-15',
        duration: 31,
        budgeted_cost: 50000,
        actual_cost: 45000,
        progress: 85,
        level: 0,
        is_expanded: true,
        linked_tasks: []
      },
      {
        project_id: projectId,
        parent_id: null,
        wbs_id: '2.0',
        title: 'Foundation Work',
        description: 'Foundation excavation and concrete pouring',
        assigned_to: 'Mike Johnson',
        start_date: '2024-08-16',
        end_date: '2024-09-30',
        duration: 45,
        budgeted_cost: 120000,
        actual_cost: 85000,
        progress: 65,
        level: 0,
        is_expanded: true,
        linked_tasks: []
      },
      {
        project_id: projectId,
        parent_id: null,
        wbs_id: '3.0',
        title: 'Structural Framework',
        description: 'Steel and concrete structural work',
        assigned_to: 'Sarah Davis',
        start_date: '2024-10-01',
        end_date: '2024-12-15',
        duration: 75,
        budgeted_cost: 200000,
        actual_cost: 0,
        progress: 0,
        level: 0,
        is_expanded: false,
        linked_tasks: []
      }
    ];

    // Create the items in the database
    const createdItems: WBSItem[] = [];
    
    for (const item of sampleItems) {
      try {
        const { data, error } = await supabase
          .from('wbs_items')
          .insert([item])
          .select()
          .single();

        if (error) throw error;

        createdItems.push({
          id: data.id,
          project_id: data.project_id,
          parent_id: data.parent_id,
          wbs_id: data.wbs_id,
          title: data.title,
          description: data.description,
          assigned_to: data.assigned_to,
          start_date: data.start_date,
          end_date: data.end_date,
          duration: data.duration || 0,
          budgeted_cost: data.budgeted_cost ? Number(data.budgeted_cost) : undefined,
          actual_cost: data.actual_cost ? Number(data.actual_cost) : undefined,
          progress: data.progress || 0,
          level: data.level,
          is_expanded: data.is_expanded,
          linked_tasks: Array.isArray(data.linked_tasks) ? (data.linked_tasks as string[]) : [],
          children: [],
          created_at: data.created_at,
          updated_at: data.updated_at
        });
      } catch (err) {
        console.error('Error creating sample WBS item:', err);
      }
    }

    // Now create some child items for the first parent
    if (createdItems.length > 0) {
      const parentId = createdItems[0].id;
      const childItems = [
        {
          project_id: projectId,
          parent_id: parentId,
          wbs_id: '1.1',
          title: 'Site Survey',
          description: 'Conduct detailed site survey',
          assigned_to: 'John Smith',
          start_date: '2024-07-15',
          end_date: '2024-07-20',
          duration: 5,
          budgeted_cost: 15000,
          actual_cost: 14000,
          progress: 100,
          level: 1,
          is_expanded: false,
          linked_tasks: []
        },
        {
          project_id: projectId,
          parent_id: parentId,
          wbs_id: '1.2',
          title: 'Site Clearing',
          description: 'Clear vegetation and debris',
          assigned_to: 'John Smith',
          start_date: '2024-07-21',
          end_date: '2024-08-15',
          duration: 25,
          budgeted_cost: 35000,
          actual_cost: 31000,
          progress: 75,
          level: 1,
          is_expanded: false,
          linked_tasks: []
        }
      ];

      for (const childItem of childItems) {
        try {
          const { data, error } = await supabase
            .from('wbs_items')
            .insert([childItem])
            .select()
            .single();

          if (error) throw error;

          const child: WBSItem = {
            id: data.id,
            project_id: data.project_id,
            parent_id: data.parent_id,
            wbs_id: data.wbs_id,
            title: data.title,
            description: data.description,
            assigned_to: data.assigned_to,
            start_date: data.start_date,
            end_date: data.end_date,
            duration: data.duration || 0,
            budgeted_cost: data.budgeted_cost ? Number(data.budgeted_cost) : undefined,
            actual_cost: data.actual_cost ? Number(data.actual_cost) : undefined,
            progress: data.progress || 0,
            level: data.level,
            is_expanded: data.is_expanded,
            linked_tasks: Array.isArray(data.linked_tasks) ? (data.linked_tasks as string[]) : [],
            children: [],
            created_at: data.created_at,
            updated_at: data.updated_at
          };

          createdItems[0].children.push(child);
        } catch (err) {
          console.error('Error creating sample child WBS item:', err);
        }
      }
    }

    return createdItems;
  };

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

      // If no data exists, create sample data
      if (!data || data.length === 0) {
        const sampleData = await createSampleData();
        if (sampleData) {
          setWBSItems(sampleData);
          setLoading(false);
          return;
        }
      }

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