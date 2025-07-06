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
    <div className="h-[calc(100vh-200px)] bg-white/5 backdrop-blur-md border border-white/20 shadow-2xl overflow-hidden mt-20 mb-32 mx-6 rounded-lg">
      <div className="p-6 h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-6 h-6 text-white" />
            <div>
              <h1 className="text-xl font-bold text-white font-poppins">My Schedule</h1>
              <p className="text-white/70 font-inter text-sm">Manage your daily appointments and tasks</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-4 h-[calc(100%-80px)]">
          {/* Left Column - Backlog */}
          <div className="w-72 flex-shrink-0">
            <Card className="bg-white/10 border-white/20 h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white font-poppins text-lg">Backlog</CardTitle>
                  <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 overflow-y-auto max-h-[calc(100%-80px)]">
                {backlogItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-white font-medium text-sm leading-tight">{item.title}</h4>
                      <Badge className={`text-xs ml-2 flex-shrink-0 ${getPriorityColor(item.priority)}`}>
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
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
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
                  
                  <div className="flex gap-1">
                    <Button
                      variant={viewMode === 'week' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('week')}
                      className={`text-sm ${viewMode === 'week' ? 'bg-primary text-primary-foreground' : 'text-white hover:bg-white/20'}`}
                    >
                      Week
                    </Button>
                    <Button
                      variant={viewMode === 'month' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('month')}
                      className={`text-sm ${viewMode === 'month' ? 'bg-primary text-primary-foreground' : 'text-white hover:bg-white/20'}`}
                    >
                      Month
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="overflow-hidden">
                <div className="max-h-[calc(100%-40px)] overflow-y-auto">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    month={currentDate}
                    onMonthChange={setCurrentDate}
                    className="w-full text-white [&_.rdp-day]:text-white [&_.rdp-day_button]:text-white [&_.rdp-day_button:hover]:bg-white/20 [&_.rdp-day_button.rdp-day_selected]:bg-primary [&_.rdp-day_button.rdp-day_selected]:text-primary-foreground [&_.rdp-nav_button]:text-white [&_.rdp-nav_button:hover]:bg-white/20 [&_.rdp-caption]:text-white [&_.rdp-head_cell]:text-white/70 pointer-events-auto"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};