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

// Comprehensive WBS renumbering system
export const renumberAllWBSItems = (items: WBSItem[]): { item: WBSItem; newWbsId: string }[] => {
  const updates: { item: WBSItem; newWbsId: string }[] = [];
  
  // Flatten all items while preserving hierarchy
  const flatItems = flattenWBSHierarchy(items);
  
  // Group items by parent_id to process siblings together
  const itemsByParent = new Map<string | null, WBSItem[]>();
  
  flatItems.forEach(item => {
    const parentKey = item.parent_id || null;
    if (!itemsByParent.has(parentKey)) {
      itemsByParent.set(parentKey, []);
    }
    itemsByParent.get(parentKey)!.push(item);
  });
  
  // Sort siblings by their current WBS ID to maintain relative order
  itemsByParent.forEach(siblings => {
    siblings.sort((a, b) => {
      const aWbs = a.wbs_id.split('.').map(n => parseInt(n, 10) || 0);
      const bWbs = b.wbs_id.split('.').map(n => parseInt(n, 10) || 0);
      
      for (let i = 0; i < Math.max(aWbs.length, bWbs.length); i++) {
        const da = aWbs[i] || 0;
        const db = bWbs[i] || 0;
        if (da !== db) return da - db;
      }
      return 0;
    });
  });
  
  // Generate new sequential WBS IDs
  const generateNewWbsId = (item: WBSItem): string => {
    if (!item.parent_id) {
      // Root level items (phases): 1.0, 2.0, 3.0, etc.
      const siblings = itemsByParent.get(null) || [];
      const index = siblings.indexOf(item);
      return `${index + 1}.0`;
    }
    
    // Find parent item and get its new WBS ID
    const parent = flatItems.find(i => i.id === item.parent_id);
    if (!parent) return item.wbs_id; // Fallback to original
    
    // Get parent's new WBS ID (it should have been processed already)
    const parentUpdate = updates.find(u => u.item.id === parent.id);
    const parentWbsId = parentUpdate?.newWbsId || parent.wbs_id;
    
    // Generate child WBS ID
    const siblings = itemsByParent.get(item.parent_id) || [];
    const index = siblings.indexOf(item);
    
    if (parentWbsId.endsWith('.0')) {
      // Parent is a phase (e.g., "1.0"), child is component (e.g., "1.1")
      return `${parentWbsId.slice(0, -2)}.${index + 1}`;
    } else {
      // Parent is a component (e.g., "1.1"), child is element (e.g., "1.1.1")
      return `${parentWbsId}.${index + 1}`;
    }
  };
  
  // Process items level by level to ensure parents are processed before children
  const processedIds = new Set<string>();
  let remainingItems = [...flatItems];
  
  while (remainingItems.length > 0 && processedIds.size < flatItems.length) {
    const initialLength = remainingItems.length;
    
    remainingItems = remainingItems.filter(item => {
      // Skip if already processed
      if (processedIds.has(item.id)) return false;
      
      // Check if parent has been processed (or is root)
      if (!item.parent_id || processedIds.has(item.parent_id)) {
        const newWbsId = generateNewWbsId(item);
        if (newWbsId !== item.wbs_id) {
          updates.push({ item, newWbsId });
        }
        processedIds.add(item.id);
        return false; // Remove from remaining items
      }
      
      return true; // Keep in remaining items
    });
    
    // Prevent infinite loop
    if (remainingItems.length === initialLength) {
      console.warn('Circular dependency detected in WBS hierarchy, breaking loop');
      break;
    }
  }
  
  return updates;
};

// Generate WBS ID for new items (improved version)
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

  if (!parentId) {
    // Create a top-level item → find existing top-level items and get next sequential number
    const rootItems = flat.filter(i => 
      i.parent_id == null || 
      i.level === 0 || 
      (i.wbs_id && i.wbs_id.endsWith('.0'))
    );
    
    // Sort by WBS number to ensure we get the correct next number
    const sortedRoots = rootItems
      .map(item => parseInt((item.wbs_id || '0.0').split('.')[0], 10))
      .filter(n => !isNaN(n))
      .sort((a, b) => a - b);
    
    // Find the next sequential number
    let nextNum = 1;
    for (const num of sortedRoots) {
      if (num === nextNum) {
        nextNum++;
      } else {
        break;
      }
    }
    
    return `${nextNum}.0`;
  }

  // Find parent to get its WBS ID
  const findParent = (items: WBSItem[]): WBSItem | null => {
    for (const item of items) {
      if (item.id === parentId) return item;
      const found = findParent(item.children || []);
      if (found) return found;
    }
    return null;
  };

  const parent = findParent(wbsItems);
  if (parent) {
    // Get all direct children of this parent
    const children = flat.filter(i => i.parent_id === parent.id);
    
    // Sort children by their WBS IDs to ensure sequential numbering
    const childNumbers = children
      .map(child => {
        const parts = child.wbs_id.split('.');
        return parseInt(parts[parts.length - 1], 10);
      })
      .filter(n => !isNaN(n))
      .sort((a, b) => a - b);
    
    // Find the next sequential number
    let nextNum = 1;
    for (const num of childNumbers) {
      if (num === nextNum) {
        nextNum++;
      } else {
        break;
      }
    }
    
    const parentBase = parent.wbs_id.endsWith('.0') ? parent.wbs_id.slice(0, -2) : parent.wbs_id;
    return `${parentBase}.${nextNum}`;
  }

  return '1.0';
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
    const parts = (wbsId || '').split('.');
    if (parts.length === 2 && parts[1] === '0') return 0; // X.0 → level 0 (Stage)
    return Math.max(0, parts.length - 1);
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
    const parts = (wbsId || '').split('.');
    // Single-segment like "1" → root
    if (parts.length === 1) return [];
    // Two segments
    if (parts.length === 2) {
      // X.0 → explicit root
      if (parts[1] === '0') return [];
      // Prefer parent "X"; also support datasets using "X.0" as parent
      return [parts[0], `${parts[0]}.0`];
    }
    // Three or more → parent is all but last
    const parent = parts.slice(0, -1).join('.');
    // If parent ends with .0, also provide variant without .0
    const candidates = [parent];
    if (parent.endsWith('.0')) {
      candidates.push(parent.split('.').slice(0, -1).join('.'));
    }
    return candidates;
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