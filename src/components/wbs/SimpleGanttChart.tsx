import React, { useMemo } from 'react';
import { format, eachDayOfInterval, startOfMonth, endOfMonth, addMonths, differenceInDays } from 'date-fns';

interface GanttTask {
  id: string;
  name: string;
  start: Date;
  end: Date;
  progress: number;
  level: number;
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
          level: item.level || 0
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

  const getBarColor = (level: number) => {
    const colors = [
      '#64748b', // level 0 - gray
      '#3b82f6', // level 1 - blue
      '#10b981', // level 2 - green
      '#f59e0b', // level 3 - amber
    ];
    return colors[level] || colors[0];
  };

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
    <div className="w-full h-full bg-white overflow-auto">
      <div className="relative" style={{ minWidth: dateRange.length * columnWidth }}>
        {/* Header */}
        <div 
          className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200"
          style={{ height: HEADER_HEIGHT }}
        >
          <div className="flex h-full">
            {dateRange.map((date, i) => (
              <div
                key={i}
                className="flex-shrink-0 border-r border-slate-200 flex items-center justify-center"
                style={{ width: columnWidth }}
              >
                <div className="text-center">
                  <div className="text-xs font-semibold text-slate-700">
                    {format(date, 'MMM')}
                  </div>
                  <div className="text-xs text-slate-500">
                    {format(date, 'd')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Grid and Bars */}
        <div className="relative">
          {/* Vertical grid lines */}
          {dateRange.map((_, i) => (
            <div
              key={`grid-${i}`}
              className="absolute top-0 bottom-0 border-r border-slate-100"
              style={{ left: i * columnWidth, width: 1 }}
            />
          ))}

          {/* Task rows and bars */}
          {tasks.map((task, rowIndex) => {
            const position = getBarPosition(task);
            return (
              <div
                key={task.id}
                className="relative border-b border-slate-100"
                style={{ height: ROW_HEIGHT }}
              >
                {/* Task bar */}
                <div
                  className="absolute top-1 rounded shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                  style={{
                    left: position.left + 4,
                    width: Math.max(position.width - 8, 20),
                    height: ROW_HEIGHT - 8,
                    backgroundColor: getBarColor(task.level),
                    top: 4
                  }}
                >
                  {/* Progress indicator */}
                  <div
                    className="h-full rounded bg-black/20"
                    style={{ width: `${task.progress}%` }}
                  />
                  
                  {/* Task name */}
                  <div className="absolute inset-0 flex items-center px-2">
                    <span className="text-xs font-medium text-white truncate">
                      {task.name}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
