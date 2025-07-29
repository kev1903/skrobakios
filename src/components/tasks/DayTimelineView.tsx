import React, { useState, useCallback } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format, isSameDay, setHours, setMinutes } from 'date-fns';
import { Clock, Plus } from 'lucide-react';
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
    
    for (let hour = 0; hour < 24; hour++) {
      const timeLabel = format(setHours(setMinutes(new Date(), 0), hour), 'HH:mm');
      
      // Filter tasks for this specific hour using the datetime stored in dueDate
      const hourTasks = dayTasks.filter(task => {
        try {
          const taskDateTime = new Date(task.dueDate);
          if (isNaN(taskDateTime.getTime())) return false; // Invalid date
          
          // Use UTC hours to avoid timezone conversion issues
          return taskDateTime.getUTCHours() === hour;
        } catch (error) {
          console.error('Error parsing task date:', task.dueDate, error);
          return false;
        }
      });
      
      console.log(`🕐 Hour ${hour} (${timeLabel}):`, hourTasks.length, 'tasks');
      
      slots.push({
        hour,
        label: timeLabel,
        tasks: hourTasks
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
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5" />
          {format(currentDate, 'EEEE, MMMM d, yyyy')}
        </h3>
        <Button size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-1" />
          Add Task
        </Button>
      </div>

        <div className="grid grid-cols-1 gap-1 max-h-[600px] overflow-y-auto border border-border rounded-lg bg-card">
          {timeSlots.map((slot) => (
            <div key={slot.hour} className="grid grid-cols-12 border-b border-border/50 min-h-[60px]">
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
                      className={`min-h-[44px] rounded-md transition-colors ${
                        snapshot.isDraggingOver
                          ? 'bg-primary/10 border-2 border-dashed border-primary/30'
                          : 'bg-background hover:bg-muted/20'
                      }`}
                    >
                      <div className="flex flex-wrap gap-2 p-1">
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
                                <Card className={`w-48 ${getStatusColor(task.status)} border-2 cursor-grab active:cursor-grabbing select-none`}>
                                  <CardContent className="p-3">
                                     <div className="space-y-2">
                                       {/* Task Name */}
                                       <h4 className="text-sm font-medium line-clamp-2 text-foreground">
                                         {task.taskName}
                                       </h4>
                                       
                                       {/* Project Name */}
                                       <p className="text-xs text-muted-foreground truncate">
                                         {task.projectName || 'No Project'}
                                       </p>
                                       
                                       {/* Due Date */}
                                       <p className="text-xs text-muted-foreground">
                                         {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy HH:mm') : 'No due date'}
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