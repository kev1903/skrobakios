import { WBSItem } from '@/types/wbs';

// Calculate duration based on dates
export const calculateDuration = (startDate: string, endDate: string): number => {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const timeDiff = end.getTime() - start.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

// Find a WBS item by ID in a hierarchical structure
export const findWBSItem = (items: WBSItem[], id: string): WBSItem | null => {
  for (const item of items) {
    if (item.id === id) return item;
    const found = findWBSItem(item.children, id);
    if (found) return found;
  }
  return null;
};

// Simple sequential WBS renumbering - flat numbering (1, 2, 3, 4...)
export const renumberAllWBSItems = (items: WBSItem[]): { item: WBSItem; newWbsId: string }[] => {
  const updates: { item: WBSItem; newWbsId: string }[] = [];
  
  // Flatten all items to get a flat list
  const flatItems = flattenWBSHierarchy(items);
  
  // Sort items by their current order/creation to maintain visual order
  flatItems.sort((a, b) => {
    return (a.created_at || '').localeCompare(b.created_at || '');
  });
  
  // Generate simple sequential WBS numbers
  flatItems.forEach((item, index) => {
    const newWbsId = `${index + 1}`;
    
    // Only add to updates if the WBS ID actually changed
    if (newWbsId !== item.wbs_id) {
      updates.push({ item, newWbsId });
    }
  });
  
  console.log(`🔢 Generated ${updates.length} WBS number updates for sequential numbering`);
  
  return updates;
};

// Generate WBS ID for new items - simple sequential numbering
export const generateWBSId = (parentId?: string, wbsItems: WBSItem[] = []): string => {
  // Helper to get all items in flat form
  const toFlat = (items: WBSItem[]): WBSItem[] => {
    const out: WBSItem[] = [];
    const walk = (list: WBSItem[]) => {
      list.forEach(i => {
        out.push(i);
        if (i.children?.length) walk(i.children);
      });
    };
    walk(items);
    return out;
  };

  const flat = toFlat(wbsItems);

  // Get all existing WBS numbers
  const allNumbers = flat
    .map(item => parseInt(item.wbs_id || '0', 10))
    .filter(n => !isNaN(n))
    .sort((a, b) => a - b);
  
  // Find the next sequential number
  let nextNum = 1;
  for (const num of allNumbers) {
    if (num === nextNum) {
      nextNum++;
    } else {
      break;
    }
  }
  
  return `${nextNum}`;
};

// Transform flat database data into hierarchical structure (robust to bad parent_id/level)
export const buildHierarchy = (flatData: any[]): WBSItem[] => {
  // Build canonical items and deduplicate by wbs_id
  const byWbsId = new Map<string, WBSItem>();

  const toItem = (row: any): WBSItem => ({
    id: row.id,
    company_id: row.company_id,
    project_id: row.project_id,
    parent_id: row.parent_id,
    wbs_id: row.wbs_id,
    title: row.title,
    description: row.description,
    assigned_to: row.assigned_to,
    start_date: row.start_date,
    end_date: row.end_date,
    duration: row.duration || 0,
    budgeted_cost: row.budgeted_cost ? Number(row.budgeted_cost) : undefined,
    actual_cost: row.actual_cost ? Number(row.actual_cost) : undefined,
    progress: row.progress || 0,
    level: row.level,
    is_expanded: row.is_expanded,
    linked_tasks: Array.isArray(row.linked_tasks) ? (row.linked_tasks as string[]) : [],
    children: [],
    created_at: row.created_at,
    updated_at: row.updated_at
  });

  const expectedLevel = (wbsId: string) => {
    const parts = (wbsId || '').split('.').filter(p => p !== '');
    // Single segment like "1", "2" → level 0 (Stage)
    if (parts.length === 1) return 0;
    // Multiple segments → level is parts.length - 1
    return Math.max(0, Math.min(4, parts.length - 1)); // Clamp to max level 4 (5 levels total: 0-4)
  };

  for (const row of flatData) {
    const wbsId: string = row.wbs_id;
    const candidate = toItem(row);
    candidate.level = candidate.level ?? expectedLevel(wbsId);

    if (!byWbsId.has(wbsId)) {
      byWbsId.set(wbsId, candidate);
    } else {
      const current = byWbsId.get(wbsId)!;
      const exp = expectedLevel(wbsId);
      const currentScore = Math.abs((current.level ?? exp) - exp);
      const candScore = Math.abs((candidate.level ?? exp) - exp);
      if (candScore < currentScore) {
        byWbsId.set(wbsId, candidate);
      } else if (candScore === currentScore) {
        // Prefer most recently updated
        if (new Date(candidate.updated_at || 0) > new Date(current.updated_at || 0)) {
          byWbsId.set(wbsId, candidate);
        }
      }
    }
  }

  // Link by WBS path regardless of parent_id stored
  const roots: WBSItem[] = [];
  const getParentCandidates = (wbsId: string): string[] => {
    const parts = (wbsId || '').split('.').filter(p => p !== '');
    // Single-segment like "1" → root
    if (parts.length === 1) return [];
    // Multiple segments → parent is all but last
    const parent = parts.slice(0, -1).join('.');
    return [parent];
  };

  // Ensure deterministic order
  const sortByWbs = (a: WBSItem, b: WBSItem) => {
    const pa = a.wbs_id.split('.').map(n => parseInt(n, 10));
    const pb = b.wbs_id.split('.').map(n => parseInt(n, 10));
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
      const da = pa[i] ?? 0;
      const db = pb[i] ?? 0;
      if (da !== db) return da - db;
    }
    return 0;
  };

  // Prepare all items
  const all = Array.from(byWbsId.values()).sort(sortByWbs);
  const byId = new Map<string, WBSItem>(all.map(i => [i.id!, i]));

  // Link children with robust parent fallback
  for (const item of all) {
    const candidates = getParentCandidates(item.wbs_id);
    if (candidates.length === 0) {
      item.level = expectedLevel(item.wbs_id);
      roots.push(item);
      continue;
    }
    let parent: WBSItem | undefined;
    for (const cand of candidates) {
      parent = byWbsId.get(cand);
      if (parent) break;
    }
    if (parent) {
      item.level = expectedLevel(item.wbs_id);
      parent.children!.push(item);
    } else {
      // No parent found, treat as root to avoid data loss
      item.level = expectedLevel(item.wbs_id);
      roots.push(item);
    }
  }

  // Sort children at every level
  const sortTree = (nodes: WBSItem[]) => {
    nodes.sort(sortByWbs);
    nodes.forEach(n => n.children && sortTree(n.children));
  };
  sortTree(roots);

  return roots;
};

