import React, { useCallback } from 'react';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Task } from './types';

interface MonthTimelineViewProps {
  currentDate: Date;
  tasks?: Task[];
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onDayClick?: (day: Date) => void;
}

export const MonthTimelineView: React.FC<MonthTimelineViewProps> = ({
  currentDate,
  tasks = [],
  onTaskUpdate,
  onDayClick
}) => {
  const weekHeaders = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  // Get calendar data for the month
  const getCalendarDays = useCallback(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentDate]);

  const calendarDays = getCalendarDays();

  // Get tasks for a specific day
  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return isSameDay(taskDate, day);
    });
  };

  const isCurrentMonth = (day: Date) => {
    return day.getMonth() === currentDate.getMonth();
  };

  const getTaskColor = (task: Task) => {
    switch (task.priority?.toLowerCase()) {
      case 'high': 
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium': 
        return 'bg-warning/10 text-warning border-warning/20';
      case 'low': 
        return 'bg-success/10 text-success border-success/20';
      default: 
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Month Grid */}
      <div className="flex-1 overflow-auto border border-border/20 rounded-lg bg-background">
        {/* Week Headers */}
        <div className="grid grid-cols-7 gap-0 border-b border-border/20 bg-muted/10">
          {weekHeaders.map(day => (
            <div key={day} className="p-3 text-center text-muted-foreground font-medium text-sm border-r border-border/20 last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days Grid */}
        <div className="grid grid-cols-7 gap-0 min-h-full">
          {calendarDays.map((day, index) => {
            const dayTasks = getTasksForDay(day);
            const isToday = isSameDay(day, new Date());
            const isCurrentMonthDay = isCurrentMonth(day);

            return (
              <div
                key={day.toISOString()}
                className={`min-h-[120px] border-r border-border/20 border-b border-border/10 cursor-pointer transition-colors relative p-2 last:border-r-0 hover:bg-accent/30 ${!isCurrentMonthDay ? 'opacity-40 bg-muted/5' : ''} ${
                  isToday ? 'bg-primary/5 border-primary/20' : ''
                }`}
                onClick={() => onDayClick?.(day)}
              >
                {/* Day Number */}
                <div className={`text-sm font-medium mb-2 ${
                  isToday ? 'text-primary font-bold' : isCurrentMonthDay ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {format(day, 'd')}
                </div>

                {/* Tasks */}
                <div className="space-y-1 overflow-hidden">
                  {dayTasks.slice(0, 3).map((task, taskIndex) => {
                    const taskDate = new Date(task.dueDate);
                    const hasSpecificTime = !(taskDate.getUTCHours() === 0 && taskDate.getUTCMinutes() === 0);

                    return (
                      <div
                        key={task.id}
                        className={`${getTaskColor(task)} text-xs p-1.5 rounded border cursor-pointer hover:opacity-80 transition-all`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="font-medium leading-tight truncate">
                          {task.taskName}
                        </div>
                        {hasSpecificTime && (
                          <div className="text-xs opacity-75 leading-tight">
                            {format(taskDate, 'HH:mm')}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-muted-foreground bg-muted/30 rounded p-1 text-center">
                      +{dayTasks.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};