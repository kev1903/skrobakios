import { useState, useMemo, useCallback } from 'react';
import { GanttTask, GanttViewSettings } from '@/types/gantt';
import { buildTaskHierarchy, flattenVisibleTasks } from '@/utils/ganttUtils';
import { startOfMonth, endOfMonth, addDays } from 'date-fns';

export const useGanttData = (tasks: GanttTask[]) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    // Initially expand all level 0 tasks (stages)
    const initialExpanded = new Set<string>();
    tasks.forEach(task => {
      if (task.level === 0) {
        initialExpanded.add(task.id);
      }
    });
    return initialExpanded;
  });

  const hierarchicalTasks = useMemo(() => buildTaskHierarchy(tasks), [tasks]);
  
  const visibleTasks = useMemo(() => 
    flattenVisibleTasks(hierarchicalTasks, expandedIds), 
    [hierarchicalTasks, expandedIds]
  );

  const viewSettings = useMemo((): GanttViewSettings => {
    if (tasks.length === 0) {
      const today = new Date();
      return {
        rowHeight: 40,
        dayWidth: 32,
        taskListWidth: 350,
        viewStart: startOfMonth(addDays(today, -30)),
        viewEnd: endOfMonth(addDays(today, 30))
      };
    }

    const earliest = tasks.reduce((min, task) => 
      task.startDate < min ? task.startDate : min, tasks[0].startDate
    );
    const latest = tasks.reduce((max, task) => 
      task.endDate > max ? task.endDate : max, tasks[0].endDate
    );

    return {
      rowHeight: 40,
      dayWidth: 32,
      taskListWidth: 350,
      viewStart: startOfMonth(addDays(earliest, -7)),
      viewEnd: endOfMonth(addDays(latest, 30))
    };
  }, [tasks]);

  const toggleExpanded = useCallback((taskId: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  }, []);

  const expandAll = useCallback(() => {
    const allParentIds = new Set<string>();
    tasks.forEach(task => {
      const hasChildren = tasks.some(t => t.parentId === task.id);
      if (hasChildren) {
        allParentIds.add(task.id);
      }
    });
    setExpandedIds(allParentIds);
  }, [tasks]);

  const collapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  return {
    visibleTasks,
    viewSettings,
    expandedIds,
    toggleExpanded,
    expandAll,
    collapseAll
  };
};