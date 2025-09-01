import React, { useState, useCallback, useRef } from 'react';
import { GanttProps } from '@/types/gantt';
import { useGanttData } from '@/hooks/useGanttData';
import { useGanttScroll } from '@/hooks/useGanttScroll';
import { GanttTaskList } from './GanttTaskList';
import { GanttHeader } from './GanttHeader';
import { GanttTimeline } from './GanttTimeline';
import { Button } from '@/components/ui/button';
import { ChevronsDown, ChevronsUp, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [taskListWidth, setTaskListWidth] = useState(350);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTaskClick = useCallback((taskId: string) => {
    setSelectedTaskId(taskId === selectedTaskId ? null : taskId);
  }, [selectedTaskId]);

  // Handle resizer drag
  const handleResizerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startWidth = taskListWidth;
    const containerWidth = containerRef.current?.offsetWidth || window.innerWidth;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const newWidth = Math.max(200, Math.min(containerWidth * 0.6, startWidth + deltaX));
      setTaskListWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [taskListWidth]);

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
    <div ref={containerRef} className="h-full flex flex-col bg-white overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
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
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Task List Panel */}
        <GanttTaskList
          tasks={visibleTasks}
          expandedIds={expandedIds}
          onToggleExpanded={toggleExpanded}
          onTaskUpdate={onTaskUpdate}
          width={taskListWidth}
          rowHeight={viewSettings.rowHeight}
          scrollRef={taskListRef}
        />

        {/* Resizable Divider */}
        <div
          className={cn(
            "w-2 bg-gray-200 hover:bg-blue-400 cursor-col-resize relative transition-colors duration-200 flex-shrink-0 z-10",
            isResizing && "bg-blue-500"
          )}
          onMouseDown={handleResizerMouseDown}
          onTouchStart={(e) => {
            const touch = e.touches[0];
            // Synthesize a mouse-like event for shared handler
            // @ts-ignore - adapting signature for touch
            handleResizerMouseDown({
              preventDefault: () => e.preventDefault(),
              clientX: touch.clientX
            } as React.MouseEvent);
          }}
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize task list"
        >
          {/* Visual grip indicator */}
          <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 flex items-center">
            <GripVertical className="w-3 h-8 text-gray-400 opacity-70" />
          </div>
        </div>

        {/* Timeline Panel */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Timeline Header */}
          <div className="flex-shrink-0">
            <GanttHeader
              viewSettings={{
                ...viewSettings,
                taskListWidth // Use the dynamic width for calculations
              }}
              scrollRef={timelineHeaderRef}
            />
          </div>

          {/* Timeline Body */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <GanttTimeline
              tasks={visibleTasks}
              viewSettings={{
                ...viewSettings,
                taskListWidth // Use the dynamic width for calculations
              }}
              onTaskClick={handleTaskClick}
              scrollRef={timelineBodyRef}
            />
          </div>
        </div>
      </div>
    </div>
  );
};