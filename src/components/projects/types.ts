import { Project } from "@/hooks/useProjects";

export interface ProjectListProps {
  onNavigate: (page: string) => void;
  onSelectProject?: (projectId: string) => void;
}

export type SortField = 'project_id' | 'name' | 'description' | 'contract_price' | 'location' | 'priority' | 'start_date' | 'deadline' | 'status';
export type SortDirection = 'asc' | 'desc';
export type ViewMode = 'list' | 'grid';

export interface ProjectListHeaderProps {
  projectsCount: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onNavigate: (page: string) => void;
}

export interface ProjectGridViewProps {
  projects: Project[];
  selectedProjects: string[];
  onSelectProject: (projectId: string, checked: boolean) => void;
  onProjectClick: (projectId: string) => void;
}

export interface ProjectTableViewProps {
  projects: Project[];
  selectedProjects: string[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onSelectAll: (checked: boolean) => void;
  onSelectProject: (projectId: string, checked: boolean) => void;
  onProjectClick: (projectId: string) => void;
}

export interface SortableHeaderProps {
  field: SortField;
  children: React.ReactNode;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}