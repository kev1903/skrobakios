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
  
  // Generate time slots for week view (6 AM to 10 PM)
  const timeSlots = Array.from({ length: 17 }, (_, i) => {
    const hour = i + 6;
    return `${hour.toString().padStart(2, '0')}:00`;
  });

  if (viewMode === 'week') {
    const weekDays = paddedDays.filter(day => day !== null) as Date[];
    
    return (
      <div className="h-full flex flex-col">
        {/* Week Header */}
        <div className="grid grid-cols-8 gap-px mb-2">
          <div className="p-3 text-center text-muted-foreground font-semibold text-sm bg-muted/20 rounded-lg">
            Time
          </div>
          {weekDays.map(day => (
            <div key={day.toISOString()} className="p-3 text-center text-muted-foreground font-semibold text-sm bg-muted/20 rounded-lg">
              <div className={`${isToday(day) ? 'text-primary font-bold' : ''}`}>
                {format(day, 'EEE')}
              </div>
              <div className={`text-xs ${isToday(day) ? 'text-primary' : 'text-muted-foreground'}`}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>

        {/* Week Grid with Time Slots */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-8 gap-px bg-border/30 rounded-lg min-h-full">
            {/* Time Column */}
            <div className="bg-card/60 backdrop-blur-sm">
              {timeSlots.map(time => (
                <div key={time} className="h-16 p-2 border-b border-border/20 text-xs text-muted-foreground font-medium">
                  {time}
                </div>
              ))}
            </div>
            
            {/* Day Columns */}
            {weekDays.map(day => {
              const dayBlocks = getBlocksForDay(day, timeBlocks);
              const isDayToday = isToday(day);
              
              return (
                <div key={day.toISOString()} className="bg-card/80 backdrop-blur-sm relative">
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
                      
                      // Calculate position (6 AM = 0, so subtract 6 from hour)
                      const startPosition = ((startHour - 6) + startMinute / 60) * 64; // 64px per hour
                      const duration = ((endHour - startHour) + (endMinute - startMinute) / 60) * 64;
                      
                      return (
                        <div
                          key={block.id}
                          className={`${block.color} text-white text-xs p-1 rounded absolute left-1 right-1 cursor-pointer hover:opacity-80 transition-opacity pointer-events-auto`}
                          style={{
                            top: `${startPosition}px`,
                            height: `${Math.max(duration, 24)}px` // Minimum height of 24px
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onBlockEdit(block);
                          }}
                        >
                          <div className="font-medium truncate">{block.title}</div>
                          <div className="text-white/80 text-xs">{block.startTime}-{block.endTime}</div>
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