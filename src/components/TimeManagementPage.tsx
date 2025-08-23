import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Timer, BarChart3, ArrowLeft, Clock, Target, Award, List, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useTimeTracking, DEFAULT_CATEGORY_COLORS } from '@/hooks/useTimeTracking';
import { TimeTrackingTable } from '@/components/time-tracking/TimeTrackingTable';
import { TimelineView } from '@/components/time-tracking/TimelineView';
import { TimeTrackingSettings } from '@/components/time-tracking/TimeTrackingSettings';

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
      <div className="h-full flex items-center justify-center">
        <div className="text-slate-600">Loading time tracking data...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="relative backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border-b border-white/20 dark:border-slate-700/20 shadow-sm">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('settings')}
                className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 hover:bg-white/40 backdrop-blur-sm transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-medium">Back to Profile</span>
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">
                  Time Management Dashboard
                </h1>
                <p className="text-sm text-slate-500 mt-1">Track, analyze, and optimize how you spend your time</p>
              </div>
            </div>
            <TimeTrackingSettings
              settings={settings}
              onUpdateSettings={updateSettings}
              onExportData={handleExportData}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-8 h-full overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Daily Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Hours */}
            <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">
                  Total Hours
                </CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-800">
                  {formatHours(dailyStats.totalHours)}
                </div>
                <p className="text-xs text-slate-500">
                  Tracked today
                </p>
              </CardContent>
            </Card>

            {/* Productive Hours */}
            <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">
                  Productive Hours
                </CardTitle>
                <Target className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-800">
                  {formatHours(dailyStats.productiveHours)}
                </div>
                <div className="mt-2">
                  <Progress 
                    value={dailyStats.totalHours > 0 ? (dailyStats.productiveHours / dailyStats.totalHours) * 100 : 0}
                    className="h-2"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {dailyStats.totalHours > 0 
                    ? `${Math.round((dailyStats.productiveHours / dailyStats.totalHours) * 100)}% of total time`
                    : 'No time tracked yet'
                  }
                </p>
              </CardContent>
            </Card>

            {/* Focus Score */}
            <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">
                  Focus Score
                </CardTitle>
                <Award className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-800">
                  {dailyStats.focusScore}%
                </div>
                <div className="mt-2">
                  <Progress 
                    value={dailyStats.focusScore}
                    className="h-2"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Time spent in deep work
                </p>
              </CardContent>
            </Card>

            {/* Entry Count */}
            <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700">
                  Time Entries
                </CardTitle>
                <List className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-800">
                  {dailyStats.entryCount}
                </div>
                <p className="text-xs text-slate-500">
                  Logged today
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Tabs */}
          <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-xl">
            <CardContent className="p-6">
              <Tabs defaultValue="tracking" className="space-y-6">
                <TabsList className="backdrop-blur-xl bg-white/60 border border-white/20 shadow-sm">
                  <TabsTrigger 
                    value="tracking" 
                    className="data-[state=active]:bg-white/80 data-[state=active]:shadow-sm text-slate-700 font-medium"
                  >
                    <Timer className="w-4 h-4 mr-2" />
                    Time Tracking
                  </TabsTrigger>
                  <TabsTrigger 
                    value="timeline" 
                    className="data-[state=active]:bg-white/80 data-[state=active]:shadow-sm text-slate-700 font-medium"
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
      </div>
    </div>
  );
};