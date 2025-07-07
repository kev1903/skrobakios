import { ModernGanttTask, TimelineHeader } from './types';

// Calculate bar position based on dates within the timeline
export const calculateBarPosition = (
  startDate: string,
  endDate: string,
  timelineStart: Date,
  timelineEnd: Date
): { left: string; width: string } => {
  const taskStart = new Date(startDate);
  const taskEnd = new Date(endDate);
  
  const totalDays = Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
  const startOffset = Math.ceil((taskStart.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
  const taskDuration = Math.ceil((taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24));
  
  const leftPercentage = Math.max(0, (startOffset / totalDays) * 100);
  const widthPercentage = Math.max(0.5, (taskDuration / totalDays) * 100);
  
  return {
    left: `${leftPercentage}%`,
    width: `${widthPercentage}%`
  };
};

// Calculate end date based on start date and duration (excluding weekends for business days)
export const calculateEndDate = (startDate: string, duration: number): string => {
  const start = new Date(startDate);
  const end = new Date(start);
  
  // For business days calculation, count only weekdays
  let daysAdded = 0;
  while (daysAdded < duration) {
    end.setDate(end.getDate() + 1);
    // Skip weekends (0 = Sunday, 6 = Saturday)
    if (end.getDay() !== 0 && end.getDay() !== 6) {
      daysAdded++;
    }
  }
  
  return end.toISOString().split('T')[0];
};

// Calculate duration based on start and end dates (business days only)
export const calculateDuration = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  let businessDays = 0;
  const current = new Date(start);
  
  while (current <= end) {
    // Count only weekdays
    if (current.getDay() !== 0 && current.getDay() !== 6) {
      businessDays++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return Math.max(1, businessDays);
};

// Generate timeline headers with proper month/day structure
export const generateTimelineHeaders = (
  startDate: Date = new Date('2024-11-01'),
  months: number = 6
): TimelineHeader => {
  const timelineMonths: string[] = [];
  const timelineDays: number[] = [];
  
  const current = new Date(startDate);
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + months);
  
  while (current < endDate) {
    const monthStr = current.toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
    
    // Only add month if it's not already in the array
    if (!timelineMonths.includes(monthStr)) {
      timelineMonths.push(monthStr);
    }
    
    timelineDays.push(current.getDate());
    current.setDate(current.getDate() + 1);
  }
  
  return {
    months: timelineMonths,
    days: timelineDays,
    startDate: new Date(startDate),
    endDate: endDate
  };
};

// Validate and resolve task dependencies
export const validateDependencies = (
  tasks: ModernGanttTask[],
  taskId: string,
  dependencies: string[]
): { isValid: boolean; conflicts: string[] } => {
  const conflicts: string[] = [];
  
  // Check for circular dependencies
  const checkCircular = (currentId: string, path: string[] = []): boolean => {
    if (path.includes(currentId)) {
      conflicts.push(`Circular dependency detected: ${path.join(' -> ')} -> ${currentId}`);
      return false;
    }
    
    const task = findTaskById(tasks, currentId);
    if (!task || !task.dependencies) return true;
    
    return task.dependencies.every(depId => 
      checkCircular(depId, [...path, currentId])
    );
  };
  
  const isValid = dependencies.every(depId => {
    const depTask = findTaskById(tasks, depId);
    if (!depTask) {
      conflicts.push(`Dependency task "${depId}" not found`);
      return false;
    }
    return checkCircular(depId, [taskId]);
  });
  
  return { isValid, conflicts };
};

// Find task by ID in hierarchical structure
export const findTaskById = (tasks: ModernGanttTask[], id: string): ModernGanttTask | null => {
  for (const task of tasks) {
    if (task.id === id) return task;
    if (task.children) {
      const found = findTaskById(task.children, id);
      if (found) return found;
    }
  }
  return null;
};

// Auto-schedule task based on dependencies
export const autoScheduleTask = (
  task: ModernGanttTask,
  allTasks: ModernGanttTask[]
): ModernGanttTask => {
  if (!task.dependencies || task.dependencies.length === 0) {
    return task;
  }
  
  let latestEndDate = task.startDate;
  
  // Find the latest end date among dependencies
  for (const depId of task.dependencies) {
    const depTask = findTaskById(allTasks, depId);
    if (depTask && depTask.endDate) {
      if (new Date(depTask.endDate) > new Date(latestEndDate)) {
        latestEndDate = depTask.endDate;
      }
    }
  }
  
  // Start the task the day after the latest dependency ends
  const newStart = new Date(latestEndDate);
  newStart.setDate(newStart.getDate() + 1);
  
  return {
    ...task,
    startDate: newStart.toISOString().split('T')[0],
    endDate: calculateEndDate(newStart.toISOString().split('T')[0], task.duration)
  };
};

// Update task with automatic calculations and dependency resolution
export const updateTaskWithCalculations = (
  task: ModernGanttTask,
  field: 'duration' | 'startDate' | 'endDate',
  value: string | number,
  timelineStart: Date,
  timelineEnd: Date,
  allTasks?: ModernGanttTask[]
): ModernGanttTask => {
  let updatedTask = { ...task };
  
  if (field === 'duration') {
    updatedTask.duration = Math.max(1, Number(value));
    updatedTask.endDate = calculateEndDate(updatedTask.startDate, updatedTask.duration);
  } else if (field === 'startDate') {
    updatedTask.startDate = String(value);
    updatedTask.endDate = calculateEndDate(updatedTask.startDate, updatedTask.duration);
  } else if (field === 'endDate') {
    updatedTask.endDate = String(value);
    updatedTask.duration = calculateDuration(updatedTask.startDate, updatedTask.endDate);
  }
  
  // Auto-schedule based on dependencies if tasks provided
  if (allTasks && updatedTask.dependencies?.length > 0) {
    updatedTask = autoScheduleTask(updatedTask, allTasks);
  }
  
  // Recalculate bar position
  const barPosition = calculateBarPosition(
    updatedTask.startDate,
    updatedTask.endDate,
    timelineStart,
    timelineEnd
  );
  
  updatedTask.barStyle = {
    ...updatedTask.barStyle,
    left: barPosition.left,
    width: barPosition.width,
    backgroundColor: updatedTask.barStyle?.backgroundColor || generateTaskColor(updatedTask.id)
  };
  
  return updatedTask;
};

// Generate consistent colors for tasks with better contrast
export const generateTaskColor = (taskId: string): string => {
  const colors = [
    '#3B82F6', // Blue
    '#06B6D4', // Cyan  
    '#10B981', // Emerald
    '#8B5CF6', // Violet
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#84CC16', // Lime
    '#EC4899', // Pink
    '#6366F1', // Indigo
    '#14B8A6'  // Teal
  ];
  
  const hash = taskId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  return colors[Math.abs(hash) % colors.length];
};

// Calculate project statistics
export const calculateProjectStats = (tasks: ModernGanttTask[]) => {
  const flatTasks = flattenTasks(tasks);
  const totalTasks = flatTasks.length;
  const completedTasks = flatTasks.filter(task => task.status === 100).length;
  const averageProgress = flatTasks.reduce((sum, task) => sum + task.status, 0) / totalTasks;
  
  // Calculate critical path
  const criticalPath = findCriticalPath(tasks);
  
  return {
    totalTasks,
    completedTasks,
    averageProgress: Math.round(averageProgress),
    criticalPath,
    remainingTasks: totalTasks - completedTasks
  };
};

// Flatten hierarchical tasks
export const flattenTasks = (tasks: ModernGanttTask[], expandedTasks?: Set<string>): ModernGanttTask[] => {
  const result: ModernGanttTask[] = [];
  
  for (const task of tasks) {
    result.push(task);
    if (task.children && (!expandedTasks || expandedTasks.has(task.id))) {
      result.push(...flattenTasks(task.children, expandedTasks));
    }
  }
  
  return result;
};

// Find critical path (longest path through dependencies)
export const findCriticalPath = (tasks: ModernGanttTask[]): string[] => {
  const flatTasks = flattenTasks(tasks);
  const taskMap = new Map(flatTasks.map(task => [task.id, task]));
  
  let longestPath: string[] = [];
  let maxDuration = 0;
  
  // Calculate path duration for each task
  const calculatePathDuration = (taskId: string, visited = new Set<string>()): number => {
    if (visited.has(taskId)) return 0; // Avoid circular references
    
    const task = taskMap.get(taskId);
    if (!task) return 0;
    
    visited.add(taskId);
    
    let maxDepDuration = 0;
    if (task.dependencies) {
      for (const depId of task.dependencies) {
        const depDuration = calculatePathDuration(depId, new Set(visited));
        maxDepDuration = Math.max(maxDepDuration, depDuration);
      }
    }
    
    return task.duration + maxDepDuration;
  };
  
  // Find the path with maximum duration
  for (const task of flatTasks) {
    const pathDuration = calculatePathDuration(task.id);
    if (pathDuration > maxDuration) {
      maxDuration = pathDuration;
      longestPath = [task.id]; // Simplified - in real implementation would trace back the full path
    }
  }
  
  return longestPath;
};