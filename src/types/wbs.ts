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

export type WBSItemInput = Omit<WBSItem, 'id' | 'children' | 'created_at' | 'updated_at'>;