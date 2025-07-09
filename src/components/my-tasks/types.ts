import { Task } from '../tasks/types';

export type SortField = 'taskName' | 'priority' | 'assignedTo' | 'dueDate' | 'status' | 'projectName';
export type SortDirection = 'asc' | 'desc';
export type ViewMode = 'list' | 'grid';

export interface MyTasksHeaderProps {
  tasksCount: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onNavigate: (page: string) => void;
}

export interface MyTasksGridViewProps {
  tasks: Task[];
  selectedTasks: string[];
  onSelectTask: (taskId: string, checked: boolean) => void;
  onTaskClick: (task: Task) => void;
}

export interface MyTasksTableViewProps {
  tasks: Task[];
  selectedTasks: string[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onSelectAll: (checked: boolean) => void;
  onSelectTask: (taskId: string, checked: boolean) => void;
  onTaskClick: (task: Task) => void;
}

export interface SortableHeaderProps {
  field: SortField;
  children: React.ReactNode;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}