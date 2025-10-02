import React, { useMemo } from 'react';
import { format, eachDayOfInterval, startOfMonth, endOfMonth, addMonths, differenceInDays } from 'date-fns';
import { WBSPredecessor } from '@/types/wbs';
import './dependency-arrows.css';

interface GanttTask {
  id: string;
  name: string;
  start: Date;
  end: Date;
  progress: number;
  level: number;
  predecessors?: WBSPredecessor[];
}

interface SimpleGanttChartProps {
  items: any[];
  onDateChange?: (task: any, start: Date, end: Date) => void;
  onProgressChange?: (task: any, progress: number) => void;
  viewMode?: 'day' | 'week' | 'month';
}

export const SimpleGanttChart = ({ 
  items, 
  viewMode = 'day' 
}: SimpleGanttChartProps) => {
  const tasks = useMemo(() => {
    const today = new Date();
    const defaultStart = today;
    const defaultEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    return items
      .filter(item => !item.id.startsWith('empty-'))
      .map(item => {
        let startDate = defaultStart;
        let endDate = defaultEnd;

        if (item.start_date) {
          startDate = new Date(item.start_date);
        }
        if (item.end_date) {
          endDate = new Date(item.end_date);
        }

        return {
          id: item.id,
          name: item.title || 'Untitled',
          start: startDate,
          end: endDate,
          progress: item.progress || 0,
          level: item.level || 0,
          predecessors: item.predecessors || []
        };
      });
  }, [items]);

  const { dateRange, columnWidth } = useMemo(() => {
    if (tasks.length === 0) {
      const today = new Date();
      return {
        dateRange: eachDayOfInterval({ start: today, end: addMonths(today, 1) }),
        columnWidth: 40
      };
    }

    const allDates = tasks.flatMap(t => [t.start, t.end]);
    const minDate = startOfMonth(new Date(Math.min(...allDates.map(d => d.getTime()))));
    const maxDate = endOfMonth(new Date(Math.max(...allDates.map(d => d.getTime()))));

    return {
      dateRange: eachDayOfInterval({ start: minDate, end: maxDate }),
      columnWidth: viewMode === 'day' ? 40 : viewMode === 'week' ? 80 : 120
    };
  }, [tasks, viewMode]);

  const getBarPosition = (task: GanttTask) => {
    const startDay = differenceInDays(task.start, dateRange[0]);
    const duration = differenceInDays(task.end, task.start) + 1;
    
    return {
      left: startDay * columnWidth,
      width: duration * columnWidth
    };
  };

  const getBarStyle = (level: number) => {
    // Light blue color scheme inspired by Smartsheet
    const styles = [
      { 
        bg: 'hsl(214, 85%, 70%)',
        border: 'hsl(214, 75%, 60%)',
        shadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      },
      { 
        bg: 'hsl(214, 80%, 68%)',
        border: 'hsl(214, 70%, 58%)',
        shadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      },
      { 
        bg: 'hsl(214, 75%, 66%)',
        border: 'hsl(214, 65%, 56%)',
        shadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      },
      { 
        bg: 'hsl(214, 70%, 64%)',
        border: 'hsl(214, 60%, 54%)',
        shadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }
    ];
    
    return styles[level % styles.length];
  };

  // Generate dependency arrows
  const dependencyArrows = useMemo(() => {
    const arrows: Array<{
      fromTaskId: string;
      toTaskId: string;
      fromX: number;
      fromY: number;
      toX: number;
      toY: number;
      path: string;
    }> = [];

    const ROW_HEIGHT = 28;
    const BAR_TOP_OFFSET = 4; // Offset from top of row to top of bar

    tasks.forEach((task, toIndex) => {
      if (!task.predecessors || task.predecessors.length === 0) return;

      task.predecessors.forEach(pred => {
        const fromTask = tasks.find(t => t.id === pred.id);
        if (!fromTask) return;

        const fromIndex = tasks.findIndex(t => t.id === pred.id);
        const fromPosition = getBarPosition(fromTask);
        const toPosition = getBarPosition(task);

        // Arrow starts from the right edge of predecessor bar at vertical center
        const fromX = fromPosition.left + fromPosition.width - 4;
        const fromY = fromIndex * ROW_HEIGHT + ROW_HEIGHT / 2;

        // Arrow ends at the left edge of successor bar at the TOP
        const toX = toPosition.left + 4;
        const toY = toIndex * ROW_HEIGHT + BAR_TOP_OFFSET;

        // Simple 2-direction path: horizontal first, then vertical down
        const path = `M ${fromX} ${fromY} L ${toX} ${fromY} L ${toX} ${toY}`;

        arrows.push({
          fromTaskId: fromTask.id,
          toTaskId: task.id,
          fromX,
          fromY,
          toX,
          toY,
          path
        });
      });
    });

    return arrows;
  }, [tasks, dateRange, columnWidth]);

  if (tasks.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
        No tasks to display
      </div>
    );
  }

  const ROW_HEIGHT = 28;
  const HEADER_HEIGHT = 48;

  return (
    <div className="w-full h-full bg-gradient-to-b from-slate-50 to-white overflow-auto">
      <div className="relative" style={{ minWidth: dateRange.length * columnWidth }}>
        {/* Header */}
        <div 
          className="sticky top-0 z-10 bg-gradient-to-b from-slate-100 via-slate-50 to-slate-50/80 backdrop-blur-sm border-b-2 border-slate-300/50 shadow-sm"
          style={{ height: HEADER_HEIGHT }}
        >
          <div className="flex h-full">
            {dateRange.map((date, i) => {
              const isToday = format(new Date(), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              
              return (
                <div
                  key={i}
                  className={`flex-shrink-0 border-r flex items-center justify-center transition-colors ${
                    isToday 
                      ? 'bg-blue-50/80 border-blue-300/50' 
                      : isWeekend 
                      ? 'bg-slate-100/50 border-slate-200/50' 
                      : 'border-slate-200/50'
                  }`}
                  style={{ width: columnWidth }}
                >
                  <div className="text-center">
                    <div className={`text-xs font-bold tracking-wide ${
                      isToday ? 'text-blue-700' : 'text-slate-700'
                    }`}>
                      {format(date, 'MMM')}
                    </div>
                    <div className={`text-[11px] font-semibold mt-0.5 ${
                      isToday ? 'text-blue-600' : 'text-slate-500'
                    }`}>
                      {format(date, 'd')}
                    </div>
                    {isToday && (
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mx-auto mt-1" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Grid and Bars */}
        <div className="relative">
          {/* Vertical grid lines with today marker */}
          {dateRange.map((date, i) => {
            const isToday = format(new Date(), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            
            return (
              <div
                key={`grid-${i}`}
                className={`absolute top-0 bottom-0 border-r ${
                  isToday 
                    ? 'border-blue-400/40 bg-blue-50/20' 
                    : isWeekend 
                    ? 'border-slate-200/40 bg-slate-50/30' 
                    : 'border-slate-200/30'
                }`}
                style={{ 
                  left: i * columnWidth, 
                  width: isToday ? 2 : 1,
                  zIndex: isToday ? 5 : 0
                }}
              />
            );
          })}

          {/* Today marker - modern dotted line with glow */}
          {dateRange.map((date, i) => {
            const isToday = format(new Date(), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
            if (!isToday) return null;
            
            return (
              <div
                key={`today-line-${i}`}
                className="absolute top-0 bottom-0"
                style={{ 
                  left: i * columnWidth + columnWidth / 2,
                  zIndex: 15
                }}
              >
                {/* Glow effect backdrop */}
                <div 
                  className="absolute inset-0 -mx-1"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(156, 163, 175, 0.08), transparent)',
                    filter: 'blur(4px)'
                  }}
                />
                {/* Main dotted line */}
                <div 
                  className="absolute inset-0 border-r-[1.5px]"
                  style={{ 
                    borderColor: '#9ca3af',
                    borderStyle: 'dashed',
                    borderWidth: '1.5px',
                    boxShadow: '0 0 8px rgba(156, 163, 175, 0.3)'
                  }}
                />
              </div>
            );
          })}

          {/* Dependency arrows - drawn in front of grid lines */}
          <svg 
            className="absolute top-0 left-0 pointer-events-none"
            style={{ 
              width: '100%', 
              height: tasks.length * ROW_HEIGHT,
              zIndex: 10
            }}
          >
            <defs>
              {/* Small arrowhead that points in travel direction */}
              <marker
                id="arrowhead-gantt"
                markerWidth="5"
                markerHeight="5"
                refX="4"
                refY="2.5"
                orient="auto"
              >
                <path
                  d="M0,0 L0,5 L4,2.5 z"
                  fill="#1a1a1a"
                  stroke="none"
                />
              </marker>
            </defs>
            {dependencyArrows.map((arrow, i) => {
              return (
                <g 
                  key={`arrow-${i}-${arrow.fromTaskId}-${arrow.toTaskId}`}
                  className="dependency-arrow"
                >
                  {/* Thin black arrow line */}
                  <path
                    className="arrow-main"
                    d={arrow.path}
                    stroke="#1a1a1a"
                    strokeWidth="1"
                    fill="none"
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    markerEnd="url(#arrowhead-gantt)"
                  />
                </g>
              );
            })}
          </svg>

          {/* Task rows and bars */}
          {tasks.map((task, rowIndex) => {
            const position = getBarPosition(task);
            const barStyle = getBarStyle(task.level);
            const isHovered = false; // Could be enhanced with state management
            
            return (
              <div
                key={task.id}
                className="relative border-b border-slate-200/40 hover:bg-slate-50/30 transition-colors group"
                style={{ height: ROW_HEIGHT, zIndex: 2 }}
              >
                {/* Task bar */}
                <div
                  className="absolute rounded-md cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5"
                  style={{
                    left: position.left + 4,
                    width: Math.max(position.width - 8, 20),
                    height: ROW_HEIGHT - 8,
                    background: barStyle.bg,
                    border: `1px solid ${barStyle.border}`,
                    boxShadow: barStyle.shadow,
                    top: 4
                  }}
                >
                  {/* Progress indicator with gradient */}
                  <div
                    className="h-full rounded-md relative overflow-hidden"
                    style={{ width: `${task.progress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/30 to-black/20" />
                    <div className="absolute inset-0 bg-white/5" />
                  </div>
                  
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-md pointer-events-none" />
                  
                  {/* Progress percentage badge */}
                  {task.progress > 0 && task.progress < 100 && (
                    <div className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-700 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      {task.progress}%
                    </div>
                  )}
                </div>
                
                {/* Task name - positioned to the right of the bar */}
                <div 
                  className="absolute flex items-center"
                  style={{
                    left: position.left + Math.max(position.width - 8, 20) + 18,
                    top: 4,
                    height: ROW_HEIGHT - 8
                  }}
                >
                  <span className="text-xs font-semibold text-slate-800 whitespace-nowrap drop-shadow-sm">
                    {task.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
