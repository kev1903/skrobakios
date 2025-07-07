import { ModernGanttTask, TimelineHeader } from './types';

// Format date to dd/mm/yy format
export const formatDateDisplay = (dateString: string): string => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
};

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

// Auto-assign row numbers to tasks in hierarchical structure
export const assignRowNumbers = (tasks: ModernGanttTask[]): ModernGanttTask[] => {
  let rowCounter = 1;
  
  const assignRecursively = (taskList: ModernGanttTask[]): ModernGanttTask[] => {
    return taskList.map(task => {
      const updatedTask = { ...task, rowNumber: rowCounter++ };
      
      if (task.children && task.children.length > 0) {
        updatedTask.children = assignRecursively(task.children);
      }
      
      return updatedTask;
    });
  };
  
  return assignRecursively(tasks);
};

// Parse dependency string (row numbers) into array
export const parseDependencies = (dependencyString: string): number[] => {
  if (!dependencyString || dependencyString.trim() === '') {
    return [];
  }
  
  return dependencyString
    .split(',')
    .map(dep => parseInt(dep.trim()))
    .filter(dep => !isNaN(dep) && dep > 0);
};

// Format dependencies array back to string for display
export const formatDependencies = (dependencies: number[]): string => {
  return dependencies.join(', ');
};

// Validate and resolve task dependencies using row numbers
export const validateDependencies = (
  tasks: ModernGanttTask[],
  taskRowNumber: number,
  dependencies: number[]
): { isValid: boolean; conflicts: string[] } => {
  const conflicts: string[] = [];
  const flatTasks = flattenTasks(tasks);
  
  // Check for self-dependency
  if (dependencies.includes(taskRowNumber)) {
    conflicts.push("Task cannot depend on itself");
    return { isValid: false, conflicts };
  }
  
  // Check for circular dependencies using row numbers
  const checkCircular = (currentRowNumber: number, path: number[] = []): boolean => {
    if (path.includes(currentRowNumber)) {
      conflicts.push(`Circular dependency detected: ${path.join(' → ')} → ${currentRowNumber}`);
      return false;
    }
    
    const task = flatTasks.find(t => t.rowNumber === currentRowNumber);
    if (!task || !task.dependencies) return true;
    
    return task.dependencies.every(depRowNumber => 
      checkCircular(depRowNumber, [...path, currentRowNumber])
    );
  };
  
  const isValid = dependencies.every(depRowNumber => {
    const depTask = flatTasks.find(t => t.rowNumber === depRowNumber);
    if (!depTask) {
      conflicts.push(`Dependency row ${depRowNumber} not found`);
      return false;
    }
    return checkCircular(depRowNumber, [taskRowNumber]);
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

// Find task by row number in flat structure
export const findTaskByRowNumber = (tasks: ModernGanttTask[], rowNumber: number): ModernGanttTask | null => {
  const flatTasks = flattenTasks(tasks);
  return flatTasks.find(task => task.rowNumber === rowNumber) || null;
};

// Auto-schedule task based on dependencies using row numbers
export const autoScheduleTask = (
  task: ModernGanttTask,
  allTasks: ModernGanttTask[]
): ModernGanttTask => {
  if (!task.dependencies || task.dependencies.length === 0) {
    return task;
  }
  
  let latestEndDate = task.startDate;
  const flatTasks = flattenTasks(allTasks);
  
  // Find the latest end date among dependencies using row numbers
  for (const depRowNumber of task.dependencies) {
    const depTask = flatTasks.find(t => t.rowNumber === depRowNumber);
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
      for (const depRowNumber of task.dependencies) {
        const depTask = flatTasks.find(t => t.rowNumber === depRowNumber);
        if (depTask) {
          const depDuration = calculatePathDuration(depTask.id, new Set(visited));
          maxDepDuration = Math.max(maxDepDuration, depDuration);
        }
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