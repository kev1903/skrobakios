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
            <defs>
              {/* Enhanced arrowhead with gradient */}
              <marker
                id="arrowhead-timeline"
                markerWidth="5"
                markerHeight="4"
                refX="4.5"
                refY="2"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path
                  d="M0,0 L0,4 L5,2 z"
                  fill="var(--arrow-color, #6366f1)"
                  stroke="none"
                />
              </marker>
              
              {/* Gradient definitions */}
              <linearGradient id="timelineArrowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: 'rgba(59, 130, 246, 0.8)' }} />
                <stop offset="100%" style={{ stopColor: 'rgba(59, 130, 246, 1)' }} />
              </linearGradient>
              
              <linearGradient id="timelineFsGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: 'rgba(59, 130, 246, 0.6)' }} />
                <stop offset="100%" style={{ stopColor: 'rgba(59, 130, 246, 0.9)' }} />
              </linearGradient>
              
              <linearGradient id="timelineSsGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: 'rgba(16, 185, 129, 0.6)' }} />
                <stop offset="100%" style={{ stopColor: 'rgba(16, 185, 129, 0.9)' }} />
              </linearGradient>
              
              <linearGradient id="timelineFfGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: 'rgba(245, 158, 11, 0.6)' }} />
                <stop offset="100%" style={{ stopColor: 'rgba(245, 158, 11, 0.9)' }} />
              </linearGradient>
              
              <linearGradient id="timelineSfGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: 'rgba(239, 68, 68, 0.6)' }} />
                <stop offset="100%" style={{ stopColor: 'rgba(239, 68, 68, 0.9)' }} />
              </linearGradient>
              
              {/* Drop shadow filter */}
              <filter id="timelineDropShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="1" dy="1" stdDeviation="1.5" floodOpacity="0.2" />
              </filter>
            </defs>
            
            {dependencyLines.map((line) => {
              const gradientId = `timeline${line.type.toLowerCase()}Gradient`;
              return (
                <g key={line.id} className={`dependency-arrow dependency-${line.type.toLowerCase()} group`}>
                  {/* Subtle glow effect background */}
                  <path
                    d={line.path}
                    stroke={line.color}
                    strokeWidth="3"
                    fill="none"
                    opacity="0.15"
                    className="arrow-glow"
                  />
                  
                  {/* Main arrow path */}
                  <path
                    d={line.path}
                    stroke={`url(#${gradientId})`}
                    strokeWidth="2"
                    fill="none"
                    markerEnd="url(#arrowhead-timeline)"
                    filter="url(#timelineDropShadow)"
                    className="arrow-main"
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                  />
                  
                  {/* Animated highlight */}
                  <path
                    d={line.path}
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth="1"
                    fill="none"
                    className="arrow-highlight"
                    strokeDasharray="4,4"
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      values="0;8"
                      dur="1.2s"
                      repeatCount="indefinite"
                    />
                  </path>
                </g>
              );
            })}
          </svg>
        )}
      </div>
    </div>
  );
};