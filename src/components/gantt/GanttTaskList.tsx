import React from 'react';
import { GanttTask } from '@/types/gantt';
import { GanttTaskRow } from './GanttTaskRow';

interface GanttTaskListProps {
  tasks: GanttTask[];
  expandedIds: Set<string>;
  onToggleExpanded: (taskId: string) => void;
  onTaskUpdate?: (taskId: string, updates: Partial<GanttTask>) => void;
  onPredecessorUpdate?: (taskId: string, predecessors: any[]) => void;
  width: number;
  rowHeight: number;
  scrollRef: React.RefObject<HTMLDivElement>;
}

export const GanttTaskList: React.FC<GanttTaskListProps> = ({
  tasks,
  expandedIds,
  onToggleExpanded,
  onTaskUpdate,
  onPredecessorUpdate,
  width,
  rowHeight,
  scrollRef
}) => {
  const hasChildren = (taskId: string) => {
    return tasks.some(task => task.parentId === taskId);
  };

  return (
    <div className="flex flex-col bg-white border-r border-gray-200 overflow-hidden" style={{ width }}>
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 flex-shrink-0">
        <div
          className="grid items-center px-2 py-3 text-xs font-medium text-gray-700"
          style={{
            gridTemplateColumns: '20px 60px 1fr 90px 90px 60px 100px 120px',
            height: rowHeight
          }}
        >
          <div></div>
          <div>WBS</div>
          <div>Task Name</div>
          <div className="text-center">Start</div>
          <div className="text-center">End</div>
          <div>Duration</div>
          <div>Status</div>
          <div>Predecessors</div>
        </div>
      </div>

      {/* Task List */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 max-h-full"
      >
        <div style={{ minHeight: tasks.length * rowHeight }}>
          {tasks.map((task, index) => (
            <GanttTaskRow
              key={task.id}
              task={task}
              hasChildren={hasChildren(task.id)}
              isExpanded={expandedIds.has(task.id)}
              onToggleExpanded={onToggleExpanded}
              onTaskUpdate={onTaskUpdate}
              onPredecessorUpdate={onPredecessorUpdate}
              allTasks={tasks}
              style={{ height: rowHeight }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};