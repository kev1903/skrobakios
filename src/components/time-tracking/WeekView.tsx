import React from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, parseISO, isSameDay } from 'date-fns';
import { Clock, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { TimeEntry } from '@/hooks/useTimeTracking';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface WeekViewProps {
  entries: TimeEntry[];
  categoryColors: Record<string, string>;
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export const WeekView = ({ entries, categoryColors, selectedDate, onDateChange }: WeekViewProps) => {
  const currentDate = new Date(selectedDate);
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

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

  const weekTotal = weekDays.reduce((acc, day) => acc + getDayTotal(day), 0);
  const maxDayMinutes = Math.max(...weekDays.map(day => getDayTotal(day)), 1);

  const handlePreviousWeek = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 7);
    onDateChange(format(date, 'yyyy-MM-dd'));
  };

  const handleNextWeek = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 7);
    onDateChange(format(date, 'yyyy-MM-dd'));
  };

  const handleThisWeek = () => {
    onDateChange(format(new Date(), 'yyyy-MM-dd'));
  };

  return (
    <div className="space-y-6">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePreviousWeek}
            className="hover:bg-accent/50"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-luxury-gold" />
            <h2 className="text-xl font-semibold text-foreground">
              {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextWeek}
            className="hover:bg-accent/50"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleThisWeek}
            className="hover:bg-accent/50"
          >
            This Week
          </Button>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">
            Total: {formatDuration(weekTotal)}
          </span>
        </div>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map((day, idx) => {
          const dayEntries = getDayEntries(day);
          const dayTotal = getDayTotal(day);
          const isToday = isSameDay(day, new Date());
          const isSelected = isSameDay(day, currentDate);

          return (
            <Card
              key={idx}
              className={`backdrop-blur-xl bg-white/80 border transition-all duration-200 hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] cursor-pointer ${
                isToday
                  ? 'border-luxury-gold shadow-[0_2px_16px_rgba(217,186,112,0.2)]'
                  : isSelected
                  ? 'border-luxury-gold/50'
                  : 'border-border/30 shadow-[0_2px_16px_rgba(0,0,0,0.04)]'
              }`}
              onClick={() => onDateChange(format(day, 'yyyy-MM-dd'))}
            >
              <CardContent className="p-4 space-y-3">
                {/* Day Header */}
                <div className="text-center">
                  <div className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                    {format(day, 'EEE')}
                  </div>
                  <div
                    className={`text-2xl font-bold mt-1 ${
                      isToday ? 'text-luxury-gold' : 'text-foreground'
                    }`}
                  >
                    {format(day, 'd')}
                  </div>
                </div>

                {/* Day Stats */}
                <div className="space-y-2">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-foreground">
                      {formatDuration(dayTotal)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {dayEntries.length} {dayEntries.length === 1 ? 'entry' : 'entries'}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <Progress
                    value={(dayTotal / maxDayMinutes) * 100}
                    className="h-2"
                  />
                </div>

                {/* Category Dots */}
                {dayEntries.length > 0 && (
                  <div className="flex flex-wrap gap-1 justify-center min-h-[20px]">
                    {Array.from(new Set(dayEntries.map(e => e.category).filter(Boolean))).slice(0, 5).map((category, i) => {
                      const color = categoryColors[category || ''] || 'hsl(var(--luxury-gold))';
                      return (
                        <div
                          key={i}
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: color }}
                          title={category}
                        />
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Week Summary */}
      <Card className="backdrop-blur-xl bg-white/80 border-border/30 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
        <CardContent className="p-6">
          <h3 className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-4">
            Week Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-2xl font-bold text-foreground">
                {formatDuration(weekTotal)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Total Time</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {formatDuration(weekTotal / 7)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Daily Average</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {entries.filter(e => {
                  const entryDate = parseISO(e.start_time);
                  return entryDate >= weekStart && entryDate <= weekEnd;
                }).length}
              </div>
              <div className="text-xs text-muted-foreground mt-1">Total Entries</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {weekDays.filter(day => getDayTotal(day) > 0).length}/7
              </div>
              <div className="text-xs text-muted-foreground mt-1">Active Days</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
