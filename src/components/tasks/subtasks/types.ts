export interface Subtask {
  id: string;
  parent_task_id: string;
  title: string;
  description?: string;
  assigned_to_name?: string;
  assigned_to_avatar?: string;
  due_date?: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubtasksListProps {
  taskId: string;
  projectMembers: Array<{ name: string; avatar: string }>;
  onSubtaskClick?: (subtask: Subtask) => void;
}