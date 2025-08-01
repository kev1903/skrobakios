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
    
    // First, add a combined 00:00-05:00 slot
    const nightTasks = dayTasks.filter(task => {
      const taskDateTime = new Date(task.dueDate);
      const taskHour = taskDateTime.getUTCHours();
      return taskHour >= 0 && taskHour < 5;
    });
    
    slots.push({
      hour: -1, // Special identifier for the combined night slot
      label: '00:00-05:00',
      tasks: nightTasks
    });
    
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
    const slotsChanged = Math.round(deltaY / 24); // Each slot is 24px height
    
    const task = tasks.find(t => t.id === dragState.taskId);
    if (!task) return;

    const currentDuration = task.duration || 30; // Default 30 minutes if no duration
    let newHeight: number;
    let newTop: number = 0;
    
    if (dragState.handle === 'top') {
      // Moving top handle - preview extending upward (dragging UP should extend duration backward)
      const newDuration = currentDuration + (-slotsChanged * 30); // Inverse the slotsChanged for top handle
      if (newDuration < 30) return; // Minimum 30 minutes
      
      newHeight = Math.ceil(newDuration / 30) * 24 - 8;
      newTop = slotsChanged * 24; // When dragging up (negative slotsChanged), this creates negative newTop
    } else {
      // Moving bottom handle - preview extending downward  
      const newDuration = currentDuration + (slotsChanged * 30);
      if (newDuration < 30) return; // Minimum 30 minutes
      
      newHeight = Math.ceil(newDuration / 30) * 24 - 8;
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
      -(dragState.previewTop || 0) / 24 * 30 : 
      ((dragState.previewHeight || 0) - ((task.duration || 30) / 30 * 24 - 8)) / 24 * 30;
    
    const currentDuration = task.duration || 30;
    
    if (dragState.handle === 'top') {
      // Calculate new start time and duration
      const slotsChanged = Math.round((dragState.previewTop || 0) / 24); // Note: no negative here since previewTop already has correct sign
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
      const heightDiff = (dragState.previewHeight || 0) - ((task.duration || 30) / 30 * 24 - 8);
      const slotsChanged = Math.round(heightDiff / 24);
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
    
    let position: number;
    
    // Calculate position based on slot arrangement with combined 00:00-05:00 slot
    if (hours >= 0 && hours < 5) {
      // Current time is in the combined 00:00-05:00 slot
      position = 12; // Middle of the first 24px slot
    } else {
      // Calculate position for slots starting from 05:00
      // Each slot after the night slot represents time from 05:00 onwards
      const minutesSince5AM = (hours - 5) * 60 + minutes;
      position = 24 + (minutesSince5AM / 30) * 24; // 24px for night slot + calculated position
    }
    
    return position;
  };

  const currentTimePosition = getCurrentTimePosition();
  const isCurrentDay = isSameDay(currentDate instanceof Date ? currentDate : new Date(currentDate), new Date());

  return (
    <div className="h-full flex bg-gradient-to-br from-background via-background to-muted/20 rounded-xl border border-border/30 shadow-lg overflow-hidden">
      {/* Main Timeline Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Column Headers */}
        <div className="border-b border-border/30 bg-gradient-to-r from-card/90 to-card/70 backdrop-blur-sm">
          <div className="grid grid-cols-[60px_40px_1fr_120px_80px_80px] h-10">
            <div className="border-r border-border/30 flex items-center justify-center">
              <span className="text-xs font-medium text-muted-foreground">Time</span>
            </div>
            <div className="border-r border-border/30 flex items-center justify-center">
              <span className="text-xs font-medium text-muted-foreground">Blocks</span>
            </div>
            <div className="border-r border-border/30 flex items-center justify-center">
              <span className="text-xs font-medium text-muted-foreground">Task Name</span>
            </div>
            <div className="border-r border-border/30 flex items-center justify-center">
              <span className="text-xs font-medium text-muted-foreground">Project</span>
            </div>
            <div className="border-r border-border/30 flex items-center justify-center">
              <span className="text-xs font-medium text-muted-foreground">Duration</span>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-xs font-medium text-muted-foreground">Priority</span>
            </div>
          </div>
        </div>
        
        {/* Timeline Grid */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <div className="grid grid-cols-[60px_40px_1fr_120px_80px_80px] min-h-full">
              {/* Time Column */}
              <div className="border-r border-border/30 bg-gradient-to-b from-card/80 to-card/60 backdrop-blur-sm min-w-[60px] shadow-inner">
                {timeSlots.map((slot, index) => {
                  const isFullHour = index % 2 === 0; // Every even slot is a full hour (00:00, 01:00, etc.)
                  return (
                    <div key={slot.hour} className={`h-6 border-b flex items-center justify-start pl-3 transition-colors hover:bg-accent/20 ${
                      isFullHour ? 'border-b-border/30 bg-card/30' : 'border-b-border/10 bg-transparent'
                    }`}>
                      <span className={`font-inter leading-tight ${
                        isFullHour ? 'text-xs font-medium text-foreground/80' : 'text-[10px] font-normal text-muted-foreground/70'
                      }`}>
                        {slot.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Time Blocks Column */}
              <div className="border-r border-border/30 bg-gradient-to-b from-card/60 to-card/40 backdrop-blur-sm relative">
                {timeSlots.map((slot, index) => (
                  <div key={`timeblock-${slot.hour}`} className="h-6 border-b border-border/10 relative">
                  </div>
                ))}
                
                {/* Time blocks positioned in this column */}
                {(() => {
                  const currentDay = currentDate instanceof Date ? currentDate : new Date(currentDate);
                  const blocksForDay = getBlocksForDay(currentDay, timeBlocks);
                  
                  return blocksForDay.map((block) => {
                    const startHour = parseInt(block.startTime.split(':')[0]);
                    const startMinute = parseInt(block.startTime.split(':')[1]);
                    const endHour = parseInt(block.endTime.split(':')[0]);
                    const endMinute = parseInt(block.endTime.split(':')[1]);
                    
                    let startPosition: number;
                    let endPosition: number;
                    
                    if (startHour >= 0 && startHour < 5) {
                      startPosition = 0;
                    } else {
                      const startTotalMinutes = startHour * 60 + startMinute;
                      const startSlotIndex = Math.floor((startTotalMinutes - 300) / 30);
                      startPosition = 24 + (startSlotIndex * 24);
                    }
                    
                    if (endHour >= 0 && endHour < 5) {
                      endPosition = 24;
                    } else {
                      const endTotalMinutes = endHour * 60 + endMinute;
                      const endSlotIndex = Math.floor((endTotalMinutes - 300) / 30);
                      endPosition = 24 + (endSlotIndex * 24);
                    }
                    
                    const heightPixels = Math.max(24, endPosition - startPosition);
                    
                    return (
                      <div
                        key={block.id}
                        className="absolute rounded border-l-4 backdrop-blur-sm pointer-events-none z-10"
                        style={{
                          top: `${startPosition}px`,
                          height: `${heightPixels}px`,
                          backgroundColor: `${block.color}20`,
                          borderLeftColor: block.color,
                          left: '2px',
                          right: '2px',
                        }}
                      >
                        <div className="p-1 h-full flex flex-col justify-center">
                          <div className="text-[10px] font-medium truncate" style={{ color: block.color }}>
                            {block.title}
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Task Name Column */}
              <div className="relative bg-gradient-to-b from-background/50 to-muted/10">
                {timeSlots.map((slot) => (
                  <div key={`taskname-${slot.hour}`} className="h-6 border-b border-border/10 relative">
                    <Droppable droppableId={`taskname-${slot.hour}`} direction="vertical">
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
                          {slot.tasks.map((task, index) => {
                            const taskDuration = task.duration || 30;
                            const slotsSpanned = Math.ceil(taskDuration / 30);
                            let heightInPixels = (slotsSpanned * 24) - 4;
                            let topOffset = 0;
                            
                            if (dragState.isDragging && dragState.taskId === task.id) {
                              if (dragState.previewHeight !== null) {
                                heightInPixels = dragState.previewHeight;
                              }
                              if (dragState.previewTop !== null) {
                                topOffset = dragState.previewTop;
                              }
                            }
                            
                            return (
                              <Draggable key={`taskname-${task.id}`} draggableId={task.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`absolute left-0 right-0 px-1 py-1 flex items-center bg-background/80 backdrop-blur-sm border-r border-border/30 ${
                                      snapshot.isDragging ? 'shadow-xl opacity-90 z-50' : 'hover:shadow-md z-10'
                                    }`}
                                    style={{
                                      ...provided.draggableProps.style,
                                      top: snapshot.isDragging ? undefined : `${topOffset}px`,
                                      height: snapshot.isDragging ? undefined : `${heightInPixels}px`,
                                      minHeight: '20px'
                                    }}
                                  >
                                    <div className={`rounded px-2 py-1 text-xs w-full border ${getStatusColor(task.status)}`}>
                                      <span className="font-medium truncate block">{task.taskName}</span>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                ))}
              </div>

              {/* Project Column */}
              <div className="relative bg-gradient-to-b from-background/50 to-muted/10">
                {timeSlots.map((slot) => (
                  <div key={`project-${slot.hour}`} className="h-6 border-b border-border/10 relative">
                    <div className="absolute inset-0">
                      {slot.tasks.map((task, index) => {
                        const taskDuration = task.duration || 30;
                        const slotsSpanned = Math.ceil(taskDuration / 30);
                        let heightInPixels = (slotsSpanned * 24) - 4;
                        let topOffset = 0;
                        
                        if (dragState.isDragging && dragState.taskId === task.id) {
                          if (dragState.previewHeight !== null) {
                            heightInPixels = dragState.previewHeight;
                          }
                          if (dragState.previewTop !== null) {
                            topOffset = dragState.previewTop;
                          }
                        }
                        
                        return (
                          <div
                            key={`project-${task.id}`}
                            className="absolute left-0 right-0 px-1 py-1 flex items-center bg-background/60 backdrop-blur-sm border-r border-border/30"
                            style={{
                              top: `${topOffset}px`,
                              height: `${heightInPixels}px`,
                              minHeight: '20px'
                            }}
                          >
                            <div className="rounded px-2 py-1 text-xs w-full bg-muted/20 border border-border/30">
                              <span className="text-foreground/80 truncate block font-medium">{task.projectName || 'No Project'}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Duration Column */}
              <div className="relative bg-gradient-to-b from-background/50 to-muted/10">
                {timeSlots.map((slot) => (
                  <div key={`duration-${slot.hour}`} className="h-6 border-b border-border/10 relative">
                    <div className="absolute inset-0">
                      {slot.tasks.map((task, index) => {
                        const taskDuration = task.duration || 30;
                        const slotsSpanned = Math.ceil(taskDuration / 30);
                        let heightInPixels = (slotsSpanned * 24) - 4;
                        let topOffset = 0;
                        
                        if (dragState.isDragging && dragState.taskId === task.id) {
                          if (dragState.previewHeight !== null) {
                            heightInPixels = dragState.previewHeight;
                          }
                          if (dragState.previewTop !== null) {
                            topOffset = dragState.previewTop;
                          }
                        }
                        
                        return (
                          <div
                            key={`duration-${task.id}`}
                            className="absolute left-0 right-0 px-1 py-1 flex items-center justify-center bg-background/60 backdrop-blur-sm border-r border-border/30"
                            style={{
                              top: `${topOffset}px`,
                              height: `${heightInPixels}px`,
                              minHeight: '20px'
                            }}
                          >
                            <div className="rounded px-2 py-1 text-xs bg-accent/20 border border-border/30">
                              <span className="font-medium text-foreground/90">{taskDuration}min</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Priority Column */}
              <div className="relative bg-gradient-to-b from-background/50 to-muted/10">
                {timeSlots.map((slot) => (
                  <div key={`priority-${slot.hour}`} className="h-6 border-b border-border/10 relative">
                    <div className="absolute inset-0">
                      {slot.tasks.map((task, index) => {
                        const taskDuration = task.duration || 30;
                        const slotsSpanned = Math.ceil(taskDuration / 30);
                        let heightInPixels = (slotsSpanned * 24) - 4;
                        let topOffset = 0;
                        
                        if (dragState.isDragging && dragState.taskId === task.id) {
                          if (dragState.previewHeight !== null) {
                            heightInPixels = dragState.previewHeight;
                          }
                          if (dragState.previewTop !== null) {
                            topOffset = dragState.previewTop;
                          }
                        }
                        
                        return (
                          <div
                            key={`priority-${task.id}`}
                            className="absolute left-0 right-0 px-1 py-1 flex items-center justify-center bg-background/60 backdrop-blur-sm"
                            style={{
                              top: `${topOffset}px`,
                              height: `${heightInPixels}px`,
                              minHeight: '20px'
                            }}
                          >
                            <Badge variant="outline" className={`text-[9px] px-1 py-0 ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Time Indicator */}
            <div className="absolute inset-0 pointer-events-none">
              {isCurrentDay && (
                <div 
                  className="absolute z-50 pointer-events-none"
                  style={{ 
                    top: `${currentTimePosition}px`,
                    left: '-60px',
                    right: '0'
                  }}
                >
                  <div className="absolute -left-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-md"></div>
                  <div className="w-full h-0.5 bg-red-500 shadow-sm"></div>
                  <div className="absolute -right-16 -top-2 bg-red-500 text-white text-xs px-2 py-1 rounded shadow-md font-medium">
                    {format(currentTime, 'HH:mm')}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Sidebar */}
      <div className="w-80 border-l border-border/30 bg-gradient-to-b from-card/90 to-card/70 backdrop-blur-sm overflow-hidden">
        <div className="h-full flex flex-col">
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