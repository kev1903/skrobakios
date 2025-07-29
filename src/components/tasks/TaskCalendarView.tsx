
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useTaskContext } from './useTaskContext';
import { DayTimelineView } from './DayTimelineView';
import { format, startOfWeek, endOfWeek, isSameDay, addDays } from 'date-fns';

type ViewMode = 'day' | 'week' | 'month';

export const TaskCalendarView = () => {
  const { tasks } = useTaskContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getTasksForDate = (date: Date | null) => {
    if (!date) return [];
    const dateString = date.toISOString().split('T')[0];
    return tasks.filter(task => task.dueDate === dateString);
  };

  const getWeekDays = (date: Date) => {
    const weekStart = startOfWeek(date);
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      weekDays.push(addDays(weekStart, i));
    }
    return weekDays;
  };

  const formatDate = (date: Date) => {
    switch (viewMode) {
      case 'day':
        return format(date, 'EEEE, MMMM d, yyyy');
      case 'week':
        const weekStart = startOfWeek(date);
        const weekEnd = endOfWeek(date);
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      case 'month':
      default:
        return format(date, 'MMMM yyyy');
    }
  };

  const navigate = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      switch (viewMode) {
        case 'day':
          newDate.setDate(prev.getDate() + (direction === 'next' ? 1 : -1));
          break;
        case 'week':
          newDate.setDate(prev.getDate() + (direction === 'next' ? 7 : -7));
          break;
        case 'month':
        default:
          newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
          break;
      }
      return newDate;
    });
  };

  const renderDayView = () => {
    return <DayTimelineView currentDate={currentDate} />;
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays(currentDate);
    const weekHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Week day headers */}
        {weekHeaders.map(day => (
          <div key={day} className="p-2 text-center font-medium text-muted-foreground text-sm">
            {day}
          </div>
        ))}
        
        {/* Week days */}
        {weekDays.map((day, index) => {
          const dayTasks = getTasksForDate(day);
          const isToday = isSameDay(day, new Date());
          
          return (
            <div
              key={index}
              className={`min-h-[120px] p-2 border border-gray-100 bg-white hover:bg-gray-50 ${
                isToday ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className={`text-sm font-medium mb-2 ${
                isToday ? 'text-blue-600' : 'text-foreground'
              }`}>
                {day.getDate()}
              </div>
              <div className="space-y-1">
                {dayTasks.slice(0, 3).map(task => (
                  <div
                    key={task.id}
                    className="text-xs p-1 rounded truncate bg-blue-100 text-blue-800"
                    title={task.taskName}
                  >
                    {task.taskName}
                  </div>
                ))}
                {dayTasks.length > 3 && (
                  <div className="text-xs text-gray-500">
                    +{dayTasks.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate);
    const weekHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Week day headers */}
        {weekHeaders.map(day => (
          <div key={day} className="p-2 text-center font-medium text-muted-foreground text-sm">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {days.map((day, index) => {
          const dayTasks = getTasksForDate(day);
          const isToday = day && isSameDay(day, new Date());
          
          return (
            <div
              key={index}
              className={`min-h-[100px] p-2 border border-gray-100 ${
                day ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'
              } ${isToday ? 'bg-blue-50 border-blue-200' : ''}`}
            >
              {day && (
                <>
                  <div className={`text-sm font-medium mb-1 ${
                    isToday ? 'text-blue-600' : 'text-foreground'
                  }`}>
                    {day.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayTasks.slice(0, 2).map(task => (
                      <div
                        key={task.id}
                        className="text-xs p-1 rounded truncate bg-blue-100 text-blue-800"
                        title={task.taskName}
                      >
                        {task.taskName}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{dayTasks.length - 2} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderCalendarView = () => {
    switch (viewMode) {
      case 'day':
        return renderDayView();
      case 'week':
        return renderWeekView();
      case 'month':
      default:
        return renderMonthView();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Task Calendar</span>
            </CardTitle>
            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as ViewMode)}>
                <ToggleGroupItem value="day" size="sm">Day</ToggleGroupItem>
                <ToggleGroupItem value="week" size="sm">Week</ToggleGroupItem>
                <ToggleGroupItem value="month" size="sm">Month</ToggleGroupItem>
              </ToggleGroup>
              
              {/* Navigation */}
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => navigate('prev')}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="font-medium px-4">{formatDate(currentDate)}</span>
                <Button variant="outline" size="sm" onClick={() => navigate('next')}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {renderCalendarView()}
        </CardContent>
      </Card>
      
      {/* Tasks for selected period */}
      <Card>
        <CardHeader>
          <CardTitle>
            Tasks This {viewMode === 'day' ? 'Day' : viewMode === 'week' ? 'Week' : 'Month'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tasks.filter(task => {
              const taskDate = new Date(task.dueDate);
              switch (viewMode) {
                case 'day':
                  return isSameDay(taskDate, currentDate);
                case 'week':
                  const weekStart = startOfWeek(currentDate);
                  const weekEnd = endOfWeek(currentDate);
                  return taskDate >= weekStart && taskDate <= weekEnd;
                case 'month':
                default:
                  return taskDate.getMonth() === currentDate.getMonth() && 
                         taskDate.getFullYear() === currentDate.getFullYear();
              }
            }).map(task => (
              <div key={task.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-sm font-medium">{task.taskName}</div>
                  <Badge variant="outline" className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </div>
                <div className="text-sm text-gray-500">
                  Due: {task.dueDate}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
