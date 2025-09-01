import { WBSItem } from '@/types/wbs';

export interface JSGanttTask {
  pID: string;
  pName: string;
  pStart: Date;
  pEnd: Date;
  pClass: string;
  pLink: string;
  pMile: number;
  pRes: string;
  pComp: number;
  pGroup: number;
  pParent: string | number;
  pOpen: number;
  pDepend: string;
  pCaption: string;
  pNotes: string;
  pGantt: string;
  pPlanStart: Date;
  pPlanEnd: Date;
  pStatus: string;
}

/**
 * Transforms WBS items into jsGantt format
 */
export const transformWBSToJSGantt = (wbsItems: WBSItem[]): JSGanttTask[] => {
  // Flatten the hierarchical structure first
  const flattenItems = (items: WBSItem[]): WBSItem[] => {
    let result: WBSItem[] = [];
    items.forEach(item => {
      result.push(item);
      if (item.children && item.children.length > 0) {
        result = result.concat(flattenItems(item.children));
      }
    });
    return result;
  };

  const flatItems = flattenItems(wbsItems);

  return flatItems.map((item) => {
    // Convert dates to proper format
    const startDate = item.start_date ? new Date(item.start_date) : new Date();
    const endDate = item.end_date ? new Date(item.end_date) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    
    // Determine if this is a group task (has children)
    const hasChildren = item.children && item.children.length > 0;
    
    return {
      pID: item.id,
      pName: item.title || 'Untitled Task',
      pStart: startDate,
      pEnd: endDate,
      pClass: getTaskClass(item),
      pLink: '',
      pMile: 0, // Not a milestone by default
      pRes: item.assigned_to || '',
      pComp: item.progress || 0,
      pGroup: hasChildren ? 1 : 0,
      pParent: item.parent_id || 0,
      pOpen: item.is_expanded ? 1 : 0,
      pDepend: item.linked_tasks?.join(',') || '',
      pCaption: item.description || '',
      pNotes: item.description || '',
      pGantt: item.wbs_id || item.id,
      pPlanStart: startDate,
      pPlanEnd: endDate,
      pStatus: item.status || 'Not Started'
    };
  });
};

/**
 * Get task class based on WBS item properties
 */
const getTaskClass = (item: WBSItem): string => {
  // Map WBS categories to jsGantt classes
  switch (item.category) {
    case 'Stage':
      return 'stage';
    case 'Component':
      return 'component';
    case 'Element':
      return 'element';
    default:
      return 'task';
  }
};

/**
 * Get task color based on status
 */
export const getTaskStatusColor = (status: string): string => {
  switch (status) {
    case 'Completed':
      return '#22c55e'; // green
    case 'In Progress':
      return '#3b82f6'; // blue
    case 'On Hold':
      return '#f59e0b'; // yellow
    case 'Delayed':
      return '#ef4444'; // red
    case 'Not Started':
    default:
      return '#6b7280'; // gray
  }
};

/**
 * Get task priority color
 */
export const getTaskPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'High':
      return '#dc2626'; // red
    case 'Medium':
      return '#f59e0b'; // yellow
    case 'Low':
    default:
      return '#10b981'; // green
  }
};