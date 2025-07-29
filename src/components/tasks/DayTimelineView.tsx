import React, { useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
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
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  // Generate 24-hour time slots
  const generateTimeSlots = useCallback((): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    for (let hour = 0; hour < 24; hour++) {
      const timeLabel = format(setHours(setMinutes(new Date(), 0), hour), 'HH:mm');
      const dayTasks = tasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        return isSameDay(taskDate, currentDate);
      });
      
      slots.push({
        hour,
        label: timeLabel,
        tasks: hour === 9 ? dayTasks : [] // Default tasks to 9 AM for now
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

  const handleDragStart = useCallback((start: any) => {
    const taskId = start.draggableId;
    const task = tasks.find(t => t.id === taskId);
    setDraggedTask(task || null);
  }, [tasks]);

  const handleDragEnd = useCallback(async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    setDraggedTask(null);

    if (!destination) return;

    const sourceHour = parseInt(source.droppableId.replace('hour-', ''));
    const destinationHour = parseInt(destination.droppableId.replace('hour-', ''));

    if (sourceHour === destinationHour) return;

    // Update local state immediately for better UX
    setTimeSlots(prevSlots => {
      const newSlots = [...prevSlots];
      const sourceSlot = newSlots[sourceHour];
      const destinationSlot = newSlots[destinationHour];
      
      const [movedTask] = sourceSlot.tasks.splice(source.index, 1);
      destinationSlot.tasks.splice(destination.index, 0, movedTask);
      
      return newSlots;
    });

    // Update the task's due date/time
    const task = tasks.find(t => t.id === draggableId);
    if (task) {
      const newDateTime = setHours(setMinutes(new Date(currentDate), 0), destinationHour);
      try {
        if (onTaskUpdate) {
          await onTaskUpdate(task.id, {
            dueDate: newDateTime.toISOString().split('T')[0]
          });
        }
      } catch (error) {
        console.error('Failed to update task:', error);
        // Revert the local state on error
        setTimeSlots(generateTimeSlots());
      }
    }
  }, [currentDate, tasks, onTaskUpdate, generateTimeSlots]);

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

      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
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
                <Droppable droppableId={`hour-${slot.hour}`} direction="horizontal">
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
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`transition-all duration-200 ${
                                  snapshot.isDragging 
                                    ? 'rotate-2 scale-105 shadow-lg z-50' 
                                    : 'hover:scale-105'
                                }`}
                              >
                                <Card className={`w-48 ${getStatusColor(task.status)} border-2 cursor-grab active:cursor-grabbing`}>
                                  <CardContent className="p-3">
                                    <div className="space-y-2">
                                      <div className="flex items-start justify-between">
                                        <h4 className="text-sm font-medium line-clamp-2">
                                          {task.taskName}
                                        </h4>
                                        <Badge variant="outline" className={`ml-2 ${getPriorityColor(task.priority)} text-xs`}>
                                          {task.priority}
                                        </Badge>
                                      </div>
                                      
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground">
                                          {task.assignedTo.name}
                                        </span>
                                        <div className="flex items-center gap-1">
                                          <div className="w-12 bg-muted rounded-full h-2">
                                            <div 
                                              className="h-2 bg-primary rounded-full transition-all"
                                              style={{ width: `${task.progress}%` }}
                                            />
                                          </div>
                                          <span className="text-muted-foreground">
                                            {task.progress}%
                                          </span>
                                        </div>
                                      </div>
                                      
                                      {task.description && (
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                          {task.description}
                                        </p>
                                      )}
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
      </DragDropContext>

      {draggedTask && (
        <div className="fixed bottom-4 right-4 z-50">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-3">
              <div className="text-sm font-medium">
                Moving: {draggedTask.taskName}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};