import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Download, Filter, Plus, Clock, BarChart3, Users, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTimeTracking } from '@/hooks/useTimeTracking';
import { format, startOfWeek, endOfWeek, addDays, isSameDay, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { FloatingTimeTracker } from '@/components/FloatingTimeTracker';

const TimeSheetPage = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState('me');
  
  const {
    timeEntries,
    settings,
    loadTimeEntries,
    getDailyStats,
    loading
  } = useTimeTracking();

  // Load time entries for the current week
  useEffect(() => {
    const weekStart = startOfWeek(currentWeek);
    const weekEnd = endOfWeek(currentWeek);
    
    // Load entries for each day of the week
    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStart, i);
      loadTimeEntries(format(date, 'yyyy-MM-dd'));
    }
  }, [currentWeek, loadTimeEntries]);

  const getWeekDays = () => {
    const weekStart = startOfWeek(currentWeek);
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  };

  const getEntriesForDay = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return timeEntries.filter(entry => {
      if (!entry.start_time) return false;
      const entryDate = format(parseISO(entry.start_time), 'yyyy-MM-dd');
      return entryDate === dateString;
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  };

  const calculateDayTotal = (entries: any[]) => {
    return entries.reduce((total, entry) => {
      return total + (entry.duration || 0);
    }, 0);
  };

  const weekDays = getWeekDays();
  const weekTotal = weekDays.reduce((total, day) => {
    const dayEntries = getEntriesForDay(day);
    return total + calculateDayTotal(dayEntries);
  }, 0);

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + (direction === 'next' ? 7 : -7));
      return newDate;
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = settings?.category_colors || {};
    return colors[category] || '#6B7280';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading timesheet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/tasks" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium text-sm">Back to Tasks</span>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">TimeSheet</h1>
              <p className="text-muted-foreground">Track and manage your time entries</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="me">My Timesheet</SelectItem>
                <SelectItem value="team">Team View</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Week Navigation & Stats */}
        <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
                  ←
                </Button>
                <div className="text-center">
                  <CardTitle className="text-xl">
                    {format(startOfWeek(currentWeek), 'MMM d')} - {format(endOfWeek(currentWeek), 'MMM d, yyyy')}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Week {format(currentWeek, 'w')}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
                  →
                </Button>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{formatDuration(weekTotal)}</div>
                  <div className="text-sm text-muted-foreground">Total Hours</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{timeEntries.length}</div>
                  <div className="text-sm text-muted-foreground">Entries</div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Weekly Calendar Grid */}
        <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-7 gap-4">
              {weekDays.map((day, index) => {
                const dayEntries = getEntriesForDay(day);
                const dayTotal = calculateDayTotal(dayEntries);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <div key={index} className="min-h-[400px]">
                    {/* Day Header */}
                    <div className={cn(
                      "text-center p-3 rounded-t-lg border-b",
                      isToday ? "bg-primary text-primary-foreground" : "bg-muted/50"
                    )}>
                      <div className="font-semibold">{format(day, 'EEE')}</div>
                      <div className={cn(
                        "text-2xl font-bold",
                        isToday ? "text-primary-foreground" : "text-foreground"
                      )}>
                        {format(day, 'd')}
                      </div>
                      <div className={cn(
                        "text-xs",
                        isToday ? "text-primary-foreground/80" : "text-muted-foreground"
                      )}>
                        {formatDuration(dayTotal)}
                      </div>
                    </div>
                    
                    {/* Day Entries */}
                    <div className="border border-t-0 rounded-b-lg p-2 space-y-2 min-h-[350px] bg-card">
                      {dayEntries.length === 0 ? (
                        <div className="text-center text-muted-foreground text-sm py-8">
                          No entries
                        </div>
                      ) : (
                        dayEntries.map((entry, entryIndex) => (
                          <div
                            key={entryIndex}
                            className="p-3 rounded-lg border bg-white shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">
                                  {entry.task_activity}
                                </div>
                                {entry.project_name && (
                                  <div className="text-xs text-muted-foreground">
                                    {entry.project_name}
                                  </div>
                                )}
                              </div>
                              {entry.category && (
                                <Badge 
                                  variant="secondary" 
                                  className="text-xs"
                                  style={{ 
                                    backgroundColor: `${getCategoryColor(entry.category)}20`,
                                    color: getCategoryColor(entry.category)
                                  }}
                                >
                                  {entry.category}
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div>
                                {entry.start_time && format(parseISO(entry.start_time), 'HH:mm')}
                                {entry.end_time && ` - ${format(parseISO(entry.end_time), 'HH:mm')}`}
                              </div>
                              <div className="font-medium">
                                {formatDuration(entry.duration || 0)}
                              </div>
                            </div>
                            
                            {entry.notes && (
                              <div className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                                {entry.notes}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Summary</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(weekTotal)}</div>
              <p className="text-xs text-muted-foreground">
                Total time tracked this week
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Daily</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(Math.floor(weekTotal / 7))}</div>
              <p className="text-xs text-muted-foreground">
                Average hours per day
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{timeEntries.length}</div>
              <p className="text-xs text-muted-foreground">
                Time entries this week
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating Time Tracker */}
      <FloatingTimeTracker />
    </div>
  );
};

export default TimeSheetPage;