import React, { useMemo } from 'react';
import { format, addDays, differenceInDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';

interface WBSItem {
  id: string;
  name: string;
  level: number;
  wbsNumber: string;
  start_date?: string | Date | null;
  end_date?: string | Date | null;
  duration?: number;
  predecessors?: string[];
  status: string;
}

interface GanttChartProps {
  items: WBSItem[];
  className?: string;
  hideHeader?: boolean;
}

export const GanttChart = ({ items, className = "", hideHeader = false }: GanttChartProps) => {
  // Debug logging
  console.log('GanttChart items:', items.map(item => ({
    id: item.id,
    name: item.name,
    start_date: item.start_date,
    end_date: item.end_date,
    level: item.level
  })));

  // Calculate the date range for the chart
  const { startDate, endDate, timelineDays } = useMemo(() => {
    const dates = items
      .filter(item => item.start_date || item.end_date)
      .flatMap(item => [
        item.start_date ? (typeof item.start_date === 'string' ? parseISO(item.start_date) : item.start_date) : null,
        item.end_date ? (typeof item.end_date === 'string' ? parseISO(item.end_date) : item.end_date) : null
      ])
      .filter(Boolean) as Date[];

    console.log('Parsed dates for chart:', dates);

    if (dates.length === 0) {
      const today = new Date();
      const fallbackStart = startOfWeek(today);
      const fallbackEnd = endOfWeek(addDays(today, 60));
      console.log('No dates found, using fallback range:', { fallbackStart, fallbackEnd });
      return {
        startDate: fallbackStart,
        endDate: fallbackEnd,
        timelineDays: eachDayOfInterval({ start: fallbackStart, end: fallbackEnd })
      };
    }

    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
    const chartStart = startOfWeek(minDate);
    const chartEnd = endOfWeek(addDays(maxDate, 14)); // Extended buffer
    
    console.log('Chart date range:', { chartStart, chartEnd, minDate, maxDate });
    
    return {
      startDate: chartStart,
      endDate: chartEnd,
      timelineDays: eachDayOfInterval({ start: chartStart, end: chartEnd })
    };
  }, [items]);

  const getTaskPosition = (item: WBSItem) => {
    if (!item.start_date && !item.end_date) return null;

    const taskStart = item.start_date 
      ? (typeof item.start_date === 'string' ? parseISO(item.start_date) : item.start_date)
      : startDate;
    
    const taskEnd = item.end_date 
      ? (typeof item.end_date === 'string' ? parseISO(item.end_date) : item.end_date)
      : (item.start_date && item.duration ? addDays(taskStart, item.duration) : endDate);

    const startOffset = differenceInDays(taskStart, startDate);
    const duration = differenceInDays(taskEnd, taskStart) + 1;
    
    const dayWidth = 32; // Width per day in pixels
    
    return {
      left: Math.max(0, startOffset * dayWidth),
      width: Math.max(dayWidth, duration * dayWidth),
      startDate: taskStart,
      endDate: taskEnd
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-500';
      case 'In Progress': return 'bg-blue-500';
      case 'On Hold': return 'bg-yellow-500';
      case 'Not Started': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 0: return 'bg-purple-100 border-purple-300';
      case 1: return 'bg-blue-100 border-blue-300';
      case 2: return 'bg-green-100 border-green-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  const dayWidth = 32;
  const chartWidth = timelineDays.length * dayWidth;
  const rowHeight = 28; // Height matching the table rows (1.75rem)

  return (
    <div className={`h-full w-full bg-white ${className}`}>
{!hideHeader && (
  <div className="sticky top-0 bg-white border-b border-border z-10">
    <div className="min-w-fit">
      <div style={{ width: chartWidth }} className="flex">
        {timelineDays.map((day) => (
          <div
            key={day.toISOString()}
            className="flex-shrink-0 border-r border-gray-200 text-center"
            style={{ width: dayWidth }}
          >
            <div className="px-1 py-2 text-xs font-medium text-gray-700">
              <div className="text-xs">{format(day, 'MMM')}</div>
              <div className="text-sm font-bold">{format(day, 'd')}</div>
              <div className="text-xs">{format(day, 'EEE')}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)}

      {/* Gantt Bars Container */}
      <div className="min-w-fit">
        <div style={{ width: chartWidth }} className="relative">
          {items.map((item, index) => {
            const position = getTaskPosition(item);
            
            return (
              <div
                key={item.id}
                className={`relative ${
                  item.level === 0 
                    ? 'bg-primary/5' 
                    : item.level === 1
                    ? 'bg-secondary/5'
                    : 'bg-white'
                }`}
                style={{ height: rowHeight }}
              >
                {/* Grid lines */}
                {timelineDays.map((day, dayIndex) => (
                  <div
                    key={day.toISOString()}
                    className="absolute top-0 bottom-0 border-r border-gray-100"
                    style={{ 
                      left: dayIndex * dayWidth,
                      width: dayWidth
                    }}
                  />
                ))}

                {/* Task bar */}
                {position && (
                  <div
                    className={`absolute top-2 bottom-2 rounded-sm border-2 ${getLevelColor(item.level)} transition-all duration-200 hover:shadow-md cursor-pointer group`}
                    style={{
                      left: position.left + 2,
                      width: Math.max(24, position.width - 4)
                    }}
                    title={`${item.wbsNumber} - ${item.name}\n${format(position.startDate, 'MMM dd')} to ${format(position.endDate, 'MMM dd')}`}
                  >
                    {/* Status indicator */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-sm ${getStatusColor(item.status)}`} />
                    
                    {/* Task content */}
                    <div className="px-2 py-1 flex items-center h-full">
                      <span className="text-xs font-medium text-gray-700 truncate">
                        {item.wbsNumber}
                      </span>
                      {position.width > 80 && (
                        <span className="ml-1 text-xs text-gray-600 truncate">
                          {item.name}
                        </span>
                      )}
                    </div>

                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                      <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                        <div className="font-medium">{item.wbsNumber} - {item.name}</div>
                        <div className="text-gray-300">
                          {format(position.startDate, 'MMM dd')} - {format(position.endDate, 'MMM dd')}
                        </div>
                        <div className="text-gray-300">Status: {item.status}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Today indicator */}
                {timelineDays.some(day => isSameDay(day, new Date())) && (
                  <div
                    className="absolute top-0 bottom-0 w-px bg-red-500 z-10"
                    style={{
                      left: timelineDays.findIndex(day => isSameDay(day, new Date())) * dayWidth
                    }}
                  >
                    <div className="absolute top-0 w-2 h-2 bg-red-500 rounded-full transform -translate-x-1/2" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Weekend highlighting */}
          {timelineDays.map((day, index) => {
            const isWeekend = day.getDay() === 0 || day.getDay() === 6;
            if (!isWeekend) return null;
            
            return (
              <div
                key={`weekend-${day.toISOString()}`}
                className="absolute top-0 bottom-0 bg-gray-50 opacity-50 pointer-events-none"
                style={{
                  left: index * dayWidth,
                  width: dayWidth
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};