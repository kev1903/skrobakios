import React, { useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format, isSameDay, setHours, setMinutes } from 'date-fns';
import { Clock, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Task } from '../tasks/types';

interface MyTasksCalendarViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => Promise<void>;
}

interface TimeSlot {
  hour: number;
  label: string;
  tasks: Task[];
}

export const MyTasksCalendarView: React.FC<MyTasksCalendarViewProps> = ({ 
  tasks, 
  onTaskClick,
  onTaskUpdate 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  // Generate 24-hour time slots with tasks distributed by hour
  const generateTimeSlots = useCallback((): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const todayTasks = tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      return isSameDay(taskDate, currentDate);
    });

    for (let hour = 0; hour < 24; hour++) {
      const timeLabel = format(setHours(setMinutes(new Date(), 0), hour), 'HH:mm');
      
      // For now, put all tasks in 9 AM slot as default, in real implementation
      // this would parse task times or allow user to assign them
      const hourTasks = hour === 9 ? todayTasks : [];
      
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

  const navigateDate = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
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

    // Update the task if update function is provided
    if (onTaskUpdate) {
      const task = tasks.find(t => t.id === draggableId);
      if (task) {
        const newDateTime = setHours(setMinutes(new Date(currentDate), 0), destinationHour);
        try {
          await onTaskUpdate(task.id, {
            dueDate: newDateTime.toISOString().split('T')[0]
          });
        } catch (error) {
          console.error('Failed to update task:', error);
          // Revert the local state on error
          setTimeSlots(generateTimeSlots());
        }
      }
    }
  }, [currentDate, tasks, onTaskUpdate, generateTimeSlots]);

  React.useEffect(() => {
    setTimeSlots(generateTimeSlots());
  }, [generateTimeSlots]);

  const todayTasks = tasks.filter(task => {
    const taskDate = new Date(task.dueDate);
    return isSameDay(taskDate, currentDate);
  });

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Daily Schedule
          </h3>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigateDate('prev')}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-medium px-4 min-w-[180px] text-center">
              {format(currentDate, 'EEEE, MMMM d, yyyy')}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigateDate('next')}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Task Summary */}
      <div className="text-sm text-muted-foreground">
        {todayTasks.length === 0 
          ? 'No tasks scheduled for this day' 
          : `${todayTasks.length} ${todayTasks.length === 1 ? 'task' : 'tasks'} scheduled`
        }
      </div>

      {/* Timeline */}
      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <Card>
          <CardContent className="p-0">
            <div className="max-h-[600px] overflow-y-auto">
              {timeSlots.map((slot) => (
                <div key={slot.hour} className="grid grid-cols-12 border-b border-border/50 min-h-[60px] last:border-b-0">
                  {/* Time Label */}
                  <div className="col-span-2 flex items-center justify-center p-3 bg-muted/30 border-r border-border/50">
                    <span className="text-sm font-medium text-muted-foreground">
                      {slot.label}
                    </span>
                  </div>

                  {/* Task Drop Zone */}
                  <div className="col-span-10 p-3">
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
                                    <Card 
                                      className={`w-64 ${getStatusColor(task.status)} border-2 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow`}
                                      onClick={() => onTaskClick(task)}
                                    >
                                      <CardContent className="p-3">
                                        <div className="space-y-2">
                                          <div className="flex items-start justify-between">
                                            <h4 className="text-sm font-medium line-clamp-2 pr-2">
                                              {task.taskName}
                                            </h4>
                                            <Badge variant="outline" className={`ml-2 ${getPriorityColor(task.priority)} text-xs flex-shrink-0`}>
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
                                          
                                          <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground">
                                              {task.projectName}
                                            </span>
                                            <Badge variant="outline" className="text-xs">
                                              {task.status}
                                            </Badge>
                                          </div>
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
                              Drop tasks here for {slot.label}
                            </div>
                          )}
                        </div>
                      )}
                    </Droppable>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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