import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Timer, BarChart3 } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white">Loading time tracking data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white font-playfair mb-2">
              Time Management Dashboard
            </h1>
            <p className="text-white/70 font-helvetica">
              Track, analyze, and optimize how you spend your time
            </p>
          </div>
          <TimeTrackingSettings
            settings={settings}
            onUpdateSettings={updateSettings}
            onExportData={handleExportData}
          />
        </div>

        {/* Daily Summary */}
        <DailySummary stats={dailyStats} />

        {/* Main Tabs */}
        <Tabs defaultValue="tracking" className="space-y-6">
          <TabsList className="bg-white/10 border-white/20 backdrop-blur-xl">
            <TabsTrigger 
              value="tracking" 
              className="data-[state=active]:bg-white/20 text-white font-helvetica"
            >
              <Timer className="w-4 h-4 mr-2" />
              Time Tracking
            </TabsTrigger>
            <TabsTrigger 
              value="timeline" 
              className="data-[state=active]:bg-white/20 text-white font-helvetica"
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
      </div>
    </div>
  );
};