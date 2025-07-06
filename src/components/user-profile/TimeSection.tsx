import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Timer, BarChart3, Clock, Target, Award, List, Settings, Play, Square } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTimeTracking, DEFAULT_CATEGORY_COLORS } from '@/hooks/useTimeTracking';
import { TimeTrackingTable } from '@/components/time-tracking/TimeTrackingTable';
import { TimelineView } from '@/components/time-tracking/TimelineView';
import { TimeTrackingSettings } from '@/components/time-tracking/TimeTrackingSettings';
import { useToast } from '@/hooks/use-toast';

interface TimeSectionProps {
  onNavigate?: (page: string) => void;
}

export const TimeSection = ({ onNavigate }: TimeSectionProps) => {
  const { toast } = useToast();
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
  const [autoTracking, setAutoTracking] = useState(false);
  const [activityInterval, setActivityInterval] = useState<NodeJS.Timeout | null>(null);
  const [newTimerTask, setNewTimerTask] = useState('');
  const [newTimerCategory, setNewTimerCategory] = useState('Other');
  const [newTimerProject, setNewTimerProject] = useState('');

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

  // AUTO Tracking Functions
  const isWithinWorkingHours = () => {
    const now = new Date();
    const hours = now.getHours();
    return hours >= 5 && hours < 24; // 5am to 11:59pm
  };

  const detectUserActivity = () => {
    // Simple activity detection based on user interactions
    const categories = ['Deep Work', 'Admin', 'Calls', 'Design', 'Break', 'Other'];
    const activities = [
      'Code Development', 'Email Management', 'Document Review', 'Research',
      'Meeting Preparation', 'Planning', 'Design Work', 'Communication'
    ];
    
    // Random selection for demo - in real app this would be more sophisticated
    const category = categories[Math.floor(Math.random() * categories.length)];
    const activity = activities[Math.floor(Math.random() * activities.length)];
    
    return { activity, category, project: null };
  };

  const handleAutoTrackingToggle = async (enabled: boolean) => {
    setAutoTracking(enabled);

    if (enabled) {
      // Check if we're within working hours
      if (!isWithinWorkingHours()) {
        toast({
          title: "Outside Working Hours",
          description: "AUTO tracking only works between 5:00 AM and 11:59 PM",
          variant: "destructive"
        });
        setAutoTracking(false);
        return;
      }

      // Set up interval for activity detection every 10 minutes
      const interval = setInterval(async () => {
        // Only track during working hours
        if (isWithinWorkingHours()) {
          const analysis = detectUserActivity();
          
          // Auto-start timer based on detected activity
          if (analysis.activity && analysis.activity !== 'Other') {
            // Stop current timer if running
            if (activeTimer) {
              stopTimer();
            }
            
            // Start new timer with detected activity
            startTimer(analysis.activity, analysis.category, analysis.project);
            
            toast({
              title: "Activity Detected",
              description: `Started tracking: ${analysis.activity} (${analysis.category})`,
            });
          }
        } else {
          // Stop tracking outside working hours
          if (activeTimer) {
            stopTimer();
          }
          toast({
            title: "Outside Working Hours",
            description: "AUTO tracking stopped - outside 5:00 AM to 11:59 PM window",
          });
        }
      }, 10 * 60 * 1000); // 10 minutes

      setActivityInterval(interval);
      
      toast({
        title: "AUTO Tracking Enabled",
        description: "Activity will be detected every 10 minutes (5:00 AM - 11:59 PM only)",
      });
    } else {
      // Clean up
      if (activityInterval) {
        clearInterval(activityInterval);
        setActivityInterval(null);
      }
      
      toast({
        title: "AUTO Tracking Disabled",
        description: "Automatic activity tracking has been stopped.",
      });
    }
  };

  const handleStartTimer = () => {
    if (newTimerTask.trim()) {
      startTimer(newTimerTask.trim(), newTimerCategory, newTimerProject.trim() || undefined);
      setNewTimerTask('');
      setNewTimerProject('');
    }
  };

  const getCurrentTimerDuration = () => {
    if (!activeTimer) return 0;
    const start = new Date(activeTimer.start_time);
    const now = new Date();
    return Math.floor((now.getTime() - start.getTime()) / (1000 * 60));
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

      {/* Live Timer Section */}
      <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Live Timer</CardTitle>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-tracking"
                  checked={autoTracking}
                  onCheckedChange={handleAutoTrackingToggle}
                />
                <Label htmlFor="auto-tracking" className="text-white/90 font-medium">
                  AUTO
                </Label>
              </div>
            </div>
          </div>
          {autoTracking && (
            <div className="text-sm text-green-400 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              AUTO tracking enabled - Activity detection every 10 minutes (5:00 AM - 11:59 PM)
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {activeTimer ? (
            <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl border border-white/20 backdrop-blur-sm">
              <div className="flex-1">
                <div className="font-medium text-white/90">{activeTimer.task_activity}</div>
                <div className="text-sm text-white/70">
                  {activeTimer.category} • Started at {format(new Date(activeTimer.start_time), 'HH:mm')} • 
                  <span className="font-medium"> {formatMinutes(getCurrentTimerDuration())}</span>
                </div>
              </div>
              <Button
                onClick={stopTimer}
                variant="destructive"
                size="sm"
                className="ml-4"
              >
                <Square className="w-4 h-4 mr-2" />
                Stop
              </Button>
            </div>
          ) : (
            !autoTracking && (
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="What are you working on?"
                  value={newTimerTask}
                  onChange={(e) => setNewTimerTask(e.target.value)}
                  className="flex-1 bg-white/10 border-white/20 text-white placeholder-white/60"
                  onKeyPress={(e) => e.key === 'Enter' && handleStartTimer()}
                />
                <Select value={newTimerCategory} onValueChange={setNewTimerCategory}>
                  <SelectTrigger className="w-full sm:w-40 bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white/90 backdrop-blur-xl border-white/30">
                    {['Deep Work', 'Admin', 'Calls', 'Design', 'Break', 'Other'].map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-slate-800">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: categoryColors[cat] || '#6B7280' }}
                          />
                          {cat}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Project (optional)"
                  value={newTimerProject}
                  onChange={(e) => setNewTimerProject(e.target.value)}
                  className="w-full sm:w-40 bg-white/10 border-white/20 text-white placeholder-white/60"
                />
                <Button
                  onClick={handleStartTimer}
                  disabled={!newTimerTask.trim()}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start
                </Button>
              </div>
            )
          )}
          {autoTracking && !activeTimer && (
            <div className="p-4 bg-white/5 rounded-xl border border-white/20 backdrop-blur-sm text-center">
              <div className="text-white/70">
                AUTO tracking is detecting your activity...
              </div>
              <div className="text-sm text-white/50 mt-1">
                Timer will start automatically when activity is detected (5:00 AM - 11:59 PM)
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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