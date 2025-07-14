import React from 'react';
import { format, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, startOfWeek, startOfMonth } from 'date-fns';

interface GanttTimelineProps {
  startDate: Date;
  endDate: Date;
  zoomLevel: number;
}

export const GanttTimeline: React.FC<GanttTimelineProps> = ({
  startDate,
  endDate,
  zoomLevel,
}) => {
  const dayWidth = 40 * zoomLevel;
  const rowHeight = 60;

  // Determine time unit based on zoom level
  const getTimeUnit = () => {
    if (zoomLevel >= 2) return 'day';
    if (zoomLevel >= 1) return 'week';
    return 'month';
  };

  const timeUnit = getTimeUnit();

  const getTimeIntervals = () => {
    switch (timeUnit) {
      case 'day':
        return eachDayOfInterval({ start: startDate, end: endDate });
      case 'week':
        return eachWeekOfInterval({ start: startDate, end: endDate }).map(date => startOfWeek(date));
      case 'month':
        return eachMonthOfInterval({ start: startDate, end: endDate }).map(date => startOfMonth(date));
      default:
        return [];
    }
  };

  const intervals = getTimeIntervals();

  const formatLabel = (date: Date) => {
    switch (timeUnit) {
      case 'day':
        return format(date, 'MMM d');
      case 'week':
        return format(date, 'MMM d');
      case 'month':
        return format(date, 'MMM yyyy');
      default:
        return '';
    }
  };

  const getIntervalWidth = () => {
    switch (timeUnit) {
      case 'day':
        return dayWidth;
      case 'week':
        return dayWidth * 7;
      case 'month':
        return dayWidth * 30; // Approximate
      default:
        return dayWidth;
    }
  };

  const intervalWidth = getIntervalWidth();

  return (
    <div className="absolute top-0 left-0 right-0 z-10 bg-background border-b">
      {/* Header with time labels */}
      <div className="flex h-12 border-b bg-muted/50">
        {/* Task names column */}
        <div className="w-48 flex-shrink-0 border-r bg-background flex items-center px-4">
          <span className="text-sm font-medium text-muted-foreground">Tasks</span>
        </div>
        
        {/* Timeline header */}
        <div className="flex-1 overflow-hidden">
          <div className="flex h-full" style={{ marginLeft: '200px' }}>
            {intervals.map((date, index) => (
              <div
                key={index}
                className="flex items-center justify-center border-r border-border/50 text-xs font-medium text-muted-foreground bg-muted/30"
                style={{ width: intervalWidth, minWidth: intervalWidth }}
              >
                {formatLabel(date as Date)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid lines */}
      <div className="absolute top-12 left-0 right-0 bottom-0 pointer-events-none">
        <div className="flex h-full">
          {/* Task names column */}
          <div className="w-48 flex-shrink-0 border-r bg-background/80" />
          
          {/* Timeline grid */}
          <div className="flex-1">
            <div className="flex h-full" style={{ marginLeft: '200px' }}>
              {intervals.map((_, index) => (
                <div
                  key={index}
                  className="border-r border-border/20"
                  style={{ width: intervalWidth, minWidth: intervalWidth }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};