import React from 'react';
import { format, startOfWeek, endOfWeek, addDays, isSameDay, startOfDay, endOfDay } from 'date-fns';
import { TimeEntry } from '@/hooks/useTimeTracking';
import { cn } from '@/lib/utils';

interface TimelineGanttViewProps {
  entries: TimeEntry[];
  categoryColors: Record<string, string>;
  dateRange: 'today' | 'week' | 'month' | 'custom';
  screenSize: 'mobile' | 'tablet' | 'desktop';
}

export const TimelineGanttView = ({ 
  entries, 
  categoryColors, 
  dateRange,
  screenSize 
}: TimelineGanttViewProps) => {
  
  // Generate time scale based on date range
  const generateTimeScale = () => {
    const now = new Date();
    const scale = [];
    
    if (dateRange === 'today') {
      // Hourly scale for today
      for (let hour = 0; hour < 24; hour++) {
        scale.push({
          date: new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour),
          label: `${hour.toString().padStart(2, '0')}:00`,
          isHour: true
        });
      }
    } else if (dateRange === 'week') {
      // Daily scale for week
      const start = startOfWeek(now);
      for (let i = 0; i < 7; i++) {
        const date = addDays(start, i);
        scale.push({
          date,
          label: format(date, 'EEE d'),
          isHour: false
        });
      }
    } else {
      // Daily scale for month
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(now.getFullYear(), now.getMonth(), day);
        scale.push({
          date,
          label: day.toString(),
          isHour: false
        });
      }
    }
    
    return scale;
  };

  const timeScale = generateTimeScale();
  const scaleWidth = screenSize === 'mobile' ? 60 : 80;

  // Group entries by category for rows
  const groupedEntries = entries.reduce((groups, entry) => {
    if (!groups[entry.category]) {
      groups[entry.category] = [];
    }
    groups[entry.category].push(entry);
    return groups;
  }, {} as Record<string, TimeEntry[]>);

  // Calculate position and width for entries
  const getEntryStyle = (entry: TimeEntry) => {
    const startTime = new Date(entry.start_time);
    const endTime = entry.end_time ? new Date(entry.end_time) : new Date();
    
    if (dateRange === 'today') {
      // Position based on hours
      const startHour = startTime.getHours() + startTime.getMinutes() / 60;
      const duration = entry.duration ? entry.duration / 60 : 0.5; // Convert minutes to hours
      
      const left = (startHour / 24) * 100;
      const width = Math.max((duration / 24) * 100, 2); // Minimum 2% width
      
      return { left: `${left}%`, width: `${width}%` };
    } else {
      // Position based on days
      const scaleStart = timeScale[0].date;
      const scaleEnd = timeScale[timeScale.length - 1].date;
      
      const totalMs = scaleEnd.getTime() - scaleStart.getTime();
      const startMs = startTime.getTime() - scaleStart.getTime();
      const durationMs = endTime.getTime() - startTime.getTime();
      
      const left = Math.max(0, (startMs / totalMs) * 100);
      const width = Math.max((durationMs / totalMs) * 100, 1); // Minimum 1% width
      
      return { left: `${left}%`, width: `${width}%` };
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="w-full overflow-auto">
      <div className={cn(
        "min-w-full bg-white/20 backdrop-blur-sm",
        screenSize === 'mobile' ? 'text-xs' : 'text-sm'
      )}>
        {/* Header with time scale */}
        <div className="sticky top-0 z-10 bg-white/60 backdrop-blur-md border-b border-white/30">
          <div className="flex">
            {/* Category header */}
            <div className={cn(
              "flex-shrink-0 border-r border-white/30 bg-white/40 font-medium text-slate-700 flex items-center justify-center",
              screenSize === 'mobile' ? 'w-24 p-2' : 'w-32 p-3'
            )}>
              Category
            </div>
            
            {/* Time scale header */}
            <div className="flex-1 flex">
              {timeScale.map((scale, index) => (
                <div
                  key={index}
                  className={cn(
                    "border-r border-white/20 text-center font-medium text-slate-600 flex items-center justify-center",
                    screenSize === 'mobile' ? 'p-2' : 'p-3'
                  )}
                  style={{ width: `${scaleWidth}px` }}
                >
                  {scale.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Body with gantt bars */}
        <div className="relative">
          {Object.entries(groupedEntries).map(([category, categoryEntries], rowIndex) => (
            <div key={category} className="relative">
              <div className="flex border-b border-white/20 hover:bg-white/20 transition-colors">
                {/* Category label */}
                <div 
                  className={cn(
                    "flex-shrink-0 border-r border-white/30 flex items-center font-medium text-slate-700",
                    screenSize === 'mobile' ? 'w-24 p-2' : 'w-32 p-3'
                  )}
                  style={{ backgroundColor: `${categoryColors[category] || '#6B7280'}20` }}
                >
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: categoryColors[category] || '#6B7280' }}
                    />
                    <span className="truncate">{category}</span>
                  </div>
                </div>
                
                {/* Timeline area */}
                <div 
                  className="flex-1 relative"
                  style={{ 
                    width: `${timeScale.length * scaleWidth}px`,
                    height: screenSize === 'mobile' ? '48px' : '60px'
                  }}
                >
                  {/* Grid lines */}
                  {timeScale.map((_, index) => (
                    <div
                      key={index}
                      className="absolute top-0 bottom-0 border-r border-white/10"
                      style={{ left: `${index * scaleWidth}px` }}
                    />
                  ))}
                  
                  {/* Entry bars */}
                  {categoryEntries.map((entry) => {
                    const style = getEntryStyle(entry);
                    return (
                      <div
                        key={entry.id}
                        className={cn(
                          "absolute top-1 bottom-1 rounded-md transition-all duration-200 hover:shadow-lg group cursor-pointer",
                          "border border-white/30 backdrop-blur-sm",
                          screenSize === 'mobile' ? 'min-w-4' : 'min-w-6'
                        )}
                        style={{
                          left: style.left,
                          width: style.width,
                          backgroundColor: `${categoryColors[entry.category] || '#6B7280'}60`,
                          borderColor: categoryColors[entry.category] || '#6B7280'
                        }}
                        title={`${entry.task_activity} - ${entry.duration ? formatDuration(entry.duration) : 'Active'}`}
                      >
                        <div className={cn(
                          "h-full flex items-center justify-center text-white text-xs font-medium truncate",
                          screenSize === 'mobile' ? 'px-1' : 'px-2'
                        )}>
                          {screenSize !== 'mobile' && entry.task_activity.length > 10 
                            ? `${entry.task_activity.substring(0, 10)}...` 
                            : entry.task_activity}
                        </div>
                        
                        {/* Tooltip on hover */}
                        <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 transition-opacity">
                          <div className="bg-black/80 text-white text-xs rounded-md p-2 whitespace-nowrap">
                            <div className="font-medium">{entry.task_activity}</div>
                            <div>{format(new Date(entry.start_time), 'HH:mm')} - {entry.end_time ? format(new Date(entry.end_time), 'HH:mm') : 'Active'}</div>
                            <div>{entry.duration ? formatDuration(entry.duration) : 'Running'}</div>
                            {entry.project_name && <div>Project: {entry.project_name}</div>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {Object.keys(groupedEntries).length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <div>No entries to display</div>
            <div className="text-xs mt-1">Start tracking time to see your gantt chart</div>
          </div>
        )}
      </div>
    </div>
  );
};