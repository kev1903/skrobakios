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
  categoryColors: Record<string, string>;
}

export const CalendarGrid = ({
  paddedDays,
  viewMode,
  isCurrentPeriod,
  timeBlocks,
  onDayClick,
  onBlockEdit,
  categoryColors
}: CalendarGridProps) => {
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Generate time slots for week view (30-minute intervals)
  const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2);
    const minute = (i % 2) * 30;
    const period = hour < 12 ? 'AM' : 'PM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  });

  if (viewMode === 'week') {
    const weekDays = paddedDays.filter(day => day !== null) as Date[];
    
    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-background via-background to-muted/20 rounded-xl border border-border/30 shadow-lg">
        {/* Week Header */}
        <div className="grid grid-cols-8 gap-1 mb-4 p-4 bg-gradient-to-r from-muted/30 to-muted/10 backdrop-blur-sm rounded-t-xl border-b border-border/20">
          <div className="p-3 text-center text-muted-foreground font-medium text-sm bg-card/50 rounded-lg border border-border/20">
            Time
          </div>
          {weekDays.map(day => {
            const isDayToday = isToday(day);
            return (
              <div key={day.toISOString()} className={`p-3 text-center transition-all duration-200 rounded-lg border ${
                isDayToday 
                  ? 'bg-gradient-to-b from-primary/20 to-primary/10 border-primary/30 shadow-md' 
                  : 'bg-card/50 border-border/20 hover:bg-card/70'
              }`}>
                <div className={`font-medium text-sm uppercase ${
                  isDayToday ? 'text-primary font-bold' : 'text-muted-foreground'
                }`}>
                  {format(day, 'EEE')}
                </div>
              </div>
            );
          })}
        </div>

        {/* Week Grid with Time Slots */}
        <div className="flex-1 overflow-auto mx-4 mb-4 rounded-lg border border-border/30 shadow-inner bg-gradient-to-b from-background to-muted/10">
          <div className="grid grid-cols-8 gap-0 min-h-full">
            {/* Time Column */}
            <div className="bg-gradient-to-b from-card/80 to-card/60 backdrop-blur-sm border-r border-border/30">
              {timeSlots.map((time, index) => (
                <div key={time} className={`h-6 p-1 border-b border-border/20 text-xs font-medium flex items-start transition-colors hover:bg-accent/20 ${
                  index % 2 === 0 ? 'text-muted-foreground bg-card/30' : 'text-muted-foreground/60 bg-transparent'
                }`}>
                  {index % 2 === 0 ? time : ''}
                </div>
              ))}
            </div>
            
            {/* Day Columns */}
            {weekDays.map(day => {
              const dayBlocks = getBlocksForDay(day, timeBlocks);
              const isDayToday = isToday(day);
              
              return (
                <div key={day.toISOString()} className={`relative last:border-r-0 border-r border-border/30 ${
                  isDayToday 
                    ? 'bg-gradient-to-b from-primary/10 via-primary/5 to-transparent' 
                    : 'bg-gradient-to-b from-card/20 to-transparent hover:from-card/30'
                } transition-all duration-200`}>
                  {timeSlots.map((time, index) => (
                    <div
                      key={`${day.toISOString()}-${time}-${index}`}
                      className={`h-6 border-b border-border/20 cursor-pointer relative transition-colors duration-150 ${
                        isDayToday 
                          ? 'hover:bg-primary/20' 
                          : 'hover:bg-accent/30'
                      } ${index % 4 === 0 ? 'border-border/30' : ''}`}
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
                      
                      // Calculate position (30-minute intervals, 24px per 30min slot)
                      const startPosition = (startHour * 2 + startMinute / 30) * 24; // 24px per 30min
                      const duration = ((endHour - startHour) * 2 + (endMinute - startMinute) / 30) * 24;
                      
                      // Get color from category mapping or fallback to stored color
                      const bgColor = categoryColors[block.category] || block.color || '#6b7280';
                      
                      return (
                        <div
                          key={block.id}
                          className="backdrop-blur-sm text-white text-xs p-1.5 rounded-md absolute left-1 right-1 cursor-pointer hover:opacity-80 transition-all shadow-sm border-2 pointer-events-auto overflow-hidden flex items-center justify-center"
                          style={{
                            backgroundColor: bgColor,
                            borderColor: bgColor,
                            top: `${startPosition + 2}px`,
                            height: `${Math.max(duration - 2, 20)}px` // Minimum height of 20px to show title
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onBlockEdit(block);
                          }}
                        >
                          <div className="font-semibold text-xs leading-tight truncate text-white drop-shadow-sm">{block.title}</div>
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
    <div className="h-full flex flex-col bg-gradient-to-br from-background via-background to-muted/20 rounded-xl border border-border/30 shadow-lg p-4">
      {/* Calendar Header */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {weekDays.map(day => (
          <div key={day} className="p-4 text-center text-muted-foreground font-semibold text-lg bg-gradient-to-b from-card/70 to-card/50 backdrop-blur-sm rounded-lg border border-border/20 shadow-sm">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 grid grid-cols-7 gap-2 bg-gradient-to-b from-muted/20 to-muted/10 rounded-lg overflow-hidden p-2 border border-border/20">
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
                {dayBlocks.map(block => {
                  // Get color from category mapping or fallback to stored color
                  const bgColor = categoryColors[block.category] || block.color || '#6b7280';
                  
                  return (
                    <div
                      key={block.id}
                      className="text-white text-xs p-1.5 rounded cursor-pointer hover:opacity-80 transition-opacity overflow-hidden flex items-center justify-center border-2"
                      style={{
                        backgroundColor: bgColor,
                        borderColor: bgColor
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onBlockEdit(block);
                      }}
                    >
                      <div className="font-semibold truncate text-xs leading-tight text-white drop-shadow-sm text-center">{block.title}</div>
                    </div>
                  );
                })}
                
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