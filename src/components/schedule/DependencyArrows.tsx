import React from 'react';
import { ModernGanttTask } from './types';

interface DependencyArrowsProps {
  tasks: ModernGanttTask[];
  dayWidth: number;
  taskHeight: number;
  timelineStartDate: Date;
}

interface ArrowPath {
  fromTask: ModernGanttTask;
  toTask: ModernGanttTask;
  fromIndex: number;
  toIndex: number;
}

export const DependencyArrows = ({
  tasks,
  dayWidth,
  taskHeight,
  timelineStartDate
}: DependencyArrowsProps) => {
  
  // Calculate the position of a task bar
  const getTaskBarPosition = (task: ModernGanttTask) => {
    if (!task.barStyle || !task.startDate || !task.endDate) return null;
    
    const startDate = new Date(task.startDate);
    const endDate = new Date(task.endDate);
    
    const daysFromStart = Math.floor((startDate.getTime() - timelineStartDate.getTime()) / (1000 * 60 * 60 * 24));
    const durationInDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    return {
      startX: daysFromStart * dayWidth,
      endX: (daysFromStart + durationInDays) * dayWidth,
      width: durationInDays * dayWidth
    };
  };

  // Find all dependency relationships
  const getDependencyPaths = (): ArrowPath[] => {
    const paths: ArrowPath[] = [];
    
    tasks.forEach((task, toIndex) => {
      if (task.dependencies && task.dependencies.length > 0) {
        task.dependencies.forEach(depRowNumber => {
          const fromTask = tasks.find(t => t.rowNumber === depRowNumber);
          const fromIndex = tasks.findIndex(t => t.rowNumber === depRowNumber);
          
          if (fromTask && fromIndex !== -1) {
            paths.push({
              fromTask,
              toTask: task,
              fromIndex,
              toIndex
            });
          }
        });
      }
    });
    
    return paths;
  };

  // Generate smooth, elegant SVG path for arrow
  const generateArrowPath = (path: ArrowPath): string | null => {
    const fromPosition = getTaskBarPosition(path.fromTask);
    const toPosition = getTaskBarPosition(path.toTask);
    
    if (!fromPosition || !toPosition) return null;
    
    // Calculate Y positions (center of each task row)
    const fromY = (path.fromIndex * taskHeight) + (taskHeight / 2);
    const toY = (path.toIndex * taskHeight) + (taskHeight / 2);
    
    // Precise connection points - end of predecessor, start of successor
    const startX = fromPosition.endX + 2; // Small offset for visual clarity
    const startY = fromY;
    const endX = toPosition.startX - 8; // Space for arrowhead
    const endY = toY;
    
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Create elegant curves based on distance and direction
    if (Math.abs(deltaY) < 8) {
      // Nearly horizontal - simple smooth line
      const midX = startX + (deltaX * 0.7);
      return `M ${startX} ${startY} 
              C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
    } else if (deltaY > 0) {
      // Downward dependency - smooth S-curve
      const controlDistance = Math.min(Math.abs(deltaX) * 0.4, 60);
      const control1X = startX + controlDistance;
      const control2X = endX - controlDistance;
      const midY = startY + (deltaY * 0.6);
      
      return `M ${startX} ${startY} 
              C ${control1X} ${startY}, ${control1X} ${midY}, ${startX + (deltaX * 0.3)} ${midY}
              S ${control2X} ${endY}, ${endX} ${endY}`;
    } else {
      // Upward dependency - elegant arch
      const archHeight = Math.max(20, Math.abs(deltaY) * 0.3);
      const control1X = startX + (deltaX * 0.3);
      const control1Y = startY - archHeight;
      const control2X = endX - (deltaX * 0.3);
      const control2Y = endY - archHeight;
      
      return `M ${startX} ${startY} 
              C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${endX} ${endY}`;
    }
  };

  // Create elegant arrowhead markers with gradients
  const ArrowMarkers = () => (
    <defs>
      {/* Gradient for depth */}
      <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#1d4ed8" stopOpacity="1" />
      </linearGradient>
      
      {/* Drop shadow filter */}
      <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="1" dy="1" stdDeviation="1" floodColor="rgba(0,0,0,0.15)" />
      </filter>
      
      {/* Main arrowhead */}
      <marker
        id="arrowhead"
        markerWidth="12"
        markerHeight="8"
        refX="11"
        refY="4"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <path
          d="M 0 0 L 12 4 L 0 8 L 3 4 Z"
          fill="url(#arrowGradient)"
          stroke="#1d4ed8"
          strokeWidth="0.5"
          filter="url(#dropShadow)"
        />
      </marker>
      
      {/* Hover state arrowhead */}
      <marker
        id="arrowheadHover"
        markerWidth="12"
        markerHeight="8"
        refX="11"
        refY="4"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <path
          d="M 0 0 L 12 4 L 0 8 L 3 4 Z"
          fill="#3b82f6"
          stroke="#1d4ed8"
          strokeWidth="0.5"
        />
      </marker>
    </defs>
  );

  const dependencyPaths = getDependencyPaths();
  
  if (dependencyPaths.length === 0) return null;

  // Calculate total height needed for the SVG
  const totalHeight = tasks.length * taskHeight;
  const totalWidth = Math.max(...tasks.map((task, index) => {
    const position = getTaskBarPosition(task);
    return position ? position.endX + 100 : 0;
  }));

  return (
    <svg
      className="absolute inset-0 pointer-events-none z-10"
      width={totalWidth}
      height={totalHeight}
      style={{ overflow: 'visible' }}
    >
      <ArrowMarkers />
      
      {dependencyPaths.map((path, index) => {
        const pathString = generateArrowPath(path);
        if (!pathString) return null;
        
        // Determine arrow color based on task type/status
        const getArrowColor = () => {
          if (path.toTask.status === 100) return '#10b981'; // Green for completed
          if (path.toTask.status > 0) return '#3b82f6'; // Blue for in progress  
          return '#64748b'; // Gray for not started
        };
        
        const arrowColor = getArrowColor();
        
        return (
          <g 
            key={`dependency-${path.fromTask.id}-${path.toTask.id}-${index}`}
            className="dependency-arrow-group"
          >
            {/* Subtle glow effect */}
            <path
              d={pathString}
              fill="none"
              stroke={arrowColor}
              strokeWidth="3"
              opacity="0.3"
              markerEnd="url(#arrowhead)"
              filter="url(#dropShadow)"
            />
            
            {/* Main arrow line */}
            <path
              d={pathString}
              fill="none"
              stroke={arrowColor}
              strokeWidth="2"
              markerEnd="url(#arrowhead)"
              className="transition-all duration-200"
              style={{
                strokeDasharray: path.toTask.status === 0 ? '5,3' : 'none', // Dashed for future tasks
              }}
            />
            
            {/* Interactive hover area */}
            <path
              d={pathString}
              fill="none"
              stroke="transparent"
              strokeWidth="12"
              className="pointer-events-auto cursor-pointer transition-all duration-200 hover:stroke-blue-400 hover:stroke-opacity-20"
              onMouseEnter={(e) => {
                // Enhance arrow on hover
                const mainPath = e.currentTarget.previousElementSibling as SVGPathElement;
                if (mainPath) {
                  mainPath.style.strokeWidth = '3';
                  mainPath.style.filter = 'url(#dropShadow)';
                }
              }}
              onMouseLeave={(e) => {
                // Reset arrow on leave
                const mainPath = e.currentTarget.previousElementSibling as SVGPathElement;
                if (mainPath) {
                  mainPath.style.strokeWidth = '2';
                  mainPath.style.filter = 'none';
                }
              }}
            >
              <title>{`${path.fromTask.title} → ${path.toTask.title}`}</title>
            </path>
          </g>
        );
      })}
    </svg>
  );
};