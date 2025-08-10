import React, { useState, useCallback } from 'react';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { GripVertical } from 'lucide-react';
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

  // Get tasks for a specific day (only scheduled tasks, not backlog tasks)
  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false; // No due date = backlog task
      
      try {
        const taskDate = new Date(task.dueDate);
        if (!isSameDay(taskDate, day)) return false; // Must be same day
        
        // Only show tasks that have specific time (not midnight = 00:00)
        const hours = taskDate.getHours();
        const minutes = taskDate.getMinutes();
        const isScheduledTask = !(hours === 0 && minutes === 0); // Exclude backlog tasks (midnight)
        
        return isScheduledTask;
      } catch (error) {
        console.error('Error parsing task date for calendar filter:', task.dueDate, error);
        return false; // Don't show tasks with invalid dates
      }
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
      <div className="flex-1 overflow-hidden border border-white/[0.08] rounded-lg backdrop-blur-xl bg-white/[0.02]">
        {/* Week Headers */}
        <div className="grid grid-cols-7 gap-0 border-b border-white/[0.08] bg-white/[0.05]">
          {weekHeaders.map(day => (
            <div key={day} className="p-3 text-center text-white/60 font-medium text-sm border-r border-white/[0.08] last:border-r-0">
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
                className={`min-h-[120px] border-r border-white/[0.08] border-b border-white/[0.05] cursor-pointer transition-colors relative p-2 last:border-r-0 hover:bg-white/[0.05] ${!isCurrentMonthDay ? 'opacity-40 bg-white/[0.01]' : ''} ${
                  isToday ? 'bg-primary/5 border-primary/20' : ''
                }`}
                onClick={() => onDayClick?.(day)}
              >
                {/* Day Number */}
                <div className={`text-sm font-medium mb-2 ${
                  isToday ? 'text-primary font-bold' : isCurrentMonthDay ? 'text-white/90' : 'text-white/40'
                }`}>
                  {format(day, 'd')}
                </div>

                {/* Tasks */}
                <div className="space-y-1 overflow-hidden">
                  {dayTasks.slice(0, 3).map((task) => {
                    const taskDate = new Date(task.dueDate);
                    const hasSpecificTime = !(taskDate.getUTCHours() === 0 && taskDate.getUTCMinutes() === 0);

                    return (
                       <div
                         key={task.id}
                         draggable
                         onDragStart={(e) => {
                           e.dataTransfer.setData('text/plain', task.id);
                           e.dataTransfer.effectAllowed = 'move';
                         }}
                         className={`draggable-task-element glass-card border border-white/30 text-white text-xs p-1.5 rounded-lg cursor-grab active:cursor-grabbing hover:scale-105 transition-all shadow-lg backdrop-blur-xl bg-white/10 hover:bg-white/20 ${getTaskColor(task)}`}
                         onClick={(e) => e.stopPropagation()}
                       >
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 text-white/60 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium leading-tight truncate text-white drop-shadow-sm">
                              {task.taskName}
                            </div>
                            {hasSpecificTime && (
                              <div className="text-xs text-white/80 leading-tight drop-shadow-sm">
                                {format(taskDate, 'HH:mm')}
                              </div>
                            )}
                          </div>
                        </div>
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