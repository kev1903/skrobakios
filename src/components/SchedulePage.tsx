import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, addMonths, subMonths, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, startOfMonth, endOfMonth } from 'date-fns';

interface SchedulePageProps {
  onNavigate?: (page: string) => void;
}

interface BacklogItem {
  id: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  dueDate?: Date;
}

export const SchedulePage = ({ onNavigate }: SchedulePageProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('month');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Mock backlog data
  const [backlogItems] = useState<BacklogItem[]>([
    { id: '1', title: 'Design review meeting', priority: 'High', dueDate: new Date() },
    { id: '2', title: 'Project documentation', priority: 'Medium' },
    { id: '3', title: 'Client presentation prep', priority: 'High', dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
    { id: '4', title: 'Team standup notes', priority: 'Low' },
  ]);

  const navigateDate = (direction: 'prev' | 'next') => {
    if (viewMode === 'month') {
      setCurrentDate(direction === 'next' ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
    } else {
      setCurrentDate(direction === 'next' ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));
    }
  };

  const getDateRange = () => {
    if (viewMode === 'month') {
      return {
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate),
        title: format(currentDate, 'MMMM yyyy')
      };
    } else {
      return {
        start: startOfWeek(currentDate),
        end: endOfWeek(currentDate),
        title: `${format(startOfWeek(currentDate), 'MMM d')} - ${format(endOfWeek(currentDate), 'MMM d, yyyy')}`
      };
    }
  };

  const dateRange = getDateRange();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'Low': return 'bg-green-500/20 text-green-300 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  return (
    <div className="h-96 bg-white/5 backdrop-blur-sm overflow-hidden">
      <div className="p-6 h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-white" />
            <div>
              <h1 className="text-2xl font-bold text-white font-poppins">My Schedule</h1>
              <p className="text-white/70 font-inter">Manage your daily appointments and tasks</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-6 h-full">
          {/* Left Column - Backlog */}
          <div className="w-80 flex-shrink-0">
            <Card className="bg-white/10 border-white/20 h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white font-poppins">Backlog</CardTitle>
                  <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 overflow-y-auto">
                {backlogItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-white font-medium text-sm">{item.title}</h4>
                      <Badge className={`text-xs ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </Badge>
                    </div>
                    {item.dueDate && (
                      <p className="text-white/60 text-xs">
                        Due: {format(item.dueDate, 'MMM d')}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Calendar */}
          <div className="flex-1 min-w-0">
            <Card className="bg-white/10 border-white/20 h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateDate('prev')}
                      className="text-white hover:bg-white/20"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <h3 className="text-lg font-semibold text-white font-poppins">
                      {dateRange.title}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateDate('next')}
                      className="text-white hover:bg-white/20"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === 'week' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('week')}
                      className={viewMode === 'week' ? '' : 'text-white hover:bg-white/20'}
                    >
                      Week
                    </Button>
                    <Button
                      variant={viewMode === 'month' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('month')}
                      className={viewMode === 'month' ? '' : 'text-white hover:bg-white/20'}
                    >
                      Month
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="overflow-hidden">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  month={currentDate}
                  onMonthChange={setCurrentDate}
                  className="w-full text-white [&_.rdp-day]:text-white [&_.rdp-day_button]:text-white [&_.rdp-day_button:hover]:bg-white/20 [&_.rdp-day_button.rdp-day_selected]:bg-primary [&_.rdp-day_button.rdp-day_selected]:text-primary-foreground [&_.rdp-nav_button]:text-white [&_.rdp-nav_button:hover]:bg-white/20 [&_.rdp-caption]:text-white pointer-events-auto"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};