// Update items recursively in a hierarchical structure
export const updateItemsRecursively = (items: WBSItem[], id: string, updates: Partial<WBSItem>): WBSItem[] => {
  return items.map(item => {
    if (item.id === id) {
      return { ...item, ...updates };
    }
    if (item.children.length > 0) {
      return { ...item, children: updateItemsRecursively(item.children, id, updates) };
    }
    return item;
  });
};

// Remove item recursively from a hierarchical structure
export const removeItemRecursively = (items: WBSItem[], id: string): WBSItem[] => {
  return items.filter(item => {
    if (item.id === id) return false;
    if (item.children.length > 0) {
      item.children = removeItemRecursively(item.children, id);
    }
    return true;
  });
};

// Calculate rollup progress for parent items based on children
export const calculateRollupProgress = (item: WBSItem): number => {
  if (!item.children || item.children.length === 0) {
    return item.progress || 0;
  }
  
  const childProgress = item.children.map(child => calculateRollupProgress(child));
  const totalProgress = childProgress.reduce((sum, progress) => sum + progress, 0);
  const avgProgress = Math.round(totalProgress / item.children.length);
  
  console.log(`📊 Calculating rollup progress for ${item.wbs_id}:`, {
    childProgress,
    totalProgress,
    avgProgress,
    childrenCount: item.children.length
  });
  
  return avgProgress;
};

