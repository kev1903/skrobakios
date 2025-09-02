import React from 'react';
import { format, isToday, isWeekend } from 'date-fns';
import { GanttTask, GanttViewSettings } from '@/types/gantt';
import { GanttTaskBar } from './GanttTaskBar';
import { calculateTaskPosition, generateTimelineData } from '@/utils/ganttUtils';
import { getDependencyLines } from '@/utils/predecessorUtils';
import { cn } from '@/lib/utils';

interface GanttTimelineProps {
  tasks: GanttTask[];
  viewSettings: GanttViewSettings;
  onTaskClick?: (taskId: string) => void;
  scrollRef: React.RefObject<HTMLDivElement>;
}

export const GanttTimeline: React.FC<GanttTimelineProps> = ({
  tasks,
  viewSettings,
  onTaskClick,
  scrollRef
}) => {
  const { days } = generateTimelineData(viewSettings.viewStart, viewSettings.viewEnd);
  const totalWidth = days.length * viewSettings.dayWidth;
  const totalHeight = tasks.length * viewSettings.rowHeight;
  
  // Get dependency lines for visualization
  const dependencyLines = getDependencyLines(tasks, viewSettings);

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-auto bg-white min-h-0 max-h-full"
    >
      <div 
        className="relative"
        style={{ 
          width: totalWidth, 
          height: totalHeight,
          minWidth: totalWidth 
        }}
      >
        {/* Grid Background */}
        <div className="absolute inset-0">
          {/* Vertical grid lines (days) */}
          {days.map((day, index) => {
            const isWeekendDay = isWeekend(day);
            return (
              <div
                key={`grid-${index}`}
                className={cn(
                  "absolute top-0 border-r",
                  isWeekendDay ? "bg-gray-50/50 border-gray-200" : "border-gray-100"
                )}
                style={{
                  left: index * viewSettings.dayWidth,
                  width: viewSettings.dayWidth,
                  height: totalHeight
                }}
              />
            );
          })}

          {/* Horizontal grid lines (tasks) */}
          {tasks.map((_, index) => (
            <div
              key={`hgrid-${index}`}
              className="absolute left-0 w-full border-b border-gray-100"
              style={{
                top: (index + 1) * viewSettings.rowHeight,
                height: 1
              }}
            />
          ))}
        </div>

        {/* Today Line */}
        {days.some(day => isToday(day)) && (
          <div
            className="absolute top-0 w-0.5 bg-blue-500 z-30"
            style={{
              left: days.findIndex(day => isToday(day)) * viewSettings.dayWidth + viewSettings.dayWidth / 2,
              height: totalHeight
            }}
          />
        )}

        {/* Task Bars */}
        <div className="absolute inset-0 z-20">
          {tasks.map((task, index) => {
            const position = calculateTaskPosition(task, viewSettings, index);
            return (
              <GanttTaskBar
                key={task.id}
                task={task}
                position={position}
                onTaskClick={onTaskClick}
              />
            );
          })}
        </div>

        {/* Dependency Arrows */}
        {dependencyLines.length > 0 && (
          <svg 
            className="absolute inset-0 z-30 pointer-events-none"
            width={totalWidth} 
            height={totalHeight}
            style={{ overflow: 'visible' }}
          >
            {dependencyLines.map((line) => (
              <g key={line.id}>
                <path
                  d={line.path}
                  stroke={line.color}
                  strokeWidth="2"
                  fill="none"
                  markerEnd="url(#arrowhead)"
                />
              </g>
            ))}
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill="#6b7280"
                />
              </marker>
            </defs>
          </svg>
        )}
      </div>
    </div>
  );
};