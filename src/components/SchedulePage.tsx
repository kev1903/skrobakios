import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, addMonths, subMonths, addWeeks, subWeeks, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { TimeBlockingCalendar } from './TimeBlockingCalendar';

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
      case 'High': return 'bg-destructive/20 text-destructive border border-destructive/30';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-700 border border-yellow-500/30';
      case 'Low': return 'bg-green-500/20 text-green-700 border border-green-500/30';
      default: return 'bg-muted text-muted-foreground border border-border';
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-background">
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="shrink-0 px-6 py-4 border-b border-border/20 bg-background/80 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="glass-card p-3">
              <CalendarIcon className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground heading-modern">My Schedule</h1>
              <p className="text-muted-foreground text-lg body-modern">Manage your daily appointments and tasks</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-4 overflow-hidden">
          {/* Left Column - Backlog */}
          <div className="lg:col-span-1 border-r border-border/20">
            <Card className="glass-card h-full rounded-none">
              <CardHeader className="pb-4 border-b border-border/50 px-6 py-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-card-foreground heading-modern text-xl flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Backlog
                  </CardTitle>
                  <Button size="sm" variant="ghost" className="text-foreground hover:bg-muted rounded-full w-8 h-8 p-0">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-6 py-4 overflow-y-auto h-[calc(100%-80px)]">
                <div className="space-y-3">
                  {backlogItems.map((item) => (
                    <div
                      key={item.id}
                      className="glass-card interactive-glass p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-card-foreground font-medium text-sm leading-snug group-hover:text-primary transition-colors">
                          {item.title}
                        </h4>
                        <Badge className={`text-xs font-medium ${getPriorityColor(item.priority)}`}>
                          {item.priority}
                        </Badge>
                      </div>
                      {item.dueDate && (
                        <div className="flex items-center gap-1">
                          <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                          <p className="text-muted-foreground text-xs font-medium">
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
            <Card className="glass-card h-full rounded-none">
              <CardHeader className="pb-4 border-b border-border/50 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateDate('prev')}
                      className="text-foreground hover:bg-muted rounded-full w-9 h-9 p-0"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <h3 className="text-2xl font-bold text-card-foreground heading-modern min-w-[200px] text-center">
                      {dateRange.title}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateDate('next')}
                      className="text-foreground hover:bg-muted rounded-full w-9 h-9 p-0"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                  
                  <div className="flex bg-muted/60 rounded-lg p-1 backdrop-blur-sm">
                    <Button
                      variant={viewMode === 'week' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('week')}
                      className={`text-sm font-medium px-4 rounded-md ${
                        viewMode === 'week' 
                          ? 'bg-primary text-primary-foreground shadow-sm' 
                          : 'text-foreground hover:bg-muted'
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
                          ? 'bg-primary text-primary-foreground shadow-sm' 
                          : 'text-foreground hover:bg-muted'
                      }`}
                    >
                      Month
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 overflow-hidden h-[calc(100%-80px)]">
                <TimeBlockingCalendar 
                  currentDate={currentDate}
                  viewMode={viewMode}
                  onMonthChange={setCurrentDate}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};