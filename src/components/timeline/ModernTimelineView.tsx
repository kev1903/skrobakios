import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, BarChart3, List, Plus, Search, Filter, Calendar as CalendarIcon, Clock, User, AlertCircle } from 'lucide-react';
import { useTimeTracking, TimeEntry, DEFAULT_CATEGORY_COLORS } from '@/hooks/useTimeTracking';
import { format, isToday, isYesterday, isThisWeek, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { useScreenSize } from '@/hooks/use-mobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TimelineListView } from './TimelineListView';
import { TimelineGanttView } from './TimelineGanttView';
import { TimelineFilters } from './TimelineFilters';
import { TimelineStats } from './TimelineStats';

interface ModernTimelineViewProps {
  projectId: string;
  projectName: string;
  companyId?: string;
}

export const ModernTimelineView = ({ projectId, projectName, companyId }: ModernTimelineViewProps) => {
  const [viewMode, setViewMode] = useState<'list' | 'gantt'>('list');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'custom'>('week');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'duration' | 'category' | 'project'>('date');
  const [groupBy, setGroupBy] = useState<'none' | 'category' | 'project' | 'date'>('date');

  const screenSize = useScreenSize();
  const { timeEntries, loading, getDailyStats } = useTimeTracking();

  // Filter and process entries
  const filteredEntries = timeEntries.filter(entry => {
    // Search filter
    if (searchQuery && !entry.task_activity.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !entry.category.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !entry.project_name?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Category filter
    if (selectedCategories.length > 0 && !selectedCategories.includes(entry.category)) {
      return false;
    }

    // Project filter
    if (selectedProjects.length > 0 && entry.project_name && !selectedProjects.includes(entry.project_name)) {
      return false;
    }

    // Date range filter
    const entryDate = new Date(entry.start_time);
    const now = new Date();
    
    switch (dateRange) {
      case 'today':
        return isToday(entryDate);
      case 'week':
        return entryDate >= startOfWeek(now) && entryDate <= endOfWeek(now);
      case 'month':
        return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear();
      default:
        return true;
    }
  });

  // Get unique categories and projects for filters
  const availableCategories = Array.from(new Set(timeEntries.map(entry => entry.category)));
  const availableProjects = Array.from(new Set(timeEntries.map(entry => entry.project_name).filter(Boolean))) as string[];

  // Calculate stats
  const stats = getDailyStats(filteredEntries);
  const totalDuration = filteredEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{projectName} Timeline</h1>
            <p className="text-muted-foreground">Track and visualize project activities</p>
          </div>
          <Button className="bg-gradient-primary hover:opacity-90 text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Entry
          </Button>
        </div>

        {/* Stats Overview */}
        <TimelineStats
          totalEntries={filteredEntries.length}
          totalDuration={totalDuration}
          stats={stats}
          screenSize={screenSize}
        />
      </div>

      {/* Filters and Controls */}
      <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-xl">
        <CardContent className="p-4">
          <div className="flex flex-col space-y-4">
            {/* View Mode Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="transition-all duration-200"
                >
                  <List className="w-4 h-4 mr-2" />
                  List View
                </Button>
                <Button
                  variant={viewMode === 'gantt' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('gantt')}
                  className="transition-all duration-200"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Gantt View
                </Button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 bg-white/20 border-white/30"
                />
              </div>
            </div>

            {/* Filters */}
            <TimelineFilters
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              selectedCategories={selectedCategories}
              onCategoriesChange={setSelectedCategories}
              selectedProjects={selectedProjects}
              onProjectsChange={setSelectedProjects}
              availableCategories={availableCategories}
              availableProjects={availableProjects}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              groupBy={groupBy}
              onGroupByChange={setGroupBy}
              screenSize={screenSize}
            />
          </div>
        </CardContent>
      </Card>

      {/* Timeline Content */}
      <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardContent className="p-0">
          {viewMode === 'list' ? (
            <TimelineListView
              entries={filteredEntries}
              categoryColors={DEFAULT_CATEGORY_COLORS}
              groupBy={groupBy}
              sortBy={sortBy}
              screenSize={screenSize}
            />
          ) : (
            <TimelineGanttView
              entries={filteredEntries}
              categoryColors={DEFAULT_CATEGORY_COLORS}
              dateRange={dateRange}
              screenSize={screenSize}
            />
          )}
        </CardContent>
      </Card>

      {/* Empty State */}
      {filteredEntries.length === 0 && (
        <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-xl">
          <CardContent className="p-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                <Calendar className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">No timeline entries found</h3>
                <p className="text-muted-foreground">Start tracking your time to see your project timeline here</p>
              </div>
              <Button className="bg-gradient-primary hover:opacity-90 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create First Entry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};