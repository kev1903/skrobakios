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
  const weekHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Generate 24-hour time slots for the week
  const generateTimeSlots = useCallback((): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    
    // Generate 48 30-minute slots (24 hours × 2)
    for (let slotIndex = 0; slotIndex < 48; slotIndex++) {
      const hour = Math.floor(slotIndex / 2);
      const minutes = (slotIndex % 2) * 30;
      const timeLabel = format(setHours(setMinutes(new Date(), minutes), hour), 'HH:mm');
      
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
        hour: slotIndex, // 30-minute slot index
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Week of {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
        </h3>
        <Button size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-1" />
          Add Task
        </Button>
      </div>

      <div className="border border-border rounded-lg bg-card overflow-hidden">
        {/* Week Headers */}
        <div className="grid grid-cols-8 bg-muted/30 border-b border-border">
          {/* Empty cell for time column */}
          <div className="p-3 border-r border-border/50"></div>
          
          {/* Day headers */}
          {weekHeaders.map((dayName, index) => {
            const day = weekDays[index];
            const isToday = isSameDay(day, new Date());
            
            return (
              <div 
                key={dayName} 
                className={`p-3 text-center border-r border-border/50 last:border-r-0 ${
                  isToday ? 'bg-primary/5' : ''
                }`}
              >
                <div className={`font-medium text-sm ${
                  isToday ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {dayName}
                </div>
                <div className={`text-lg font-semibold ${
                  isToday ? 'text-primary' : 'text-foreground'
                }`}>
                  {day.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time slots grid */}
        <div className="max-h-[600px] overflow-y-auto">
          {timeSlots.map((slot) => (
            <div key={slot.hour} className="grid grid-cols-8 border-b border-border/50 h-[50px]">
              {/* Time Label */}
              <div className="flex items-center justify-center p-2 bg-muted/30 border-r border-border/50">
                <span className="text-sm font-medium text-muted-foreground">
                  {slot.label}
                </span>
              </div>

              {/* Day columns */}
              {weekDays.map((day, dayIndex) => (
                <div key={dayIndex} className="p-1 border-r border-border/50 last:border-r-0">
                  <Droppable droppableId={`week-timeline-${slot.hour}-${dayIndex}`} direction="horizontal">
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`h-[42px] rounded-md transition-colors flex items-center ${
                          snapshot.isDraggingOver
                            ? 'bg-primary/10 border-2 border-dashed border-primary/30'
                            : 'bg-background hover:bg-muted/20'
                        }`}
                      >
                        <div className={`flex gap-1 py-1 px-1 w-full overflow-hidden ${
                          isDragging ? 'drag-no-scroll' : ''
                        }`}>
                          {(slot.dayTasks[dayIndex] || []).map((task, index) => (
                            <Draggable key={task.id} draggableId={`week-timeline-${task.id}`} index={index}>
                              {(provided, snapshot) => {
                                // Update drag state when this specific task is being dragged
                                React.useEffect(() => {
                                  if (snapshot.isDragging && !isDragging) {
                                    setIsDragging(true);
                                  } else if (!snapshot.isDragging && isDragging) {
                                    // Small delay to prevent flicker
                                    setTimeout(() => setIsDragging(false), 100);
                                  }
                                }, [snapshot.isDragging]);

                                 return (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  data-dragging={snapshot.isDragging}
                                  className={`group transition-all duration-300 ease-out ${
                                    snapshot.isDragging 
                                      ? 'scale-105 shadow-2xl z-50' 
                                      : 'hover:scale-102 hover:shadow-lg'
                                  }`}
                                  style={{
                                    ...provided.draggableProps.style,
                                    transform: snapshot.isDragging 
                                      ? provided.draggableProps.style?.transform 
                                      : provided.draggableProps.style?.transform
                                  }}
                                >
                                   <div className={`
                                     w-full max-w-[100px] h-9 flex-shrink-0 relative overflow-hidden
                                     glass-card border border-white/20 
                                     cursor-grab active:cursor-grabbing select-none
                                     rounded-lg backdrop-blur-sm
                                     ${snapshot.isDragging ? 'ring-2 ring-primary/40 ring-offset-1' : ''}
                                     ${getStatusColor(task.status)}
                                     hover:border-white/30 transition-all duration-200
                                   `}>
                                     {/* Priority indicator dot */}
                                     <div className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${
                                       task.priority === 'High' ? 'bg-red-400' :
                                       task.priority === 'Medium' ? 'bg-amber-400' :
                                       'bg-green-400'
                                     }`} />
                                     
                                     <div className="px-1.5 py-1.5 h-full flex flex-col justify-center gap-0.5 overflow-hidden">
                                       <div className="text-xs font-semibold text-foreground/90 leading-3 truncate">
                                         {task.taskName}
                                       </div>
                                       <div className="text-[10px] text-muted-foreground/70 leading-3 font-medium truncate">
                                         {task.projectName ? task.projectName.substring(0, 8) + (task.projectName.length > 8 ? '...' : '') : 'No Project'}
                                       </div>
                                     </div>

                                    {/* Subtle gradient overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/5 pointer-events-none" />
                                    
                                    {/* Hover indicator */}
                                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                                  </div>
                                </div>
                                );
                              }}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                        
                        {(slot.dayTasks[dayIndex] || []).length === 0 && !snapshot.isDraggingOver && (
                          <div className="flex items-center justify-center h-full text-xs text-muted-foreground opacity-0 hover:opacity-100 transition-opacity">
                            Drop
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};