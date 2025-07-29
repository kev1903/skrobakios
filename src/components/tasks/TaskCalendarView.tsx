
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useTaskContext } from './useTaskContext';

type CalendarView = 'day' | 'week' | 'month';

export const TaskCalendarView = () => {
  const { tasks } = useTaskContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<CalendarView>('month');

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

  const formatDate = (date: Date) => {
    switch (calendarView) {
      case 'day':
        return date.toLocaleDateString('en-US', { 
          weekday: 'long',
          year: 'numeric', 
          month: 'long',
          day: 'numeric'
        });
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      case 'month':
      default:
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long' 
        });
    }
  };

  const navigate = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        switch (calendarView) {
          case 'day':
            newDate.setDate(prev.getDate() - 1);
            break;
          case 'week':
            newDate.setDate(prev.getDate() - 7);
            break;
          case 'month':
            newDate.setMonth(prev.getMonth() - 1);
            break;
        }
      } else {
        switch (calendarView) {
          case 'day':
            newDate.setDate(prev.getDate() + 1);
            break;
          case 'week':
            newDate.setDate(prev.getDate() + 7);
            break;
          case 'month':
            newDate.setMonth(prev.getMonth() + 1);
            break;
        }
      }
      return newDate;
    });
  };

  // Helper functions for different views
  const getWeekDays = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const renderDayView = () => {
    const dayTasks = getTasksForDate(currentDate);
    const isToday = currentDate.toDateString() === new Date().toDateString();
    
    return (
      <div className="space-y-4">
        <div className={`p-6 border rounded-lg ${isToday ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-medium ${isToday ? 'text-blue-600' : 'text-foreground'}`}>
              {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
            <span className="text-sm text-muted-foreground">
              {dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="space-y-2">
            {dayTasks.length > 0 ? (
              dayTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="font-medium">{task.taskName}</div>
                    <Badge variant="outline" className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {task.assignedTo.name}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No tasks scheduled for this day
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays(currentDate);
    
    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Week day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center font-medium text-muted-foreground text-sm border-b">
            {day}
          </div>
        ))}
        
        {/* Week days */}
        {weekDays.map((day, index) => {
          const dayTasks = getTasksForDate(day);
          const isToday = day.toDateString() === new Date().toDateString();
          
          return (
            <div
              key={index}
              className={`min-h-[120px] p-2 border border-gray-100 ${
                isToday ? 'bg-blue-50 border-blue-200' : 'bg-white hover:bg-gray-50'
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
    
    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Week day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center font-medium text-muted-foreground text-sm">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {days.map((day, index) => {
          const dayTasks = getTasksForDate(day);
          const isToday = day && day.toDateString() === new Date().toDateString();
          
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

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
              {/* View Toggle Buttons */}
              <div className="flex items-center space-x-1">
                <Button 
                  variant={calendarView === 'day' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setCalendarView('day')}
                >
                  Day
                </Button>
                <Button 
                  variant={calendarView === 'week' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setCalendarView('week')}
                >
                  Week
                </Button>
                <Button 
                  variant={calendarView === 'month' ? 'default' : 'outline'} 
                  size="sm"
                  onClick={() => setCalendarView('month')}
                >
                  Month
                </Button>
              </div>
              
              {/* Navigation Controls */}
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => navigate('prev')}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="font-medium px-4 min-w-[200px] text-center">{formatDate(currentDate)}</span>
                <Button variant="outline" size="sm" onClick={() => navigate('next')}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Render the appropriate view based on selected mode */}
          {calendarView === 'day' && renderDayView()}
          {calendarView === 'week' && renderWeekView()}
          {calendarView === 'month' && renderMonthView()}
        </CardContent>
      </Card>
      
      {/* Tasks summary for selected period */}
      <Card>
        <CardHeader>
          <CardTitle>
            Tasks for {calendarView === 'day' ? 'Selected Day' : 
                      calendarView === 'week' ? 'This Week' : 
                      'This Month'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(() => {
              let filteredTasks;
              if (calendarView === 'day') {
                filteredTasks = getTasksForDate(currentDate);
              } else if (calendarView === 'week') {
                const weekDays = getWeekDays(currentDate);
                const weekStart = weekDays[0];
                const weekEnd = weekDays[6];
                filteredTasks = tasks.filter(task => {
                  const taskDate = new Date(task.dueDate);
                  return taskDate >= weekStart && taskDate <= weekEnd;
                });
              } else {
                filteredTasks = tasks.filter(task => {
                  const taskDate = new Date(task.dueDate);
                  return taskDate.getMonth() === currentDate.getMonth() && 
                         taskDate.getFullYear() === currentDate.getFullYear();
                });
              }
              
              return filteredTasks.length > 0 ? (
                filteredTasks.map(task => (
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
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No tasks scheduled for this {calendarView}
                </div>
              );
            })()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
