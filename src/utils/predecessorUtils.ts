import { GanttTask, TaskDependency, DependencyType } from '@/types/gantt';
import { addDays, max, min } from 'date-fns';

/**
 * Calculate the earliest possible start date for a task based on its predecessors
 */
export const calculateEarliestStartDate = (
  task: GanttTask, 
  allTasks: GanttTask[]
): Date | null => {
  if (!task.predecessors || task.predecessors.length === 0) {
    return null; // No constraints
  }

  let earliestStart: Date | null = null;

  for (const dependency of task.predecessors) {
    const predecessorTask = allTasks.find(t => t.id === dependency.predecessorId);
    if (!predecessorTask) continue;

    const dependencyDate = calculateDependencyDate(
      predecessorTask,
      dependency.type,
      dependency.lag || 0
    );

    if (dependencyDate) {
      earliestStart = earliestStart ? max([earliestStart, dependencyDate]) : dependencyDate;
    }
  }

  return earliestStart;
};

/**
 * Calculate the date constraint imposed by a specific dependency
 */
export const calculateDependencyDate = (
  predecessorTask: GanttTask,
  dependencyType: DependencyType,
  lag: number = 0
): Date => {
  let constraintDate: Date;

  switch (dependencyType) {
    case 'FS': // Finish to Start - successor starts when predecessor finishes
      constraintDate = predecessorTask.endDate;
      break;
    case 'SS': // Start to Start - successor starts when predecessor starts  
      constraintDate = predecessorTask.startDate;
      break;
    case 'FF': // Finish to Finish - successor finishes when predecessor finishes
      constraintDate = predecessorTask.endDate;
      break;
    case 'SF': // Start to Finish - successor finishes when predecessor starts
      constraintDate = predecessorTask.startDate;
      break;
    default:
      constraintDate = predecessorTask.endDate;
  }

  // Apply lag/lead time
  return addDays(constraintDate, lag);
};

/**
 * Validate if a task's current schedule violates any predecessor constraints
 */
export const validateTaskSchedule = (
  task: GanttTask,
  allTasks: GanttTask[]
): { isValid: boolean; violations: string[] } => {
  const violations: string[] = [];

  if (!task.predecessors || task.predecessors.length === 0) {
    return { isValid: true, violations: [] };
  }

  for (const dependency of task.predecessors) {
    const predecessorTask = allTasks.find(t => t.id === dependency.predecessorId);
    if (!predecessorTask) continue;

    const constraintDate = calculateDependencyDate(
      predecessorTask,
      dependency.type,
      dependency.lag || 0
    );

    let isViolated = false;
    let violationMessage = '';

    switch (dependency.type) {
      case 'FS':
        if (task.startDate < constraintDate) {
          isViolated = true;
          violationMessage = `Task cannot start before ${predecessorTask.name} finishes`;
        }
        break;
      case 'SS':
        if (task.startDate < constraintDate) {
          isViolated = true;
          violationMessage = `Task cannot start before ${predecessorTask.name} starts`;
        }
        break;
      case 'FF':
        if (task.endDate < constraintDate) {
          isViolated = true;
          violationMessage = `Task cannot finish before ${predecessorTask.name} finishes`;
        }
        break;
      case 'SF':
        if (task.endDate < constraintDate) {
          isViolated = true;
          violationMessage = `Task cannot finish before ${predecessorTask.name} starts`;
        }
        break;
    }

    if (isViolated) {
      violations.push(violationMessage);
    }
  }

  return { isValid: violations.length === 0, violations };
};

/**
 * Auto-schedule a task based on its predecessors
 */
