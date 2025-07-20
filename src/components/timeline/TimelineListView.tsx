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
  return;
};