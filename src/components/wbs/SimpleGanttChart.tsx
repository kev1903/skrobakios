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
    // Sophisticated color scheme based on hierarchy level
    const styles = [
      { 
        bg: 'linear-gradient(135deg, hsl(210, 100%, 56%) 0%, hsl(210, 100%, 64%) 100%)',
        border: 'hsl(210, 100%, 50%)',
        shadow: '0 2px 8px -2px rgba(59, 130, 246, 0.3)'
      },
      { 
        bg: 'linear-gradient(135deg, hsl(262, 83%, 58%) 0%, hsl(262, 83%, 66%) 100%)',
        border: 'hsl(262, 83%, 52%)',
        shadow: '0 2px 8px -2px rgba(139, 92, 246, 0.3)'
      },
      { 
        bg: 'linear-gradient(135deg, hsl(200, 98%, 39%) 0%, hsl(200, 98%, 47%) 100%)',
        border: 'hsl(200, 98%, 35%)',
        shadow: '0 2px 8px -2px rgba(14, 165, 233, 0.3)'
      },
      { 
        bg: 'linear-gradient(135deg, hsl(173, 58%, 39%) 0%, hsl(173, 58%, 47%) 100%)',
        border: 'hsl(173, 58%, 35%)',
        shadow: '0 2px 8px -2px rgba(20, 184, 166, 0.3)'
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

        // Create path: go right, down, across, then down to top of bar
        const cornerOffset = 8;
        const path = `
          M ${fromX} ${fromY}
          L ${fromX + cornerOffset} ${fromY}
          L ${fromX + cornerOffset} ${toY - cornerOffset}
          L ${toX} ${toY - cornerOffset}
          L ${toX} ${toY}
        `;

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

          {/* Dependency arrows - drawn before bars so they appear behind */}
          <svg 
            className="absolute top-0 left-0 pointer-events-none"
            style={{ 
              width: '100%', 
              height: tasks.length * ROW_HEIGHT,
              zIndex: 1
            }}
          >
            <defs>
              {/* Sophisticated downward pointing arrowhead */}
              <marker
                id="arrowhead-gantt"
                markerWidth="10"
                markerHeight="10"
                refX="5"
                refY="8"
                orient="auto-start-reverse"
              >
                <path
                  d="M1,1 L9,1 L5,9 z"
                  fill="#2563eb"
                  stroke="#1e40af"
                  strokeWidth="0.5"
                  strokeLinejoin="round"
                />
              </marker>
              <filter id="arrow-shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
                <feOffset dx="0" dy="1" result="offsetblur"/>
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.2"/>
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            {dependencyArrows.map((arrow, i) => {
              return (
                <g 
                  key={`arrow-${i}-${arrow.fromTaskId}-${arrow.toTaskId}`}
                  className="dependency-arrow dependency-fs"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {/* Outer glow effect */}
                  <path
                    className="arrow-glow"
                    d={arrow.path}
                    stroke="rgba(37, 99, 235, 0.15)"
                    strokeWidth="8"
                    fill="none"
                    opacity="0"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Main arrow line with shadow */}
                  <path
                    className="arrow-main"
                    d={arrow.path}
                    stroke="#2563eb"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    markerEnd="url(#arrowhead-gantt)"
                    filter="url(#arrow-shadow)"
                  />
                  {/* Inner highlight for depth */}
                  <path
                    className="arrow-highlight"
                    d={arrow.path}
                    stroke="rgba(96, 165, 250, 0.4)"
                    strokeWidth="0.5"
                    fill="none"
                    opacity="0"
                    strokeLinecap="round"
                    strokeLinejoin="round"
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
                    left: position.left + Math.max(position.width - 8, 20) + 12,
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
