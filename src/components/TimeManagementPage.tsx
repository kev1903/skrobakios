import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Timer, Calendar, TrendingUp, Clock, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTimeTracking, DEFAULT_CATEGORY_COLORS } from '@/hooks/useTimeTracking';
import { DayView } from '@/components/time-tracking/DayView';
import { WeekView } from '@/components/time-tracking/WeekView';
import { CalendarMonthView } from '@/components/time-tracking/CalendarMonthView';
import { ScheduleTab } from '@/components/time-tracking/ScheduleTab';
import { ProductivityTab } from '@/components/time-tracking/ProductivityTab';
import { useMenuBarSpacing } from '@/hooks/useMenuBarSpacing';
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

  const { spacingClasses, minHeightClasses } = useMenuBarSpacing();
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
      <div className={cn("flex items-center justify-center bg-background", minHeightClasses)}>
        <div className="text-muted-foreground">Loading time tracking data...</div>
      </div>
    );
  }

  return (
    <div className={cn("w-full bg-gradient-to-br from-background via-background to-muted/10", minHeightClasses)}>
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="backdrop-blur-xl bg-white/80 border-b border-border/30 shadow-[0_2px_16px_rgba(0,0,0,0.04)] sticky top-0 z-10">
          <div className="px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate('home')}
                  className="flex items-center gap-2 hover:bg-accent/50 transition-colors"
                >
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </Button>
                <div className="h-6 w-px bg-border/50" />
                <div className="flex items-center gap-3">
                  <Clock className="w-7 h-7 text-luxury-gold" />
                  <h1 className="text-2xl font-bold text-foreground">
                    Time Management
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          <Tabs value={mainTab} onValueChange={setMainTab} className="w-full space-y-6">
            {/* Main Tab Navigation */}
            <div className="flex items-center gap-4">
              <TabsList className="inline-flex items-center gap-1 bg-white/80 backdrop-blur-xl border border-border/30 rounded-xl p-1 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
                <TabsTrigger 
                  value="tracking"
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 data-[state=active]:bg-luxury-gold data-[state=active]:text-white data-[state=active]:shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
                >
                  <Timer className="w-4 h-4" />
                  Time Tracking
                </TabsTrigger>
                <TabsTrigger 
                  value="schedule"
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 data-[state=active]:bg-luxury-gold data-[state=active]:text-white data-[state=active]:shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
                >
                  <Calendar className="w-4 h-4" />
                  Schedule
                </TabsTrigger>
                <TabsTrigger 
                  value="productivity"
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 data-[state=active]:bg-luxury-gold data-[state=active]:text-white data-[state=active]:shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
                >
                  <TrendingUp className="w-4 h-4" />
                  Productivity
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Time Tracking Tab */}
            <TabsContent value="tracking" className="m-0 space-y-6 animate-fade-in">
              {/* Time Tracking Sub-Navigation */}
              <div className="inline-flex items-center gap-1 bg-white/80 backdrop-blur-xl border border-border/30 rounded-xl p-1 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
                <button
                  onClick={() => setTrackingView('day')}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                    trackingView === 'day'
                      ? 'bg-luxury-gold text-white shadow-[0_2px_8px_rgba(0,0,0,0.1)]'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  )}
                >
                  Day
                </button>
                <button
                  onClick={() => setTrackingView('week')}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                    trackingView === 'week'
                      ? 'bg-luxury-gold text-white shadow-[0_2px_8px_rgba(0,0,0,0.1)]'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  )}
                >
                  Week
                </button>
                <button
                  onClick={() => setTrackingView('calendar')}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                    trackingView === 'calendar'
                      ? 'bg-luxury-gold text-white shadow-[0_2px_8px_rgba(0,0,0,0.1)]'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  )}
                >
                  Calendar
                </button>
              </div>

              {/* Time Tracking Views */}
              <div className="animate-fade-in">
                {trackingView === 'day' && (
                  <DayView
                    entries={timeEntries}
                    categoryColors={categoryColors}
                    selectedDate={selectedDate}
                    onDateChange={handleDateChange}
                  />
                )}
                {trackingView === 'week' && (
                  <WeekView
                    entries={timeEntries}
                    categoryColors={categoryColors}
                    selectedDate={selectedDate}
                    onDateChange={handleDateChange}
                  />
                )}
                {trackingView === 'calendar' && (
                  <CalendarMonthView
                    entries={timeEntries}
                    categoryColors={categoryColors}
                    selectedDate={selectedDate}
                    onDateChange={handleDateChange}
                  />
                )}
              </div>
            </TabsContent>

            {/* Schedule Tab */}
            <TabsContent value="schedule" className="m-0 animate-fade-in">
              <ScheduleTab />
            </TabsContent>

            {/* Productivity Tab */}
            <TabsContent value="productivity" className="m-0 animate-fade-in">
              <ProductivityTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};