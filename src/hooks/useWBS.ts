import { useState, useEffect } from 'react';
import { WBSItem, WBSItemInput } from '@/types/wbs';
import { WBSService } from '@/services/wbsService';
import { 
  calculateDuration, 
  findWBSItem, 
  generateWBSId, 
  updateItemsRecursively, 
  removeItemRecursively 
} from '@/utils/wbsUtils';

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
      const items = await WBSService.loadWBSItems(projectId);
      setWBSItems(items);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load WBS items';
      setError(errorMessage);
      console.error('Error loading WBS items:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create a new WBS item
  const createWBSItem = async (itemData: WBSItemInput) => {
    try {
      const data = await WBSService.createWBSItem(itemData);
      
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
    generateWBSId: (parentId?: string) => generateWBSId(parentId, wbsItems),
    findWBSItem: (id: string) => findWBSItem(wbsItems, id)
  };
};

// Re-export types for convenience
export type { WBSItem } from '@/types/wbs';