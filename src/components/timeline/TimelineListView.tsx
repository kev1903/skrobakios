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
  screenSize: 'mobile-small' | 'mobile' | 'tablet' | 'desktop';
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
      return {
        'All Entries': sortedEntries
      };
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
    if (entry.status === 'running') return 'bg-green-100 text-green-800 border-green-200';
    if (entry.end_time) return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };
  const getStatusText = (entry: TimeEntry) => {
    if (entry.status === 'running') return 'Active';
    if (entry.end_time) return 'Completed';
    return 'Draft';
  };
  const groups = groupedEntries();

  return (
    <div className="p-6 space-y-6">
      {Object.entries(groups).map(([groupName, entries]) => (
        <div key={groupName} className="space-y-4">
          {/* Group Header */}
          <div className="flex items-center space-x-2 pb-2 border-b border-white/20">
            <h3 className="text-lg font-semibold text-foreground">{groupName}</h3>
            <Badge variant="secondary" className="text-xs">
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
            </Badge>
          </div>

          {/* Entries List */}
          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="backdrop-blur-sm bg-white/30 border border-white/20 rounded-lg p-4 hover:bg-white/40 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Entry Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: `hsl(${categoryColors[entry.category] || '217 33% 47%'})` }}
                      />
                      <h4 className="font-medium text-foreground">{entry.task_activity}</h4>
                      <Badge className={cn("text-xs", getStatusColor(entry))}>
                        {getStatusText(entry)}
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(entry.start_time), 'MMM d, h:mm a')}</span>
                      </div>
                      {entry.duration && (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatDuration(entry.duration)}</span>
                        </div>
                      )}
                      {entry.project_name && (
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>{entry.project_name}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Tag className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{entry.category}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    {entry.status === 'running' ? (
                      <Button size="sm" variant="outline" className="border-red-200 text-red-700 hover:bg-red-50">
                        <Pause className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
                        <Play className="w-4 h-4" />
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
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