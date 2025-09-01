import { differenceInDays, format, isToday, isWeekend, eachDayOfInterval, startOfMonth, endOfMonth, addDays } from 'date-fns';
import { GanttTask, TaskPosition, GanttViewSettings } from '@/types/gantt';

export const buildTaskHierarchy = (tasks: GanttTask[]): (GanttTask & { children: GanttTask[] })[] => {
  const taskMap = new Map<string, GanttTask & { children: GanttTask[] }>();
  const rootTasks: (GanttTask & { children: GanttTask[] })[] = [];

  // Initialize all tasks with children array
  tasks.forEach(task => {
    taskMap.set(task.id, { ...task, children: [] });
  });

  // Build hierarchy
  tasks.forEach(task => {
    const taskNode = taskMap.get(task.id)!;
    if (task.parentId && taskMap.has(task.parentId)) {
      const parent = taskMap.get(task.parentId)!;
      parent.children.push(taskNode);
    } else {
      rootTasks.push(taskNode);
    }
  });

  return rootTasks;
};

export const flattenVisibleTasks = (
  hierarchicalTasks: (GanttTask & { children: GanttTask[] })[],
  expandedIds: Set<string>
): GanttTask[] => {
  const result: GanttTask[] = [];

  const traverse = (tasks: (GanttTask & { children: GanttTask[] })[], depth = 0) => {
    tasks.forEach(task => {
      result.push({ ...task, level: depth });
      
      if (task.children && task.children.length > 0 && expandedIds.has(task.id)) {
        traverse(task.children as (GanttTask & { children: GanttTask[] })[], depth + 1);
      }
    });
  };

  traverse(hierarchicalTasks, 0);
  return result;
};

export const calculateTaskPosition = (
  task: GanttTask,
  settings: GanttViewSettings,
  taskIndex: number
): TaskPosition => {
  const daysSinceStart = differenceInDays(task.startDate, settings.viewStart);
  const duration = differenceInDays(task.endDate, task.startDate) + 1;

  return {
    left: Math.max(0, daysSinceStart * settings.dayWidth),
    width: Math.max(settings.dayWidth, duration * settings.dayWidth),
    top: taskIndex * settings.rowHeight + 8,
    height: settings.rowHeight - 16
  };
};

export const generateTimelineData = (start: Date, end: Date) => {
  const days = eachDayOfInterval({ start, end });
  
  const months = days.reduce((acc, day, index) => {
    const monthKey = format(day, 'yyyy-MM');
    const isFirstOfMonth = format(day, 'd') === '1' || index === 0;
    
    if (isFirstOfMonth) {
      const monthStart = index;
      const monthEnd = days.findIndex((d, i) => i > index && format(d, 'yyyy-MM') !== monthKey);
      const monthLength = monthEnd === -1 ? days.length - monthStart : monthEnd - monthStart;
      
      acc.push({
        key: monthKey,
        label: format(day, 'MMM yyyy'),
        startIndex: monthStart,
        length: monthLength
      });
    }
    
    return acc;
  }, [] as Array<{ key: string; label: string; startIndex: number; length: number }>);

  return { days, months };
};

export const getTaskStatusColor = (status: GanttTask['status']) => {
  switch (status) {
    case 'completed':
      return 'bg-green-500';
    case 'in-progress':
      return 'bg-blue-500';
    case 'delayed':
      return 'bg-red-500';
    default:
      return 'bg-gray-400';
  }
};

export const getTaskLevelStyles = (level: number) => {
  switch (level) {
    case 0:
      return {
        background: 'bg-slate-100',
        border: 'border-l-4 border-l-slate-700',
        text: 'font-semibold text-slate-800'
      };
    case 1:
      return {
        background: 'bg-slate-50',
        border: 'border-l-2 border-l-slate-600',
        text: 'font-medium text-slate-700'
      };
    default:
      return {
        background: 'bg-white',
        border: 'border-l border-l-slate-400',
        text: 'text-slate-600'
      };
  }
};

export const formatDuration = (startDate: Date, endDate: Date): string => {
  const days = differenceInDays(endDate, startDate) + 1;
  return `${days} day${days !== 1 ? 's' : ''}`;
};