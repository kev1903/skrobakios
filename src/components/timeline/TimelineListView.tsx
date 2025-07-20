import React from 'react';
import { format, isToday, isYesterday, startOfDay } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Clock, Play, Pause, MoreHorizontal, Calendar, User, Tag } from 'lucide-react';
import { TimeEntry } from '@/hooks/useTimeTracking';
import { cn } from '@/lib/utils';

interface TimelineListViewProps {
  entries: TimeEntry[];
  categoryColors: Record<string, string>;
  groupBy: 'none' | 'category' | 'project' | 'date';
  sortBy: 'date' | 'duration' | 'category' | 'project';
  screenSize: 'mobile' | 'tablet' | 'desktop';
}

export const TimelineListView = ({ 
  entries, 
  categoryColors, 
  groupBy, 
  sortBy,
  screenSize 
}: TimelineListViewProps) => {
  
  // Sort entries
  const sortedEntries = [...entries].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.start_time).getTime() - new Date(a.start_time).getTime();
      case 'duration':
        return (b.duration || 0) - (a.duration || 0);
      case 'category':
        return a.category.localeCompare(b.category);
      case 'project':
        return (a.project_name || '').localeCompare(b.project_name || '');
      default:
        return 0;
    }
  });

  // Group entries
  const groupedEntries = () => {
    if (groupBy === 'none') {
      return { 'All Entries': sortedEntries };
    }

    const groups: Record<string, TimeEntry[]> = {};
    
    sortedEntries.forEach(entry => {
      let groupKey = '';
      
      switch (groupBy) {
        case 'category':
          groupKey = entry.category;
          break;
        case 'project':
          groupKey = entry.project_name || 'No Project';
          break;
        case 'date':
          const date = new Date(entry.start_time);
          if (isToday(date)) {
            groupKey = 'Today';
          } else if (isYesterday(date)) {
            groupKey = 'Yesterday';
          } else {
            groupKey = format(date, 'EEEE, MMMM d');
          }
          break;
        default:
          groupKey = 'All Entries';
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(entry);
    });

    return groups;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getStatusColor = (entry: TimeEntry) => {
    if (entry.is_active) return 'bg-green-100 text-green-800 border-green-200';
    if (entry.end_time) return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusText = (entry: TimeEntry) => {
    if (entry.is_active) return 'Active';
    if (entry.end_time) return 'Completed';
    return 'Draft';
  };

  const groups = groupedEntries();

  return (
    <div className="space-y-6 p-6">
      {Object.entries(groups).map(([groupName, groupEntries]) => (
        <div key={groupName} className="space-y-4">
          {groupBy !== 'none' && (
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold text-slate-800">{groupName}</h3>
              <Badge variant="secondary" className="bg-white/50">
                {groupEntries.length} {groupEntries.length === 1 ? 'entry' : 'entries'}
              </Badge>
            </div>
          )}
          
          <div className="space-y-3">
            {groupEntries.map((entry) => (
              <div
                key={entry.id}
                className={cn(
                  "group relative overflow-hidden rounded-lg border transition-all duration-200",
                  "bg-white/60 backdrop-blur-sm border-white/30 hover:border-white/50",
                  "hover:shadow-lg hover:bg-white/70",
                  screenSize === 'mobile' ? 'p-4' : 'p-5'
                )}
              >
                {/* Category color indicator */}
                <div 
                  className="absolute left-0 top-0 w-1 h-full"
                  style={{ backgroundColor: categoryColors[entry.category] || '#6B7280' }}
                />
                
                <div className={cn(
                  "flex items-start justify-between",
                  screenSize === 'mobile' ? 'flex-col space-y-3' : 'flex-row'
                )}>
                  <div className="flex-1 space-y-2">
                    {/* Main content */}
                    <div className="flex items-start space-x-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                        style={{ backgroundColor: categoryColors[entry.category] || '#6B7280' }}
                      >
                        {entry.category.charAt(0)}
                      </div>
                      
                      <div className="flex-1 space-y-1">
                        <h4 className="font-medium text-slate-800 line-clamp-1">
                          {entry.task_activity}
                        </h4>
                        
                        <div className={cn(
                          "flex items-center text-sm text-slate-600",
                          screenSize === 'mobile' ? 'flex-col items-start space-y-1' : 'space-x-4'
                        )}>
                          <div className="flex items-center space-x-1">
                            <Tag className="w-3 h-3" />
                            <span>{entry.category}</span>
                          </div>
                          
                          {entry.project_name && (
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{entry.project_name}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{format(new Date(entry.start_time), 'HH:mm')}</span>
                            {entry.end_time && (
                              <>
                                <span>-</span>
                                <span>{format(new Date(entry.end_time), 'HH:mm')}</span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {entry.notes && (
                          <p className="text-sm text-slate-500 line-clamp-2">
                            {entry.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Right side actions */}
                  <div className={cn(
                    "flex items-center space-x-3",
                    screenSize === 'mobile' ? 'self-end' : ''
                  )}>
                    {/* Duration */}
                    <div className="text-right">
                      <div className="font-semibold text-slate-800">
                        {entry.duration ? formatDuration(entry.duration) : '0m'}
                      </div>
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs", getStatusColor(entry))}
                      >
                        {getStatusText(entry)}
                      </Badge>
                    </div>
                    
                    {/* Action button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {entry.is_active ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};