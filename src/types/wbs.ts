export type DependencyType = 'FS' | 'SS' | 'FF' | 'SF';

export interface WBSPredecessor {
  id: string;
  type: DependencyType;
  lag?: number; // Days of lag/lead time
}

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
  category?: 'Stage' | 'Component' | 'Element' | 'Task'; // Single source categorization
  is_expanded: boolean;
  linked_tasks: string[]; // Legacy field for backwards compatibility
  predecessors?: WBSPredecessor[]; // New structured predecessor data
  children: WBSItem[];
  created_at: string;
  updated_at: string;

  // Additional fields to match standardized interface
  priority?: 'High' | 'Medium' | 'Low';

  // Task-specific fields
  scope_link?: string; // Link to scope documentation or requirements
  time_link?: string; // Link to time tracking or scheduling information
  cost_link?: string; // Link to cost tracking or budget information
  task_type?: string; // Type of task (General, Design, Construction, Review, etc.)
  estimated_hours?: number; // Estimated hours to complete the task
  actual_hours?: number; // Actual hours spent on the task
}

export type WBSItemInput = Omit<WBSItem, 'id' | 'children' | 'created_at' | 'updated_at'>;