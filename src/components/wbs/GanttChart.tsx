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
  hoveredId?: string | null;
  onRowHover?: (id: string | null) => void;
}

export const GanttChart = ({ items, className = "", hideHeader = false, hoveredId, onRowHover }: GanttChartProps) => {
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
    // Neutral left stripe colors
    switch (status) {
      case 'Completed': return 'bg-green-500/80';
      case 'In Progress': return 'bg-gray-500/80';
      case 'On Hold': return 'bg-amber-500/80';
      case 'Not Started': return 'bg-slate-300/80';
      default: return 'bg-slate-300/80';
    }
  };

  const getLevelColor = (level: number) => {
    // Modern, sleek neutral bars with subtle hierarchy
    switch (level) {
      case 0:
        return 'border-gray-400 bg-white/95 shadow-md'; // Stage - elevated look
      case 1:
        return 'border-gray-300 bg-white/90 shadow-sm'; // Component - clean look
      case 2:
        return 'border-gray-200 bg-white/85 shadow-sm'; // Element - subtle look
      default:
        return 'border-gray-200 bg-white/80 shadow-sm';
    }
  };

  const getLevelFontStyle = (level: number) => {
    switch (level) {
      case 0: return 'font-semibold text-gray-800'; // Stage
      case 1: return 'font-medium text-gray-700'; // Component  
      case 2: return 'font-medium text-gray-600'; // Element
      default: return 'font-medium text-gray-500';
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
    <div className={`h-full w-full rounded-xl border border-border/20 bg-white overflow-hidden ${className}`}>
{!hideHeader && (
  <div className="sticky top-0 bg-white border-b border-border/10 z-10">
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
      <div className="min-w-fit bg-white">
        <div style={{ width: chartWidth }} className="relative">
          {items.map((item, index) => {
            const position = getTaskPosition(item);
            const isEven = index % 2 === 0;
            
            return (
              <div
                key={item.id}
                className={`relative border-b border-gray-100 transition-colors duration-150 ${
                  isEven ? 'bg-white' : 'bg-gray-50/30'
                } ${hoveredId === item.id ? 'bg-gray-50' : 'hover:bg-gray-50/50'}`}
                style={{ height: rowHeight }}
                onMouseEnter={() => onRowHover?.(item.id)}
                onMouseLeave={() => onRowHover?.(null)}
              >
                {/* Grid lines */}
                {timelineDays.map((day, dayIndex) => {
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                  return (
                    <div
                      key={day.toISOString()}
                      className={`absolute top-0 bottom-0 border-r transition-all duration-200 z-0 ${
                        isWeekend ? 'border-gray-200 bg-gray-50/30' : 'border-gray-100'
                      }`}
                      style={{ 
                        left: dayIndex * dayWidth,
                        width: dayWidth
                      }}
                    />
                  );
                })}

                {/* Task bar or summary line based on level */}
                {position && (
                  <>
                    {/* Rectangular bar for Phases (level 0) */}
                    {item.level === 0 && (
                      <div
                        className="absolute cursor-pointer group z-20"
                        style={{
                          left: position.left + 8,
                          top: rowHeight / 2 - 8,
                          width: Math.max(40, position.width - 16),
                          height: 16
                        }}
                        title={`${getWbs(item)} - ${item.name}\n${format(position.startDate, 'MMM dd')} to ${format(position.endDate, 'MMM dd')}`}
                      >
                        {/* Phase bar shape - rectangular with subtle styling */}
                        <div className="relative h-full w-full bg-gray-800 rounded-sm border border-gray-700 shadow-sm">
                          {/* Subtle gradient overlay */}
                          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/10 rounded-sm" />
                          
                          {/* Phase label if wide enough */}
                          {position.width > 60 && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-white text-xs font-semibold truncate px-1">
                                {getWbs(item)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Enhanced tooltip for Phase */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 
                                      transition-all duration-300 pointer-events-none z-30">
                          <div className="bg-white border border-gray-200 rounded-lg py-3 px-4 shadow-lg">
                            <div className="font-semibold text-gray-800 text-sm">
                              {getWbs(item)} - {item.name} 
                              <span className="text-xs text-gray-500 ml-2">
                                (Phase Summary)
                              </span>
                            </div>
                            <div className="text-gray-600 text-xs mt-1">
                              {format(position.startDate, 'MMM dd, yyyy')} - {format(position.endDate, 'MMM dd, yyyy')}
                            </div>
                            <div className={`text-xs mt-2 font-medium px-2 py-1 rounded-md inline-block ${
                              item.status === 'Completed' ? 'bg-green-100 text-green-700' :
                              item.status === 'In Progress' ? 'bg-gray-100 text-gray-700' :
                              item.status === 'On Hold' ? 'bg-amber-100 text-amber-700' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {item.status}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Summary line for Components (level 1) only */}
                    {item.level === 1 && (
                      <div
                        className="absolute cursor-pointer group z-20"
                        style={{
                          left: position.left + 8,
                          top: rowHeight / 2 - 1,
                          width: Math.max(40, position.width - 16),
                          height: 2
                        }}
                        title={`${getWbs(item)} - ${item.name}\n${format(position.startDate, 'MMM dd')} to ${format(position.endDate, 'MMM dd')}`}
                      >
                        {/* Summary line with dot endpoints */}
                        <div className="relative h-full">
                          {/* Main summary line */}
                          <div className="h-full bg-gray-600 rounded-full" />
                          
                          {/* Start dot */}
                          <div className="absolute left-0 top-1/2 w-2 h-2 transform -translate-y-1/2 -translate-x-1/2 rounded-full bg-gray-600 border-white border" />
                          
                          {/* End dot */}
                          <div className="absolute right-0 top-1/2 w-2 h-2 transform -translate-y-1/2 translate-x-1/2 rounded-full bg-gray-600 border-white border" />
                          
                          {/* Component name in the middle */}
                          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 
                                         bg-white px-2 py-0.5 rounded text-xs font-medium text-gray-700 
                                         border border-gray-300 shadow-sm whitespace-nowrap">
                            {item.name}
                          </div>
                        </div>

                        {/* Enhanced tooltip for Component */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 
                                      transition-all duration-300 pointer-events-none z-30">
                          <div className="bg-white border border-gray-200 rounded-lg py-3 px-4 shadow-lg">
                            <div className="font-semibold text-gray-800 text-sm">
                              {getWbs(item)} - {item.name} 
                              <span className="text-xs text-gray-500 ml-2">
                                (Component Summary)
                              </span>
                            </div>
                            <div className="text-gray-600 text-xs mt-1">
                              {format(position.startDate, 'MMM dd, yyyy')} - {format(position.endDate, 'MMM dd, yyyy')}
                            </div>
                            <div className={`text-xs mt-2 font-medium px-2 py-1 rounded-md inline-block ${
                              item.status === 'Completed' ? 'bg-green-100 text-green-700' :
                              item.status === 'In Progress' ? 'bg-gray-100 text-gray-700' :
                              item.status === 'On Hold' ? 'bg-amber-100 text-amber-700' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {item.status}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Regular task bar for Elements (level 2) */}
                    {item.level === 2 && (
                      <div
                        className="absolute cursor-pointer group z-20"
                        style={{
                          left: position.left + 4,
                          top: 2,
                          width: Math.max(32, position.width - 8),
                          height: rowHeight - 4
                        }}
                        title={`${getWbs(item)} - ${item.name}\n${format(position.startDate, 'MMM dd')} to ${format(position.endDate, 'MMM dd')}`}
                      >
                        <div className={`
                          h-full rounded-xl ${getLevelColor(item.level)} 
                          transition-all duration-300 ease-out
                          flex items-center
                          backdrop-blur-sm
                          hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-lg
                          relative overflow-hidden
                          border
                        `}>
                          {/* Subtle shine effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                                        opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                          
                          {/* Modern status indicator */}
                          <div className={`absolute left-0 top-1 bottom-1 w-1 rounded-full ml-1 ${getStatusColor(item.status)}`} />
                          
                          {/* Task content with better spacing */}
                          {position.width <= 60 ? (
                            <div className="px-2 flex items-center justify-center h-full relative z-10">
                              <span className={`text-[10px] font-semibold ${getLevelFontStyle(item.level)}`}>
                                {getWbs(item)}
                              </span>
                            </div>
                          ) : (
                            <div className="px-3 py-1 flex items-center h-full relative z-10 w-full">
                              <span className={`text-xs font-semibold truncate min-w-0 flex-shrink-0 ${getLevelFontStyle(item.level)}`}>
                                {getWbs(item)}
                              </span>
                              {position.width > 90 && (
                                <span className={`ml-2 text-xs font-medium truncate min-w-0 ${getLevelFontStyle(item.level)} opacity-80`}>
                                  {item.name}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Refined progress indicator */}
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/5 via-white/10 to-white/5 
                                        opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />
                        </div>

                        {/* Enhanced tooltip for elements */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 
                                      transition-all duration-300 pointer-events-none z-30">
                          <div className="bg-white border border-gray-200 rounded-lg py-3 px-4 shadow-lg">
                            <div className="font-semibold text-gray-800 text-sm">{getWbs(item)} - {item.name}</div>
                            <div className="text-gray-600 text-xs mt-1">
                              {format(position.startDate, 'MMM dd, yyyy')} - {format(position.endDate, 'MMM dd, yyyy')}
                            </div>
                            <div className={`text-xs mt-2 font-medium px-2 py-1 rounded-md inline-block ${
                              item.status === 'Completed' ? 'bg-green-100 text-green-700' :
                              item.status === 'In Progress' ? 'bg-gray-100 text-gray-700' :
                              item.status === 'On Hold' ? 'bg-amber-100 text-amber-700' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {item.status}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Today indicator - neutral */}
                {timelineDays.some(day => isSameDay(day, new Date())) && (
                  <div
                    className="absolute top-0 bottom-0 border-l-2 border-dashed border-gray-400 z-10"
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
                  markerWidth="8"
                  markerHeight="6"
                  refX="8"
                  refY="3"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <path
                    d="M0,0 L0,6 L8,3 z"
                    fill="rgba(156, 163, 175, 0.9)"
                    stroke="rgba(0,0,0,0.1)"
                    strokeWidth="0.3"
                  />
                </marker>
                
                {/* Gradient definitions for different dependency types - All light grey */}
                <linearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: 'rgba(156, 163, 175, 0.8)' }} />
                  <stop offset="100%" style={{ stopColor: 'rgba(156, 163, 175, 1)' }} />
                </linearGradient>
                
                <linearGradient id="fsGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: 'rgba(156, 163, 175, 0.6)' }} />
                  <stop offset="100%" style={{ stopColor: 'rgba(156, 163, 175, 0.9)' }} />
                </linearGradient>
                
                <linearGradient id="ssGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: 'rgba(156, 163, 175, 0.6)' }} />
                  <stop offset="100%" style={{ stopColor: 'rgba(156, 163, 175, 0.9)' }} />
                </linearGradient>
                
                <linearGradient id="ffGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: 'rgba(156, 163, 175, 0.6)' }} />
                  <stop offset="100%" style={{ stopColor: 'rgba(156, 163, 175, 0.9)' }} />
                </linearGradient>
                
                <linearGradient id="sfGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: 'rgba(156, 163, 175, 0.6)' }} />
                  <stop offset="100%" style={{ stopColor: 'rgba(156, 163, 175, 0.9)' }} />
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
                    {/* Subtle glow effect background */}
                    <path
                      d={line.path}
                      stroke={line.color}
                      strokeWidth="3"
                      fill="none"
                      opacity="0.15"
                      className="arrow-glow"
                    />
                    
                    {/* Main arrow path */}
                    <path
                      d={line.path}
                      stroke={`url(#${gradientId})`}
                      strokeWidth="2"
                      fill="none"
                      markerEnd="url(#arrowhead)"
                      filter="url(#dropShadow)"
                      className="arrow-main"
                      strokeLinecap="square"
                      strokeLinejoin="miter"
                    >
                      <title>{`${line.type} Dependency: ${line.fromTask} → ${line.toTask}`}</title>
                    </path>
                  </g>
                );
              })}
            </svg>
          )}

          {/* Enhanced today indicator for the entire chart */}
          {timelineDays.some(day => isSameDay(day, new Date())) && (
            <div
              className="absolute top-0 w-0.5 bg-gradient-to-b from-primary/40 via-primary to-primary/40 z-30 pointer-events-none"
              style={{
                height: items.length * rowHeight,
                left: timelineDays.findIndex(day => isSameDay(day, new Date())) * dayWidth + dayWidth/2
              }}
            />
          )}

          {/* Weekend highlight overlay */}
          {timelineDays.map((day, dayIndex) => {
            if (day.getDay() === 0 || day.getDay() === 6) {
              return (
                <div
                  key={`weekend-${day.toISOString()}`}
                  className="absolute top-0 bg-slate-50/50 pointer-events-none"
                  style={{
                    left: dayIndex * dayWidth,
                    width: dayWidth,
                    height: items.length * rowHeight
                  }}
                />
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
};