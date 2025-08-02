import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Download, Filter, Plus, Clock, BarChart3, Users, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTimeTracking } from '@/contexts/TimeTrackingContext';
import { format, startOfWeek, endOfWeek, addDays, isSameDay, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { useTimerBarSpacing } from '@/hooks/useTimerBarSpacing';

const TimeSheetPage = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState('me');
  const { spacingClasses, minHeightClasses } = useTimerBarSpacing();
  
  const {
    timeEntries,
    settings,
    loadTimeEntries,
    getDailyStats,
    loading
  } = useTimeTracking();

  // Load time entries for the current week (optimized)
  useEffect(() => {
    const weekStart = startOfWeek(currentWeek);
    const weekEnd = endOfWeek(currentWeek);
    
    // Load all entries for the week range in a single request
    loadTimeEntries(format(weekStart, 'yyyy-MM-dd'), format(weekEnd, 'yyyy-MM-dd'));
  }, [currentWeek, loadTimeEntries]);

  // Memoize week days calculation to avoid recalculating on every render
  const weekDays = React.useMemo(() => {
    const weekStart = startOfWeek(currentWeek);
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [currentWeek]);

  const getEntriesForDay = React.useCallback((date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return timeEntries.filter(entry => {
      if (!entry.start_time) return false;
      
      // Only show logged/completed entries (not running entries)
      const isLogged = entry.status === 'completed' || 
                      (entry.end_time && entry.duration !== null && entry.duration > 0);
      if (!isLogged) return false;
      
      const entryDate = format(parseISO(entry.start_time), 'yyyy-MM-dd');
      return entryDate === dateString;
    });
  }, [timeEntries]);

  const formatDuration = React.useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  }, []);

  const calculateDayTotal = React.useCallback((entries: any[]) => {
    return entries.reduce((total, entry) => {
      return total + (entry.duration || 0);
    }, 0);
  }, []);

  // Memoize week total calculation
  const weekTotal = React.useMemo(() => {
    return weekDays.reduce((total, day) => {
      const dayEntries = getEntriesForDay(day);
      return total + calculateDayTotal(dayEntries);
    }, 0);
  }, [weekDays, getEntriesForDay, calculateDayTotal]);

  const navigateWeek = React.useCallback((direction: 'prev' | 'next') => {
    setCurrentWeek(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + (direction === 'next' ? 7 : -7));
      return newDate;
    });
  }, []);

  const getCategoryColor = React.useCallback((category: string) => {
    const colors = settings?.category_colors || {};
    return colors[category] || '#6B7280';
  }, [settings]);

  // Generate time slots for the week (24 hours in 30-minute slots) - memoized for performance
  const timeSlots = React.useMemo(() => {
    const slots = [];
    
    // Generate 48 30-minute slots (24 hours × 2)
    for (let slotIndex = 0; slotIndex < 48; slotIndex++) {
      const hour = Math.floor(slotIndex / 2);
      const minutes = (slotIndex % 2) * 30;
      
      // Create a proper date object for time formatting
      const timeDate = new Date();
      timeDate.setHours(hour, minutes, 0, 0);
      const timeLabel = format(timeDate, 'HH:mm');
      
      slots.push({
        hour: slotIndex,
        label: timeLabel,
        actualHour: hour,
        actualMinutes: minutes
      });
    }
    return slots;
  }, []);

  const getEntriesForTimeSlot = React.useCallback((day: Date, slotHour: number, slotMinutes: number) => {
    const dayEntries = getEntriesForDay(day);
    return dayEntries.filter(entry => {
      if (!entry.start_time) return false;
      const entryDate = parseISO(entry.start_time);
      const entryHour = entryDate.getHours();
      const entryMinutes = entryDate.getMinutes();
      
      return entryHour === slotHour && 
             ((slotMinutes === 0 && entryMinutes >= 0 && entryMinutes < 30) ||
              (slotMinutes === 30 && entryMinutes >= 30 && entryMinutes < 60));
    });
  }, [timeEntries]);

  const getCurrentTime = () => new Date();

  if (loading) {
    return (
      <div className={cn("bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center", minHeightClasses, spacingClasses)}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading timesheet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100", minHeightClasses, spacingClasses)}>
      <div className="flex h-full">
        {/* Main Content Area */}
        <div className="flex-1 p-4">
          <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link to="/tasks" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium text-sm">Back to Tasks</span>
            </Link>
            
            <div className="h-4 w-px bg-gray-300 mx-1"></div>
            
            <div>
              <h1 className="text-xl font-bold text-gray-900">TimeSheet</h1>
              <p className="text-gray-600 text-xs">Track and manage your time entries</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger className="w-[140px] h-8 text-sm">
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="me">My Timesheet</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-1 h-8 text-xs">
              <Filter className="w-3 h-3" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="gap-1 h-8 text-xs">
              <Download className="w-3 h-3" />
              Export
            </Button>
          </div>
        </div>

        {/* Week Navigation & Stats - Compact */}
        <Card className="bg-white/70 backdrop-blur-xl border border-gray-200/50 shadow-sm mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentWeek(new Date(currentWeek.getTime() - 7 * 24 * 60 * 60 * 1000))}
                    className="h-7 w-7 p-0"
                  >
                    ←
                  </Button>
                  <div className="text-center min-w-[160px]">
                    <div className="font-semibold text-sm">
                      {format(startOfWeek(currentWeek), 'MMM d')} - {format(endOfWeek(currentWeek), 'MMM d, yyyy')}
                    </div>
                    <div className="text-xs text-gray-500">Week {format(currentWeek, 'w')}</div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentWeek(new Date(currentWeek.getTime() + 7 * 24 * 60 * 60 * 1000))}
                    className="h-7 w-7 p-0"
                  >
                    →
                  </Button>
                </div>
                
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="font-medium text-lg">0:00</span>
                    <span className="text-gray-500 text-xs">Total Hours</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium">1</span>
                    <span className="text-gray-500 text-xs">Entries</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Calendar Grid with Time Column */}
        <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
          <CardContent className="p-6">
            <div className="h-full flex flex-col bg-gradient-to-br from-background via-background to-muted/20 rounded-xl border border-border/30 shadow-lg overflow-hidden">
              {/* Day Headers Row */}
              <div className="grid grid-cols-8 gap-1 border-b border-border/30 bg-gradient-to-r from-muted/30 to-muted/10 backdrop-blur-sm p-2">
                <div className="p-3 text-center text-muted-foreground font-medium text-sm min-w-[100px] bg-card/50 rounded-lg border border-border/20">
                  Time
                </div>
                {weekDays.map((day, index) => {
                  const dayEntries = getEntriesForDay(day);
                  const dayTotal = calculateDayTotal(dayEntries);
                  const isToday = isSameDay(day, new Date());
                  
                  return (
                    <div key={index} className={`p-3 text-center transition-all duration-200 rounded-lg border ${
                      isToday 
                        ? 'bg-gradient-to-b from-primary/20 to-primary/10 border-primary/30 shadow-md' 
                        : 'bg-card/50 border-border/20 hover:bg-card/70'
                    }`}>
                      <div className={`font-medium text-sm uppercase ${
                        isToday ? 'text-primary font-bold' : 'text-muted-foreground'
                      }`}>
                        {format(day, 'EEE')} {day.getDate()}
                      </div>
                      <div className={`text-xs mt-1 ${
                        isToday ? 'text-primary/80' : 'text-muted-foreground'
                      }`}>
                        {formatDuration(dayTotal)}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Time Grid */}
              <div className="grid grid-cols-8 gap-0 min-h-[800px] relative overflow-auto max-h-[800px]">
                {/* Time Column */}
                <div className="bg-gradient-to-b from-card/80 to-card/60 backdrop-blur-sm border-r border-border/30 min-w-[100px] shadow-inner relative">
                  {timeSlots.map((slot, index) => {
                    const isFullHour = slot.hour % 2 === 0;
                    const currentTime = getCurrentTime();
                    const isCurrentSlot = isSameDay(currentTime, currentWeek) &&
                                          slot.actualHour === currentTime.getHours() && 
                                          ((slot.actualMinutes === 0 && currentTime.getMinutes() >= 0 && currentTime.getMinutes() < 30) ||
                                           (slot.actualMinutes === 30 && currentTime.getMinutes() >= 30 && currentTime.getMinutes() < 60));
                    
                    return (
                      <div key={slot.hour} className={`h-6 border-b flex items-start justify-end pr-4 pt-1 transition-colors hover:bg-accent/20 ${
                        isFullHour ? 'border-b-border/30 bg-card/30' : 'border-b-border/10 bg-transparent'
                      } ${isCurrentSlot ? 'bg-primary/10 border-primary/20' : ''}`}>
                        <span className={`font-inter leading-tight ${
                          isFullHour ? 'text-xs font-medium text-foreground/80' : 'text-[10px] font-normal text-muted-foreground/70'
                        } ${isCurrentSlot ? 'text-primary font-semibold' : ''}`}>
                          {slot.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
                
                {/* Day Columns */}
                {weekDays.map((day, dayIndex) => {
                  const dayEntries = getEntriesForDay(day);
                  const hasLoggedEntries = dayEntries.length > 0;
                  
                  return (
                    <div key={dayIndex} className="border-r border-border/20 last:border-r-0 bg-background/30 relative">
                      {/* No entries message */}
                      {!hasLoggedEntries && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center text-muted-foreground">
                            <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <div className="text-xs">No logged entries</div>
                            <div className="text-[10px] opacity-60">Start tracking time to see entries here</div>
                          </div>
                        </div>
                      )}
                      
                      {timeSlots.map((slot, slotIndex) => {
                        const slotEntries = getEntriesForTimeSlot(day, slot.actualHour, slot.actualMinutes);
                        const isFullHour = slot.hour % 2 === 0;
                        
                        return (
                          <div 
                            key={slotIndex} 
                            className={`h-6 border-b relative ${
                              isFullHour ? 'border-b-border/30' : 'border-b-border/10'
                            } hover:bg-accent/10 transition-colors`}
                          >
                            {slotEntries.map((entry, entryIndex) => (
                              <div
                                key={entryIndex}
                                className="absolute inset-x-1 top-0.5 bottom-0.5 bg-white rounded shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
                                style={{
                                  backgroundColor: entry.category ? `${getCategoryColor(entry.category)}20` : 'rgba(255, 255, 255, 0.9)',
                                  borderColor: entry.category ? getCategoryColor(entry.category) : '#e5e7eb'
                                }}
                              >
                                <div className="px-2 py-1 text-xs truncate">
                                  <div className="font-medium text-foreground/90 truncate flex items-center gap-1">
                                    {entry.task_activity}
                                    <Badge variant="secondary" className="text-[8px] px-1 py-0 h-3 bg-green-100 text-green-700 border-green-200">
                                      ✓
                                    </Badge>
                                  </div>
                                  <div className="text-[10px] text-muted-foreground flex items-center justify-between">
                                    <span>
                                      {entry.start_time && format(parseISO(entry.start_time), 'HH:mm')}
                                      {entry.end_time && ` - ${format(parseISO(entry.end_time), 'HH:mm')}`}
                                    </span>
                                    <span className="font-medium">
                                      {formatDuration(entry.duration || 0)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
                
                {/* Current Time Indicator */}
                {isSameDay(getCurrentTime(), currentWeek) && (
                  <div 
                    className="absolute left-0 right-0 h-0.5 border-t-2 border-dotted border-blue-500 z-[1000] pointer-events-none"
                    style={{
                      top: `${(getCurrentTime().getHours() * 2 + getCurrentTime().getMinutes() / 30) * 24 + (getCurrentTime().getMinutes() % 30) / 30 * 24}px`
                    }}
                  >
                    <div className="absolute -left-2 -top-1 w-4 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                )}
              </div>
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
              <div className="text-2xl font-bold">
                {weekDays.reduce((total, day) => total + getEntriesForDay(day).length, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Logged entries this week
              </p>
            </CardContent>
          </Card>
        </div>
          </div>
        </div>
      </div>

      {/* Timer functionality now handled by TimerTopBar */}
    </div>
  );
};

export default TimeSheetPage;