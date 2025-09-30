import React from 'react';
import { format, isToday, isWeekend } from 'date-fns';
import { generateTimelineData } from '@/utils/ganttUtils';
import { GanttViewSettings } from '@/types/gantt';
import { cn } from '@/lib/utils';

interface GanttHeaderProps {
  viewSettings: GanttViewSettings;
  scrollRef: React.RefObject<HTMLDivElement>;
}

export const GanttHeader: React.FC<GanttHeaderProps> = ({
  viewSettings,
  scrollRef
}) => {
  const { days, months } = generateTimelineData(viewSettings.viewStart, viewSettings.viewEnd);
  const totalWidth = days.length * viewSettings.dayWidth;

  return (
    <div 
      ref={scrollRef}
      className="bg-gray-50 border-b border-gray-200 overflow-x-auto overflow-y-hidden sticky top-0 z-20 flex items-center"
      style={{ height: '28px', maxHeight: '28px', minHeight: '28px' }}
    >
      <div style={{ width: totalWidth, minWidth: totalWidth }} className="flex h-full">
        {/* Combined Month/Day Headers */}
        {days.map((day, index) => {
          const dayNumber = format(day, 'd');
          const isWeekendDay = isWeekend(day);
          const isTodayDay = isToday(day);
          const isFirstOfMonth = dayNumber === '1' || index === 0;
          const monthLabel = isFirstOfMonth ? format(day, 'MMM yyyy') : '';

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "flex items-center justify-center text-xs font-medium border-r border-gray-200 relative",
                isTodayDay 
                  ? "bg-blue-100 text-blue-700" 
                  : isWeekendDay 
                    ? "bg-gray-100 text-gray-600" 
                    : "bg-gray-50 text-gray-600"
              )}
              style={{
                width: viewSettings.dayWidth,
                minWidth: viewSettings.dayWidth
              }}
            >
              {monthLabel ? (
                <span className="text-[10px] font-semibold">{monthLabel}</span>
              ) : (
                <span className={cn("text-[10px]", isTodayDay ? "font-bold" : "")}>
                  {dayNumber}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};