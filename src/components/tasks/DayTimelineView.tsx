import React, { useState, useCallback, useRef } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { format, isSameDay, setHours, setMinutes, addMinutes, subMinutes } from 'date-fns';
import { Clock, Plus, ChevronUp, ChevronDown, Target, GripVertical } from 'lucide-react';
import { Task } from './types';
import { TimeBlock } from '../calendar/types';
import { getBlocksForDay } from '../calendar/utils';
import { supabase } from '@/integrations/supabase/client';
import { useTimeTracking } from '@/hooks/useTimeTracking';

interface DayTimelineViewProps {
  currentDate: Date;
  tasks?: Task[];
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => Promise<void>;
  isDragActive?: boolean;
  enableDragDrop?: boolean;
}

interface TimeSlot {
  hour: number;
  label: string;
  tasks: Task[];
}

interface LayoutItem {
  id: string;
  type: 'task' | 'timeblock';
  data: Task | TimeBlock;
  startMinutes: number;
  endMinutes: number;
  duration: number;
  topPosition: number;
  height: number;
  column: number;
  columnWidth: number;
  leftOffset: number;
}

export const DayTimelineView: React.FC<DayTimelineViewProps> = ({ 
  currentDate, 
  tasks = [], 
  onTaskUpdate,
  isDragActive = false,
  enableDragDrop = false
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [priorities, setPriorities] = useState<string[]>(['', '', '']);
  const { settings } = useTimeTracking();
  
  // Get category colors from time tracking settings - now in HSL format
  const categoryColors = settings?.category_colors || {
    'Design': '217 91% 60%',
    'Admin': '159 61% 51%',
    'Calls': '43 96% 56%',
    'Break': '0 84% 60%',
    'Browsing': '263 69% 69%',
    'Site Visit': '188 94% 43%',
    'Deep Work': '160 84% 39%',
    'Other': '217 33% 47%',
    work: '217 91% 60%',
    personal: '159 61% 51%',
    meeting: '43 96% 56%',
    break: '0 84% 60%',
    family: '327 73% 97%',
    site_visit: '188 94% 43%',
    church: '263 69% 69%',
    rest: '217 33% 47%'
  };

  // Load time blocks from database
  const loadTimeBlocks = useCallback(async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        setTimeBlocks([]);
        return;
      }

      const { data, error } = await supabase
        .from('time_blocks')
        .select('*')
        .eq('user_id', user.user.id)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) throw error;

      const formattedBlocks: TimeBlock[] = data?.map(block => ({
        id: block.id,
        title: block.title,
        description: block.description || '',
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

  // Improved layout engine with proper cross-type overlap detection
  const calculateLayout = useCallback((): { tasks: LayoutItem[], timeBlocks: LayoutItem[] } => {
    const dayTasks = tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      const dateObj = currentDate instanceof Date ? currentDate : new Date(currentDate);
      if (!isSameDay(taskDate, dateObj)) return false;
      
      // Only show tasks with specific times (not at midnight)
      const hours = taskDate.getHours();
      const minutes = taskDate.getMinutes();
      return !(hours === 0 && minutes === 0);
    });

    const currentDay = currentDate instanceof Date ? currentDate : new Date(currentDate);
    const blocksForDay = getBlocksForDay(currentDay, timeBlocks);

    // Helper function to check if two time ranges overlap
    const doTimesOverlap = (start1: number, end1: number, start2: number, end2: number): boolean => {
      return start1 < end2 && start2 < end1;
    };

    // Process tasks into layout items with precise positioning
    const taskItems: LayoutItem[] = dayTasks.map(task => {
      const taskDateTime = new Date(task.dueDate);
      const startMinutes = taskDateTime.getHours() * 60 + taskDateTime.getMinutes();
      const duration = task.duration || 30;
      const endMinutes = startMinutes + duration;
      
      // Calculate exact slot alignment - each 30-min slot is 24px high
      const startSlot = startMinutes / 30; // Exact slot position
      const endSlot = endMinutes / 30;
      const topPosition = startSlot * 24; // 24px per 30-min slot
      const height = Math.max(20, (endSlot - startSlot) * 24);

      return {
        id: `task-${task.id}`,
        type: 'task' as const,
        data: task,
        startMinutes,
        endMinutes,
        duration,
        topPosition,
        height,
        column: 0,
        columnWidth: 100,
        leftOffset: 0
      };
    });

    // Process time blocks into layout items
    const blockItems: LayoutItem[] = blocksForDay.map(block => {
      const startTime = block.startTime.split(':');
      const endTime = block.endTime.split(':');
      const startMinutes = parseInt(startTime[0]) * 60 + parseInt(startTime[1]);
      const endMinutes = parseInt(endTime[0]) * 60 + parseInt(endTime[1]);
      
      // Calculate exact slot alignment - each slot is 30 minutes and 24px high
      const startSlot = startMinutes / 30; // Exact slot position (can be fractional)
      const endSlot = endMinutes / 30;
      const topPosition = startSlot * 24; // 24px per slot
      const height = Math.max(20, (endSlot - startSlot) * 24); // No gap reduction for exact alignment

      return {
        id: `block-${block.id}`,
        type: 'timeblock' as const,
        data: block,
        startMinutes,
        endMinutes,
        duration: endMinutes - startMinutes,
        topPosition: topPosition, // Remove offset for exact alignment
        height,
        column: 0,
        columnWidth: 100,
        leftOffset: 0
      };
    });

    // CRITICAL FIX: Combine all items for unified overlap resolution
    const allItems = [...taskItems, ...blockItems];
    
    // Unified overlap resolution for all items regardless of type
    const resolveAllOverlaps = (items: LayoutItem[]): LayoutItem[] => {
      if (items.length === 0) return items;
      
      // Sort by start time
      const sortedItems = [...items].sort((a, b) => a.startMinutes - b.startMinutes);
      const result: LayoutItem[] = [];
      
      for (const item of sortedItems) {
        // Find all items that overlap with this one
        const overlappingItems = sortedItems.filter(other => 
          doTimesOverlap(item.startMinutes, item.endMinutes, other.startMinutes, other.endMinutes)
        );
        
        if (overlappingItems.length === 1) {
          // No overlaps - use full width
          result.push({
            ...item,
            column: 0,
            columnWidth: 100,
            leftOffset: 0
          });
        } else {
          // Has overlaps - assign column based on start time order
          const sortedOverlapping = overlappingItems.sort((a, b) => a.startMinutes - b.startMinutes);
          const columnIndex = sortedOverlapping.findIndex(other => other.id === item.id);
          const totalColumns = overlappingItems.length;
          const columnWidth = 94 / totalColumns; // Leave 6% margin for better spacing
          const leftOffset = (columnIndex * columnWidth) + 2; // 2% left margin
          
          result.push({
            ...item,
            column: columnIndex,
            columnWidth,
            leftOffset
          });
        }
      }
      
      return result;
    };

    // Apply unified overlap resolution to all items
    const resolvedItems = resolveAllOverlaps(allItems);
    
    // Separate resolved items back into tasks and blocks
    const resolvedTasks = resolvedItems.filter(item => item.type === 'task');
    const resolvedBlocks = resolvedItems.filter(item => item.type === 'timeblock');

    return { tasks: resolvedTasks, timeBlocks: resolvedBlocks };
  }, [tasks, currentDate, timeBlocks]);

  // Generate time slots
  const generateTimeSlots = useCallback((): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    
    for (let slotIndex = 0; slotIndex < 48; slotIndex++) {
      const hour = Math.floor(slotIndex / 2);
      const minutes = (slotIndex % 2) * 30;
      
      const timeDate = new Date();
      timeDate.setHours(hour, minutes, 0, 0);
      const timeLabel = format(timeDate, 'HH:mm');
      
      slots.push({
        hour: slotIndex,
        label: timeLabel,
        tasks: []
      });
    }
    return slots;
  }, []);

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

  const [expandedTasks, setExpandedTasks] = useState<{[taskId: string]: number}>({});

  const isEdgeClick = (e: React.MouseEvent, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const edgeThreshold = 8;
    
    const isLeftEdge = clickX <= edgeThreshold;
    const isRightEdge = clickX >= rect.width - edgeThreshold;
    const isTopEdge = clickY <= edgeThreshold;
    const isBottomEdge = clickY >= rect.height - edgeThreshold;
    
    return { isLeftEdge, isRightEdge, isTopEdge, isBottomEdge };
  };

  const handleEdgeClick = useCallback(async (e: React.MouseEvent, taskId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const target = e.currentTarget as HTMLElement;
    const edges = isEdgeClick(e, target);
    
    if (!edges.isBottomEdge && !edges.isRightEdge) return;
    
    const task = tasks.find(t => t.id === taskId);
    if (!task || !onTaskUpdate) return;

    const currentDuration = task.duration || 30;
    const currentExpansion = expandedTasks[taskId] || 0;
    
    if (edges.isBottomEdge || edges.isRightEdge) {
      const newExpansion = currentExpansion + 1;
      const newDuration = currentDuration + (30 * newExpansion);
      
      setExpandedTasks(prev => ({
        ...prev,
        [taskId]: newExpansion
      }));
      
      await onTaskUpdate(taskId, { duration: newDuration });
    }
  }, [tasks, onTaskUpdate, expandedTasks]);

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
    const slotsChanged = Math.round(deltaY / 24);
    
    const task = tasks.find(t => t.id === dragState.taskId);
    if (!task) return;

    const currentDuration = task.duration || 30;
    let newHeight: number;
    let newTop: number = 0;
    
    if (dragState.handle === 'top') {
      const newDuration = currentDuration + (-slotsChanged * 30);
      if (newDuration < 30) return;
      
      newHeight = Math.ceil(newDuration / 30) * 24 - 8;
      newTop = slotsChanged * 24;
    } else {
      const newDuration = currentDuration + (slotsChanged * 30);
      if (newDuration < 30) return;
      
      newHeight = Math.ceil(newDuration / 30) * 24 - 8;
      newTop = 0;
    }
    
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

    const currentDuration = task.duration || 30;
    
    if (dragState.handle === 'top') {
      const slotsChanged = Math.round((dragState.previewTop || 0) / 24);
      const newStartTime = subMinutes(dragState.startTime, slotsChanged * 30);
      const newDuration = currentDuration + (-slotsChanged * 30);
      
      if (newDuration >= 30) {
        await onTaskUpdate(dragState.taskId, {
          dueDate: newStartTime.toISOString(),
          duration: newDuration
        });
      }
    } else {
      const heightDiff = (dragState.previewHeight || 0) - ((task.duration || 30) / 30 * 24 - 8);
      const slotsChanged = Math.round(heightDiff / 24);
      const newDuration = currentDuration + (slotsChanged * 30);
      
      if (newDuration >= 30) {
        await onTaskUpdate(dragState.taskId, {
          duration: newDuration
        });
      }
    }

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
    loadTimeBlocks();
  }, [loadTimeBlocks]);

  React.useEffect(() => {
    setTimeSlots(generateTimeSlots());
  }, [generateTimeSlots]);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute instead of every second

    return () => clearInterval(timer);
  }, []);

  const isCurrentDay = isSameDay(currentDate instanceof Date ? currentDate : new Date(currentDate), new Date());
  // Calculate layout with built-in overlap detection
  const layout = calculateLayout();

  return (
    <div className="h-full flex backdrop-blur-xl bg-white/[0.02] border border-white/[0.08] shadow-lg rounded-xl overflow-hidden">
      {/* Main Timeline Area */}
      <div className={`flex flex-col overflow-hidden transition-all duration-200 ${isDragActive ? 'w-full' : 'flex-1'}`}>
        {/* Column Headers */}
        <div className="border-b border-white/[0.08] bg-white/[0.05] backdrop-blur-sm">
          <div className="grid grid-cols-[60px_200px_1fr_120px_80px_80px] h-10">
            <div className="border-r border-white/[0.08] flex items-center justify-center">
              <span className="text-xs font-medium text-white/60">Time</span>
            </div>
            <div className="border-r border-white/[0.08] flex items-center justify-center">
              <span className="text-xs font-medium text-white/60">Blocks</span>
            </div>
            <div className="border-r border-white/[0.08] flex items-center justify-center">
              <span className="text-xs font-medium text-white/60">Task Name</span>
            </div>
            <div className="border-r border-white/[0.08] flex items-center justify-center">
              <span className="text-xs font-medium text-white/60">Project</span>
            </div>
            <div className="border-r border-white/[0.08] flex items-center justify-center">
              <span className="text-xs font-medium text-white/60">Duration</span>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-xs font-medium text-white/60">Priority</span>
            </div>
          </div>
        </div>
        
        {/* Timeline Grid */}
        <div className="flex-1 overflow-hidden relative">
          <div className="h-full overflow-auto">
            <div className="grid grid-cols-[60px_200px_1fr_120px_80px_80px] min-h-full">
              {/* Time Column */}
              <div className="border-r border-white/[0.08] bg-white/[0.02] backdrop-blur-sm min-w-[60px] shadow-inner relative">
                {timeSlots.map((slot, index) => {
                  const isFullHour = slot.hour % 2 === 0;
                  const currentHour = currentTime.getHours();
                  const currentMinutes = currentTime.getMinutes();
                  const slotHour = Math.floor(slot.hour / 2);
                  const slotMinutes = (slot.hour % 2) * 30;
                  const isCurrentSlot = isCurrentDay && slotHour === currentHour && 
                                       ((slotMinutes === 0 && currentMinutes >= 0 && currentMinutes < 30) ||
                                        (slotMinutes === 30 && currentMinutes >= 30 && currentMinutes < 60));
                  
                  return (
                    <div key={slot.hour} className={`h-6 border-b flex items-center justify-start pl-3 transition-colors hover:bg-white/[0.05] ${
                      isFullHour ? 'border-b-white/[0.08] bg-white/[0.02]' : 'border-b-white/[0.05] bg-transparent'
                    } ${isCurrentSlot ? 'bg-primary/10 border-primary/20' : ''}`}>
                       <span className={`font-inter leading-tight ${
                         isFullHour ? 'text-xs font-medium text-white' : 'text-[10px] font-normal text-white'
                       } ${isCurrentSlot ? 'text-primary font-semibold' : ''}`}>
                        {slot.label}
                      </span>
                    </div>
                  );
                })}
              </div>
          
              {/* Current Time Indicator */}
              {isCurrentDay && (
                <div 
                  className="absolute left-0 right-0 h-0.5 border-t-2 border-dotted border-blue-500 z-[1000] pointer-events-none"
                  style={{
                    top: `${(currentTime.getHours() * 2 + Math.floor(currentTime.getMinutes() / 30)) * 24 + (currentTime.getMinutes() % 30) / 30 * 24}px`
                  }}
                >
                  <div className="absolute left-8 -top-2 w-4 h-4 bg-blue-500 rounded-full shadow-md"></div>
                </div>
              )}

              {/* Time Blocks Column */}
              <div className="border-r border-white/[0.08] bg-white/[0.02] backdrop-blur-sm relative">
                {timeSlots.map((slot, index) => (
                  <div key={`timeblock-${slot.hour}`} className="h-6 border-b border-white/[0.05] relative">
                  </div>
                ))}
                
                {/* Render time blocks with layout engine */}
                {layout.timeBlocks.map((item) => {
                  const block = item.data as TimeBlock;
                  const actualColor = categoryColors[block.category] || block.color || categoryColors['Other'] || '217 33% 47%';
                  
                  return (
                    <div
                      key={item.id}
                      className="absolute rounded-md backdrop-blur-sm pointer-events-none z-10 border-2 shadow-sm"
                      style={{
                        top: `${item.topPosition}px`,
                        height: `${item.height}px`,
                        backgroundColor: 'transparent',
                        borderColor: `hsl(${actualColor})`,
                        left: `${item.leftOffset}%`,
                        width: `${item.columnWidth}%`,
                      }}
                    >
                      <div className="p-1 h-full flex flex-col justify-center">
                        <div className="text-xs font-semibold text-center drop-shadow-sm text-white font-inter">
                          {block.title}
                        </div>
                        {block.description && item.height > 30 && (
                          <div className="text-[10px] text-center opacity-80 mt-1 text-white font-inter">
                            {block.description}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Task Name Column */}
              <div className="relative bg-gradient-to-b from-background/50 to-muted/10">
                {timeSlots.map((slot, index) => {
                  const slotHour = Math.floor(slot.hour / 2);
                  const slotMinutes = (slot.hour % 2) * 30;
                  const currentDateStr = format(currentDate instanceof Date ? currentDate : new Date(currentDate), 'yyyy-MM-dd');
                  const droppableId = `calendar-slot-${currentDateStr}-${slotHour.toString().padStart(2, '0')}-${slotMinutes.toString().padStart(2, '0')}`;
                  
                   return (
                     <Droppable key={`taskname-${slot.hour}`} droppableId={droppableId}>
                       {(provided, snapshot) => (
                         <div 
                           ref={provided.innerRef}
                           {...provided.droppableProps}
                           className={`h-6 border-b border-border/10 relative transition-colors ${
                             snapshot.isDraggingOver 
                               ? 'bg-blue-500/20 border-blue-400/50' 
                               : 'hover:bg-muted/10'
                           }`}
                         >
                           {snapshot.isDraggingOver && (
                             <div className="absolute inset-0 flex items-center justify-center">
                               <span className="text-xs text-blue-300 font-medium">
                                 Drop here for {slot.label}
                               </span>
                             </div>
                           )}
                           {provided.placeholder}
                         </div>
                       )}
                     </Droppable>
                   );
                })}
                
                 {/* Render tasks with layout engine - spanning across all task columns */}
                 {layout.tasks.map((item) => {
                   const task = item.data as Task;
                   let heightInPixels = item.height;
                   let topOffset = item.topPosition;
                   
                   if (dragState.isDragging && dragState.taskId === task.id) {
                     if (dragState.previewHeight !== null) {
                       heightInPixels = dragState.previewHeight;
                     }
                     if (dragState.previewTop !== null) {
                       topOffset = item.topPosition + dragState.previewTop;
                     }
                   }
                   
                   return (
                     <div
                       key={`timeline-${task.id}`}
                       className="absolute z-20 cursor-pointer rounded-lg group hover:scale-[1.02] transition-transform duration-200"
                       style={{
                         top: `${topOffset}px`,
                         left: '200px', // Start after Time column (60px) + Blocks column (200px)
                         right: '0px', // Extend to the end of the grid
                         height: `${heightInPixels}px`,
                         minHeight: '20px'
                       }}
                       onClick={(e) => handleEdgeClick(e, task.id)}
                     >
                       {/* Task spanning all columns with individual sections */}
                       <div className="h-full grid grid-cols-[1fr_120px_80px_80px] gap-0 glass-card border border-white/30 text-white shadow-lg backdrop-blur-xl bg-white/10 hover:bg-white/20 transition-all duration-300 rounded-lg overflow-hidden">
                         {/* Task Name Column */}
                         <div className="px-3 py-2 border-r border-white/20 flex flex-col justify-center min-w-0">
                           <div className="font-medium text-sm text-white drop-shadow-sm truncate leading-tight">{task.taskName}</div>
                           <div className="text-xs text-white/80 drop-shadow-sm leading-tight">
                             {format(new Date(task.dueDate), 'HH:mm')} - {task.duration || 30}min
                           </div>
                         </div>
                         
                         {/* Project Column */}
                         <div className="px-2 py-2 border-r border-white/20 flex items-center justify-center min-w-0">
                           <div className="text-xs text-white/90 truncate text-center">{task.projectName || 'No Project'}</div>
                         </div>
                         
                         {/* Duration Column */}
                         <div className="px-2 py-2 border-r border-white/20 flex items-center justify-center">
                           <div className="text-xs text-white/90 font-medium">{task.duration || 30}min</div>
                         </div>
                         
                         {/* Priority Column */}
                         <div className="px-2 py-2 flex items-center justify-center">
                           <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                             task.priority?.toLowerCase() === 'high' ? 'bg-red-500/30 text-red-200 border border-red-400/30' :
                             task.priority?.toLowerCase() === 'medium' ? 'bg-yellow-500/30 text-yellow-200 border border-yellow-400/30' :
                             task.priority?.toLowerCase() === 'low' ? 'bg-green-500/30 text-green-200 border border-green-400/30' :
                             'bg-white/20 text-white/80 border border-white/30'
                           }`}>
                             {task.priority || 'medium'}
                           </div>
                         </div>
                         
                         {/* Resize handles */}
                         <div 
                           className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-2 cursor-n-resize opacity-0 group-hover:opacity-100 bg-white/30 rounded-sm backdrop-blur-sm transition-opacity duration-200"
                           onMouseDown={(e) => handleResizeStart(e, task.id, 'top')}
                         />
                         <div 
                           className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-2 cursor-s-resize opacity-0 group-hover:opacity-100 bg-white/30 rounded-sm backdrop-blur-sm transition-opacity duration-200"
                           onMouseDown={(e) => handleResizeStart(e, task.id, 'bottom')}
                         />
                       </div>
                     </div>
                   );
                 })}
              </div>

              {/* Project Column */}
              <div className="relative bg-gradient-to-b from-background/50 to-muted/10">
                {timeSlots.map((slot) => (
                  <div key={`project-${slot.hour}`} className="h-6 border-b border-border/10 relative">
                  </div>
                ))}
                
                {layout.tasks.map((item) => {
                  const task = item.data as Task;
                  let heightInPixels = item.height;
                  let topOffset = item.topPosition;
                  
                  if (dragState.isDragging && dragState.taskId === task.id) {
                    if (dragState.previewHeight !== null) {
                      heightInPixels = dragState.previewHeight;
                    }
                    if (dragState.previewTop !== null) {
                      topOffset = item.topPosition + dragState.previewTop;
                    }
                  }
                  
                  return (
                    <div
                      key={`project-${task.id}`}
                      className="absolute px-1 py-1 flex items-center bg-background/60 backdrop-blur-sm border-r border-border/30"
                      style={{
                        top: `${topOffset}px`,
                        left: `${item.leftOffset}%`,
                        width: `${item.columnWidth}%`,
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

              {/* Duration Column */}
              <div className="relative bg-gradient-to-b from-background/50 to-muted/10">
                {timeSlots.map((slot) => (
                  <div key={`duration-${slot.hour}`} className="h-6 border-b border-border/10 relative">
                  </div>
                ))}
                
                {layout.tasks.map((item) => {
                  const task = item.data as Task;
                  let heightInPixels = item.height;
                  let topOffset = item.topPosition;
                  
                  if (dragState.isDragging && dragState.taskId === task.id) {
                    if (dragState.previewHeight !== null) {
                      heightInPixels = dragState.previewHeight;
                    }
                    if (dragState.previewTop !== null) {
                      topOffset = item.topPosition + dragState.previewTop;
                    }
                  }
                  
                  return (
                    <div
                      key={`duration-${task.id}`}
                      className="absolute px-1 py-1 flex items-center justify-center bg-background/60 backdrop-blur-sm border-r border-border/30"
                      style={{
                        top: `${topOffset}px`,
                        left: `${item.leftOffset}%`,
                        width: `${item.columnWidth}%`,
                        height: `${heightInPixels}px`,
                        minHeight: '20px'
                      }}
                    >
                      <div className="rounded px-2 py-1 text-xs bg-accent/20 border border-border/30">
                        <span className="font-medium text-foreground/90">{task.duration || 30}min</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Priority Column */}
              <div className="relative bg-gradient-to-b from-background/50 to-muted/10">
                {timeSlots.map((slot) => (
                  <div key={`priority-${slot.hour}`} className="h-6 border-b border-border/10 relative">
                  </div>
                ))}
                
                {layout.tasks.map((item) => {
                  const task = item.data as Task;
                  let heightInPixels = item.height;
                  let topOffset = item.topPosition;
                  
                  if (dragState.isDragging && dragState.taskId === task.id) {
                    if (dragState.previewHeight !== null) {
                      heightInPixels = dragState.previewHeight;
                    }
                    if (dragState.previewTop !== null) {
                      topOffset = item.topPosition + dragState.previewTop;
                    }
                  }
                  
                  return (
                    <div
                      key={`priority-${task.id}`}
                      className="absolute px-1 py-1 flex items-center justify-center bg-background/60 backdrop-blur-sm"
                      style={{
                        top: `${topOffset}px`,
                        left: `${item.leftOffset}%`,
                        width: `${item.columnWidth}%`,
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
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      {!isDragActive && (
        <div className="w-80 border-l border-border/30 bg-gradient-to-b from-card/80 to-card/60 backdrop-blur-sm flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Today's Overview</h3>
            </div>
            <div className="text-sm text-muted-foreground">
              {format(currentDate instanceof Date ? currentDate : new Date(currentDate), 'EEEE, d MMMM')}
            </div>
          </div>

          {/* Task Summary */}
          <div className="p-4 border-b border-border/30">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 rounded-lg bg-primary/10">
                <div className="text-2xl font-bold text-primary">{layout.tasks.length}</div>
                <div className="text-xs text-muted-foreground">Tasks</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-accent/10">
                <div className="text-2xl font-bold text-accent-foreground">{layout.timeBlocks.length}</div>
                <div className="text-xs text-muted-foreground">Blocks</div>
              </div>
            </div>
          </div>

          {/* Top 3 Priorities */}
          <div className="p-4 flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-accent" />
              <h4 className="font-medium text-foreground">Top 3 Priorities</h4>
            </div>
            <div className="space-y-2">
              {priorities.map((priority, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground w-4">{index + 1}.</span>
                  <Input
                    value={priority}
                    onChange={(e) => {
                      const newPriorities = [...priorities];
                      newPriorities[index] = e.target.value;
                      setPriorities(newPriorities);
                    }}
                    placeholder={`Priority ${index + 1}`}
                    className="text-sm h-8"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};