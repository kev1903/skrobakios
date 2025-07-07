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

  // Generate SVG path for arrow
  const generateArrowPath = (path: ArrowPath): string | null => {
    const fromPosition = getTaskBarPosition(path.fromTask);
    const toPosition = getTaskBarPosition(path.toTask);
    
    if (!fromPosition || !toPosition) return null;
    
    // Calculate Y positions (center of each task row)
    const fromY = (path.fromIndex * taskHeight) + (taskHeight / 2);
    const toY = (path.toIndex * taskHeight) + (taskHeight / 2);
    
    // Start from the end of the predecessor task
    const startX = fromPosition.endX;
    const startY = fromY;
    
    // End at the start of the successor task
    const endX = toPosition.startX;
    const endY = toY;
    
    // Create a path with proper curves for readability
    const midX = startX + ((endX - startX) / 2);
    const controlOffset = 20;
    
    if (Math.abs(endY - startY) < 5) {
      // Horizontal line for same-level tasks
      return `M ${startX} ${startY} L ${endX - 8} ${endY}`;
    } else {
      // Curved path for different-level tasks
      return `M ${startX} ${startY} 
              L ${midX - controlOffset} ${startY} 
              Q ${midX} ${startY} ${midX} ${startY + ((endY - startY) / 2)}
              Q ${midX} ${endY} ${midX + controlOffset} ${endY}
              L ${endX - 8} ${endY}`;
    }
  };

  // Create arrowhead marker
  const ArrowMarker = () => (
    <defs>
      <marker
        id="arrowhead"
        markerWidth="10"
        markerHeight="7"
        refX="9"
        refY="3.5"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <polygon
          points="0 0, 10 3.5, 0 7"
          fill="#64748b"
          stroke="#64748b"
          strokeWidth="1"
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
      <ArrowMarker />
      
      {dependencyPaths.map((path, index) => {
        const pathString = generateArrowPath(path);
        if (!pathString) return null;
        
        return (
          <g key={`dependency-${path.fromTask.id}-${path.toTask.id}-${index}`}>
            {/* Main arrow line */}
            <path
              d={pathString}
              fill="none"
              stroke="#64748b"
              strokeWidth="2"
              markerEnd="url(#arrowhead)"
              className="drop-shadow-sm"
            />
            
            {/* Hover area for interaction */}
            <path
              d={pathString}
              fill="none"
              stroke="transparent"
              strokeWidth="8"
              className="pointer-events-auto cursor-pointer hover:stroke-blue-300"
            >
              <title>{`${path.fromTask.title} → ${path.toTask.title}`}</title>
            </path>
          </g>
        );
      })}
    </svg>
  );
};