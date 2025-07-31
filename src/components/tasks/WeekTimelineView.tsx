import React, { useState, useCallback } from 'react';
import { Droppable, Draggable, DragStart } from 'react-beautiful-dnd';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format, isSameDay, setHours, setMinutes, addDays, startOfWeek } from 'date-fns';
import { Clock, Plus } from 'lucide-react';
import { Task } from './types';
import { TimeBlock } from '../calendar/types';
import { getBlocksForDay } from '../calendar/utils';
import { supabase } from '@/integrations/supabase/client';

interface WeekTimelineViewProps {
  currentDate: Date;
  tasks?: Task[];
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onDragStart?: (start: DragStart) => void;
}

interface TimeSlot {
  hour: number;
  label: string;
  dayTasks: { [dayIndex: number]: Task[] };
}

export const WeekTimelineView: React.FC<WeekTimelineViewProps> = ({ 
  currentDate, 
  tasks = [], 
  onTaskUpdate,
  onDragStart 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);

  // Update current time every minute
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Load time blocks from database
  const loadTimeBlocks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('time_blocks')
        .select('*');

      if (error) throw error;

      const formattedBlocks: TimeBlock[] = data?.map(block => ({
        id: block.id,
        title: block.title,
        description: block.description,
        dayOfWeek: block.day_of_week,
        startTime: block.start_time,
        endTime: block.end_time,
        category: block.category as TimeBlock['category'],
        color: block.color
      })) || [];

      setTimeBlocks(formattedBlocks);
    } catch (error) {
      console.error('Error loading time blocks:', error);
    }
  }, []);

  // Load time blocks on component mount
  React.useEffect(() => {
    loadTimeBlocks();
  }, [loadTimeBlocks]);
  
  // Get the week days starting from Sunday (to match the headers)
  const getWeekDays = useCallback(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 }); // 0 = Sunday
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      weekDays.push(addDays(weekStart, i));
    }
    return weekDays;
  }, [currentDate]);

  const weekDays = getWeekDays();
  const weekHeaders = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  // Generate time slots for the week (Full 24 hours)
  const generateTimeSlots = useCallback((): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    
    // First, add a combined 00:00-05:00 slot
    const nightSlot: TimeSlot = {
      hour: -1, // Special identifier for the combined night slot
      label: '00:00-05:00',
      dayTasks: {}
    };
    
    // For each day of the week, find tasks in the 00:00-05:00 range
    weekDays.forEach((day, dayIndex) => {
      const nightTasks = tasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        if (!isSameDay(taskDate, day)) return false;
        
        // Only show tasks with specific times (not at midnight/00:00) in timeline
        if (taskDate.getUTCHours() === 0 && taskDate.getUTCMinutes() === 0) return false;
        
        // Check if task falls within 00:00-05:00 range
        const taskHour = taskDate.getUTCHours();
        return taskHour >= 0 && taskHour < 5;
      });
      
      nightSlot.dayTasks[dayIndex] = nightTasks;
    });
    
    slots.push(nightSlot);
    
    // Generate remaining slots starting from 05:00 (slot index 10 = 05:00)
    // Generate 38 30-minute slots (from 05:00 to 24:00 = 19 hours × 2)
    for (let slotIndex = 10; slotIndex < 48; slotIndex++) {
      const hour = Math.floor(slotIndex / 2);
      const minutes = (slotIndex % 2) * 30;
      
      // Create a proper date object for time formatting
      const timeDate = new Date();
      timeDate.setHours(hour, minutes, 0, 0);
      const timeLabel = format(timeDate, 'HH:mm');
      
      // Create dayTasks object to hold tasks for each day of the week
      const dayTasks: { [dayIndex: number]: Task[] } = {};
      
      // For each day of the week, find tasks for this time slot
      weekDays.forEach((day, dayIndex) => {
        const dayTasksForSlot = tasks.filter(task => {
          const taskDate = new Date(task.dueDate);
          if (!isSameDay(taskDate, day)) return false;
          
          // Only show tasks with specific times (not at midnight/00:00) in timeline
          if (taskDate.getUTCHours() === 0 && taskDate.getUTCMinutes() === 0) return false;
          
          // Check if task falls within this 30-minute slot
          const taskHour = taskDate.getUTCHours();
          const taskMinutes = taskDate.getUTCMinutes();
          
          return taskHour === hour && 
                 ((minutes === 0 && taskMinutes >= 0 && taskMinutes < 30) ||
                  (minutes === 30 && taskMinutes >= 30 && taskMinutes < 60));
        });
        
        dayTasks[dayIndex] = dayTasksForSlot;
      });
      
      slots.push({
        hour: slotIndex, // Use 30-minute slot index
        label: timeLabel,
        dayTasks
      });
    }
    return slots;
  }, [tasks, weekDays]);

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(generateTimeSlots());

  const handleDragStart = useCallback((start: DragStart) => {
    setIsDragging(true);
    onDragStart?.(start);
  }, [onDragStart]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-success/10 border-success/20 text-success";
      case "in progress":
        return "bg-primary/10 border-primary/20 text-primary";
      case "pending":
        return "bg-warning/10 border-warning/20 text-warning";
      default:
        return "bg-muted border-border text-muted-foreground";
    }
  };

  React.useEffect(() => {
    setTimeSlots(generateTimeSlots());
  }, [generateTimeSlots]);

  return (
    <div className="h-full flex flex-col">
      {/* Week Grid with Time Slots */}
      <div className="flex-1 overflow-auto border border-border/20 rounded-lg bg-background">
        {/* Day Headers Row */}
        <div className="grid grid-cols-8 gap-0 border-b border-border/20 bg-muted/10">
          <div className="p-3 text-center text-muted-foreground font-medium text-sm min-w-[80px]">
            Time
          </div>
          {weekHeaders.map((dayName, index) => {
            const day = weekDays[index];
            const isToday = isSameDay(day, new Date());
            
            return (
              <div key={dayName} className="p-3 text-center border-r border-border/20 last:border-r-0">
                <div className={`text-muted-foreground font-medium text-sm uppercase ${isToday ? 'text-primary font-bold' : ''}`}>
                  {dayName} {day.getDate()}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="grid grid-cols-8 gap-0 min-h-full">
          {/* Time Column */}
          <div className="bg-muted/10 border-r border-border/20 min-w-[80px]">
            {timeSlots.map((slot, index) => {
              const isFullHour = index % 2 === 0; // Every even slot is a full hour
              return (
                <div key={slot.hour} className={`h-16 border-b border-border/10 flex items-start justify-end pr-4 pt-2 ${isFullHour ? 'border-b-border/20' : ''}`}>
                  <span className={`font-mono text-muted-foreground leading-tight ${
                    isFullHour ? 'text-sm font-medium' : 'text-xs opacity-60'
                  }`}>
                    {slot.label}
                  </span>
                </div>
              );
            })}
          </div>
          
          {/* Day Columns */}
          {weekDays.map((day, dayIndex) => (
            <div key={dayIndex} className="bg-background border-r border-border/20 relative last:border-r-0">
              {timeSlots.map(slot => {
                const dayTasks = slot.dayTasks[dayIndex] || [];
                
                return (
                  <Droppable key={`${slot.hour}-${dayIndex}`} droppableId={`week-timeline-${slot.hour}-${dayIndex}`}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`h-16 border-b border-border/10 cursor-pointer transition-colors relative p-1 ${
                          snapshot.isDraggingOver
                            ? 'bg-primary/10 border-primary/30'
                            : 'hover:bg-accent/30'
                        }`}
                      >
                        <div className="flex gap-1 h-full overflow-hidden">
                          {dayTasks.map((task, taskIndex) => {
                            const taskDate = new Date(task.dueDate);
                            
                            // Task colors based on priority or category
                            const getTaskColor = () => {
                              switch (task.priority?.toLowerCase()) {
                                case 'high': return 'bg-red-400/90';
                                case 'medium': return 'bg-amber-400/90';
                                case 'low': return 'bg-green-400/90';
                                default: return 'bg-blue-400/90';
                              }
                            };
                            
                            return (
                              <Draggable key={task.id} draggableId={`week-timeline-${task.id}`} index={taskIndex}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`${getTaskColor()} backdrop-blur-sm text-white text-xs p-2 rounded-md cursor-pointer hover:opacity-80 transition-all shadow-sm border border-white/20 flex-1 min-w-0 ${
                                      snapshot.isDragging ? 'scale-105 shadow-lg z-50' : ''
                                    }`}
                                    style={{
                                      ...provided.draggableProps.style,
                                    }}
                                  >
                                    <div className="font-semibold text-sm leading-tight truncate">
                                      {format(taskDate, 'HH:mm')} - {format(new Date(taskDate.getTime() + 60 * 60 * 1000), 'HH:mm')}
                                    </div>
                                    <div className="font-medium mt-1 leading-tight truncate">{task.taskName}</div>
                                    {task.projectName && (
                                      <div className="text-white/80 text-xs mt-1 truncate">{task.projectName}</div>
                                    )}
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                        </div>
                        
                        {dayTasks.length === 0 && !snapshot.isDraggingOver && (
                          <div className="flex items-center justify-center h-full text-xs text-muted-foreground opacity-0 hover:opacity-100 transition-opacity">
                            Drop
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                );
              })}
              
              {/* Time Blocks Underlay for this day */}
              {(() => {
                const dayBlocks = getBlocksForDay(day, timeBlocks);
                return dayBlocks.map(block => {
                  const startHour = parseInt(block.startTime.split(':')[0]);
                  const startMinute = parseInt(block.startTime.split(':')[1]);
                  const endHour = parseInt(block.endTime.split(':')[0]);
                  const endMinute = parseInt(block.endTime.split(':')[1]);
                  
                  // Calculate position with new slot arrangement (combined 00:00-05:00 slot)
                  let startPosition: number;
                  let duration: number;
                  
                  if (startHour < 5) {
                    // Time block starts in the combined night slot
                    startPosition = 0;
                    if (endHour <= 5) {
                      // Entire block is within night slot
                      duration = 64;
                    } else {
                      // Block spans from night slot into regular slots
                      const remainingDuration = ((endHour - 5) * 2 + endMinute / 30) * 64;
                      duration = 64 + remainingDuration;
                    }
                  } else {
                    // Time block starts at 05:00 or later
                    const adjustedStartHour = startHour - 5; // Adjust for the combined night slot
                    startPosition = 64 + (adjustedStartHour * 2 + startMinute / 30) * 64;
                    duration = ((endHour - startHour) * 2 + (endMinute - startMinute) / 30) * 64;
                  }
                  
                  return (
                    <div
                      key={`timeblock-${block.id}-${dayIndex}`}
                      className={`${block.color}/15 border border-current/20 absolute left-0 right-0 pointer-events-none z-0 rounded-md`}
                      style={{
                        top: `${startPosition}px`,
                        height: `${Math.max(duration - 2, 20)}px`
                      }}
                    >
                      <div className="p-1 text-xs font-medium opacity-50 leading-tight">
                        <div className="truncate text-center">{block.title}</div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          ))}
          
          {/* Week-wide Current Time Indicator */}
          {(() => {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            
            let currentTimePosition: number;
            
            // Calculate position based on new slot arrangement
            if (hours >= 0 && hours < 5) {
              // Current time is in the combined 00:00-05:00 slot
              currentTimePosition = 32; // Middle of the first 64px slot
            } else {
              // Calculate position for slots starting from 05:00
              // Each slot after the night slot represents time from 05:00 onwards
              const minutesSince5AM = (hours - 5) * 60 + minutes;
              currentTimePosition = 64 + (minutesSince5AM / 30) * 64; // 64px for night slot + calculated position
            }
            
            return (
              <div 
                className="absolute left-0 right-0 z-50 pointer-events-none"
                style={{ top: `${currentTimePosition}px` }}
              >
                {/* Time dot on the left edge of the time column */}
                <div className="absolute left-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-md" style={{ left: '76px' }}></div>
                {/* Time line spanning across all day columns */}
                <div className="w-full h-0.5 bg-red-500 shadow-sm" style={{ marginLeft: '80px' }}></div>
                {/* Current time label positioned in the time column */}
                <div className="absolute left-2 -top-2 bg-red-500 text-white text-xs px-2 py-1 rounded shadow-md font-medium">
                  {format(currentTime, 'HH:mm')}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};