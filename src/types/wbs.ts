export interface WBSItem {
  id: string;
  company_id: string;
  project_id: string;
  parent_id?: string;
  wbs_id: string;
  title: string; // Maps to "task" in standardized view
  description?: string;
  assigned_to?: string; // Maps to "assignedTo" in standardized view
  start_date?: string; // Maps to "startDate" in standardized view
  end_date?: string; // Maps to "endDate" in standardized view
  duration?: number; // Duration in days
  budgeted_cost?: number;
  actual_cost?: number;
  progress?: number; // Maps to "percentComplete" in standardized view (0-100)
  status?: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold' | 'Delayed'; // Status
  health?: 'Good' | 'At Risk' | 'Critical' | 'Unknown'; // Health status
  progress_status?: 'On Track' | 'Behind' | 'Ahead' | 'Blocked'; // Progress status
  at_risk?: boolean; // At Risk flag
  level: number;
  is_expanded: boolean;
  linked_tasks: string[];
  children: WBSItem[];
  created_at: string;
  updated_at: string;

  // Additional fields to match standardized interface
  priority?: 'High' | 'Medium' | 'Low';
}

export type WBSItemInput = Omit<WBSItem, 'id' | 'children' | 'created_at' | 'updated_at'>;