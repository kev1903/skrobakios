import React, { useState, useCallback, useRef } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { format, isSameDay, setHours, setMinutes, addMinutes, subMinutes } from 'date-fns';
import { Clock, Plus, ChevronUp, ChevronDown, Target } from 'lucide-react';
import { Task } from './types';
import { TimeBlock } from '../calendar/types';
import { getBlocksForDay } from '../calendar/utils';
import { supabase } from '@/integrations/supabase/client';

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
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [priorities, setPriorities] = useState<string[]>(['', '', '']);

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

  // Update current time every minute
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Generate 24-hour time slots
  const generateTimeSlots = useCallback((): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    
    // Filter tasks for current date that have specific times (not midnight)
    const dayTasks = tasks.filter(task => {
      const taskDate = new Date(task.dueDate);
      const dateObj = currentDate instanceof Date ? currentDate : new Date(currentDate);
      if (!isSameDay(taskDate, dateObj)) return false;
      
      // Show tasks with specific times (not at midnight/00:00) in timeline
      // Tasks at midnight are considered "unscheduled" and stay in backlog
      return !(taskDate.getUTCHours() === 0 && taskDate.getUTCMinutes() === 0);
    });
    
    // First, add individual slots for 00:00-05:00 range
    for (let hour = 0; hour < 5; hour++) {
      for (let minutes = 0; minutes < 60; minutes += 30) {
        const timeDate = new Date();
        timeDate.setHours(hour, minutes, 0, 0);
        const timeLabel = format(timeDate, 'HH:mm');
        
        const nightTasks = dayTasks.filter(task => {
          const taskDateTime = new Date(task.dueDate);
          const taskHour = taskDateTime.getUTCHours();
          const taskMinutes = taskDateTime.getUTCMinutes();
          
          return taskHour === hour && 
                 ((minutes === 0 && taskMinutes >= 0 && taskMinutes < 30) ||
                  (minutes === 30 && taskMinutes >= 30 && taskMinutes < 60));
        });
        
        slots.push({
          hour: hour * 2 + (minutes / 30), // Create unique slot identifier
          label: timeLabel,
          tasks: nightTasks
        });
      }
    }
    
    // Generate remaining slots starting from 05:00 (slot index 10 = 05:00)
    // Generate 38 30-minute slots (from 05:00 to 24:00 = 19 hours × 2)
    for (let slotIndex = 10; slotIndex < 48; slotIndex++) {
      const hour = Math.floor(slotIndex / 2);
      const minutes = (slotIndex % 2) * 30;
      
      // Create a proper date object for time formatting
      const timeDate = new Date();
      timeDate.setHours(hour, minutes, 0, 0);
      const timeLabel = format(timeDate, 'HH:mm');
      
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
      
      slots.push({
        hour: slotIndex, // Represents 30-minute slot index
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
    previewHeight: number | null;
    previewTop: number | null;
  }>({
    isDragging: false,
    taskId: null,
    handle: null,
    startY: 0,
    startTime: null,
    previewHeight: null,
    previewTop: null
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
      startTime: new Date(task.dueDate),
      previewHeight: null,
      previewTop: null
    });
  }, [tasks]);

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging || !dragState.taskId || !dragState.startTime) return;

    const deltaY = e.clientY - dragState.startY;
    const slotsChanged = Math.round(deltaY / 64); // Each slot is 64px height
    
    const task = tasks.find(t => t.id === dragState.taskId);
    if (!task) return;

    const currentDuration = task.duration || 30; // Default 30 minutes if no duration
    let newHeight: number;
    let newTop: number = 0;
    
    if (dragState.handle === 'top') {
      // Moving top handle - preview extending upward (dragging UP should extend duration backward)
      const newDuration = currentDuration + (-slotsChanged * 30); // Inverse the slotsChanged for top handle
      if (newDuration < 30) return; // Minimum 30 minutes
      
      newHeight = Math.ceil(newDuration / 30) * 64 - 8;
      newTop = slotsChanged * 64; // When dragging up (negative slotsChanged), this creates negative newTop
    } else {
      // Moving bottom handle - preview extending downward  
      const newDuration = currentDuration + (slotsChanged * 30);
      if (newDuration < 30) return; // Minimum 30 minutes
      
      newHeight = Math.ceil(newDuration / 30) * 64 - 8;
      newTop = 0; // Keep top position same
    }
    
    // Update preview state for live feedback
    setDragState(prev => ({
      ...prev,
      previewHeight: newHeight,
      previewTop: newTop
    }));
  }, [dragState, tasks]);

  const handleResizeEnd = useCallback(async () => {
    if (!dragState.isDragging || !dragState.taskId || !dragState.startTime || !onTaskUpdate) {
      setDragState({
        isDragging: false,
        taskId: null,
        handle: null,
        startY: 0,
        startTime: null,
        previewHeight: null,
        previewTop: null
      });
      return;
    }

    const task = tasks.find(t => t.id === dragState.taskId);
    if (!task) return;

    const deltaY = document.body.style.cursor === 'n-resize' ? 
      -(dragState.previewTop || 0) / 64 * 30 : 
      ((dragState.previewHeight || 0) - ((task.duration || 30) / 30 * 64 - 8)) / 64 * 30;
    
    const currentDuration = task.duration || 30;
    
    if (dragState.handle === 'top') {
      // Calculate new start time and duration
      const slotsChanged = Math.round((dragState.previewTop || 0) / 64); // Note: no negative here since previewTop already has correct sign
      const newStartTime = subMinutes(dragState.startTime, slotsChanged * 30);
      const newDuration = currentDuration + (-slotsChanged * 30); // Inverse for top handle
      
      if (newDuration >= 30) {
        await onTaskUpdate(dragState.taskId, {
          dueDate: newStartTime.toISOString(),
          duration: newDuration
        });
      }
    } else {
      // Calculate new duration
      const heightDiff = (dragState.previewHeight || 0) - ((task.duration || 30) / 30 * 64 - 8);
      const slotsChanged = Math.round(heightDiff / 64);
      const newDuration = currentDuration + (slotsChanged * 30);
      
      if (newDuration >= 30) {
        await onTaskUpdate(dragState.taskId, {
          duration: newDuration
        });
      }
    }

    // Reset drag state
    setDragState({
      isDragging: false,
      taskId: null,
      handle: null,
      startY: 0,
      startTime: null,
      previewHeight: null,
      previewTop: null
    });
  }, [dragState, tasks, onTaskUpdate]);

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

  // Calculate current time indicator position
  const getCurrentTimePosition = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // Calculate position based on individual 30-minute slots throughout the day
    const totalMinutesFromMidnight = hours * 60 + minutes;
    const slotIndex = Math.floor(totalMinutesFromMidnight / 30);
    const minutesIntoSlot = totalMinutesFromMidnight % 30;
    
    // Each slot is 64px, position within slot based on minutes
    const position = slotIndex * 64 + (minutesIntoSlot / 30) * 64;
    
    return position;
  };

  const currentTimePosition = getCurrentTimePosition();
  const isCurrentDay = isSameDay(currentDate instanceof Date ? currentDate : new Date(currentDate), new Date());

  return (
    <div className="h-full flex bg-gradient-to-br from-background via-background to-muted/20 rounded-xl border border-border/30 shadow-lg overflow-hidden">
      {/* Main Timeline Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Timeline Grid */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <div className="grid grid-cols-[100px_1fr] min-h-full">
              {/* Time Column */}
              <div className="border-r border-border/30 bg-gradient-to-b from-card/80 to-card/60 backdrop-blur-sm min-w-[100px] shadow-inner">
                {timeSlots.map((slot, index) => {
                  const isFullHour = index % 2 === 0; // Every even slot is a full hour (00:00, 01:00, etc.)
                  return (
                    <div key={slot.hour} className={`h-16 border-b flex items-start justify-end pr-4 pt-2 transition-colors hover:bg-accent/20 ${
                      isFullHour ? 'border-b-border/30 bg-card/30' : 'border-b-border/10 bg-transparent'
                    }`}>
                      <span className={`font-inter leading-tight ${
                        isFullHour ? 'text-sm font-medium text-foreground/80' : 'text-xs font-normal text-muted-foreground/70'
                      }`}>
                        {slot.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Events Column */}
              <div className="relative bg-gradient-to-b from-background/50 to-muted/10">
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
                              let heightInPixels = (slotsSpanned * 64) - 8; // 64px per slot minus padding
                              let topOffset = 0;
                              
                              // Apply live preview for resizing
                              if (dragState.isDragging && dragState.taskId === task.id) {
                                if (dragState.previewHeight !== null) {
                                  heightInPixels = dragState.previewHeight;
                                }
                                if (dragState.previewTop !== null) {
                                  topOffset = dragState.previewTop;
                                }
                              }
                              
                              return (
                                 <Draggable key={task.id} draggableId={`timeline-${task.id}`} index={index}>
                                   {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        data-dragging={snapshot.isDragging}
                                        className={`absolute ${
                                          // Disable transitions during resize operations to prevent flashing
                                          dragState.isDragging && dragState.taskId === task.id
                                            ? 'border-2 border-primary/50' 
                                            : 'transition-all duration-200'
                                        } ${
                                          snapshot.isDragging 
                                            ? 'shadow-xl opacity-90 z-50' 
                                            : 'hover:shadow-md z-10'
                                        }`}
                                        style={{
                                          ...provided.draggableProps.style,
                                          // Fix drag offset by using consistent positioning
                                          transform: snapshot.isDragging 
                                            ? provided.draggableProps.style?.transform 
                                            : `translate(${index * 200 + 4}px, ${topOffset}px)`,
                                          left: snapshot.isDragging ? 0 : `${index * 200 + 4}px`,
                                          top: snapshot.isDragging ? 0 : `${topOffset}px`,
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
                                          
                                          {/* Main task content */}
                                          <CardContent className="p-3 flex flex-col justify-between h-full">
                                            <div {...provided.dragHandleProps} className="cursor-move flex-1 min-h-0">
                                              <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-sm leading-tight mb-1 truncate">
                                                  {task.taskName}
                                                </h4>
                                                  {task.description && (
                                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                                      {task.description}
                                                    </p>
                                                  )}
                                                </div>
                                              </div>
                                              
                                              {/* Task metadata */}
                                              <div className="flex flex-wrap gap-1 mt-auto">
                                                <Badge className={`text-xs px-1 py-0 h-5 ${getPriorityColor(task.priority)}`}>
                                                  {task.priority}
                                                </Badge>
                                                {task.duration && (
                                                  <Badge variant="outline" className="text-xs px-1 py-0 h-5 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {task.duration}m
                                                  </Badge>
                                                )}
                                              </div>
                                            </div>
                                          </CardContent>
                                          
                                          {/* Bottom resize handle */}
                                          <div className="absolute -bottom-1 left-0 right-0 h-2 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20">
                                            <div 
                                              className="bg-primary/80 hover:bg-primary text-primary-foreground rounded-full w-6 h-3 flex items-center justify-center cursor-s-resize shadow-sm"
                                              onMouseDown={(e) => handleResizeStart(e, task.id, 'bottom')}
                                            >
                                              <ChevronDown className="w-3 h-3" />
                                            </div>
                                          </div>
                                       </Card>
                                     </div>
                                  )}
                                </Draggable>
                              );
                            })}
                          </div>
                          
                          {provided.placeholder}
                          
                          {slot.tasks.length === 0 && !snapshot.isDraggingOver && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-30 transition-opacity z-10">
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
                
                {/* Time blocks overlay */}
                {(() => {
                  // Ensure currentDate is a Date object
                  const dateObj = currentDate instanceof Date ? currentDate : new Date(currentDate);
                  const dayBlocks = getBlocksForDay(dateObj, timeBlocks);
                  
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
                    
                    console.log(`Time block: ${block.title}, Category: ${block.category}, Color: ${block.color}`);
                    
                    // Override colors based on title/category for the specific blocks you mentioned
                    let blockColor = block.color;
                    if (block.title.toLowerCase().includes('devotion')) {
                      blockColor = 'bg-yellow-400';
                    } else if (block.title.toLowerCase().includes('get ready')) {
                      blockColor = 'bg-green-400';
                    }
                    
                    return (
                      <div
                        key={`timeblock-${block.id}`}
                        className={`bg-transparent border-2 ${blockColor.replace('bg-', 'border-')} absolute left-2 right-2 pointer-events-none z-0 rounded-lg backdrop-blur-sm`}
                        style={{
                          top: `${startPosition}px`,
                          height: `${Math.max(duration - 2, 20)}px`
                        }}
                      >
                        <div className={`p-2 text-xs font-medium leading-tight ${blockColor.replace('bg-', 'text-')}`}>
                          <div className="truncate">{block.title}</div>
                          {block.description && (
                            <div className="text-xs opacity-75 truncate">{block.description}</div>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
                
                {/* Current Time Indicator - Only show for current day */}
                {isCurrentDay && (
                  <div 
                    className="absolute left-0 right-0 z-50 pointer-events-none"
                    style={{ top: `${currentTimePosition}px` }}
                  >
                    {/* Time dot */}
                    <div className="absolute -left-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-md"></div>
                    {/* Time line */}
                    <div className="w-full h-0.5 bg-red-500 shadow-sm"></div>
                    {/* Current time label */}
                    <div className="absolute -right-16 -top-2 bg-red-500 text-white text-xs px-2 py-1 rounded shadow-md font-medium">
                      {format(currentTime, 'HH:mm')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Sidebar */}
      <div className="w-80 border-l border-border/30 bg-gradient-to-b from-card/90 to-card/70 backdrop-blur-sm overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          
          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Quick Stats */}
            <Card className="p-4 bg-background/50 border-border/50">
              <h4 className="font-medium mb-3 text-sm">Today's Overview</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Tasks</span>
                  <Badge variant="secondary">{tasks.filter(task => isSameDay(new Date(task.dueDate), currentDate instanceof Date ? currentDate : new Date(currentDate))).length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Completed</span>
                  <Badge variant="secondary" className="bg-success/20 text-success">
                    {tasks.filter(task => isSameDay(new Date(task.dueDate), currentDate instanceof Date ? currentDate : new Date(currentDate)) && task.status === 'Completed').length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">In Progress</span>
                  <Badge variant="secondary" className="bg-primary/20 text-primary">
                    {tasks.filter(task => isSameDay(new Date(task.dueDate), currentDate instanceof Date ? currentDate : new Date(currentDate)) && task.status === 'In Progress').length}
                  </Badge>
                </div>
              </div>
            </Card>
            
            {/* Upcoming Tasks */}
            <Card className="p-4 bg-background/50 border-border/50">
              <h4 className="font-medium mb-3 text-sm">Upcoming Tasks</h4>
              <div className="space-y-2">
                {tasks
                  .filter(task => isSameDay(new Date(task.dueDate), currentDate instanceof Date ? currentDate : new Date(currentDate)) && task.status !== 'Completed')
                  .slice(0, 5)
                  .map(task => (
                    <div key={task.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent/20 transition-colors">
                      <div className={`w-2 h-2 rounded-full ${
                        task.priority === 'High' ? 'bg-destructive' : 
                        task.priority === 'Medium' ? 'bg-warning' : 'bg-success'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{task.taskName}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(task.dueDate), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))}
                {tasks.filter(task => isSameDay(new Date(task.dueDate), currentDate instanceof Date ? currentDate : new Date(currentDate)) && task.status !== 'Completed').length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No upcoming tasks</p>
                )}
              </div>
            </Card>
            
            {/* Top Priorities */}
            <Card className="p-4 bg-background/50 border-border/50">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-primary" />
                <h4 className="font-medium text-sm">Top 3 Priorities Today</h4>
              </div>
              <div className="space-y-3">
                {priorities.map((priority, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-sm font-medium text-muted-foreground mt-2 min-w-[20px]">
                      {index + 1}.
                    </span>
                    <Input
                      placeholder={`Priority ${index + 1}`}
                      value={priority}
                      onChange={(e) => {
                        const newPriorities = [...priorities];
                        newPriorities[index] = e.target.value;
                        setPriorities(newPriorities);
                      }}
                      className="text-sm"
                    />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};