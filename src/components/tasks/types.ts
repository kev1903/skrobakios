import { WBSItem } from '@/types/wbs';

export interface Task {
  id: string;
  project_id: string;
  projectName?: string;
  taskName: string;
  priority: 'High' | 'Medium' | 'Low';
  assignedTo: { name: string; avatar: string; userId?: string };
  dueDate: string;
  status: 'Completed' | 'In Progress' | 'Pending' | 'Not Started';
  progress: number;
  description?: string;
  duration?: number;
  is_milestone?: boolean;
  is_critical_path?: boolean;
  created_at: string;
  updated_at: string;
}

// New interface for Project Timeline View with updated field specifications
export interface TimelineTask {
  id: string;
  activity_name: string; // Name of the activity
  duration: number; // Duration in days (required)
  start_date: string; // Task start date (required)
  end_date: string; // Task end date (required)
  status: 'Pending' | 'In Progress' | 'Complete' | 'Delayed'; // Updated statuses
  percent_complete: number; // Progress indicator (0-100)
  dependency?: string; // Optional task this one depends on
  assignee: string; // Assigned team member (text email/name)
  description?: string;
  project_id: string;
  created_at: string;
  updated_at: string;
}

// Cost interface following the same field structure
export interface Cost {
  id: string;
  project_id: string;
  company_id: string;
  cost_name: string; // Maps to "task" in standardized view
  description?: string;
  assigned_to?: string; // Maps to "assignedTo" in standardized view
  start_date?: string; // Maps to "startDate" in standardized view
  end_date?: string; // Maps to "endDate" in standardized view
  duration?: number; // Duration in days
  status: 'Planned' | 'Approved' | 'In Progress' | 'Completed' | 'Cancelled'; // Status
  percent_complete: number; // % Complete (0-100)
  health: 'Good' | 'At Risk' | 'Critical' | 'Unknown'; // Health status
  progress_status: 'On Track' | 'Behind' | 'Ahead' | 'Blocked'; // Progress status
  at_risk: boolean; // At Risk flag
  budgeted_amount: number;
  actual_amount: number;
  remaining_amount: number;
  cost_category: string;
  currency: string;
  priority: 'High' | 'Medium' | 'Low';
  created_at: string;
  updated_at: string;
  created_by?: string;
  last_modified_by?: string;
}

// Standardized interface matching Gantt chart columns for display consistency
export interface StandardizedProjectItem {
  id: string;
  task: string; // Task name (maps to taskName, activity_name, title, cost_name, etc.)
  description?: string;
  assignedTo: string; // Assigned team member
  status: string; // Status
  percentComplete: number; // % Complete (0-100)
  startDate: string; // Start Date
  endDate: string; // End Date  
  duration?: number; // Duration in days
  health: 'Good' | 'At Risk' | 'Critical' | 'Unknown'; // Health status
  progress: 'On Track' | 'Behind' | 'Ahead' | 'Blocked'; // Progress status
  atRisk: boolean; // At Risk flag
  type: 'task' | 'wbs' | 'timeline' | 'cost'; // Item type for identification
  originalData?: Task | TimelineTask | WBSItem | Cost; // Reference to original data
}

// Utility functions to convert between interfaces
export const convertToStandardized = {
  fromTask: (task: Task): StandardizedProjectItem => ({
    id: task.id,
    task: task.taskName,
    description: task.description,
    assignedTo: task.assignedTo.name,
    status: task.status,
    percentComplete: task.progress,
    startDate: task.dueDate, // Using dueDate as a temporary mapping
    endDate: task.dueDate,
    duration: task.duration,
    health: 'Unknown', // Default values for new fields
    progress: 'On Track',
    atRisk: false,
    type: 'task',
    originalData: task
  }),
  
  fromTimelineTask: (timelineTask: TimelineTask): StandardizedProjectItem => ({
    id: timelineTask.id,
    task: timelineTask.activity_name,
    description: timelineTask.description,
    assignedTo: timelineTask.assignee,
    status: timelineTask.status,
    percentComplete: timelineTask.percent_complete,
    startDate: timelineTask.start_date,
    endDate: timelineTask.end_date,
    duration: timelineTask.duration,
    health: 'Unknown',
    progress: 'On Track',
    atRisk: false,
    type: 'timeline',
    originalData: timelineTask
  }),
  
  fromWBS: (wbs: any): StandardizedProjectItem => ({
    id: wbs.id,
    task: wbs.title,
    description: wbs.description,
    assignedTo: wbs.assigned_to || 'Unassigned',
    status: wbs.status || 'Not Started',
    percentComplete: wbs.progress || 0,
    startDate: wbs.start_date || '',
    endDate: wbs.end_date || '',
    duration: wbs.duration,
    health: wbs.health || 'Unknown',
    progress: wbs.progress_status || 'On Track',
    atRisk: wbs.at_risk || false,
    type: 'wbs',
    originalData: wbs
  }),
  
  fromCost: (cost: Cost): StandardizedProjectItem => ({
    id: cost.id,
    task: cost.cost_name,
    description: cost.description,
    assignedTo: cost.assigned_to || 'Unassigned',
    status: cost.status,
    percentComplete: cost.percent_complete,
    startDate: cost.start_date || '',
    endDate: cost.end_date || '',
    duration: cost.duration,
    health: cost.health,
    progress: cost.progress_status,
    atRisk: cost.at_risk,
    type: 'cost',
    originalData: cost
  })
};

export interface Milestone {
  id: string;
  name: string;
  description?: string;
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
  progress: number;
  priority: 'High' | 'Medium' | 'Low';
  project_id: string;
  projectName: string;
  dependencies: string[];
  completedDate?: string;
  created_at: string;
  updated_at: string;
}

export interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  loadTasksForProject: (projectId: string) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
}