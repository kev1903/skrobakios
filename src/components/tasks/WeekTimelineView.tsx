import React, { useState, useCallback } from 'react';
import { Droppable, Draggable, DragStart } from 'react-beautiful-dnd';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format, isSameDay, setHours, setMinutes, addDays, startOfWeek } from 'date-fns';
import { Clock, Plus } from 'lucide-react';
import { Task } from './types';

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
  
  // Get the week days starting from Sunday
  const getWeekDays = useCallback(() => {
    const weekStart = startOfWeek(currentDate);
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      weekDays.push(addDays(weekStart, i));
    }
    return weekDays;
  }, [currentDate]);

  const weekDays = getWeekDays();
  const weekHeaders = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  // Generate time slots for the week (8 AM to 1 PM)
  const generateTimeSlots = useCallback((): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    
    // Generate time slots from 8 AM to 1 PM (6 hours)
    for (let slotIndex = 0; slotIndex < 6; slotIndex++) {
      const hour = slotIndex + 8; // Start from 8 AM
      const timeLabel = hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
      
      // Create dayTasks object to hold tasks for each day of the week
      const dayTasks: { [dayIndex: number]: Task[] } = {};
      
      // For each day of the week, find tasks for this time slot
      weekDays.forEach((day, dayIndex) => {
        const dayTasksForSlot = tasks.filter(task => {
          const taskDate = new Date(task.dueDate);
          if (!isSameDay(taskDate, day)) return false;
          
          // Only show tasks with specific times (not at midnight/00:00) in timeline
          if (taskDate.getUTCHours() === 0 && taskDate.getUTCMinutes() === 0) return false;
          
          // Check if task falls within this hour slot
          const taskHour = taskDate.getUTCHours();
          return taskHour === hour;
        });
        
        dayTasks[dayIndex] = dayTasksForSlot;
      });
      
      slots.push({
        hour: slotIndex,
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
      {/* Week Header */}
      <div className="grid grid-cols-8 gap-0 mb-4">
        <div className="p-4 text-center text-muted-foreground font-medium text-sm">
          
        </div>
        {weekHeaders.map((dayName, index) => {
          const day = weekDays[index];
          const isToday = isSameDay(day, new Date());
          
          return (
            <div key={dayName} className="p-4 text-center">
              <div className="text-muted-foreground font-medium text-sm uppercase">
                {dayName} {day.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Week Grid with Time Slots */}
      <div className="flex-1 overflow-auto border border-border/20 rounded-lg">
        <div className="grid grid-cols-8 gap-0 min-h-full">
          {/* Time Column */}
          <div className="bg-background border-r border-border/20">
            {timeSlots.map(slot => (
              <div key={slot.hour} className="h-16 p-3 border-b border-border/20 text-sm text-muted-foreground font-medium flex items-start">
                {slot.label}
              </div>
            ))}
          </div>
          
          {/* Day Columns */}
          {weekDays.map((day, dayIndex) => (
            <div key={dayIndex} className="bg-background border-r border-border/20 relative last:border-r-0">
              {timeSlots.map(slot => (
                <div
                  key={`${dayIndex}-${slot.hour}`}
                  className="h-16 border-b border-border/20 cursor-pointer hover:bg-accent/30 relative"
                />
              ))}
              
              {/* Tasks Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                {timeSlots.map(slot => {
                  const dayTasks = slot.dayTasks[dayIndex] || [];
                  return dayTasks.map((task, taskIndex) => {
                    const taskDate = new Date(task.dueDate);
                    const taskHour = taskDate.getUTCHours();
                    const taskMinutes = taskDate.getUTCMinutes();
                    
                    // Calculate position within the slot
                    const slotPosition = (taskHour - 8) * 64; // 64px per hour, starting from 8 AM
                    const duration = Math.max(60, 90); // Default 90 minutes duration
                    
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
                      <Droppable key={`${slot.hour}-${dayIndex}`} droppableId={`week-slot-${slot.hour}-${dayIndex}`}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="absolute inset-0"
                          >
                            <Draggable draggableId={`week-task-${task.id}`} index={taskIndex}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`${getTaskColor()} backdrop-blur-sm text-white text-xs p-2 rounded-md absolute left-2 right-2 cursor-pointer hover:opacity-80 transition-all shadow-sm border border-white/20 pointer-events-auto`}
                                  style={{
                                    top: `${slotPosition + 2}px`,
                                    height: `${duration - 4}px`
                                  }}
                                >
                                  <div className="font-semibold text-sm leading-tight">
                                    {format(taskDate, 'HH:mm')} - {format(new Date(taskDate.getTime() + 60 * 60 * 1000), 'HH:mm')}
                                  </div>
                                  <div className="font-medium mt-1 leading-tight">{task.taskName}</div>
                                  {task.projectName && (
                                    <div className="text-white/80 text-xs mt-1">{task.projectName}</div>
                                  )}
                                </div>
                              )}
                            </Draggable>
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    );
                  });
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};