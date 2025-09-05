import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, BarChart3, List, Plus, Search, Filter, Calendar as CalendarIcon, Clock, User, AlertCircle } from 'lucide-react';
import { useTimeTracking, TimeEntry, DEFAULT_CATEGORY_COLORS } from '@/hooks/useTimeTracking';
import { useCentralTasks } from '@/hooks/useCentralTasks';
import { format, isToday, isYesterday, isThisWeek, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { useScreenSize } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TimelineListView } from './TimelineListView';
import { ProfessionalTimelineView } from './ProfessionalTimelineView';
import { TimelineFilters } from './TimelineFilters';

interface ModernTimelineViewProps {
  projectId: string;
  projectName: string;
  companyId?: string;
}

export const ModernTimelineView = ({ projectId, projectName, companyId }: ModernTimelineViewProps) => {
  // Fixed: Removed dateRange functionality completely
  const [viewMode, setViewMode] = useState<'list' | 'gantt'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'duration' | 'category' | 'project'>('date');
  const [groupBy, setGroupBy] = useState<'none' | 'category' | 'project' | 'date'>('date');

  const screenSize = useScreenSize();
  const { timeEntries, loading, getDailyStats } = useTimeTracking();
  const { tasks, loading: tasksLoading, updateTask } = useCentralTasks(projectId, companyId || '');

  // Sample tasks for development/testing
  const sampleTasks = [
    {
      id: '1',
      project_id: projectId,
      company_id: companyId || '',
      name: 'Research',
      description: 'Market research and analysis',
      stage: 'Research',
      level: 0,
      start_date: '2024-03-25',
      end_date: '2024-04-02',
      duration: 10,
      progress: 70,
      budgeted_cost: 5000,
      actual_cost: 3500,
      is_expanded: true,
      dependencies: [],
      linked_tasks: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      assigned_to: 'John'
    },
    {
      id: '2',
      project_id: projectId,
      company_id: companyId || '',
      name: 'Market Research',
      description: 'Detailed market analysis',
      stage: 'Research',
      level: 1,
      parent_id: '1',
      start_date: '2024-03-25',
      end_date: '2024-03-27',
      duration: 7,
      progress: 80,
      budgeted_cost: 2000,
      actual_cost: 1600,
      is_expanded: false,
      dependencies: [],
      linked_tasks: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      assigned_to: 'Sarah'
    },
    {
      id: '3',
      project_id: projectId,
      company_id: companyId || '',
      name: 'Design',
      description: 'UI/UX Design phase',
      stage: 'Design',
      level: 0,
      start_date: '2024-03-28',
      end_date: '2024-04-15',
      duration: 14,
      progress: 50,
      budgeted_cost: 8000,
      actual_cost: 4000,
      is_expanded: true,
      dependencies: [],
      linked_tasks: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      assigned_to: 'Alex'
    },
    {
      id: '4',
      project_id: projectId,
      company_id: companyId || '',
      name: 'Wireframing',
      description: 'Create wireframes',
      stage: 'Design',
      level: 1,
      parent_id: '3',
      start_date: '2024-03-28',
      end_date: '2024-04-05',
      duration: 5,
      progress: 100,
      budgeted_cost: 3000,
      actual_cost: 3000,
      is_expanded: false,
      dependencies: [],
      linked_tasks: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      assigned_to: 'Emma'
    },
    {
      id: '5',
      project_id: projectId,
      company_id: companyId || '',
      name: 'Development',
      description: 'Development phase',
      stage: 'Development',
      level: 0,
      start_date: '2024-04-01',
      end_date: '2024-05-15',
      duration: 15,
      progress: 70,
      budgeted_cost: 15000,
      actual_cost: 10500,
      is_expanded: true,
      dependencies: [],
      linked_tasks: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      assigned_to: 'Mike'
    },
    {
      id: '6',
      project_id: projectId,
      company_id: companyId || '',
      name: 'HTML Coding',
      description: 'Frontend development',
      stage: 'Development',
      level: 1,
      parent_id: '5',
      start_date: '2024-04-01',
      end_date: '2024-04-14',
      duration: 14,
      progress: 100,
      budgeted_cost: 7000,
      actual_cost: 7000,
      is_expanded: false,
      dependencies: [],
      linked_tasks: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      assigned_to: 'Lisa'
    }
  ];

  // Use sample tasks if no real tasks are available
  const displayTasks = tasks.length > 0 ? tasks : sampleTasks;

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

    return true;
  });

  // Get unique categories and projects for filters
  const availableCategories = Array.from(new Set(timeEntries.map(entry => entry.category)));
  const availableProjects = Array.from(new Set(timeEntries.map(entry => entry.project_name).filter(Boolean))) as string[];

  // Calculate stats
  const stats = getDailyStats(filteredEntries);
  const totalDuration = filteredEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);

  if (loading || tasksLoading) {
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
    <div className="space-y-6 bg-slate-50 min-h-full p-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{projectName} Timeline</h1>
            <p className="text-slate-600">Track and visualize project activities</p>
          </div>
        </div>

        {/* View Toggle and Controls */}
        <div className="flex items-center justify-between">
          <div></div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="Search activities"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 h-9 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Sort by</span>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-24 h-9 border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="duration">Duration</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* List/Gantt Toggle - Clean professional buttons */}
            <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={cn(
                  "h-8 px-4 text-sm font-medium rounded-md transition-all",
                  viewMode === 'list' 
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                )}
              >
                <List className="w-4 h-4 mr-2" />
                List View
              </Button>
              <Button
                variant={viewMode === 'gantt' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('gantt')}
                className={cn(
                  "h-8 px-4 text-sm font-medium rounded-md transition-all",
                  viewMode === 'gantt' 
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                )}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Gantt View
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
        <div className="p-0">
          {viewMode === 'list' ? (
            <TimelineListView
              entries={filteredEntries}
              categoryColors={DEFAULT_CATEGORY_COLORS}
              groupBy={groupBy}
              sortBy={sortBy}
              screenSize={screenSize}
            />
          ) : (
            <div className="h-full">
              <ProfessionalTimelineView
                tasks={displayTasks}
                onTaskUpdate={updateTask}
                screenSize={screenSize}
              />
            </div>
          )}
        </div>
      </div>

      {/* Empty State */}
      {filteredEntries.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
          <div className="p-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center">
                <Calendar className="w-8 h-8 text-slate-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">No timeline entries found</h3>
                <p className="text-slate-600">Start tracking your time to see your project timeline here</p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create First Entry
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};