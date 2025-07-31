import React from 'react';
import { format, isToday } from 'date-fns';
import { TimeBlock } from './types';
import { getBlocksForDay } from './utils';

interface CalendarGridProps {
  paddedDays: (Date | null)[];
  viewMode: 'week' | 'month';
  isCurrentPeriod: (day: Date) => boolean;
  timeBlocks: TimeBlock[];
  onDayClick: (day: Date) => void;
  onBlockEdit: (block: TimeBlock) => void;
}

export const CalendarGrid = ({
  paddedDays,
  viewMode,
  isCurrentPeriod,
  timeBlocks,
  onDayClick,
  onBlockEdit
}: CalendarGridProps) => {
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Generate time slots for week view (full 24 hours)
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const hour = i;
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    if (hour > 12) return `${hour - 12} PM`;
    return `${hour} AM`;
  });

  if (viewMode === 'week') {
    const weekDays = paddedDays.filter(day => day !== null) as Date[];
    
    return (
      <div className="h-full flex flex-col">
        {/* Week Header */}
        <div className="grid grid-cols-8 gap-0 mb-4">
          <div className="p-4 text-center text-muted-foreground font-medium text-sm">
            
          </div>
          {weekDays.map(day => (
            <div key={day.toISOString()} className="p-4 text-center">
              <div className="text-muted-foreground font-medium text-sm uppercase">
                {format(day, 'EEE')}
              </div>
            </div>
          ))}
        </div>

        {/* Week Grid with Time Slots */}
        <div className="flex-1 overflow-auto border border-border/20 rounded-lg">
          <div className="grid grid-cols-8 gap-0 min-h-full">
            {/* Time Column */}
            <div className="bg-background border-r border-border/20">
              {timeSlots.map(time => (
                <div key={time} className="h-16 p-3 border-b border-border/20 text-sm text-muted-foreground font-medium flex items-start">
                  {time}
                </div>
              ))}
            </div>
            
            {/* Day Columns */}
            {weekDays.map(day => {
              const dayBlocks = getBlocksForDay(day, timeBlocks);
              const isDayToday = isToday(day);
              
              return (
                <div key={day.toISOString()} className="bg-background border-r border-border/20 relative last:border-r-0">
                  {timeSlots.map(time => (
                    <div
                      key={`${day.toISOString()}-${time}`}
                      className={`h-16 border-b border-border/20 cursor-pointer hover:bg-accent/30 relative ${
                        isDayToday ? 'bg-primary/5' : ''
                      }`}
                      onClick={() => onDayClick(day)}
                    />
                  ))}
                  
                  {/* Time Blocks Overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    {dayBlocks.map(block => {
                      const startHour = parseInt(block.startTime.split(':')[0]);
                      const startMinute = parseInt(block.startTime.split(':')[1]);
                      const endHour = parseInt(block.endTime.split(':')[0]);
                      const endMinute = parseInt(block.endTime.split(':')[1]);
                      
                      // Calculate position (12 AM = 0, so use hour directly)
                      const startPosition = (startHour + startMinute / 60) * 64; // 64px per hour
                      const duration = ((endHour - startHour) + (endMinute - startMinute) / 60) * 64;
                      
                      return (
                        <div
                          key={block.id}
                          className={`${block.color}/90 backdrop-blur-sm text-white text-xs p-2 rounded-md absolute left-2 right-2 cursor-pointer hover:opacity-80 transition-all shadow-sm border border-white/20 pointer-events-auto`}
                          style={{
                            top: `${startPosition + 2}px`,
                            height: `${Math.max(duration - 4, 24)}px` // Minimum height of 24px with spacing
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onBlockEdit(block);
                          }}
                        >
                          <div className="font-semibold text-sm leading-tight">{block.startTime} - {block.endTime}</div>
                          <div className="font-medium mt-1 leading-tight">{block.title}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Month view (existing layout)
  return (
    <div className="h-full flex flex-col">
      {/* Calendar Header */}
      <div className="grid grid-cols-7 gap-px mb-2">
        {weekDays.map(day => (
          <div key={day} className="p-3 text-center text-muted-foreground font-semibold text-lg bg-muted/20 rounded-lg">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 grid grid-cols-7 gap-px bg-border/30 rounded-lg overflow-hidden">
        {paddedDays.map((day, index) => {
          if (!day) {
            return <div key={index} className="bg-muted/10"></div>;
          }

          const dayBlocks = getBlocksForDay(day, timeBlocks);
          const isCurrentPeriodDay = isCurrentPeriod(day);
          const isDayToday = isToday(day);

          return (
            <div
              key={day.toISOString()}
              className={`bg-card/80 backdrop-blur-sm p-2 cursor-pointer hover:bg-accent/50 transition-colors min-h-[120px] flex flex-col ${
                !isCurrentPeriodDay ? 'opacity-40' : ''
              } ${isDayToday ? 'ring-2 ring-primary' : ''}`}
              onClick={() => onDayClick(day)}
            >
              <div className={`text-sm font-medium mb-2 ${
                isDayToday ? 'text-primary font-bold' : 'text-card-foreground'
              }`}>
                {format(day, 'd')}
              </div>
              
              <div className="flex-1 space-y-1 overflow-y-auto">
                {dayBlocks.map(block => (
                  <div
                    key={block.id}
                    className={`${block.color} text-white text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onBlockEdit(block);
                    }}
                  >
                    <div className="font-medium truncate">{block.title}</div>
                    <div className="text-white/80">{block.startTime}-{block.endTime}</div>
                  </div>
                ))}
                
                {dayBlocks.length > 2 && (
                  <div className="text-xs text-muted-foreground">
                    +{dayBlocks.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};