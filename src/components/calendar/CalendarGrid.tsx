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
              className={`bg-card/80 backdrop-blur-sm p-2 cursor-pointer hover:bg-accent/50 transition-colors ${
                viewMode === 'week' ? 'min-h-[200px]' : 'min-h-[120px]'
              } flex flex-col ${
                !isCurrentPeriodDay ? 'opacity-40' : ''
              } ${isDayToday ? 'ring-2 ring-primary' : ''}`}
              onClick={() => onDayClick(day)}
            >
              <div className={`text-sm font-medium mb-2 ${
                isDayToday ? 'text-primary font-bold' : 'text-card-foreground'
              }`}>
                {viewMode === 'week' ? format(day, 'EEE d') : format(day, 'd')}
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