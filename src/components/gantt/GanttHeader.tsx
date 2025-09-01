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
      className="bg-white border-b border-gray-200 overflow-x-auto overflow-y-hidden sticky top-0 z-20"
      style={{ height: '60px' }}
    >
      <div style={{ width: totalWidth, minWidth: totalWidth }}>
        {/* Month Headers */}
        <div className="flex h-6 bg-gray-50">
          {months.map(month => (
            <div
              key={month.key}
              className="flex items-center justify-center text-xs font-semibold text-gray-700 border-r border-gray-300"
              style={{
                width: month.length * viewSettings.dayWidth,
                minWidth: month.length * viewSettings.dayWidth
              }}
            >
              {month.label}
            </div>
          ))}
        </div>

        {/* Day Headers */}
        <div className="flex h-8 bg-white">
          {days.map((day, index) => {
            const dayOfWeek = format(day, 'EEE').charAt(0);
            const dayNumber = format(day, 'd');
            const isWeekendDay = isWeekend(day);
            const isTodayDay = isToday(day);

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "flex flex-col items-center justify-center text-xs font-medium border-r border-gray-200",
                  isTodayDay 
                    ? "bg-blue-100 text-blue-700" 
                    : isWeekendDay 
                      ? "bg-gray-100 text-gray-600" 
                      : "bg-white text-gray-600"
                )}
                style={{
                  width: viewSettings.dayWidth,
                  minWidth: viewSettings.dayWidth
                }}
              >
                <div className="text-[9px] leading-none">{dayOfWeek}</div>
                <div className={cn(
                  "text-[10px] leading-none mt-0.5",
                  isTodayDay ? "font-bold" : ""
                )}>
                  {dayNumber.padStart(2, '0')}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};