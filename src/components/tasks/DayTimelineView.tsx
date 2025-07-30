import React, { useState, useCallback } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format, isSameDay, setHours, setMinutes } from 'date-fns';
import { Clock, Plus, ChevronUp, ChevronDown } from 'lucide-react';
import { Task } from './types';

interface DayTimelineViewProps {
  currentDate: Date;
  tasks?: Task[];
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => Promise<void>;
}

interface TimeSlot {
  hour: number;
  label: string;
  tasks: Task[];
}

export const DayTimelineView: React.FC<DayTimelineViewProps> = ({ 
  currentDate, 
  tasks = [], 
  onTaskUpdate 
}) => {
  

  // Generate 24-hour time slots
  const generateTimeSlots = useCallback((): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    
    // Filter tasks for current date that have specific times (not midnight)
    const dayTasks = tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      if (!isSameDay(taskDate, currentDate)) return false;
      
      // Only show tasks with specific times (not at midnight/00:00) in timeline
      return !(taskDate.getUTCHours() === 0 && taskDate.getUTCMinutes() === 0);
    });
    
    console.log('📅 Tasks for current date:', dayTasks.length, dayTasks.map(t => ({ name: t.taskName, dueDate: t.dueDate })));
    
    // Generate 48 30-minute slots (24 hours × 2)
    for (let slotIndex = 0; slotIndex < 48; slotIndex++) {
      const hour = Math.floor(slotIndex / 2);
      const minutes = (slotIndex % 2) * 30;
      const timeLabel = format(setHours(setMinutes(new Date(), minutes), hour), 'HH:mm');
      
      // Filter tasks for this specific 30-minute slot using the datetime stored in dueDate
      const slotTasks = dayTasks.filter(task => {
        try {
          const taskDateTime = new Date(task.dueDate);
          if (isNaN(taskDateTime.getTime())) return false; // Invalid date
          
          // Check if task falls within this 30-minute slot
          const taskHour = taskDateTime.getUTCHours();
          const taskMinutes = taskDateTime.getUTCMinutes();
          
          return taskHour === hour && 
                 ((minutes === 0 && taskMinutes >= 0 && taskMinutes < 30) ||
                  (minutes === 30 && taskMinutes >= 30 && taskMinutes < 60));
        } catch (error) {
          console.error('Error parsing task date:', task.dueDate, error);
          return false;
        }
      });
      
      console.log(`🕐 Slot ${slotIndex} (${timeLabel}):`, slotTasks.length, 'tasks');
      
      slots.push({
        hour: slotIndex, // Now represents 30-minute slot index instead of hour
        label: timeLabel,
        tasks: slotTasks
      });
    }
    return slots;
  }, [tasks, currentDate]);

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(generateTimeSlots());

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-destructive/20 text-destructive border-destructive/30";
      case "medium":
        return "bg-warning/20 text-warning border-warning/30";
      case "low":
        return "bg-success/20 text-success border-success/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

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
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5" />
        <h3 className="text-lg font-semibold">
          {format(currentDate, 'EEEE, MMMM d, yyyy')}
        </h3>
      </div>

        <div className="grid grid-cols-1 gap-1 max-h-[600px] overflow-y-auto border border-border rounded-lg bg-card">
          {timeSlots.map((slot) => (
            <div key={slot.hour} className="grid grid-cols-12 border-b border-border/50 h-[50px]">
              {/* Time Label */}
              <div className="col-span-2 flex items-center justify-center p-2 bg-muted/30 border-r border-border/50">
                <span className="text-sm font-medium text-muted-foreground">
                  {slot.label}
                </span>
              </div>

              {/* Task Drop Zone */}
              <div className="col-span-10 p-2">
                <Droppable droppableId={`timeline-${slot.hour}`} direction="horizontal">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`h-[34px] rounded-md transition-colors flex items-center ${
                        snapshot.isDraggingOver
                          ? 'bg-primary/10 border-2 border-dashed border-primary/30'
                          : 'bg-background hover:bg-muted/20'
                      }`}
                    >
                      <div className="flex gap-2 overflow-x-auto scrollbar-thin py-1 px-1 w-full">
                        {slot.tasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={`timeline-${task.id}`} index={index}>
                            {(provided, snapshot) => (
                               <div
                                 ref={provided.innerRef}
                                 {...provided.draggableProps}
                                 {...provided.dragHandleProps}
                                 data-dragging={snapshot.isDragging}
                                 className={`transition-all duration-200 ${
                                   snapshot.isDragging 
                                     ? 'shadow-xl opacity-90' 
                                     : 'hover:shadow-md'
                                 }`}
                                 style={{
                                   ...provided.draggableProps.style,
                                   // Ensure proper cursor tracking during drag
                                   transform: snapshot.isDragging 
                                     ? provided.draggableProps.style?.transform 
                                     : provided.draggableProps.style?.transform
                                 }}
                               >
                                 <Card className={`relative w-36 h-10 flex-shrink-0 ${getStatusColor(task.status)} border cursor-grab active:cursor-grabbing select-none group`}>
                                   {/* Top resize handle */}
                                   <div className="absolute -top-1 left-0 right-0 h-2 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                                     <div className="bg-primary/80 hover:bg-primary text-primary-foreground rounded-full w-6 h-3 flex items-center justify-center cursor-n-resize shadow-sm">
                                       <ChevronUp className="w-3 h-3" />
                                     </div>
                                   </div>
                                   
                                   {/* Bottom resize handle */}
                                   <div className="absolute -bottom-1 left-0 right-0 h-2 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                                     <div className="bg-primary/80 hover:bg-primary text-primary-foreground rounded-full w-6 h-3 flex items-center justify-center cursor-s-resize shadow-sm">
                                       <ChevronDown className="w-3 h-3" />
                                     </div>
                                   </div>
                                   
                                   <CardContent className="px-2 py-1 h-full flex flex-col justify-center gap-0.5">
                                      <div className="flex flex-col">
                                        {/* Task Name - Primary, more prominent */}
                                        <h4 className="text-xs font-semibold line-clamp-1 text-foreground leading-tight">
                                          {task.taskName}
                                        </h4>
                                        
                                        {/* Project Name - Secondary, subtle */}
                                        <p className="text-xs text-muted-foreground/80 truncate leading-tight font-normal">
                                          {task.projectName || "No Project"}
                                        </p>
                                      </div>
                                   </CardContent>
                                 </Card>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                      
                      {slot.tasks.length === 0 && !snapshot.isDraggingOver && (
                        <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                          Drop tasks here
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          ))}
        </div>

    </div>
  );
};