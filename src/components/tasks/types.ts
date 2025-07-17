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
  digital_object_id?: string;
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