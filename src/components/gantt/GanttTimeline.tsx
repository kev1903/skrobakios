import React from 'react';
import { format, isToday, isWeekend } from 'date-fns';
import { GanttTask, GanttViewSettings } from '@/types/gantt';
import { GanttTaskBar } from './GanttTaskBar';
import { calculateTaskPosition, generateTimelineData } from '@/utils/ganttUtils';
import { getDependencyLines } from '@/utils/predecessorUtils';
import { cn } from '@/lib/utils';
import '../wbs/dependency-arrows.css';

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
            className="absolute pointer-events-none z-[1000]"
            width={totalWidth + 200} 
            height={totalHeight + 100}
            style={{ 
              left: '-100px',
              top: '-50px',
              overflow: 'visible'
            }}
          >
            <defs>
              {/* Enhanced arrowheads with gradient fills */}
              <marker
                id="arrowhead-timeline-fs"
                viewBox="0 0 14 10"
                refX="13"
                refY="5"
                markerWidth="14"
                markerHeight="10"
                orient="auto"
                markerUnits="userSpaceOnUse"
              >
                <path d="M 0 2 L 12 5 L 0 8 L 2 5 Z" fill="url(#timelineFsArrowGradient)" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="0.5" />
              </marker>
              <marker
                id="arrowhead-timeline-ss"
                viewBox="0 0 14 10"
                refX="13"
                refY="5"
                markerWidth="14"
                markerHeight="10"
                orient="auto"
                markerUnits="userSpaceOnUse"
              >
                <path d="M 0 2 L 12 5 L 0 8 L 2 5 Z" fill="url(#timelineSsArrowGradient)" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="0.5" />
              </marker>
              <marker
                id="arrowhead-timeline-ff"
                viewBox="0 0 14 10"
                refX="13"
                refY="5"
                markerWidth="14"
                markerHeight="10"
                orient="auto"
                markerUnits="userSpaceOnUse"
              >
                <path d="M 0 2 L 12 5 L 0 8 L 2 5 Z" fill="url(#timelineFfArrowGradient)" stroke="rgba(245, 158, 11, 0.3)" strokeWidth="0.5" />
              </marker>
              <marker
                id="arrowhead-timeline-sf"
                viewBox="0 0 14 10"
                refX="13"
                refY="5"
                markerWidth="14"
                markerHeight="10"
                orient="auto"
                markerUnits="userSpaceOnUse"
              >
                <path d="M 0 2 L 12 5 L 0 8 L 2 5 Z" fill="url(#timelineSfArrowGradient)" stroke="rgba(239, 68, 68, 0.3)" strokeWidth="0.5" />
              </marker>
              
              {/* Line gradient definitions */}
              <linearGradient id="timelineFsGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: 'rgba(59, 130, 246, 0.5)' }} />
                <stop offset="50%" style={{ stopColor: 'rgba(59, 130, 246, 0.8)' }} />
                <stop offset="100%" style={{ stopColor: 'rgba(59, 130, 246, 0.9)' }} />
              </linearGradient>
              
              <linearGradient id="timelineSsGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: 'rgba(16, 185, 129, 0.5)' }} />
                <stop offset="50%" style={{ stopColor: 'rgba(16, 185, 129, 0.8)' }} />
                <stop offset="100%" style={{ stopColor: 'rgba(16, 185, 129, 0.9)' }} />
              </linearGradient>
              
              <linearGradient id="timelineFfGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: 'rgba(245, 158, 11, 0.5)' }} />
                <stop offset="50%" style={{ stopColor: 'rgba(245, 158, 11, 0.8)' }} />
                <stop offset="100%" style={{ stopColor: 'rgba(245, 158, 11, 0.9)' }} />
              </linearGradient>
              
              <linearGradient id="timelineSfGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: 'rgba(239, 68, 68, 0.5)' }} />
                <stop offset="50%" style={{ stopColor: 'rgba(239, 68, 68, 0.8)' }} />
                <stop offset="100%" style={{ stopColor: 'rgba(239, 68, 68, 0.9)' }} />
              </linearGradient>
              
              {/* Arrowhead gradient definitions */}
              <linearGradient id="timelineFsArrowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'rgba(59, 130, 246, 1)' }} />
                <stop offset="100%" style={{ stopColor: 'rgba(99, 151, 255, 1)' }} />
              </linearGradient>
              
              <linearGradient id="timelineSsArrowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'rgba(16, 185, 129, 1)' }} />
                <stop offset="100%" style={{ stopColor: 'rgba(52, 211, 153, 1)' }} />
              </linearGradient>
              
              <linearGradient id="timelineFfArrowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'rgba(245, 158, 11, 1)' }} />
                <stop offset="100%" style={{ stopColor: 'rgba(251, 191, 36, 1)' }} />
              </linearGradient>
              
              <linearGradient id="timelineSfArrowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'rgba(239, 68, 68, 1)' }} />
                <stop offset="100%" style={{ stopColor: 'rgba(248, 113, 113, 1)' }} />
              </linearGradient>
              
              {/* Enhanced shadow and glow filters */}
              <filter id="timelineDropShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
                <feOffset dx="2" dy="2" result="offset"/>
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.3"/>
                </feComponentTransfer>
                <feMerge> 
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              
              <filter id="timelineGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {dependencyLines.map((line, index) => {
              const gradientId = `timeline${line.type.charAt(0).toUpperCase() + line.type.slice(1).toLowerCase()}Gradient`;
              const adjustedPath = line.path.split(' ').map((coord, i) => {
                if (i % 2 === 1 && coord.match(/^\d/)) { // Y coordinates
                  return (parseFloat(coord) + 50).toString();
                } else if (i % 2 === 0 && coord.match(/^\d/)) { // X coordinates  
                  return (parseFloat(coord) + 100).toString();
                }
                return coord;
              }).join(' ');
              
              return (
                <g key={line.id} className={`dependency-arrow dependency-${line.type.toLowerCase()}`}>
                  {/* Background glow for depth */}
                  <path
                    d={adjustedPath}
                    stroke={line.color}
                    strokeWidth="6"
                    fill="none"
                    opacity="0.1"
                    className="arrow-glow"
                    filter="url(#timelineGlow)"
                  />
                  
                  {/* Main arrow path with enhanced styling */}
                  <path
                    d={adjustedPath}
                    stroke={`url(#${gradientId})`}
                    strokeWidth="2.5"
                    fill="none"
                    markerEnd={`url(#arrowhead-timeline-${line.type.toLowerCase()})`}
                    filter="url(#timelineDropShadow)"
                    className="arrow-main"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {/* Subtle animated highlight on hover */}
                  <path
                    d={adjustedPath}
                    stroke="rgba(255,255,255,0.6)"
                    strokeWidth="0.8"
                    fill="none"
                    className="arrow-highlight opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    strokeDasharray="3,3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      values="0;6"
                      dur="1.5s"
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