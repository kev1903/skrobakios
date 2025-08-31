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

// Generate WBS ID for new items
export const generateWBSId = (parentId?: string, wbsItems: WBSItem[] = []): string => {
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

// Transform flat database data into hierarchical structure
export const buildHierarchy = (flatData: any[]): WBSItem[] => {
  const itemsMap = new Map<string, WBSItem>();
  const rootItems: WBSItem[] = [];

  // First pass: create all items
  flatData.forEach(item => {
    const wbsItem: WBSItem = {
      id: item.id,
      company_id: item.company_id,
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

  return rootItems;
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