export interface Subtask {
  id: string;
  title: string;
  assignedTo: { name: string; avatar: string };
  dueDate: string;
  completed: boolean;
}

export interface SubtasksListProps {
  taskId: string;
  projectMembers: Array<{ name: string; avatar: string }>;
  onSubtaskClick?: (subtask: Subtask) => void;
}