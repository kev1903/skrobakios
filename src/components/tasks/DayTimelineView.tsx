import React, { useState, useCallback, useRef } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format, isSameDay, setHours, setMinutes, addMinutes, subMinutes } from 'date-fns';
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
    
    console.log('📅 Tasks for current date:', dayTasks.length, dayTasks.map(t => ({ name: t.taskName, dueDate: t.dueDate, duration: t.duration })));
    
    // Generate 48 30-minute slots (24 hours × 2)
    for (let slotIndex = 0; slotIndex < 48; slotIndex++) {
      const hour = Math.floor(slotIndex / 2);
      const minutes = (slotIndex % 2) * 30;
      const timeLabel = format(setHours(setMinutes(new Date(), minutes), hour), 'HH:mm');
      
      // Filter tasks that start in this specific 30-minute slot
      const slotTasks = dayTasks.filter(task => {
        try {
          const taskDateTime = new Date(task.dueDate);
          if (isNaN(taskDateTime.getTime())) return false; // Invalid date
          
          // Check if task starts in this 30-minute slot
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
  const [dragState, setDragState] = useState<{
    isDragging: boolean;
    taskId: string | null;
    handle: 'top' | 'bottom' | null;
    startY: number;
    startTime: Date | null;
  }>({
    isDragging: false,
    taskId: null,
    handle: null,
    startY: 0,
    startTime: null
  });

  // Handle resize drag functionality
  const handleResizeStart = useCallback((e: React.MouseEvent, taskId: string, handle: 'top' | 'bottom') => {
    e.preventDefault();
    e.stopPropagation();
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    setDragState({
      isDragging: true,
      taskId,
      handle,
      startY: e.clientY,
      startTime: new Date(task.dueDate)
    });
  }, [tasks]);

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging || !dragState.taskId || !dragState.startTime) return;

    const deltaY = e.clientY - dragState.startY;
    const slotsChanged = Math.round(deltaY / 64); // Each slot is 64px height
    
    if (slotsChanged === 0) return;

    const task = tasks.find(t => t.id === dragState.taskId);
    if (!task || !onTaskUpdate) return;

    const currentDuration = task.duration || 30; // Default 30 minutes if no duration
    
    if (dragState.handle === 'top') {
      // Moving top handle - change start time and adjust duration to maintain end time
      const newStartTime = subMinutes(dragState.startTime, slotsChanged * 30);
      const newDuration = currentDuration + (slotsChanged * 30);
      
      // Ensure duration is at least 30 minutes
      if (newDuration < 30) return;
      
      // Ensure time is within valid bounds (00:00 to 23:59)
      const hours = newStartTime.getHours();
      const minutes = newStartTime.getMinutes();
      if (hours < 0 || hours > 23 || (hours === 23 && minutes > 59)) return;

      onTaskUpdate(dragState.taskId, {
        dueDate: newStartTime.toISOString(),
        duration: newDuration
      });
    } else {
      // Moving bottom handle - extend/reduce duration
      const newDuration = currentDuration + (slotsChanged * 30);
      
      // Ensure duration is at least 30 minutes
      if (newDuration < 30) return;
      
      // Ensure end time doesn't exceed 23:59
      const endTime = addMinutes(dragState.startTime, newDuration);
      if (endTime.getHours() > 23 || (endTime.getHours() === 23 && endTime.getMinutes() > 59)) return;

      onTaskUpdate(dragState.taskId, {
        duration: newDuration
      });
    }
  }, [dragState, tasks, onTaskUpdate]);

  const handleResizeEnd = useCallback(() => {
    setDragState({
      isDragging: false,
      taskId: null,
      handle: null,
      startY: 0,
      startTime: null
    });
  }, []);

  // Add global mouse event listeners for resize dragging
  React.useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [dragState.isDragging, handleResizeMove, handleResizeEnd]);

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
    <div className="h-full flex flex-col bg-background">
      {/* Header with date */}
      <div className="flex items-center justify-between p-4 border-b border-border/20 bg-card/50">
        <h2 className="text-lg font-semibold text-foreground">
          {format(currentDate, 'EEEE, MMMM d, yyyy')}
        </h2>
        <div className="text-sm text-muted-foreground">
          Day View
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="grid grid-cols-[80px_1fr] min-h-full">
            {/* Time Column */}
            <div className="border-r border-border/20 bg-muted/20">
              {timeSlots.map((slot) => (
                <div key={slot.hour} className="h-16 border-b border-border/10 flex items-start justify-end pr-3 pt-1">
                  <span className="text-sm font-medium text-muted-foreground">
                    {slot.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Events Column */}
            <div className="relative">
              {timeSlots.map((slot) => (
                <div key={slot.hour} className="h-16 border-b border-border/10 relative">
                  <Droppable droppableId={`timeline-${slot.hour}`} direction="horizontal">
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`absolute inset-0 transition-colors ${
                          snapshot.isDraggingOver
                            ? 'bg-primary/5 border-l-2 border-primary/30'
                            : 'hover:bg-muted/10'
                        }`}
                      >
                        <div className="p-1 h-full">
                          {slot.tasks.map((task, index) => {
                            const taskDuration = task.duration || 30; // Default 30 minutes
                            const slotsSpanned = Math.ceil(taskDuration / 30); // How many 30-min slots this task spans
                            const heightInPixels = (slotsSpanned * 64) - 8; // 64px per slot minus padding
                            
                            return (
                              <Draggable key={task.id} draggableId={`timeline-${task.id}`} index={index}>
                                {(provided, snapshot) => (
                                   <div
                                     ref={provided.innerRef}
                                     {...provided.draggableProps}
                                     data-dragging={snapshot.isDragging}
                                     className={`absolute transition-all duration-200 ${
                                       snapshot.isDragging 
                                         ? 'shadow-xl opacity-90 z-50' 
                                         : 'hover:shadow-md z-10'
                                     }`}
                                     style={{
                                       ...provided.draggableProps.style,
                                       transform: snapshot.isDragging 
                                         ? provided.draggableProps.style?.transform 
                                         : provided.draggableProps.style?.transform,
                                       left: `${index * 200 + 4}px`, // Offset multiple tasks horizontally
                                       width: '190px',
                                       height: `${heightInPixels}px`,
                                       minHeight: '56px'
                                     }}
                                   >
                                     <Card 
                                       className={`h-full w-full ${getStatusColor(task.status)} border-l-4 select-none group shadow-sm relative`}
                                       style={{ borderLeftColor: task.priority === 'High' ? 'hsl(var(--destructive))' : task.priority === 'Medium' ? 'hsl(var(--warning))' : 'hsl(var(--success))' }}
                                     >
                                        {/* Top resize handle */}
                                        <div className="absolute -top-1 left-0 right-0 h-2 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                                          <div 
                                            className="bg-primary/80 hover:bg-primary text-primary-foreground rounded-full w-6 h-3 flex items-center justify-center cursor-n-resize shadow-sm"
                                            onMouseDown={(e) => handleResizeStart(e, task.id, 'top')}
                                          >
                                            <ChevronUp className="w-3 h-3" />
                                          </div>
                                        </div>
                                        
                                        {/* Bottom resize handle */}
                                        <div className="absolute -bottom-1 left-0 right-0 h-2 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                                          <div 
                                            className="bg-primary/80 hover:bg-primary text-primary-foreground rounded-full w-6 h-3 flex items-center justify-center cursor-s-resize shadow-sm"
                                            onMouseDown={(e) => handleResizeStart(e, task.id, 'bottom')}
                                          >
                                            <ChevronDown className="w-3 h-3" />
                                          </div>
                                        </div>
                                       
                                       {/* Drag handle area - separate from resize handles */}
                                       <div
                                         {...provided.dragHandleProps}
                                         className="cursor-grab active:cursor-grabbing absolute inset-2 z-10"
                                       />

                                       <CardContent className="p-3 h-full flex flex-col justify-start gap-1">
                                          <h4 className="text-sm font-semibold text-foreground leading-tight line-clamp-2">
                                            {task.taskName}
                                          </h4>
                                          
                                          <p className="text-xs text-muted-foreground/80 leading-tight">
                                            {task.projectName || "No Project"}
                                          </p>
                                          
                                          {slotsSpanned > 1 && (
                                            <div className="flex items-center gap-1 mt-1">
                                              <Clock className="w-3 h-3 text-muted-foreground/60" />
                                              <span className="text-xs text-muted-foreground/60">
                                                {taskDuration}min
                                              </span>
                                            </div>
                                          )}
                                          
                                          <div className="flex items-center gap-1 mt-auto">
                                            <Badge variant="outline" className={`text-xs px-1.5 py-0.5 ${getPriorityColor(task.priority)}`}>
                                              {task.priority}
                                            </Badge>
                                          </div>
                                       </CardContent>
                                     </Card>
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                        </div>
                        
                        {slot.tasks.length === 0 && !snapshot.isDraggingOver && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-30 transition-opacity">
                            <span className="text-xs text-muted-foreground">
                              {slot.label}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};