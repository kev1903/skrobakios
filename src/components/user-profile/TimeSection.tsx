import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Timer, BarChart3, Clock, Target, Award, List } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useTimeTracking, DEFAULT_CATEGORY_COLORS } from '@/hooks/useTimeTracking';
import { TimeTrackingTable } from '@/components/time-tracking/TimeTrackingTable';
import { TimelineView } from '@/components/time-tracking/TimelineView';
import { TimeTrackingSettings } from '@/components/time-tracking/TimeTrackingSettings';

interface TimeSectionProps {
  onNavigate?: (page: string) => void;
}

export const TimeSection = ({ onNavigate }: TimeSectionProps) => {
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

  useEffect(() => {
    loadTimeEntries(selectedDate);
  }, [selectedDate]);

  const handleDateFilter = (date: string) => {
    setSelectedDate(date);
    loadTimeEntries(date);
  };

  const handleProjectFilter = (project: string) => {
    // Filter logic would go here if needed
  };

  const handleExportData = (format: 'csv' | 'pdf') => {
    console.log(`Exporting data as ${format}`);
  };

  const categoryColors = settings?.category_colors || DEFAULT_CATEGORY_COLORS;
  const todayEntries = timeEntries.filter(entry => {
    const entryDate = format(new Date(entry.start_time), 'yyyy-MM-dd');
    return entryDate === selectedDate;
  });
  
  const dailyStats = getDailyStats(todayEntries);

  const formatHours = (hours: number) => {
    return hours === 1 ? '1 hour' : `${hours} hours`;
  };

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6">
          <div className="text-center py-12">
            <div className="text-white/70">Loading time tracking data...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Settings */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Time Management Dashboard</h2>
        <TimeTrackingSettings
          settings={settings}
          onUpdateSettings={updateSettings}
          onExportData={handleExportData}
        />
      </div>

      {/* Daily Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Hours */}
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">
              Total Hours
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatHours(dailyStats.totalHours)}
            </div>
            <p className="text-xs text-white/60">
              Tracked today
            </p>
          </CardContent>
        </Card>

        {/* Productive Hours */}
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">
              Productive Hours
            </CardTitle>
            <Target className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {formatHours(dailyStats.productiveHours)}
            </div>
            <div className="mt-2">
              <Progress 
                value={dailyStats.totalHours > 0 ? (dailyStats.productiveHours / dailyStats.totalHours) * 100 : 0}
                className="h-2"
              />
            </div>
            <p className="text-xs text-white/60 mt-2">
              {dailyStats.totalHours > 0 
                ? `${Math.round((dailyStats.productiveHours / dailyStats.totalHours) * 100)}% of total time`
                : 'No time tracked yet'
              }
            </p>
          </CardContent>
        </Card>

        {/* Focus Score */}
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">
              Focus Score
            </CardTitle>
            <Award className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {dailyStats.focusScore}%
            </div>
            <div className="mt-2">
              <Progress 
                value={dailyStats.focusScore}
                className="h-2"
              />
            </div>
            <p className="text-xs text-white/60 mt-2">
              Time spent in deep work
            </p>
          </CardContent>
        </Card>

        {/* Entry Count */}
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">
              Time Entries
            </CardTitle>
            <List className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {dailyStats.entryCount}
            </div>
            <p className="text-xs text-white/60">
              Logged today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-xl">
        <CardContent className="p-6">
          <Tabs defaultValue="tracking" className="space-y-6">
            <TabsList className="backdrop-blur-xl bg-white/20 border border-white/20 shadow-sm">
              <TabsTrigger 
                value="tracking" 
                className="data-[state=active]:bg-white/30 data-[state=active]:shadow-sm text-white/80 font-medium"
              >
                <Timer className="w-4 h-4 mr-2" />
                Time Tracking
              </TabsTrigger>
              <TabsTrigger 
                value="timeline" 
                className="data-[state=active]:bg-white/30 data-[state=active]:shadow-sm text-white/80 font-medium"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Timeline View
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tracking" className="space-y-6">
              <TimeTrackingTable
                entries={timeEntries}
                activeTimer={activeTimer}
                onStartTimer={startTimer}
                onStopTimer={stopTimer}
                onUpdateEntry={updateTimeEntry}
                onDeleteEntry={deleteTimeEntry}
                onDuplicateEntry={duplicateTimeEntry}
                categoryColors={categoryColors}
              />
            </TabsContent>

            <TabsContent value="timeline" className="space-y-6">
              <TimelineView
                entries={timeEntries}
                categoryColors={categoryColors}
                onDateFilter={handleDateFilter}
                onProjectFilter={handleProjectFilter}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};