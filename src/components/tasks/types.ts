export interface Task {
  id: string;
  project_id: string;
  taskName: string;
  priority: 'High' | 'Medium' | 'Low';
  assignedTo: { name: string; avatar: string };
  dueDate: string;
  status: 'Completed' | 'In Progress' | 'Pending' | 'Not Started';
  progress: number;
  description?: string;
  duration?: number;
  digital_object_id?: string;
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