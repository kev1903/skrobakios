import React, { useState } from 'react';
import { format, startOfDay, endOfDay } from 'date-fns';
import { Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TimeEntry } from '@/hooks/useTimeTracking';

interface TimelineViewProps {
  entries: TimeEntry[];
  categoryColors: Record<string, string>;
  onDateFilter: (date: string) => void;
  onProjectFilter: (project: string) => void;
}

export const TimelineView = ({ 
  entries, 
  categoryColors, 
  onDateFilter, 
  onProjectFilter 
}: TimelineViewProps) => {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedProject, setSelectedProject] = useState<string>('all');

  // Get unique projects from entries
  const projects = Array.from(new Set(
    entries
      .map(entry => entry.project_name)
      .filter(Boolean)
  )) as string[];

  // Filter entries for the selected date
  const dayEntries = entries.filter(entry => {
    const entryDate = format(new Date(entry.start_time), 'yyyy-MM-dd');
    return entryDate === selectedDate;
  });

  // Generate time slots for the timeline (9am to 7pm by default)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 19; hour++) {
      slots.push({
        hour,
        time: `${hour.toString().padStart(2, '0')}:00`,
        label: hour <= 12 ? `${hour}AM` : `${hour - 12}PM`
      });
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Position entries on timeline
  const getEntryPosition = (entry: TimeEntry) => {
    const startTime = new Date(entry.start_time);
    const startHour = startTime.getHours();
    const startMinute = startTime.getMinutes();
    
    // Calculate position as percentage from 9am (540 minutes from midnight)
    const startMinutes = startHour * 60 + startMinute;
    const baseMinutes = 9 * 60; // 9am in minutes
    const timelineMinutes = 10 * 60; // 10 hours (9am to 7pm)
    
    const top = Math.max(0, ((startMinutes - baseMinutes) / timelineMinutes) * 100);
    
    // Calculate height based on duration
    const duration = entry.duration || 0;
    const height = Math.max(2, (duration / timelineMinutes) * 100);
    
    return { top: `${top}%`, height: `${height}%` };
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    onDateFilter(date);
  };

  const handleProjectChange = (project: string) => {
    setSelectedProject(project);
    onProjectFilter(project);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="border-white/20 bg-white/10 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white font-playfair flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Timeline Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-white/70" />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="bg-white/10 border-white/20 text-white"
            />
          </div>
          
          <Select value={selectedProject} onValueChange={handleProjectChange}>
            <SelectTrigger className="w-full sm:w-48 bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Filter by project" />
            </SelectTrigger>
            <SelectContent className="bg-black/90 border-white/20">
              <SelectItem value="all" className="text-white">All Projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project} value={project} className="text-white">
                  {project}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card className="border-white/20 bg-white/10 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white font-playfair">
            Timeline for {format(new Date(selectedDate), 'MMMM dd, yyyy')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative h-[600px] overflow-auto">
            {/* Time labels */}
            <div className="absolute left-0 top-0 w-16 h-full">
              {timeSlots.map((slot, index) => (
                <div
                  key={slot.hour}
                  className="absolute text-xs text-white/70 font-helvetica"
                  style={{ top: `${(index / (timeSlots.length - 1)) * 100}%` }}
                >
                  {slot.label}
                </div>
              ))}
            </div>

            {/* Timeline background */}
            <div className="ml-20 relative h-full border-l border-white/20">
              {/* Hour lines */}
              {timeSlots.map((_, index) => (
                <div
                  key={index}
                  className="absolute w-full border-t border-white/10"
                  style={{ top: `${(index / (timeSlots.length - 1)) * 100}%` }}
                />
              ))}

              {/* Time entries */}
              <TooltipProvider>
                {dayEntries.map((entry) => {
                  const position = getEntryPosition(entry);
                  const bgColor = categoryColors[entry.category] || '#6B7280';
                  
                  return (
                    <Tooltip key={entry.id}>
                      <TooltipTrigger asChild>
                        <div
                          className="absolute left-2 right-2 rounded-lg p-2 cursor-pointer transition-all hover:shadow-lg"
                          style={{
                            top: position.top,
                            height: position.height,
                            backgroundColor: `${bgColor}90`,
                            borderLeft: `4px solid ${bgColor}`,
                            minHeight: '24px'
                          }}
                        >
                          <div className="text-white text-xs font-medium truncate font-helvetica">
                            {entry.task_activity}
                          </div>
                          {entry.duration && entry.duration > 30 && (
                            <div className="text-white/80 text-xs mt-1 font-helvetica">
                              {entry.category}
                            </div>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-black/90 border-white/20 text-white">
                        <div className="space-y-1">
                          <div className="font-medium">{entry.task_activity}</div>
                          <div className="text-sm text-white/80">
                            {format(new Date(entry.start_time), 'HH:mm')} - 
                            {entry.end_time ? format(new Date(entry.end_time), 'HH:mm') : 'Running'}
                          </div>
                          <div className="text-sm text-white/80">
                            Duration: {entry.duration ? formatDuration(entry.duration) : 'Active'}
                          </div>
                          <div className="text-sm text-white/80">
                            Category: {entry.category}
                          </div>
                          {entry.project_name && (
                            <div className="text-sm text-white/80">
                              Project: {entry.project_name}
                            </div>
                          )}
                          {entry.notes && (
                            <div className="text-sm text-white/60 max-w-48">
                              {entry.notes}
                            </div>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </TooltipProvider>

              {/* Empty state */}
              {dayEntries.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white/50">
                    <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="font-helvetica">No time entries for this date</p>
                    <p className="text-sm mt-1">Start tracking your time to see it here</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};