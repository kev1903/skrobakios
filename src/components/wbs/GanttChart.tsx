import React, { useMemo } from 'react';
import { format, addDays, differenceInDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { getDependencyLines } from '@/utils/predecessorUtils';
import { GanttTask, DependencyType } from '@/types/gantt';
import './dependency-arrows.css';

interface WBSItem {
  id: string;
  name: string;
  level: number;
  wbsNumber: string;
  start_date?: string | Date | null;
  end_date?: string | Date | null;
  duration?: number;
  predecessors?: (string | {
    predecessorId: string;
    type: DependencyType;
    lag?: number;
  })[];
  status: string;
}

interface GanttChartProps {
  items: WBSItem[];
  className?: string;
  hideHeader?: boolean;
}

export const GanttChart = ({ items, className = "", hideHeader = false }: GanttChartProps) => {
  // Debug logging
  console.log('GanttChart items:', items.map(item => ({
    id: item.id,
    wbsNumber: item.wbsNumber,
    name: item.name,
    start_date: item.start_date,
    end_date: item.end_date,
    level: item.level,
    predecessors: item.predecessors
  })));

  // Calculate the date range for the chart
  const { startDate, endDate, timelineDays } = useMemo(() => {
    const dates = items
      .filter(item => item.start_date || item.end_date)
      .flatMap(item => [
        item.start_date ? (typeof item.start_date === 'string' ? parseISO(item.start_date) : item.start_date) : null,
        item.end_date ? (typeof item.end_date === 'string' ? parseISO(item.end_date) : item.end_date) : null
      ])
      .filter(Boolean) as Date[];

    console.log('Parsed dates for chart:', dates);

    if (dates.length === 0) {
      const today = new Date();
      const fallbackStart = startOfWeek(today);
      const fallbackEnd = endOfWeek(addDays(today, 60));
      console.log('No dates found, using fallback range:', { fallbackStart, fallbackEnd });
      return {
        startDate: fallbackStart,
        endDate: fallbackEnd,
        timelineDays: eachDayOfInterval({ start: fallbackStart, end: fallbackEnd })
      };
    }

    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
    const chartStart = startOfWeek(minDate);
    const chartEnd = endOfWeek(addDays(maxDate, 14)); // Extended buffer
    
    console.log('Chart date range:', { chartStart, chartEnd, minDate, maxDate });
    
    return {
      startDate: chartStart,
      endDate: chartEnd,
      timelineDays: eachDayOfInterval({ start: chartStart, end: chartEnd })
    };
  }, [items]);

  const getTaskPosition = (item: WBSItem) => {
    if (!item.start_date && !item.end_date) return null;

    const taskStart = item.start_date 
      ? (typeof item.start_date === 'string' ? parseISO(item.start_date) : item.start_date)
      : startDate;
    
    const taskEnd = item.end_date 
      ? (typeof item.end_date === 'string' ? parseISO(item.end_date) : item.end_date)
      : (item.start_date && item.duration ? addDays(taskStart, item.duration) : endDate);

    const startOffset = differenceInDays(taskStart, startDate);
    const duration = differenceInDays(taskEnd, taskStart) + 1;
    
    const dayWidth = 32; // Width per day in pixels
    
    return {
      left: Math.max(0, startOffset * dayWidth),
      width: Math.max(dayWidth, duration * dayWidth),
      startDate: taskStart,
      endDate: taskEnd
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-gradient-to-r from-success to-success/80';
      case 'In Progress': return 'bg-gradient-to-r from-primary to-primary/80';
      case 'On Hold': return 'bg-gradient-to-r from-warning to-warning/80';
      case 'Not Started': return 'bg-gradient-to-r from-muted-foreground/60 to-muted-foreground/40';
      default: return 'bg-gradient-to-r from-muted-foreground/60 to-muted-foreground/40';
    }
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 0: return 'border-primary/40 bg-primary/20';
      case 1: return 'border-secondary/50 bg-secondary/25';
      case 2: return 'border-accent/40 bg-accent/12';
      default: return 'border-muted/40 bg-muted/10';
    }
  };

  const dayWidth = 32;
  const chartWidth = timelineDays.length * dayWidth;
  const rowHeight = 28; // Height matching the table rows (1.75rem)

  // Fallback WBS numbering when wbsNumber is missing
  const computedWbsNumbers = useMemo(() => {
    const counters: number[] = [];
    const map = new Map<string, string>();

    items.forEach((it) => {
      const level = Math.max(0, it.level || 0);
      while (counters.length <= level) counters.push(0);
      // Trim deeper levels when moving up
      if (level < counters.length - 1) counters.splice(level + 1);
      counters[level]++;
      const num = counters.slice(0, level + 1).join('.');
      map.set(it.id, num);
    });

    return map;
  }, [items]);

  const getWbs = (it: WBSItem) => (it.wbsNumber && it.wbsNumber.trim().length > 0 ? it.wbsNumber : (computedWbsNumbers.get(it.id) || ''));

  // Convert WBS items to GanttTask format for dependency calculations
  const ganttTasks: GanttTask[] = useMemo(() => {
    return items.map(item => ({
      id: item.id,
      name: item.name,
      startDate: item.start_date ? (typeof item.start_date === 'string' ? parseISO(item.start_date) : item.start_date) : new Date(),
      endDate: item.end_date ? (typeof item.end_date === 'string' ? parseISO(item.end_date) : item.end_date) : new Date(),
      progress: 0,
      status: 'not-started' as const,
      level: item.level,
      category: 'Element' as const,
      predecessors: item.predecessors ? item.predecessors.map(predId => ({
        predecessorId: typeof predId === 'string' ? predId : predId.predecessorId,
        type: typeof predId === 'string' ? 'FS' as DependencyType : predId.type,
        lag: typeof predId === 'string' ? 0 : (predId.lag || 0)
      })) : []
    }));
  }, [items]);

  // Calculate dependency lines
  const dependencyLines = useMemo(() => {
    if (ganttTasks.length === 0) return [];
    
    const viewSettings = {
      dayWidth,
      rowHeight,
      viewStart: startDate
    };
    
    const lines = getDependencyLines(ganttTasks, viewSettings);
    console.log('Dependency lines calculated:', lines.length, lines);
    return lines;
  }, [ganttTasks, dayWidth, rowHeight, startDate]);


  return (
    <div className={`h-full w-full rounded-xl border border-border/20 overflow-hidden ${className}`}>
{!hideHeader && (
  <div className="sticky top-0 bg-background border-b border-border/10 z-10">
    <div className="min-w-fit">
      <div style={{ width: chartWidth }} className="flex">
        {timelineDays.map((day) => {
          const isWeekend = day.getDay() === 0 || day.getDay() === 6;
          const isToday = isSameDay(day, new Date());
          return (
            <div
              key={day.toISOString()}
              className={`flex-shrink-0 border-r border-border/10 text-center transition-all duration-200 ${
                isWeekend ? 'bg-muted/20' : ''
              } ${isToday ? 'bg-primary/10 border-primary/30' : ''}`}
              style={{ width: dayWidth }}
            >
              <div className="px-1 py-3 text-xs font-medium">
                <div className={`text-xs ${isToday ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                  {format(day, 'MMM')}
                </div>
                <div className={`text-sm font-bold ${isToday ? 'text-primary' : 'text-foreground'}`}>
                  {format(day, 'd')}
                </div>
                <div className={`text-xs ${isToday ? 'text-primary/80' : 'text-muted-foreground'}`}>
                  {format(day, 'EEE')}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
)}

      {/* Gantt Bars Container */}
      <div className="min-w-fit bg-gradient-to-b from-background/50 to-background/30">
        <div style={{ width: chartWidth }} className="relative">
          {items.map((item, index) => {
            const position = getTaskPosition(item);
            const isEven = index % 2 === 0;
            
            return (
              <div
                key={item.id}
                className={`relative border-b border-border/5 transition-all duration-200 ${
                  item.level === 0 
                    ? 'bg-gradient-to-r from-primary/3 to-primary/8' 
                    : item.level === 1
                    ? 'bg-gradient-to-r from-secondary/3 to-secondary/8'
                    : isEven ? 'bg-background/30' : 'bg-muted/10'
                }`}
                style={{ height: rowHeight }}
              >
                {/* Grid lines */}
                {timelineDays.map((day, dayIndex) => {
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                  return (
                    <div
                      key={day.toISOString()}
                      className={`absolute top-0 bottom-0 border-r transition-all duration-200 ${
                        isWeekend ? 'border-muted/20 bg-muted/5' : 'border-border/5'
                      }`}
                      style={{ 
                        left: dayIndex * dayWidth,
                        width: dayWidth
                      }}
                    />
                  );
                })}

                {/* Task bar */}
                {position && (
                  <div
                    className={`absolute top-1 bottom-1 rounded-lg border ${getLevelColor(item.level)} transition-all duration-300 cursor-pointer group`}
                    style={{
                      left: position.left + 3,
                      width: Math.max(28, position.width - 6)
                    }}
                    title={`${getWbs(item)} - ${item.name}\n${format(position.startDate, 'MMM dd')} to ${format(position.endDate, 'MMM dd')}`}
                  >
                    {/* Status indicator with gradient */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-lg ${getStatusColor(item.status)}`} />
                    
                    {/* Task content */}
                    {position.width <= 60 ? (
                      <div className="px-1 flex items-center justify-center h-full relative z-10">
                        <span className="text-[10px] font-semibold text-foreground">
                          {getWbs(item)}
                        </span>
                      </div>
                    ) : (
                      <div className="px-2 py-1 flex items-center h-full relative z-10">
                        <span className="text-xs font-bold text-foreground truncate min-w-0 flex-shrink-0">
                          {getWbs(item)}
                        </span>
                        {position.width > 80 && (
                          <span className="ml-1.5 text-xs text-muted-foreground truncate min-w-0">
                            {item.name}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Progress indicator overlay */}
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-300 pointer-events-none z-0" />

                    {/* Enhanced tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 opacity-0 transition-all duration-300 pointer-events-none z-20">
                      <div className="bg-background border border-border/20 rounded-lg py-3 px-4">
                        <div className="font-semibold text-foreground text-sm">{getWbs(item)} - {item.name}</div>
                        <div className="text-muted-foreground text-xs mt-1">
                          {format(position.startDate, 'MMM dd, yyyy')} - {format(position.endDate, 'MMM dd, yyyy')}
                        </div>
                        <div className={`text-xs mt-2 font-medium px-2 py-1 rounded-md inline-block ${
                          item.status === 'Completed' ? 'bg-success/20 text-success-foreground' :
                          item.status === 'In Progress' ? 'bg-primary/20 text-primary-foreground' :
                          item.status === 'On Hold' ? 'bg-warning/20 text-warning-foreground' :
                          'bg-muted/20 text-muted-foreground'
                        }`}>
                          {item.status}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Enhanced today indicator */}
                {timelineDays.some(day => isSameDay(day, new Date())) && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary to-primary/60 z-10"
                    style={{
                      left: timelineDays.findIndex(day => isSameDay(day, new Date())) * dayWidth + dayWidth/2
                    }}
                  />
                )}
              </div>
            );
          })}

          {/* Dependency Arrows */}
          {dependencyLines.length > 0 && (
            <svg 
              className="absolute inset-0 pointer-events-none z-50"
              width={chartWidth} 
              height={items.length * rowHeight}
              style={{ overflow: 'visible' }}
            >
              <defs>
                {/* Enhanced arrowhead with gradient */}
                <marker
                  id="arrowhead"
                  markerWidth="12"
                  markerHeight="10"
                  refX="11"
                  refY="5"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <path
                    d="M0,0 L0,10 L12,5 z"
                    fill="url(#arrowGradient)"
                    stroke="rgba(0,0,0,0.1)"
                    strokeWidth="0.5"
                  />
                </marker>
                
                {/* Gradient definitions for different dependency types */}
                <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: 'rgba(59, 130, 246, 0.8)' }} />
                  <stop offset="100%" style={{ stopColor: 'rgba(59, 130, 246, 1)' }} />
                </linearGradient>
                
                <linearGradient id="fsGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: 'rgba(59, 130, 246, 0.6)' }} />
                  <stop offset="100%" style={{ stopColor: 'rgba(59, 130, 246, 0.9)' }} />
                </linearGradient>
                
                <linearGradient id="ssGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: 'rgba(16, 185, 129, 0.6)' }} />
                  <stop offset="100%" style={{ stopColor: 'rgba(16, 185, 129, 0.9)' }} />
                </linearGradient>
                
                <linearGradient id="ffGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: 'rgba(245, 158, 11, 0.6)' }} />
                  <stop offset="100%" style={{ stopColor: 'rgba(245, 158, 11, 0.9)' }} />
                </linearGradient>
                
                <linearGradient id="sfGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: 'rgba(239, 68, 68, 0.6)' }} />
                  <stop offset="100%" style={{ stopColor: 'rgba(239, 68, 68, 0.9)' }} />
                </linearGradient>
                
                {/* Drop shadow filter */}
                <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="1" dy="1" stdDeviation="1.5" floodOpacity="0.2" />
                </filter>
              </defs>
              
              {dependencyLines.map((line) => {
                const gradientId = `${line.type.toLowerCase()}Gradient`;
                return (
                  <g key={line.id} className={`dependency-arrow dependency-${line.type.toLowerCase()} group`}>
                    {/* Glow effect background */}
                    <path
                      d={line.path}
                      stroke={line.color}
                      strokeWidth="6"
                      fill="none"
                      opacity="0.2"
                      className="arrow-glow"
                    />
                    
                    {/* Main arrow path */}
                    <path
                      d={line.path}
                      stroke={`url(#${gradientId})`}
                      strokeWidth="2.5"
                      fill="none"
                      markerEnd="url(#arrowhead)"
                      filter="url(#dropShadow)"
                      className="arrow-main"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <title>{`${line.type} Dependency: ${line.fromTask} → ${line.toTask}`}</title>
                    </path>
                    
                    {/* Animated highlight */}
                    <path
                      d={line.path}
                      stroke="rgba(255,255,255,0.6)"
                      strokeWidth="1"
                      fill="none"
                      className="arrow-highlight"
                      strokeDasharray="5,5"
                      strokeLinecap="round"
                    >
                      <animate
                        attributeName="stroke-dashoffset"
                        values="0;10"
                        dur="1s"
                        repeatCount="indefinite"
                      />
                    </path>
                  </g>
                );
              })}
            </svg>
          )}

          {/* Weekend highlighting with subtle pattern */}
          {timelineDays.map((day, index) => {
            const isWeekend = day.getDay() === 0 || day.getDay() === 6;
            if (!isWeekend) return null;
            
            return (
              <div
                key={`weekend-${day.toISOString()}`}
                className="absolute top-0 bottom-0 bg-gradient-to-b from-muted/5 to-muted/10 opacity-60 pointer-events-none"
                style={{
                  left: index * dayWidth,
                  width: dayWidth
                }}
              />
            );
          })}

        </div>
      </div>
    </div>
  );
};