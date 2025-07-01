
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, Plus } from 'lucide-react';
import { useCalendarData } from '@/hooks/useCalendarData';
import { useToast } from '@/hooks/use-toast';

export const CalendarPreview = () => {
  const { toast } = useToast();
  const { 
    getTodayEvents, 
    getUpcomingDays, 
    getWeeklyEventCount,
    addEvent 
  } = useCalendarData();

  const todayEvents = getTodayEvents();
  const upcomingDays = getUpcomingDays();
  const weeklyEventCount = getWeeklyEventCount();

  const getCurrentMonth = () => {
    return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const handleQuickAddEvent = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });

    addEvent({
      time: timeString,
      title: 'Quick Meeting',
      type: 'meeting',
      date: now.toISOString().split('T')[0],
      description: 'Quick meeting added from dashboard'
    });

    toast({
      title: "Event Added",
      description: "Quick meeting has been added to your calendar.",
    });
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 font-manrope">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#3366FF]" />
            Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {getCurrentMonth()}
            </Badge>
            <Button
              size="sm"
              onClick={handleQuickAddEvent}
              className="bg-[#3366FF] hover:bg-[#1F3D7A] text-white h-6 px-2"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 3-Day View */}
        <div className="grid grid-cols-3 gap-2">
          {upcomingDays.map((day) => (
            <div
              key={day.fullDate}
              className={`p-3 rounded-xl text-center transition-all duration-200 cursor-pointer ${
                day.isToday
                  ? 'bg-[#3366FF] text-white shadow-lg'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="text-xs font-medium opacity-80">{day.day}</div>
              <div className="text-lg font-bold">{day.date}</div>
              {day.events > 0 && (
                <div className={`text-xs mt-1 ${
                  day.isToday ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {day.events} event{day.events !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Today's Events */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Today's Schedule
          </h4>
          
          <div className="space-y-2">
            {todayEvents.length > 0 ? (
              todayEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-xs font-medium text-gray-500 min-w-[60px]">
                      {event.time}
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {event.title}
                    </div>
                  </div>
                  <Badge className={`text-xs px-2 py-1 ${event.color}`}>
                    {event.type}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm">
                No events scheduled for today
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-[#E6F0FF] rounded-lg p-3 space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-700 flex items-center gap-1">
              <Users className="w-4 h-4" />
              This week
            </span>
            <span className="font-semibold text-[#3366FF]">{weeklyEventCount} events</span>
          </div>
          <div className="w-full bg-white rounded-full h-2">
            <div 
              className="bg-[#3366FF] h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((weeklyEventCount / 20) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
