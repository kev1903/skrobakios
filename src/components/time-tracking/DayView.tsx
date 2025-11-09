import React from 'react';
import { format, parseISO } from 'date-fns';
import { Clock, Calendar as CalendarIcon } from 'lucide-react';
import { TimeEntry } from '@/hooks/useTimeTracking';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    const totalMinutesFromStart = (hours - 9) * 60 + minutes;
    const top = (totalMinutesFromStart / 60) * 80;
    const height = (durationMinutes / 60) * 80;
    return { top: `${top}px`, height: `${Math.max(height, 20)}px` };
  };

  const timeSlots = Array.from({ length: 11 }, (_, i) => i + 9);
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
          <div className="relative overflow-visible" style={{ height: '880px', minHeight: '880px' }}>
            {/* Time Labels */}
            <div className="absolute left-0 top-0 bottom-0 w-20 border-r border-border/30">
              {timeSlots.map(hour => (
                <div
                  key={hour}
                  className="absolute left-0 right-0 flex items-center justify-end pr-4 text-xs text-muted-foreground font-medium"
                  style={{ top: `${(hour - 9) * 80}px` }}
                >
                  {format(new Date().setHours(hour, 0), 'h a')}
                </div>
              ))}
            </div>

            {/* Timeline Grid */}
            <div className="absolute left-20 right-0 top-0 bottom-0 overflow-hidden">
              {/* Grid Lines */}
              {timeSlots.map(hour => (
                <div
                  key={hour}
                  className="absolute left-0 right-0 border-t border-border/20"
                  style={{ top: `${(hour - 9) * 80}px`, height: '80px' }}
                />
              ))}

              {/* Time Entries Container with Relative Positioning */}
              <div className="absolute inset-0">
                {dayEntries.length > 0 ? (
                  dayEntries.map((entry, idx) => {
                    const durationMinutes = Math.floor((entry.duration || 0) / 60);
                    const position = getEntryPosition(entry.start_time, durationMinutes);
                    const bgColor = entry.category ? categoryColors[entry.category] || 'hsl(var(--luxury-gold))' : 'hsl(var(--luxury-gold))';
                    
                    return (
                      <div
                        key={entry.id || idx}
                        className="absolute left-4 right-4 rounded-lg p-3 overflow-hidden backdrop-blur-md border border-white/30 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all duration-200 cursor-pointer"
                        style={{
                          top: position.top,
                          height: position.height,
                          background: `linear-gradient(135deg, ${bgColor}15 0%, ${bgColor}30 100%)`,
                          borderLeftWidth: '4px',
                          borderLeftColor: bgColor,
                        }}
                      >
                        <div className="flex items-start justify-between gap-2 h-full">
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-sm text-foreground truncate">
                              {entry.task_activity}
                            </div>
                            {entry.project_name && (
                              <div className="text-xs text-muted-foreground truncate mt-1">
                                {entry.project_name}
                              </div>
                            )}
                          </div>
                          <div className="text-xs font-medium text-foreground whitespace-nowrap">
                            {formatDuration(durationMinutes)}
                          </div>
                        </div>
                      </div>
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
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
