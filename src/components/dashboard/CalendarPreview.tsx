
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users } from 'lucide-react';

export const CalendarPreview = () => {
  const todayEvents = [
    {
      time: '9:00 AM',
      title: 'Team Meeting',
      type: 'meeting',
      color: 'bg-blue-100 text-blue-700 border-blue-200'
    },
    {
      time: '2:00 PM',
      title: 'Client Call',
      type: 'call',
      color: 'bg-green-100 text-green-700 border-green-200'
    },
    {
      time: '4:30 PM',
      title: 'Project Review',
      type: 'review',
      color: 'bg-purple-100 text-purple-700 border-purple-200'
    }
  ];

  const upcomingDays = [
    { day: 'Thu', date: 28, isToday: true, events: 3 },
    { day: 'Fri', date: 29, isToday: false, events: 2 },
    { day: 'Sat', date: 30, isToday: false, events: 0 },
  ];

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 font-manrope">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#3366FF]" />
            Calendar
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            January 2025
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 3-Day View */}
        <div className="grid grid-cols-3 gap-2">
          {upcomingDays.map((day) => (
            <div
              key={day.date}
              className={`p-3 rounded-xl text-center transition-all duration-200 ${
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
                  {day.events} events
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
            {todayEvents.map((event, index) => (
              <div
                key={index}
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
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-[#E6F0FF] rounded-lg p-3 space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-700 flex items-center gap-1">
              <Users className="w-4 h-4" />
              This week
            </span>
            <span className="font-semibold text-[#3366FF]">12 meetings</span>
          </div>
          <div className="w-full bg-white rounded-full h-2">
            <div className="bg-[#3366FF] h-2 rounded-full w-3/4 transition-all duration-300"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
