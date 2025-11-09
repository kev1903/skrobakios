import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Timer, Calendar, TrendingUp, ArrowLeft, Clock, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTimeTracking, DEFAULT_CATEGORY_COLORS } from '@/hooks/useTimeTracking';
import { DayView } from '@/components/time-tracking/DayView';
import { WeekView } from '@/components/time-tracking/WeekView';
import { CalendarMonthView } from '@/components/time-tracking/CalendarMonthView';
import { ScheduleTab } from '@/components/time-tracking/ScheduleTab';
import { ProductivityTab } from '@/components/time-tracking/ProductivityTab';

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
      <div className="h-full flex items-center justify-center">
        <div className="text-slate-600">Loading time tracking data...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="backdrop-blur-xl bg-white/80 border-b border-border/30 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('home')}
                className="flex items-center gap-2 hover:bg-accent/50"
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Button>
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-luxury-gold" />
                <h1 className="text-2xl font-bold text-foreground">
                  Time Management
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <Tabs value={mainTab} onValueChange={setMainTab} className="flex-1 flex flex-col">
          <div className="border-b border-border/30 bg-white/60 backdrop-blur-xl px-6 py-3">
            <TabsList className="inline-flex items-center gap-1 bg-white/80 border border-border/30 rounded-xl p-1 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
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

          <TabsContent value="tracking" className="flex-1 overflow-y-auto p-6 data-[state=inactive]:hidden">
            <div className="space-y-6">
              {/* Time Tracking Sub-Navigation */}
              <div className="inline-flex items-center gap-1 bg-white/80 border border-border/30 rounded-xl p-1 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
                <button
                  onClick={() => setTrackingView('day')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    trackingView === 'day'
                      ? 'bg-luxury-gold text-white shadow-[0_2px_8px_rgba(0,0,0,0.1)]'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                >
                  Day
                </button>
                <button
                  onClick={() => setTrackingView('week')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    trackingView === 'week'
                      ? 'bg-luxury-gold text-white shadow-[0_2px_8px_rgba(0,0,0,0.1)]'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setTrackingView('calendar')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    trackingView === 'calendar'
                      ? 'bg-luxury-gold text-white shadow-[0_2px_8px_rgba(0,0,0,0.1)]'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }`}
                >
                  Calendar
                </button>
              </div>

              {/* Time Tracking Views */}
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

          <TabsContent value="schedule" className="flex-1 overflow-y-auto p-6 data-[state=inactive]:hidden">
            <ScheduleTab />
          </TabsContent>

          <TabsContent value="productivity" className="flex-1 overflow-y-auto p-6 data-[state=inactive]:hidden">
            <ProductivityTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};