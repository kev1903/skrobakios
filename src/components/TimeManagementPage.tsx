import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, subDays } from 'date-fns';
import { Timer, Calendar, TrendingUp, Clock, Home, ChevronLeft, ChevronRight, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { useTimeTracking, DEFAULT_CATEGORY_COLORS } from '@/hooks/useTimeTracking';
import { DayView } from '@/components/time-tracking/DayView';
import { WeekView } from '@/components/time-tracking/WeekView';
import { CalendarMonthView } from '@/components/time-tracking/CalendarMonthView';
import { ScheduleTab } from '@/components/time-tracking/ScheduleTab';
import { ProductivityTab } from '@/components/time-tracking/ProductivityTab';
import { cn } from '@/lib/utils';

interface TimeManagementPageProps {
  onNavigate: (page: string) => void;
}

export const TimeManagementPage = ({ onNavigate }: TimeManagementPageProps) => {
  const {
    timeEntries,
    settings,
    activeTimer,
    loading,
    loadTimeEntries,
    startTimer,
    stopTimer,
    updateTimeEntry,
    deleteTimeEntry,
    duplicateTimeEntry,
    updateSettings,
    getDailyStats
  } = useTimeTracking();

  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [mainTab, setMainTab] = useState('tracking');
  const [trackingView, setTrackingView] = useState('day');

  useEffect(() => {
    loadTimeEntries(selectedDate);
  }, [selectedDate]);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    loadTimeEntries(date);
  };

  const categoryColors = settings?.category_colors || DEFAULT_CATEGORY_COLORS;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-background">
        <div className="text-muted-foreground">Loading time tracking data...</div>
      </div>
    );
  }

  // Calculate stats
  const calculateStats = () => {
    const now = new Date();
    const last24Hours = timeEntries.filter(entry => {
      const entryDate = new Date(entry.start_time);
      const hoursDiff = (now.getTime() - entryDate.getTime()) / (1000 * 60 * 60);
      return hoursDiff <= 24;
    });

    const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const thisWeek = timeEntries.filter(entry => {
      const entryDate = new Date(entry.start_time);
      return entryDate >= thisWeekStart && entryDate <= thisWeekEnd;
    });

    const lastWeekStart = subDays(thisWeekStart, 7);
    const lastWeekEnd = subDays(thisWeekEnd, 7);
    const lastWeek = timeEntries.filter(entry => {
      const entryDate = new Date(entry.start_time);
      return entryDate >= lastWeekStart && entryDate <= lastWeekEnd;
    });

    const formatTime = (entries: typeof timeEntries) => {
      const totalMinutes = entries.reduce((acc, entry) => acc + Math.floor((entry.duration || 0) / 60), 0);
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      return `${hours}:${mins.toString().padStart(2, '0')} hrs`;
    };

    return {
      last24Hours: formatTime(last24Hours),
      thisWeek: formatTime(thisWeek),
      lastWeek: formatTime(lastWeek),
      sinceStart: formatTime(timeEntries),
    };
  };

  const stats = calculateStats();

  // Get current week for work diary
  const currentWeekStart = startOfWeek(new Date(selectedDate), { weekStartsOn: 1 });
  const currentWeekEnd = endOfWeek(new Date(selectedDate), { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: currentWeekStart, end: currentWeekEnd });

  return (
    <div className="w-full min-h-screen bg-background pb-12">
      <div className="max-w-[1800px] mx-auto">
        {/* Top Navigation */}
        <div className="bg-[#1a4d4d] text-white px-8 py-4 rounded-t-2xl">
          <Tabs value={mainTab} onValueChange={setMainTab} className="w-full">
            <TabsList className="inline-flex items-center gap-1 bg-transparent border-0 p-0">
              <TabsTrigger 
                value="overview"
                className="px-6 py-2 text-sm font-medium rounded-md transition-all duration-200 data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=inactive]:text-white/70 hover:text-white border-b-2 border-transparent data-[state=active]:border-luxury-gold rounded-none"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="timesheet"
                className="px-6 py-2 text-sm font-medium rounded-md transition-all duration-200 data-[state=active]:bg-transparent data-[state=active]:text-luxury-gold data-[state=inactive]:text-white/70 hover:text-white border-b-2 border-transparent data-[state=active]:border-luxury-gold rounded-none"
              >
                Timesheet
              </TabsTrigger>
              <TabsTrigger 
                value="messages"
                className="px-6 py-2 text-sm font-medium rounded-md transition-all duration-200 data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=inactive]:text-white/70 hover:text-white border-b-2 border-transparent data-[state=active]:border-luxury-gold rounded-none"
              >
                Messages
              </TabsTrigger>
              <TabsTrigger 
                value="details"
                className="px-6 py-2 text-sm font-medium rounded-md transition-all duration-200 data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=inactive]:text-white/70 hover:text-white border-b-2 border-transparent data-[state=active]:border-luxury-gold rounded-none"
              >
                Details
              </TabsTrigger>
            </TabsList>

            {/* Stats Cards */}
            <TabsContent value="timesheet" className="m-0 mt-8 space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-muted/30 p-6 rounded-xl">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Last 24 hours</div>
                  <div className="text-3xl font-bold text-foreground">{stats.last24Hours}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">This week</div>
                  <div className="text-3xl font-bold text-foreground">{stats.thisWeek}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>of 40 hrs weekly limit</span>
                    <Edit2 className="w-3 h-3 text-emerald-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Last week</div>
                  <div className="text-3xl font-bold text-foreground">{stats.lastWeek}</div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Since start</div>
                  <div className="text-3xl font-bold text-foreground">{stats.sinceStart}</div>
                </div>
              </div>

              {/* Work Diary */}
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-foreground mb-6">Work diary</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8">
                  {/* Calendar */}
                  <Card className="border border-border/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDateChange(format(subDays(new Date(selectedDate), 7), 'yyyy-MM-dd'))}
                          className="h-8 w-8"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <div className="text-lg font-semibold">
                          {format(new Date(selectedDate), 'MMMM yyyy')}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDateChange(format(addDays(new Date(selectedDate), 7), 'yyyy-MM-dd'))}
                          className="h-8 w-8"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Calendar Grid */}
                      <div className="space-y-2">
                        {/* Day headers */}
                        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground mb-2">
                          <div>Mon</div>
                          <div>Tue</div>
                          <div>Wed</div>
                          <div>Thu</div>
                          <div>Fri</div>
                          <div>Sat</div>
                          <div>Sun</div>
                        </div>

                        {/* Calendar dates */}
                        <div className="grid grid-cols-7 gap-1">
                          {weekDays.map((day, idx) => {
                            const isSelected = format(day, 'yyyy-MM-dd') === selectedDate;
                            const isInCurrentWeek = day >= currentWeekStart && day <= currentWeekEnd;
                            
                            return (
                              <button
                                key={idx}
                                onClick={() => handleDateChange(format(day, 'yyyy-MM-dd'))}
                                className={cn(
                                  "h-10 rounded-lg text-sm font-medium transition-all duration-200",
                                  isInCurrentWeek && !isSelected && "bg-emerald-500 text-white hover:bg-emerald-600",
                                  isSelected && "bg-emerald-600 text-white ring-2 ring-emerald-300",
                                  !isInCurrentWeek && "text-muted-foreground hover:bg-muted"
                                )}
                              >
                                {format(day, 'd')}
                              </button>
                            );
                          })}
                        </div>

                        {/* Legend */}
                        <div className="flex flex-wrap gap-4 mt-6 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500" />
                            <span className="text-muted-foreground">Tracked</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-amber-500" />
                            <span className="text-muted-foreground">Manual</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-rose-500" />
                            <span className="text-muted-foreground">Overtime</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Week View */}
                  <div className="space-y-4">
                    <div className="text-sm font-semibold text-muted-foreground">
                      {format(currentWeekStart, 'MMM d')} - {format(currentWeekEnd, 'MMM d')}
                    </div>
                    
                    <div className="space-y-3">
                      {weekDays.map((day, idx) => {
                        const dayEntries = timeEntries.filter(entry => {
                          const entryDate = format(new Date(entry.start_time), 'yyyy-MM-dd');
                          return entryDate === format(day, 'yyyy-MM-dd');
                        });
                        const totalMinutes = dayEntries.reduce((acc, entry) => acc + Math.floor((entry.duration || 0) / 60), 0);
                        const hours = Math.floor(totalMinutes / 60);
                        const mins = totalMinutes % 60;
                        const timeString = `${hours}:${mins.toString().padStart(2, '0')} hrs`;

                        return (
                          <div 
                            key={idx}
                            className="flex items-center gap-4 p-4 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                            onClick={() => handleDateChange(format(day, 'yyyy-MM-dd'))}
                          >
                            <div className="w-32 flex-shrink-0">
                              <div className="text-sm font-medium text-foreground">
                                {format(day, 'd')} {format(day, 'EEEE')}
                              </div>
                            </div>
                            
                            <div className="flex-1 h-6 bg-muted/50 rounded-full overflow-hidden">
                              {dayEntries.length > 0 && (
                                <div 
                                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500"
                                  style={{ width: `${Math.min((totalMinutes / 480) * 100, 100)}%` }}
                                />
                              )}
                            </div>
                            
                            <div className="w-24 text-right text-sm font-medium text-foreground">
                              {timeString}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Other Tabs */}
            <TabsContent value="overview" className="m-0 mt-8 animate-fade-in">
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <p className="text-muted-foreground">Overview content will be displayed here.</p>
              </div>
            </TabsContent>

            <TabsContent value="messages" className="m-0 mt-8 animate-fade-in">
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <p className="text-muted-foreground">Messages content will be displayed here.</p>
              </div>
            </TabsContent>

            <TabsContent value="details" className="m-0 mt-8 animate-fade-in">
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <p className="text-muted-foreground">Details content will be displayed here.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};