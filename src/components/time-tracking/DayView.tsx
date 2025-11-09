import React from 'react';
import { format, parseISO } from 'date-fns';
import { Clock, Calendar as CalendarIcon } from 'lucide-react';
import { TimeEntry } from '@/hooks/useTimeTracking';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DayViewProps {
  entries: TimeEntry[];
  categoryColors: Record<string, string>;
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export const DayView = ({ entries, categoryColors, selectedDate, onDateChange }: DayViewProps) => {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const getEntryPosition = (startTime: string, durationMinutes: number) => {
    const start = parseISO(startTime);
    const hours = start.getHours();
    const minutes = start.getMinutes();
    const totalMinutesFromStart = hours * 60 + minutes;
    // For Gantt chart: calculate horizontal position (left) and width
    const totalDayMinutes = 24 * 60; // 1440 minutes in a day
    const left = (totalMinutesFromStart / totalDayMinutes) * 100; // percentage
    const width = (durationMinutes / totalDayMinutes) * 100; // percentage
    return { left: `${left}%`, width: `${Math.max(width, 0.5)}%` };
  };

  const formatTimeRange = (startTime: string, durationMinutes: number) => {
    const start = parseISO(startTime);
    const end = new Date(start.getTime() + durationMinutes * 60000);
    return `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;
  };

  const timeSlots = Array.from({ length: 24 }, (_, i) => i);
  const dayEntries = entries.filter(entry => {
    const entryDate = format(new Date(entry.start_time), 'yyyy-MM-dd');
    return entryDate === selectedDate;
  });

  const totalMinutes = dayEntries.reduce((acc, entry) => acc + Math.floor((entry.duration || 0) / 60), 0);

  const isToday = selectedDate === format(new Date(), 'yyyy-MM-dd');
  
  const getCurrentTimePosition = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutesFromStart = hours * 60 + minutes;
    const totalDayMinutes = 24 * 60;
    return (totalMinutesFromStart / totalDayMinutes) * 100;
  };

  const handlePreviousDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    onDateChange(format(date, 'yyyy-MM-dd'));
  };

  const handleNextDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    onDateChange(format(date, 'yyyy-MM-dd'));
  };

  const handleToday = () => {
    onDateChange(format(new Date(), 'yyyy-MM-dd'));
  };

  return (
    <div className="space-y-6">
      {/* Date Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePreviousDay}
            className="hover:bg-accent/50"
          >
            ←
          </Button>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-luxury-gold" />
            <h2 className="text-xl font-semibold text-foreground">
              {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextDay}
            className="hover:bg-accent/50"
          >
            →
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
            className="hover:bg-accent/50"
          >
            Today
          </Button>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">
            Total: {formatDuration(totalMinutes)}
          </span>
        </div>
      </div>

      {/* Gantt Chart Timeline */}
      <Card className="backdrop-blur-xl bg-white/80 border-border/30 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Time Scale Header */}
            <div className="relative h-12 border-b border-border/30">
              <div className="absolute inset-0 flex">
                {timeSlots.map(hour => (
                  <div
                    key={hour}
                    className="flex-1 border-l border-border/20 first:border-l-0"
                  >
                    <div className="text-[10px] text-muted-foreground font-medium pl-1 pt-1">
                      {format(new Date().setHours(hour, 0), 'ha')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Time Indicator */}
            {isToday && (
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-20 pointer-events-none"
                style={{ left: `${getCurrentTimePosition()}%` }}
              >
                {/* Time label at top */}
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg whitespace-nowrap">
                  {format(new Date(), 'h:mm a')}
                </div>
                {/* Dot at top */}
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white shadow-md" />
              </div>
            )}

            {/* Gantt Chart Rows */}
            <ScrollArea className="h-[500px]">
              <div className="space-y-2 pr-4 relative">
                <TooltipProvider>
                  {dayEntries.length > 0 ? (
                    dayEntries.map((entry, idx) => {
                      const durationMinutes = Math.floor((entry.duration || 0) / 60);
                      const position = getEntryPosition(entry.start_time, durationMinutes);
                      const bgColor = entry.category ? categoryColors[entry.category] || 'hsl(var(--luxury-gold))' : 'hsl(var(--luxury-gold))';
                      const widthPercent = parseFloat(position.width);
                      const isNarrow = widthPercent < 8;
                      const isVeryNarrow = widthPercent < 4;
                      
                      const entryContent = (
                        <div className="relative h-14 bg-muted/10 rounded-lg border border-border/20">
                          {/* Grid lines background */}
                          <div className="absolute inset-0 flex">
                            {timeSlots.map(hour => (
                              <div
                                key={hour}
                                className="flex-1 border-l border-border/10 first:border-l-0"
                              />
                            ))}
                          </div>
                          
                          {/* Task bar */}
                          <div
                            className="absolute top-2 bottom-2 rounded-md overflow-hidden backdrop-blur-md border-2 border-white/40 shadow-[0_2px_12px_rgba(0,0,0,0.12)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.2)] hover:scale-[1.02] hover:z-10 transition-all duration-200 cursor-pointer group"
                            style={{
                              left: position.left,
                              width: position.width,
                              background: `linear-gradient(to right, rgba(255,255,255,0.15), rgba(255,255,255,0.05)), linear-gradient(135deg, ${bgColor}40 0%, ${bgColor}60 100%)`,
                              borderLeftWidth: '4px',
                              borderLeftColor: bgColor,
                              boxShadow: `inset 0 1px 0 0 rgba(255,255,255,0.4), 0 2px 12px rgba(0,0,0,0.12)`,
                            }}
                          >
                            <div className="h-full flex items-center justify-between gap-2 px-3">
                              {!isVeryNarrow && (
                                <>
                                  <div className="min-w-0 flex-1 flex items-center gap-2">
                                    <div className="font-bold text-xs text-foreground truncate">
                                      {entry.task_activity}
                                    </div>
                                    {!isNarrow && entry.category && (
                                      <span 
                                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium text-foreground/90 border flex-shrink-0"
                                        style={{ 
                                          backgroundColor: `${bgColor}25`,
                                          borderColor: bgColor
                                        }}
                                      >
                                        {entry.category}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] font-bold text-foreground whitespace-nowrap flex-shrink-0">
                                    {formatDuration(durationMinutes)}
                                  </div>
                                </>
                              )}
                            </div>
                            
                            {/* Duration indicator bar on bottom edge */}
                            <div 
                              className="absolute bottom-0 left-0 right-0 h-1 opacity-50 group-hover:opacity-70 transition-opacity"
                              style={{ backgroundColor: bgColor }}
                            />
                          </div>
                        </div>
                      );

                      return isVeryNarrow || isNarrow ? (
                        <Tooltip key={entry.id || idx}>
                          <TooltipTrigger asChild>
                            {entryContent}
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <div className="space-y-1">
                              <p className="font-semibold">{entry.task_activity}</p>
                              {entry.project_name && <p className="text-xs text-muted-foreground">{entry.project_name}</p>}
                              <p className="text-xs">{formatTimeRange(entry.start_time, durationMinutes)}</p>
                              <p className="text-xs font-medium">Duration: {formatDuration(durationMinutes)}</p>
                              {entry.category && <p className="text-xs">Category: {entry.category}</p>}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <React.Fragment key={entry.id || idx}>
                          {entryContent}
                        </React.Fragment>
                      );
                    })
                  ) : (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center text-muted-foreground">
                        <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p className="text-sm">No time entries for this day</p>
                      </div>
                    </div>
                  )}
                </TooltipProvider>
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
