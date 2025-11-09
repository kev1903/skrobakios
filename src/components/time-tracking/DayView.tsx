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
    const top = (totalMinutesFromStart / 60) * 40;
    const height = (durationMinutes / 60) * 40;
    return { top: `${top}px`, height: `${Math.max(height, 48)}px` };
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

      {/* Timeline */}
      <Card className="backdrop-blur-xl bg-white/80 border-border/30 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
        <CardContent className="p-6">
          <ScrollArea className="h-[600px]">
            <div className="relative pb-10" style={{ height: '960px', minHeight: '960px' }}>
            {/* Time Labels */}
            <div className="absolute left-0 top-0 bottom-0 w-16 border-r border-border/30">
              {timeSlots.map(hour => (
                <div
                  key={hour}
                  className="absolute left-0 right-0 flex items-center justify-end pr-3 text-[10px] text-muted-foreground font-medium"
                  style={{ top: `${hour * 40}px` }}
                >
                  {format(new Date().setHours(hour, 0), 'h a')}
                </div>
              ))}
            </div>

            {/* Timeline Grid */}
            <div className="absolute left-16 right-0 top-0 bottom-0 overflow-hidden">
              {/* Grid Lines */}
              {timeSlots.map(hour => (
                <div
                  key={hour}
                  className="absolute left-0 right-0 border-t border-border/20"
                  style={{ top: `${hour * 40}px`, height: '40px' }}
                />
              ))}

              {/* Time Entries Container with Relative Positioning */}
              <div className="absolute inset-0">
                <TooltipProvider>
                  {dayEntries.length > 0 ? (
                    dayEntries.map((entry, idx) => {
                      const durationMinutes = Math.floor((entry.duration || 0) / 60);
                      const position = getEntryPosition(entry.start_time, durationMinutes);
                      const bgColor = entry.category ? categoryColors[entry.category] || 'hsl(var(--luxury-gold))' : 'hsl(var(--luxury-gold))';
                      const heightValue = parseInt(position.height);
                      const isSmall = heightValue < 80;
                      const isTiny = heightValue < 60;
                      
                      const entryContent = (
                        <div
                          className="absolute left-4 right-4 rounded-lg overflow-hidden backdrop-blur-md border-2 border-white/40 shadow-[0_2px_12px_rgba(0,0,0,0.12)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.2)] hover:scale-[1.01] hover:z-10 transition-all duration-200 cursor-pointer group"
                          style={{
                            top: position.top,
                            height: position.height,
                            background: `linear-gradient(to bottom, rgba(255,255,255,0.15), rgba(255,255,255,0.05)), linear-gradient(135deg, ${bgColor}40 0%, ${bgColor}60 100%)`,
                            borderLeftWidth: '6px',
                            borderLeftColor: bgColor,
                            boxShadow: `inset 0 1px 0 0 rgba(255,255,255,0.4), 0 2px 12px rgba(0,0,0,0.12)`,
                          }}
                        >
                          <div className={`h-full flex flex-col justify-between ${isTiny ? 'p-2' : 'p-3'}`}>
                            <div className="flex items-start justify-between gap-2 min-w-0">
                              <div className="min-w-0 flex-1">
                                <div className="font-bold text-sm text-foreground truncate">
                                  {entry.task_activity}
                                </div>
                                {!isTiny && entry.project_name && (
                                  <div className="text-xs text-muted-foreground truncate mt-0.5">
                                    {entry.project_name}
                                  </div>
                                )}
                                {!isSmall && entry.category && (
                                  <div className="mt-2">
                                    <span 
                                      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium text-foreground/90 border"
                                      style={{ 
                                        backgroundColor: `${bgColor}25`,
                                        borderColor: bgColor
                                      }}
                                    >
                                      {entry.category}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="text-xs font-bold text-foreground whitespace-nowrap">
                                {formatDuration(durationMinutes)}
                              </div>
                            </div>
                            
                            {!isTiny && (
                              <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium mt-1">
                                <span>{formatTimeRange(entry.start_time, durationMinutes)}</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Duration indicator bar on right edge */}
                          <div 
                            className="absolute right-0 top-0 bottom-0 w-1 opacity-50 group-hover:opacity-70 transition-opacity"
                            style={{ backgroundColor: bgColor }}
                          />
                        </div>
                      );

                      return isTiny ? (
                        <Tooltip key={entry.id || idx}>
                          <TooltipTrigger asChild>
                            {entryContent}
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-xs">
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
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p className="text-sm">No time entries for this day</p>
                      </div>
                    </div>
                  )}
                </TooltipProvider>
              </div>
            </div>
          </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
