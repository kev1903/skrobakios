export interface ModernGanttTask {
  id: string;
  title: string;
  duration: number; // Changed to number (days)
  status: number; // percentage
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  dependencies: string[]; // Array of task IDs
  level: number;
  children?: ModernGanttTask[];
  expanded?: boolean;
  color?: string;
  barStyle?: {
    left: string;
    width: string;
    backgroundColor: string;
  };
}

export interface TimelineHeader {
  months: string[];
  days: number[];
  startDate: Date;
  endDate: Date;
}