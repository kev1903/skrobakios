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
      <div className="flex items-center justify-between p-4 backdrop-blur-xl bg-white/60 rounded-2xl border border-border/30 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePreviousDay}
            className="h-10 w-10 hover:bg-white/80 hover:shadow-md transition-all duration-200"
          >
            ←
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
            className={`hover:bg-white/80 ${isToday ? 'bg-luxury-gold text-white border-luxury-gold hover:bg-luxury-gold/90' : ''}`}
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextDay}
            className="h-10 w-10 hover:bg-white/80 hover:shadow-md transition-all duration-200"
          >
            →
          </Button>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 px-4 py-2 backdrop-blur-md bg-white/90 rounded-xl border border-border/30">
            <Clock className="w-5 h-5 text-luxury-gold" />
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Total Time</div>
              <div className="text-lg font-bold text-foreground">{formatDuration(totalMinutes)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Day Header with Date */}
      <div className="backdrop-blur-xl bg-gradient-to-r from-luxury-gold/10 via-luxury-gold/5 to-transparent rounded-2xl border border-luxury-gold/20 p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 backdrop-blur-md bg-white/90 rounded-2xl border border-border/30 shadow-sm flex flex-col items-center justify-center">
            <div className="text-2xl font-bold text-luxury-gold">
              {format(new Date(selectedDate), 'd')}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              {format(new Date(selectedDate), 'EEE')}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-1">
              {format(new Date(selectedDate), 'EEEE')}
            </h2>
            <p className="text-sm text-muted-foreground font-medium">
              {format(new Date(selectedDate), 'MMMM d, yyyy')}
            </p>
          </div>
        </div>
      </div>

      {/* Gantt Chart Timeline */}
      <Card className="backdrop-blur-xl bg-white/80 border-border/30 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Time Scale Header */}
            <div className="relative h-14 border-b-2 border-border/20 bg-gradient-to-b from-muted/20 to-transparent">
              <div className="absolute inset-0 flex">
                {timeSlots.map(hour => (
                  <div
                    key={hour}
                    className="flex-1 border-l border-border/10 first:border-l-0"
                  >
                    <div className="text-[11px] text-muted-foreground font-semibold pl-2 pt-2 uppercase tracking-wide">
                      {format(new Date().setHours(hour, 0), 'ha')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Time Indicator */}
            {isToday && (
              <div 
                className="absolute top-0 bottom-0 w-[2px] bg-gradient-to-b from-rose-500 to-rose-400 z-20 pointer-events-none shadow-[0_0_12px_rgba(244,63,94,0.5)]"
                style={{ left: `${getCurrentTimePosition()}%` }}
              >
                {/* Time label at top */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 backdrop-blur-md bg-rose-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap border border-rose-400">
                  {format(new Date(), 'h:mm a')}
                </div>
                {/* Dot at top */}
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-rose-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
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
                      
                      const leftPercent = parseFloat(position.left);
                      
                      return (
                        <div key={entry.id || idx}>
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
                            
                            {/* Task name tag to the left of the bar */}
                            {leftPercent > 15 && (
                              <div
                                className="absolute top-1/2 -translate-y-1/2 z-10"
                                style={{ right: `${100 - leftPercent + 1}%` }}
                              >
                                <div className="backdrop-blur-md bg-white/90 rounded-md px-3 py-1 border border-border/30 shadow-sm mr-2">
                                  <div className="text-xs font-semibold text-foreground whitespace-nowrap">
                                    {entry.task_activity}
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {/* Task bar */}
                            <div
                              className="absolute top-2 bottom-2 rounded-lg overflow-hidden backdrop-blur-xl border-2 border-white/50 shadow-[0_4px_16px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.16)] hover:scale-[1.03] hover:z-20 transition-all duration-300 cursor-pointer group"
                              style={{
                                left: position.left,
                                width: position.width,
                                background: `linear-gradient(to bottom, rgba(255,255,255,0.25), rgba(255,255,255,0.05)), linear-gradient(135deg, ${bgColor}50 0%, ${bgColor}70 100%)`,
                                borderLeftWidth: '5px',
                                borderLeftColor: bgColor,
                                boxShadow: `inset 0 1px 0 0 rgba(255,255,255,0.5), inset 0 -1px 0 0 rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.08)`,
                              }}
                            >
                              <div className="h-full flex items-center justify-between gap-2 px-3">
                                {/* Task name inside bar if no space on left */}
                                {(leftPercent <= 15 || !isVeryNarrow) && (
                                  <div className="min-w-0 flex-1 flex items-center gap-2">
                                    {leftPercent <= 15 && (
                                      <div className="font-bold text-xs text-foreground truncate">
                                        {entry.task_activity}
                                      </div>
                                    )}
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
                                )}
                                <div className="text-[10px] font-bold text-foreground whitespace-nowrap flex-shrink-0">
                                  {formatDuration(durationMinutes)}
                                </div>
                              </div>
                              
                              {/* Duration indicator bar on bottom edge */}
                              <div 
                                className="absolute bottom-0 left-0 right-0 h-1.5 opacity-60 group-hover:opacity-90 transition-all duration-200"
                                style={{ 
                                  background: `linear-gradient(to right, ${bgColor}, ${bgColor}cc)`,
                                  boxShadow: `0 0 8px ${bgColor}40`
                                }}
                              />
                            </div>
                            
                            {isVeryNarrow || isNarrow ? (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="absolute inset-0 z-30" />
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
                            ) : null}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex items-center justify-center h-96 backdrop-blur-md bg-muted/10 rounded-2xl border-2 border-dashed border-border/30">
                      <div className="text-center text-muted-foreground max-w-md">
                        <div className="w-20 h-20 mx-auto mb-4 backdrop-blur-xl bg-white/60 rounded-full flex items-center justify-center border border-border/30 shadow-sm">
                          <Clock className="w-10 h-10 text-muted-foreground/30" />
                        </div>
                        <p className="text-base font-semibold mb-2">No time tracked yet</p>
                        <p className="text-sm text-muted-foreground/70">Start tracking your time to see your activity timeline here</p>
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
