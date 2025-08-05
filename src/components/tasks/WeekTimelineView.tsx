import React, { useState, useCallback, useMemo } from 'react';
import { Droppable, Draggable, DragStart, DropResult } from 'react-beautiful-dnd';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format, isSameDay, setHours, setMinutes, addDays, startOfWeek } from 'date-fns';
import { Clock, Plus, GripVertical } from 'lucide-react';
import { Task } from './types';
import { TimeBlock } from '../calendar/types';
import { getBlocksForDay } from '../calendar/utils';
import { supabase } from '@/integrations/supabase/client';
import { useTimeTracking } from '@/hooks/useTimeTracking';

interface WeekTimelineViewProps {
  currentDate: Date;
  tasks?: Task[];
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onDragStart?: (start: any) => void;
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
  const { settings } = useTimeTracking();
  
  // Get category colors from time tracking settings - now in HSL format
  const categoryColors = settings?.category_colors || {
    'Design': '217 91% 60%',     // Blue
    'Admin': '159 61% 51%',      // Green  
    'Calls': '43 96% 56%',       // Amber
    'Break': '0 84% 60%',        // Red
    'Browsing': '263 69% 69%',   // Purple
    'Site Visit': '188 94% 43%', // Cyan
    'Deep Work': '160 84% 39%',  // Emerald
    'Other': '217 33% 47%',      // Gray
    // Legacy categories for backward compatibility
    work: '217 91% 60%',        // Blue
    personal: '159 61% 51%',    // Green
    meeting: '43 96% 56%',      // Amber
    break: '0 84% 60%',         // Red
    family: '327 73% 97%',      // Pink
    site_visit: '188 94% 43%',  // Cyan
    church: '263 69% 69%',      // Purple
    rest: '217 33% 47%'         // Gray
  };

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

