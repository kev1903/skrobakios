export type DependencyType = 'FS' | 'SS' | 'FF' | 'SF';

export interface TaskDependency {
  predecessorId: string;
  type: DependencyType;
  lag?: number; // Days of lag/lead time
}

export interface GanttTask {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'delayed';
  assignee?: string;
  wbs?: string;
  parentId?: string;
  level: number;
  isExpanded?: boolean;
  dependencies?: string[];
  predecessors?: TaskDependency[];
  category: 'Stage' | 'Component' | 'Element';
}

export interface GanttProps {
  tasks: GanttTask[];
  onTaskUpdate?: (taskId: string, updates: Partial<GanttTask>) => void;
  onTaskAdd?: (task: Omit<GanttTask, 'id'>) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskReorder?: (reorderedTasks: GanttTask[]) => void;
}

export interface GanttViewSettings {
  rowHeight: number;
  dayWidth: number;
  taskListWidth: number;
  viewStart: Date;
  viewEnd: Date;
}

export interface TaskPosition {
  left: number;
  width: number;
  top: number;
  height: number;
}