export const autoScheduleTask = (
  task: GanttTask,
  allTasks: GanttTask[]
): Partial<GanttTask> => {
  const earliestStart = calculateEarliestStartDate(task, allTasks);
  
  if (!earliestStart) {
    return {}; // No changes needed
  }

  // Calculate current duration
  const currentDuration = Math.ceil(
    (task.endDate.getTime() - task.startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Apply the earliest start date and maintain duration
  return {
    startDate: earliestStart,
    endDate: addDays(earliestStart, currentDuration)
  };
};

/**
 * Get dependency relationship lines for visualization
 */
export const getDependencyLines = (
  tasks: GanttTask[],
  viewSettings: { dayWidth: number; rowHeight: number; viewStart: Date }
) => {
  const lines: Array<{
    id: string;
    fromTask: string;
    toTask: string;
    type: DependencyType;
    path: string;
    color: string;
  }> = [];

  tasks.forEach((task, taskIndex) => {
    if (!task.predecessors) return;

    task.predecessors.forEach((dependency) => {
      const predecessorTask = tasks.find(t => t.id === dependency.predecessorId);
      const predecessorIndex = tasks.findIndex(t => t.id === dependency.predecessorId);
      
      if (!predecessorTask || predecessorIndex === -1) return;

      // Calculate positions
      const fromY = (predecessorIndex + 0.5) * viewSettings.rowHeight;
      const toY = (taskIndex + 0.5) * viewSettings.rowHeight;
      
      const fromX = dependency.type === 'FS' || dependency.type === 'FF' 
        ? getTaskEndX(predecessorTask, viewSettings)
        : getTaskStartX(predecessorTask, viewSettings);
        
      const toX = dependency.type === 'FF' || dependency.type === 'SF'
        ? getTaskEndX(task, viewSettings)
        : getTaskStartX(task, viewSettings);

      // Create path for arrow
      const path = createArrowPath(fromX, fromY, toX, toY);
      
      lines.push({
        id: `${dependency.predecessorId}-${task.id}-${dependency.type}`,
        fromTask: dependency.predecessorId,
        toTask: task.id,
        type: dependency.type,
        path,
        color: getDependencyColor(dependency.type)
      });
    });
  });

  return lines;
};

const getTaskStartX = (task: GanttTask, viewSettings: any) => {
  const daysSinceStart = Math.floor(
    (task.startDate.getTime() - viewSettings.viewStart.getTime()) / (1000 * 60 * 60 * 24)
  );
  const taskLeft = daysSinceStart * viewSettings.dayWidth;
  // Match the Element task bar rendering: position.left + 4
  return taskLeft + 4;
};

const getTaskEndX = (task: GanttTask, viewSettings: any) => {
  const startDaysSinceStart = Math.floor(
    (task.startDate.getTime() - viewSettings.viewStart.getTime()) / (1000 * 60 * 60 * 24)
  );
  const endDaysSinceStart = Math.floor(
    (task.endDate.getTime() - viewSettings.viewStart.getTime()) / (1000 * 60 * 60 * 24)
  );
  const duration = Math.max(1, endDaysSinceStart - startDaysSinceStart + 1);
  const taskLeft = startDaysSinceStart * viewSettings.dayWidth;
  const taskWidth = Math.max(viewSettings.dayWidth, duration * viewSettings.dayWidth);
  // Match the Element task bar rendering: position.left + position.width - 4
  return taskLeft + taskWidth - 4;
};

const createArrowPath = (fromX: number, fromY: number, toX: number, toY: number) => {
  // Simple vertical arrow path - straight down from predecessor to successor
  return `M ${fromX} ${fromY} L ${fromX} ${toY} L ${toX} ${toY}`;
};

const getDependencyColor = (type: DependencyType) => {
  switch (type) {
    case 'FS': return 'rgba(59, 130, 246, 0.8)'; // blue with opacity
    case 'SS': return 'rgba(16, 185, 129, 0.8)'; // green with opacity  
    case 'FF': return 'rgba(245, 158, 11, 0.8)'; // amber with opacity
    case 'SF': return 'rgba(239, 68, 68, 0.8)'; // red with opacity
    default: return 'rgba(107, 114, 128, 0.8)'; // gray with opacity
  }
};