// Calculate rollup status for parent items based on children
export const calculateRollupStatus = (item: WBSItem): WBSItem['status'] => {
  if (!item.children || item.children.length === 0) {
    return item.status || 'Not Started';
  }
  
  const childStatuses = item.children.map(child => calculateRollupStatus(child));
  const childProgress = item.children.map(child => calculateRollupProgress(child));
  
  console.log(`🏷️ Calculating rollup status for ${item.wbs_id}:`, {
    childStatuses,
    childProgress
  });
  
  // If all children are 100% complete, parent is completed
  if (childProgress.every(progress => progress === 100)) {
    return 'Completed';
  }
  
  // If all children are completed status-wise, parent is completed
  if (childStatuses.every(status => status === 'Completed')) {
    return 'Completed';
  }
  
  // If any child is in progress or has progress > 0, parent is in progress
  if (childStatuses.includes('In Progress') || childProgress.some(progress => progress > 0)) {
    return 'In Progress';
  }
  
  // If any child is delayed, parent is delayed
  if (childStatuses.includes('Delayed')) {
    return 'Delayed';
  }
  
  // If any child is on hold, consider parent status
  if (childStatuses.includes('On Hold')) {
    return 'On Hold';
  }
  
  // Default to Not Started if no children have started
  return 'Not Started';
};

// Update parent items with rollup calculations
export const updateParentRollups = (items: WBSItem[], changedItemId: string): { updatedItems: WBSItem[], parentsToUpdate: Array<{id: string, progress: number, status: WBSItem['status']}> } => {
  const parentsToUpdate: Array<{id: string, progress: number, status: WBSItem['status']}> = [];
  
  console.log('🔄 updateParentRollups called for item:', changedItemId);
  
  const updateItem = (item: WBSItem): WBSItem => {
    // Update children first (recursive)
    const updatedChildren = item.children ? item.children.map(updateItem) : [];
    const updatedItem = { ...item, children: updatedChildren };
    
    // Check if this item has children and any of them (or their descendants) was changed
    const hasChangedChild = updatedChildren.some(child => 
      child.id === changedItemId || hasDescendant(child, changedItemId)
    );
    
    // Also check if this item itself was changed (direct child update)
    const isDirectParent = updatedChildren.some(child => child.id === changedItemId);
    
    console.log(`📊 Item ${item.wbs_id} (${item.title}):`, {
      hasChildren: updatedChildren.length > 0,
      hasChangedChild,
      isDirectParent,
      childrenCount: updatedChildren.length
    });
    
    if ((hasChangedChild || isDirectParent) && updatedChildren.length > 0) {
      const newProgress = calculateRollupProgress(updatedItem);
      const newStatus = calculateRollupStatus(updatedItem);
      
      console.log(`✅ Updating parent ${item.wbs_id} rollup:`, {
        oldProgress: item.progress,
        newProgress,
        oldStatus: item.status,
        newStatus,
        childrenProgress: updatedChildren.map(c => ({ id: c.wbs_id, progress: c.progress }))
      });
      
      // Track this parent for database update
      parentsToUpdate.push({
        id: item.id,
        progress: newProgress,
        status: newStatus
      });
      
      return {
        ...updatedItem,
        progress: newProgress,
        status: newStatus
      };
    }
    
    return updatedItem;
  };
  
  const updatedItems = items.map(updateItem);
  console.log(`🎯 Parents to update in database:`, parentsToUpdate.length);
  return { updatedItems, parentsToUpdate };
};

// Helper function to check if an item has a descendant with given ID
const hasDescendant = (item: WBSItem, targetId: string): boolean => {
  if (!item.children) return false;
  
  return item.children.some(child => 
    child.id === targetId || hasDescendant(child, targetId)
  );
};

// Flatten hierarchical WBS structure to include all levels (Stages, Components, Elements)
export const flattenWBSHierarchy = (items: WBSItem[]): WBSItem[] => {
  const flatItems: WBSItem[] = [];
  
  const flatten = (itemList: WBSItem[]) => {
    itemList.forEach(item => {
      flatItems.push(item);
      if (item.children && item.children.length > 0) {
        flatten(item.children);
      }
    });
  };
  
  flatten(items);
  return flatItems;
};