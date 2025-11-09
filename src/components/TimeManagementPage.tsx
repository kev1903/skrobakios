import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, subDays } from 'date-fns';
import { Timer, Calendar, TrendingUp, Clock, Home, ChevronLeft, ChevronRight, Edit2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTimeTracking, DEFAULT_CATEGORY_COLORS } from '@/hooks/useTimeTracking';
import { DayView } from '@/components/time-tracking/DayView';
import { WeekView } from '@/components/time-tracking/WeekView';
import { CalendarMonthView } from '@/components/time-tracking/CalendarMonthView';
import { ScheduleTab } from '@/components/time-tracking/ScheduleTab';
import { ProductivityTab } from '@/components/time-tracking/ProductivityTab';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

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
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState('');
  const [userRate, setUserRate] = useState<number | null>(null);
  const [rateCurrency, setRateCurrency] = useState<string>('AUD');

  useEffect(() => {
    // Load entire week's data for the work diary
    const weekStart = startOfWeek(new Date(selectedDate), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(selectedDate), { weekStartsOn: 1 });
    loadTimeEntries(format(weekStart, 'yyyy-MM-dd'), format(weekEnd, 'yyyy-MM-dd'));
  }, [selectedDate]);

  useEffect(() => {
    // Load user's rate
    const loadUserRate = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('user_rates')
          .select('rate_amount, currency')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading user rate:', error);
          return;
        }

        if (data) {
          setUserRate(data.rate_amount);
          setRateCurrency(data.currency || 'AUD');
        }
      } catch (error) {
        console.error('Error loading user rate:', error);
      }
    };

    loadUserRate();
  }, []);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    loadTimeEntries(date);
  };

  const handleDayClick = (date: string) => {
    setModalDate(date);
    setIsDayModalOpen(true);
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

  // Calculate this week's pay
  const calculateWeeklyPay = () => {
    if (!userRate) return null;
    
    const now = new Date();
    const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const thisWeek = timeEntries.filter(entry => {
      const entryDate = new Date(entry.start_time);
      return entryDate >= thisWeekStart && entryDate <= thisWeekEnd;
    });

    const totalMinutes = thisWeek.reduce((acc, entry) => acc + Math.floor((entry.duration || 0) / 60), 0);
    const totalHours = totalMinutes / 60;
    const weeklyPay = totalHours * userRate;

    return {
      pay: weeklyPay,
      hours: totalHours
    };
  };

  const weeklyPay = calculateWeeklyPay();

  // Get current week for work diary
  const currentWeekStart = startOfWeek(new Date(selectedDate), { weekStartsOn: 1 });
  const currentWeekEnd = endOfWeek(new Date(selectedDate), { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: currentWeekStart, end: currentWeekEnd });

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-background via-background to-muted/10 pb-12">
      <div className="max-w-[1800px] mx-auto p-6 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="backdrop-blur-xl bg-white/80 border-border/30 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground font-medium">Last 24 hours</div>
                  <div className="text-2xl font-bold text-foreground">{stats.last24Hours}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-white/80 border-border/30 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <div className="text-xs text-muted-foreground font-medium">This week</div>
                  <div className="text-2xl font-bold text-foreground">{stats.thisWeek}</div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="whitespace-nowrap">of 40 hrs</span>
                  <Edit2 className="w-3 h-3 text-luxury-gold hover:text-luxury-gold/80 cursor-pointer" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-white/80 border-border/30 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground font-medium">This week's pay</div>
                  {weeklyPay ? (
                    <>
                      <div className="text-2xl font-bold text-foreground">
                        ${weeklyPay.pay.toFixed(2)} {rateCurrency}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {weeklyPay.hours.toFixed(2)} hrs × ${userRate?.toFixed(2)}/hr
                      </div>
                    </>
                  ) : (
                    <div className="text-2xl font-bold text-muted-foreground">
                      No rate set
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Work Diary */}
        <Card className="backdrop-blur-xl bg-white/80 border-border/30 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Work diary</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8">
              {/* Calendar */}
              <Card className="backdrop-blur-xl bg-white/60 border-border/30 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDateChange(format(subDays(new Date(selectedDate), 7), 'yyyy-MM-dd'))}
                      className="h-8 w-8 hover:bg-accent/50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="text-lg font-semibold text-foreground">
                      {format(new Date(selectedDate), 'MMMM yyyy')}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDateChange(format(addDays(new Date(selectedDate), 7), 'yyyy-MM-dd'))}
                      className="h-8 w-8 hover:bg-accent/50"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Calendar Grid */}
                  <div className="space-y-2">
                    {/* Day headers */}
                    <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted-foreground mb-2">
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
                              "h-10 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-[1.02]",
                              isInCurrentWeek && !isSelected && "bg-luxury-gold/20 text-foreground hover:bg-luxury-gold/30 border border-luxury-gold/40",
                              isSelected && "bg-luxury-gold text-white shadow-md border-2 border-luxury-gold",
                              !isInCurrentWeek && "text-muted-foreground hover:bg-muted/50"
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
                        <div className="w-3 h-3 rounded-full bg-luxury-gold shadow-sm" />
                        <span className="text-muted-foreground font-medium">Tracked</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm" />
                        <span className="text-muted-foreground font-medium">Manual</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-rose-500 shadow-sm" />
                        <span className="text-muted-foreground font-medium">Overtime</span>
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
                        className="flex items-center gap-4 p-4 backdrop-blur-md bg-white/60 rounded-xl border border-border/30 hover:bg-white/80 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-200 cursor-pointer group"
                        onClick={() => handleDayClick(format(day, 'yyyy-MM-dd'))}
                      >
                        <div className="w-32 flex-shrink-0">
                          <div className="text-sm font-semibold text-foreground">
                            {format(day, 'd')} {format(day, 'EEEE')}
                          </div>
                        </div>
                        
                        <div className="flex-1 h-6 bg-muted/30 rounded-full overflow-hidden border border-border/20">
                          {dayEntries.length > 0 && (
                            <div 
                              className="h-full bg-gradient-to-r from-luxury-gold to-luxury-gold/80 group-hover:from-luxury-gold/90 group-hover:to-luxury-gold/70 transition-all duration-200"
                              style={{ width: `${Math.min((totalMinutes / 480) * 100, 100)}%` }}
                            />
                          )}
                        </div>
                        
                        <div className="w-24 text-right text-sm font-semibold text-foreground">
                          {timeString}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Day Detail Modal */}
        <Dialog open={isDayModalOpen} onOpenChange={setIsDayModalOpen}>
          <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto backdrop-blur-xl bg-white/95 border-border/30">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Calendar className="w-6 h-6 text-luxury-gold" />
                {modalDate && format(new Date(modalDate), 'EEEE, MMMM d, yyyy')}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              {modalDate && (
                <DayView
                  entries={timeEntries}
                  categoryColors={categoryColors}
                  selectedDate={modalDate}
                  onDateChange={(date) => {
                    setModalDate(date);
                    handleDateChange(date);
                  }}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};