  // Generate time slots for the week (24 hours in 30-minute slots)
  const timeSlots = useMemo((): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    
    // Generate 48 30-minute slots (24 hours × 2)
    for (let slotIndex = 0; slotIndex < 48; slotIndex++) {
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
          if (taskDate.getHours() === 0 && taskDate.getMinutes() === 0) return false;
          
          // Check if task falls within this 30-minute slot
          const taskHour = taskDate.getHours();
          const taskMinutes = taskDate.getMinutes();
          
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

  const handleDragStart = useCallback((start: any) => {
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

  return (
    <div className="h-full flex flex-col backdrop-blur-xl bg-white/[0.02] border border-white/[0.08] shadow-lg rounded-xl overflow-hidden">
      {/* Week Grid with Time Slots */}
      <div className="flex-1 overflow-hidden">
        {/* Day Headers Row */}
        <div className="grid grid-cols-8 gap-1 border-b border-white/[0.08] bg-white/[0.05] backdrop-blur-sm p-2">
          <div className="p-3 text-center text-white/60 font-medium text-sm min-w-[100px] bg-white/[0.02] rounded-lg border border-white/[0.08]">
            Time
          </div>
          {weekHeaders.map((dayName, index) => {
            const day = weekDays[index];
            const isToday = isSameDay(day, new Date());
            
            return (
              <div key={dayName} className={`p-3 text-center transition-all duration-200 rounded-lg border ${
                isToday 
                  ? 'bg-gradient-to-b from-primary/20 to-primary/10 border-primary/30 shadow-md' 
                  : 'bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05]'
              }`}>
                <div className={`font-medium text-sm uppercase ${
                  isToday ? 'text-primary font-bold' : 'text-white/60'
                }`}>
                  {dayName} {day.getDate()}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="grid grid-cols-8 gap-0 min-h-full relative">
          {/* Time Column */}
          <div className="bg-white/[0.02] backdrop-blur-sm border-r border-white/[0.08] min-w-[100px] shadow-inner relative">
            {timeSlots.map((slot, index) => {
              const isFullHour = slot.hour % 2 === 0; // Every even slot is a full hour
              const currentHour = currentTime.getHours();
              const currentMinutes = currentTime.getMinutes();
              const slotHour = Math.floor(slot.hour / 2);
              const slotMinutes = (slot.hour % 2) * 30;
              const isCurrentSlot = slotHour === currentHour && 
                                   ((slotMinutes === 0 && currentMinutes >= 0 && currentMinutes < 30) ||
                                    (slotMinutes === 30 && currentMinutes >= 30 && currentMinutes < 60));
              
              return (
                <div key={slot.hour} className={`h-6 border-b flex items-start justify-end pr-4 pt-1 transition-colors hover:bg-white/[0.05] ${
                  isFullHour ? 'border-b-white/[0.08] bg-white/[0.02]' : 'border-b-white/[0.05] bg-transparent'
                } ${isCurrentSlot ? 'bg-primary/10 border-primary/20' : ''}`}>
                  <span className={`font-inter leading-tight ${
                    isFullHour ? 'text-xs font-medium text-white/80' : 'text-[10px] font-normal text-white/60'
                  } ${isCurrentSlot ? 'text-primary font-semibold' : ''}`}>
                    {slot.label}
                  </span>
                </div>
              );
            })}
          </div>
          
          {/* Current Time Indicator - Spans Entire Calendar */}
          {isSameDay(currentTime, currentDate) && (
            <div 
              className="absolute left-0 right-0 h-0.5 border-t-2 border-dotted border-blue-500 z-[1000] pointer-events-none"
              style={{
                top: `${(currentTime.getHours() * 2 + currentTime.getMinutes() / 30) * 24 + (currentTime.getMinutes() % 30) / 30 * 24}px`
              }}
            >
              <div className="absolute left-12 -top-2 w-4 h-4 bg-blue-500 rounded-full shadow-md"></div>
            </div>
          )}
          
          {/* Day Columns */}
          {weekDays.map((day, dayIndex) => (
            <div key={dayIndex} className="bg-white/[0.01] border-r border-white/[0.05] relative last:border-r-0">
              {timeSlots.map(slot => {
                const dayTasks = slot.dayTasks[dayIndex] || [];
                const slotHour = Math.floor(slot.hour / 2);
                const slotMinutes = (slot.hour % 2) * 30;
                const currentDateStr = format(day, 'yyyy-MM-dd');
                const droppableId = `calendar-slot-${currentDateStr}-${slotHour.toString().padStart(2, '0')}-${slotMinutes.toString().padStart(2, '0')}`;

                return (
                  <Droppable key={`${slot.hour}-${dayIndex}`} droppableId={droppableId}>
                    {(provided, snapshot) => (
                      <div 
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`h-6 border-b border-white/[0.05] cursor-pointer transition-colors relative p-1 ${
                          snapshot.isDraggingOver 
                            ? 'bg-blue-500/20 border-blue-400/50' 
                            : 'hover:bg-white/[0.05]'
                        }`}
                      >
                    <div className="flex gap-1 h-full overflow-hidden">
                      {dayTasks.map((task, taskIndex) => (
                        <div
                          key={task.id}
                          className="bg-transparent border-border/30 backdrop-blur-sm text-foreground text-[10px] p-1 rounded-sm cursor-pointer hover:opacity-80 transition-all shadow-sm border flex-1 min-w-0 z-10"
                        >
                          <div className="flex items-center justify-center gap-1 h-full">
                            <GripVertical className="w-2 h-2 text-gray-500/60 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-[10px] leading-tight truncate">{task.taskName}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {dayTasks.length === 0 && snapshot.isDraggingOver && (
                      <div className="flex items-center justify-center h-full text-[10px] text-blue-300 font-medium z-10">
                        Drop here for {slot.label}
                      </div>
                    )}
                    {provided.placeholder}
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
                  
                  // Calculate position using proper 30-minute slots (24px height each)
                  const startSlotIndex = startHour * 2 + Math.floor(startMinute / 30);
                  const endSlotIndex = endHour * 2 + Math.floor(endMinute / 30);
                  
                  const startPosition = startSlotIndex * 24;
                  const duration = (endSlotIndex - startSlotIndex) * 24;
                  
                  console.log(`Week Time block: ${block.title}, Category: ${block.category}, Start: ${startHour}:${startMinute}, End: ${endHour}:${endMinute}`);
                  
                  // Use category colors from time tracking settings
                  const actualColor = categoryColors[block.category] || block.color || categoryColors['Other'] || '217 33% 47%';
                  
                  return (
                    <div
                      key={`timeblock-${block.id}-${dayIndex}`}
                      className="absolute left-1 right-1 pointer-events-none z-0 rounded-sm border"
                      style={{
                        backgroundColor: 'transparent',
                        borderColor: `hsl(${actualColor})`,
                        top: `${startPosition}px`,
                        height: `${Math.max(duration, 12)}px`
                      }}
                    >
                      <div 
                        className="flex items-center justify-center h-full text-foreground text-[10px] font-semibold px-1"
                      >
                        <span className="truncate">{block.title}</span>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          ))}
          
        </div>
      </div>
    </div>
  );
};