import { WBSItem, WBSPredecessor, DependencyType } from '@/types/wbs';
import { addDays, parseISO, isAfter, isBefore } from 'date-fns';

/**
 * Calculates the earliest start date for a WBS item based on its predecessors
 */
export const calculateWBSEarliestStartDate = (
  task: WBSItem, 
  allTasks: WBSItem[]
): Date | null => {
  if (!task.predecessors || task.predecessors.length === 0) {
    return task.start_date ? parseISO(task.start_date) : null;
  }

  let latestConstraintDate: Date | null = null;

  for (const predecessor of task.predecessors) {
    const predecessorTask = allTasks.find(t => t.id === predecessor.id);
    if (!predecessorTask) continue;

    // Derive predecessor end date if missing using start_date + duration
    let augmentedPredecessor = predecessorTask;
    if (!predecessorTask.end_date && predecessorTask.start_date && (predecessorTask.duration || predecessorTask.duration === 0)) {
      const derivedEnd = addDays(parseISO(predecessorTask.start_date), Math.max(0, (predecessorTask.duration || 1) - 1));
      augmentedPredecessor = { ...predecessorTask, end_date: derivedEnd.toISOString().split('T')[0] } as WBSItem;
    }

    // Ensure required anchor exists based on dependency type
    const needsEnd = predecessor.type === 'FS' || predecessor.type === 'FF';
    const needsStart = predecessor.type === 'SS' || predecessor.type === 'SF';
    if ((needsEnd && !augmentedPredecessor.end_date) || (needsStart && !augmentedPredecessor.start_date)) {
      continue;
    }

    // Only FS and SS affect earliest start; FF and SF are end constraints handled separately
    if (predecessor.type === 'FF' || predecessor.type === 'SF') {
      continue;
    }

    const constraintDate = calculateWBSDependencyDate(
      augmentedPredecessor, 
      predecessor.type, 
      predecessor.lag || 0
    );

    if (!latestConstraintDate || isAfter(constraintDate, latestConstraintDate)) {
      latestConstraintDate = constraintDate;
    }
  }

  return latestConstraintDate;
};

/**
 * Calculates the constraint date imposed by a predecessor based on dependency type
 */
export const calculateWBSDependencyDate = (
  predecessorTask: WBSItem, 
  dependencyType: DependencyType, 
  lag: number = 0
): Date => {
  const predecessorStart = predecessorTask.start_date ? parseISO(predecessorTask.start_date) : null;
  let predecessorEnd = predecessorTask.end_date ? parseISO(predecessorTask.end_date) : null;

  // Derive end date from start + duration if needed
  if (!predecessorEnd && predecessorStart && predecessorTask.duration && predecessorTask.duration > 0) {
    predecessorEnd = addDays(predecessorStart, predecessorTask.duration - 1);
  }

  let constraintDate: Date;

  switch (dependencyType) {
    case 'FS': // Finish-to-Start: dependent starts the day after predecessor finishes
      constraintDate = addDays(predecessorEnd ?? predecessorStart ?? new Date(), 1);
      break;
    case 'SS': // Start-to-Start: dependent starts when predecessor starts
      constraintDate = predecessorStart ?? predecessorEnd ?? new Date();
      break;
    case 'FF': // Finish-to-Finish: dependent finishes when predecessor finishes
      constraintDate = predecessorEnd ?? predecessorStart ?? new Date();
      break;
    case 'SF': // Start-to-Finish: dependent finishes when predecessor starts
      constraintDate = predecessorStart ?? predecessorEnd ?? new Date();
      break;
    default:
      constraintDate = addDays((predecessorEnd ?? predecessorStart ?? new Date()), 1); // Default to FS behavior
  }

  return addDays(constraintDate, lag);
};

/**
 * Auto-schedules a WBS item based on its predecessors
 */
export const autoScheduleWBSTask = (
  task: WBSItem, 
  allTasks: WBSItem[]
): Partial<WBSItem> | null => {
  const earliestStart = calculateWBSEarliestStartDate(task, allTasks);
  const duration = task.duration || 1;

  // Compute end-based constraints (FF, SF) to ensure finish alignment
  let latestEndConstraint: Date | null = null;
  if (task.predecessors && task.predecessors.length > 0) {
    for (const predecessor of task.predecessors) {
      const predecessorTask = allTasks.find(t => t.id === predecessor.id);
      if (!predecessorTask) continue;

      // Derive predecessor end date if missing using start_date + duration
      let augmentedPredecessor = predecessorTask;
      if (!predecessorTask.end_date && predecessorTask.start_date && (predecessorTask.duration || predecessorTask.duration === 0)) {
        const derivedEnd = addDays(parseISO(predecessorTask.start_date), Math.max(0, (predecessorTask.duration || 1) - 1));
        augmentedPredecessor = { ...predecessorTask, end_date: derivedEnd.toISOString().split('T')[0] } as WBSItem;
      }

      // Ensure required anchor exists based on dependency type
      const needsEnd = predecessor.type === 'FS' || predecessor.type === 'FF';
      const needsStart = predecessor.type === 'SS' || predecessor.type === 'SF';
      if ((needsEnd && !augmentedPredecessor.end_date) || (needsStart && !augmentedPredecessor.start_date)) {
        continue;
      }

      if (predecessor.type === 'FF' || predecessor.type === 'SF') {
        const endConstraint = calculateWBSDependencyDate(
          augmentedPredecessor,
          predecessor.type,
          predecessor.lag || 0
        );
        if (!latestEndConstraint || isAfter(endConstraint, latestEndConstraint)) {
          latestEndConstraint = endConstraint;
        }
      }
    }
  }

  // Combine start and end constraints into a proposed start date
  let proposedStart: Date | null = earliestStart;
  if (latestEndConstraint) {
    const requiredStartFromEnd = addDays(latestEndConstraint, -(duration - 1));
    if (!proposedStart || isBefore(proposedStart, requiredStartFromEnd)) {
      proposedStart = requiredStartFromEnd;
    }
  }

  // If no constraints, do nothing
  if (!proposedStart) return null;

  const currentStart = task.start_date ? parseISO(task.start_date) : null;

  // Always reschedule if there are predecessors to ensure proper sequencing
  // or if the proposed start differs from current start
  if (!currentStart || proposedStart.getTime() !== currentStart.getTime()) {
    const newStartDate = proposedStart.toISOString().split('T')[0];
    const newEndDate = addDays(proposedStart, duration - 1).toISOString().split('T')[0];

    return {
      start_date: newStartDate,
      end_date: newEndDate
    };
  }

  return null;
};

