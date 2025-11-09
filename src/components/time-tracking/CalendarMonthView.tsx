import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO, addMonths, subMonths } from 'date-fns';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { TimeEntry } from '@/hooks/useTimeTracking';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface CalendarMonthViewProps {
  entries: TimeEntry[];
  categoryColors: Record<string, string>;
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export const CalendarMonthView = ({ entries, categoryColors, selectedDate, onDateChange }: CalendarMonthViewProps) => {
  const currentDate = new Date(selectedDate);
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const getDayEntries = (day: Date) => {
    return entries.filter(entry => {
      const entryDate = parseISO(entry.start_time);
      return isSameDay(entryDate, day);
    });
  };

  const getDayTotal = (day: Date) => {
    const dayEntries = getDayEntries(day);
    return dayEntries.reduce((acc, entry) => acc + Math.floor((entry.duration || 0) / 60), 0);
  };

  const monthTotal = entries
    .filter(entry => {
      const entryDate = parseISO(entry.start_time);
      return isSameMonth(entryDate, currentDate);
    })
    .reduce((acc, entry) => acc + Math.floor((entry.duration || 0) / 60), 0);

  // Get calendar days (including padding from previous/next month)
  const firstDayOfMonth = monthStart.getDay();
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1));

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: new Date(startDate.getTime() + 41 * 24 * 60 * 60 * 1000)
  });

  const handlePreviousMonth = () => {
    onDateChange(format(subMonths(currentDate, 1), 'yyyy-MM-dd'));
  };

  const handleNextMonth = () => {
    onDateChange(format(addMonths(currentDate, 1), 'yyyy-MM-dd'));
  };

  const handleThisMonth = () => {
    onDateChange(format(new Date(), 'yyyy-MM-dd'));
  };

  return (
    <div className="space-y-6">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePreviousMonth}
            className="hover:bg-accent/50"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-luxury-gold" />
            <h2 className="text-xl font-semibold text-foreground">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextMonth}
            className="hover:bg-accent/50"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleThisMonth}
            className="hover:bg-accent/50"
          >
            This Month
          </Button>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">
            Total: {formatDuration(monthTotal)}
          </span>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="backdrop-blur-xl bg-white/80 border-border/30 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
        <CardContent className="p-6">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div
                key={day}
                className="text-center text-[11px] uppercase tracking-wider font-semibold text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, idx) => {
              const dayEntries = getDayEntries(day);
              const dayTotal = getDayTotal(day);
              const isToday = isSameDay(day, new Date());
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isSelected = isSameDay(day, currentDate);

              return (
                <div
                  key={idx}
                  className={`min-h-[100px] p-2 rounded-lg border transition-all duration-200 cursor-pointer ${
                    !isCurrentMonth
                      ? 'bg-muted/20 border-transparent'
                      : isToday
                      ? 'bg-luxury-gold/10 border-luxury-gold shadow-[0_2px_8px_rgba(217,186,112,0.2)]'
                      : isSelected
                      ? 'bg-luxury-gold/5 border-luxury-gold/50'
                      : 'bg-white/60 border-border/30 hover:bg-white/80 hover:border-border/50'
                  }`}
                  onClick={() => onDateChange(format(day, 'yyyy-MM-dd'))}
                >
                  <div className="space-y-1">
                    {/* Day Number */}
                    <div
                      className={`text-sm font-semibold ${
                        !isCurrentMonth
                          ? 'text-muted-foreground/40'
                          : isToday
                          ? 'text-luxury-gold'
                          : 'text-foreground'
                      }`}
                    >
                      {format(day, 'd')}
                    </div>

                    {/* Day Total */}
                    {dayTotal > 0 && (
                      <div className="text-xs font-medium text-foreground">
                        {formatDuration(dayTotal)}
                      </div>
                    )}

                    {/* Category Indicators */}
                    {dayEntries.length > 0 && (
                      <div className="flex flex-wrap gap-0.5">
                        {dayEntries.slice(0, 3).map((entry, i) => {
                          const color = entry.category
                            ? categoryColors[entry.category] || 'hsl(var(--luxury-gold))'
                            : 'hsl(var(--luxury-gold))';
                          return (
                            <div
                              key={i}
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                          );
                        })}
                        {dayEntries.length > 3 && (
                          <div className="text-[10px] text-muted-foreground ml-0.5">
                            +{dayEntries.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
