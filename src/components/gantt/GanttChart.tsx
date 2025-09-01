import React, { useState, useCallback } from 'react';
import { GanttProps } from '@/types/gantt';
import { useGanttData } from '@/hooks/useGanttData';
import { useGanttScroll } from '@/hooks/useGanttScroll';
import { GanttTaskList } from './GanttTaskList';
import { GanttHeader } from './GanttHeader';
import { GanttTimeline } from './GanttTimeline';
import { Button } from '@/components/ui/button';
import { ChevronsDown, ChevronsUp } from 'lucide-react';

export const GanttChart: React.FC<GanttProps> = ({
  tasks,
  onTaskUpdate,
  onTaskAdd,
  onTaskDelete,
  onTaskReorder
}) => {
  const {
    visibleTasks,
    viewSettings,
    expandedIds,
    toggleExpanded,
    expandAll,
    collapseAll
  } = useGanttData(tasks);

  const {
    taskListRef,
    timelineHeaderRef,
    timelineBodyRef
  } = useGanttScroll();

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const handleTaskClick = useCallback((taskId: string) => {
    setSelectedTaskId(taskId === selectedTaskId ? null : taskId);
  }, [selectedTaskId]);

  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        <div className="text-center">
          <div className="text-lg font-medium mb-2">No tasks found</div>
          <div className="text-sm">Add tasks to get started with your project schedule</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 border-b border-gray-200 bg-gray-50">
        <Button
          variant="outline"
          size="sm"
          onClick={expandAll}
          className="h-7"
        >
          <ChevronsDown className="w-3 h-3 mr-1" />
          Expand All
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={collapseAll}
          className="h-7"
        >
          <ChevronsUp className="w-3 h-3 mr-1" />
          Collapse All
        </Button>
        <div className="ml-auto text-sm text-gray-600">
          {visibleTasks.length} of {tasks.length} tasks visible
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0">
        {/* Task List Panel */}
        <GanttTaskList
          tasks={visibleTasks}
          expandedIds={expandedIds}
          onToggleExpanded={toggleExpanded}
          onTaskUpdate={onTaskUpdate}
          width={viewSettings.taskListWidth}
          rowHeight={viewSettings.rowHeight}
          scrollRef={taskListRef}
        />

        {/* Timeline Panel */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Timeline Header */}
          <GanttHeader
            viewSettings={viewSettings}
            scrollRef={timelineHeaderRef}
          />

          {/* Timeline Body */}
          <GanttTimeline
            tasks={visibleTasks}
            viewSettings={viewSettings}
            onTaskClick={handleTaskClick}
            scrollRef={timelineBodyRef}
          />
        </div>
      </div>
    </div>
  );
};