/**
 * Finds all tasks that depend on the given task
 */
export const findDependentWBSTasks = (
  taskId: string, 
  allTasks: WBSItem[]
): WBSItem[] => {
  return allTasks.filter(task => 
    task.predecessors?.some(pred => pred.id === taskId)
  );
};

/**
 * Auto-schedules all dependent tasks recursively
 */
export const autoScheduleDependentWBSTasks = (
  updatedTaskId: string,
  allTasks: WBSItem[],
  onTaskUpdate: (id: string, updates: Partial<WBSItem>) => Promise<void>,
  processedTasks: Set<string> = new Set()
): Promise<void> => {
  return new Promise(async (resolve) => {
    // Prevent infinite loops
    if (processedTasks.has(updatedTaskId)) {
      resolve();
      return;
    }
    
    processedTasks.add(updatedTaskId);

    const dependentTasks = findDependentWBSTasks(updatedTaskId, allTasks);
    
    for (const dependentTask of dependentTasks) {
      const updates = autoScheduleWBSTask(dependentTask, allTasks);
      
      if (updates) {
        try {
          await onTaskUpdate(dependentTask.id, updates);
          
          // Update the task in our local array for subsequent calculations
          const taskIndex = allTasks.findIndex(t => t.id === dependentTask.id);
          if (taskIndex !== -1) {
            allTasks[taskIndex] = { ...allTasks[taskIndex], ...updates };
          }
          
          // Recursively schedule tasks that depend on this one
          await autoScheduleDependentWBSTasks(
            dependentTask.id, 
            allTasks, 
            onTaskUpdate, 
            processedTasks
          );
        } catch (error) {
          console.error('Error auto-scheduling dependent task:', error);
        }
      }
    }
    
    resolve();
  });
};

/**
 * Validates WBS task schedule for conflicts
 */
export const validateWBSTaskSchedule = (
  task: WBSItem, 
  allTasks: WBSItem[]
): { isValid: boolean; violations: string[] } => {
  const violations: string[] = [];
  
  if (!task.predecessors || task.predecessors.length === 0) {
    return { isValid: true, violations: [] };
  }

  const taskStart = task.start_date ? parseISO(task.start_date) : null;
  const taskEnd = task.end_date ? parseISO(task.end_date) : null;

  if (!taskStart || !taskEnd) {
    violations.push('Task must have both start and end dates');
    return { isValid: false, violations };
  }

  for (const predecessor of task.predecessors) {
    const predecessorTask = allTasks.find(t => t.id === predecessor.id);
    if (!predecessorTask) continue;

    const constraintDate = calculateWBSDependencyDate(
      predecessorTask, 
      predecessor.type, 
      predecessor.lag || 0
    );

    const dependencyTypeLabel = getDependencyTypeLabel(predecessor.type);
    
    switch (predecessor.type) {
      case 'FS':
        if (isBefore(taskStart, constraintDate)) {
          violations.push(
            `${dependencyTypeLabel} violation: Task cannot start before ${constraintDate.toLocaleDateString()}`
          );
        }
        break;
      case 'SS':
        if (isBefore(taskStart, constraintDate)) {
          violations.push(
            `${dependencyTypeLabel} violation: Task cannot start before ${constraintDate.toLocaleDateString()}`
          );
        }
        break;
      case 'FF':
        if (isBefore(taskEnd, constraintDate)) {
          violations.push(
            `${dependencyTypeLabel} violation: Task cannot finish before ${constraintDate.toLocaleDateString()}`
          );
        }
        break;
      case 'SF':
        if (isBefore(taskEnd, constraintDate)) {
          violations.push(
            `${dependencyTypeLabel} violation: Task cannot finish before ${constraintDate.toLocaleDateString()}`
          );
        }
        break;
    }
  }

  return { isValid: violations.length === 0, violations };
};

/**
 * Gets human-readable dependency type labels
 */
export const getDependencyTypeLabel = (type: DependencyType): string => {
  const labels = {
    'FS': 'Finish-to-Start',
    'SS': 'Start-to-Start', 
    'FF': 'Finish-to-Finish',
    'SF': 'Start-to-Finish'
  };
  return labels[type];
};

/**
 * Detects circular dependencies in WBS structure
 */
export const detectCircularDependencies = (
  taskId: string,
  allTasks: WBSItem[],
  visited: Set<string> = new Set(),
  path: Set<string> = new Set()
): boolean => {
  if (path.has(taskId)) {
    return true; // Circular dependency detected
  }
  
  if (visited.has(taskId)) {
    return false; // Already processed this path
  }

  visited.add(taskId);
  path.add(taskId);

  const task = allTasks.find(t => t.id === taskId);
  if (task?.predecessors) {
    for (const predecessor of task.predecessors) {
      if (detectCircularDependencies(predecessor.id, allTasks, visited, path)) {
        return true;
      }
    }
  }

  path.delete(taskId);
  return false;
};