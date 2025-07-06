import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Timer, BarChart3, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTimeTracking, DEFAULT_CATEGORY_COLORS } from '@/hooks/useTimeTracking';
import { TimeTrackingTable } from '@/components/time-tracking/TimeTrackingTable';
import { TimelineView } from '@/components/time-tracking/TimelineView';
import { DailySummary } from '@/components/time-tracking/DailySummary';
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
    createTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    duplicateTimeEntry,
    updateSettings,
    getDailyStats
  } = useTimeTracking();

  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedProject, setSelectedProject] = useState('all');

  useEffect(() => {
    loadTimeEntries(selectedDate);
  }, [selectedDate]);

  const handleDateFilter = (date: string) => {
    setSelectedDate(date);
    loadTimeEntries(date);
  };

  const handleProjectFilter = (project: string) => {
    setSelectedProject(project);
    // Filter logic would go here if needed
  };

  const handleExportData = (format: 'csv' | 'pdf') => {
    // Export functionality would be implemented here
    console.log(`Exporting data as ${format}`);
  };

  const categoryColors = settings?.category_colors || DEFAULT_CATEGORY_COLORS;
  const todayEntries = timeEntries.filter(entry => {
    const entryDate = format(new Date(entry.start_time), 'yyyy-MM-dd');
    return entryDate === selectedDate;
  });
  
  const dailyStats = getDailyStats(todayEntries);

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
                onClick={() => onNavigate('home')}
                className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 hover:bg-white/40 backdrop-blur-sm transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-medium">Back</span>
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
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Daily Summary */}
          <DailySummary stats={dailyStats} />

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