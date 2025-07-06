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
      case 'High': return 'bg-red-100 text-red-800 border border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border border-green-200';
      default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-blue-100 rounded-xl">
              <CalendarIcon className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 font-poppins">My Schedule</h1>
              <p className="text-slate-600 text-lg">Manage your daily appointments and tasks</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Backlog */}
          <div className="lg:col-span-1">
            <Card className="h-[600px] shadow-lg border-0">
              <CardHeader className="pb-4 border-b bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-slate-900 font-poppins text-xl flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Backlog
                  </CardTitle>
                  <Button size="sm" variant="ghost" className="text-slate-600 hover:bg-slate-100 rounded-full w-8 h-8 p-0">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 overflow-y-auto h-[calc(100%-80px)]">
                <div className="space-y-3">
                  {backlogItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 bg-white rounded-xl border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-slate-900 font-medium text-sm leading-snug group-hover:text-blue-600 transition-colors">
                          {item.title}
                        </h4>
                        <Badge className={`text-xs font-medium ${getPriorityColor(item.priority)}`}>
                          {item.priority}
                        </Badge>
                      </div>
                      {item.dueDate && (
                        <div className="flex items-center gap-1">
                          <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                          <p className="text-slate-500 text-xs font-medium">
                            Due {format(item.dueDate, 'MMM d')}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Calendar */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] shadow-lg border-0">
              <CardHeader className="pb-4 border-b bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateDate('prev')}
                      className="text-slate-600 hover:bg-slate-100 rounded-full w-9 h-9 p-0"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <h3 className="text-2xl font-bold text-slate-900 font-poppins min-w-[200px] text-center">
                      {dateRange.title}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateDate('next')}
                      className="text-slate-600 hover:bg-slate-100 rounded-full w-9 h-9 p-0"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                  
                  <div className="flex bg-slate-100 rounded-lg p-1">
                    <Button
                      variant={viewMode === 'week' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('week')}
                      className={`text-sm font-medium px-4 rounded-md ${
                        viewMode === 'week' 
                          ? 'bg-white text-blue-600 shadow-sm' 
                          : 'text-slate-600 hover:bg-slate-200/50'
                      }`}
                    >
                      Week
                    </Button>
                    <Button
                      variant={viewMode === 'month' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('month')}
                      className={`text-sm font-medium px-4 rounded-md ${
                        viewMode === 'month' 
                          ? 'bg-white text-blue-600 shadow-sm' 
                          : 'text-slate-600 hover:bg-slate-200/50'
                      }`}
                    >
                      Month
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 overflow-hidden">
                <div className="h-[calc(100%-40px)] overflow-y-auto">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    month={currentDate}
                    onMonthChange={setCurrentDate}
                    className="w-full text-slate-900 [&_.rdp-day]:text-slate-700 [&_.rdp-day_button]:text-slate-700 [&_.rdp-day_button:hover]:bg-blue-50 [&_.rdp-day_button:hover]:text-blue-600 [&_.rdp-day_button.rdp-day_selected]:bg-blue-500 [&_.rdp-day_button.rdp-day_selected]:text-white [&_.rdp-nav_button]:hidden [&_.rdp-caption]:hidden [&_.rdp-head_cell]:text-slate-500 [&_.rdp-head_cell]:font-semibold [&_.rdp-head_cell]:text-sm [&_.rdp-day_button.rdp-day_today]:bg-blue-100 [&_.rdp-day_button.rdp-day_today]:text-blue-700 [&_.rdp-day_button.rdp-day_today]:font-semibold pointer-events-auto"
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