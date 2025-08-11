import React, { useState, useCallback, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { format, isSameDay, setHours, setMinutes, addMinutes, subMinutes } from 'date-fns';
import { Clock, Plus, ChevronUp, ChevronDown, Target, GripVertical, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Task } from './types';
import { TimeBlock } from '../calendar/types';
import { getBlocksForDay } from '../calendar/utils';
import { supabase } from '@/integrations/supabase/client';
import { useTimeTracking } from '@/hooks/useTimeTracking';
import { TodaysOverview } from './TodaysOverview';

interface DayTimelineViewProps {
  currentDate: Date;
  tasks?: Task[];
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => Promise<void>;
  isDragActive?: boolean;
  enableDragDrop?: boolean;
  useOwnDragContext?: boolean; // New prop to control whether to wrap with own DragDropContext
  onCalendarDrop?: (e: React.DragEvent, slotId: string) => Promise<void>;
  onCalendarDragOver?: (e: React.DragEvent) => void;
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
  enableDragDrop = false,
  useOwnDragContext = false,
  onCalendarDrop,
  onCalendarDragOver
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const {
    settings
  } = useTimeTracking();

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
      const {
        data: user
      } = await supabase.auth.getUser();
      if (!user.user) {
        setTimeBlocks([]);
        return;
      }
      const {
        data,
        error
      } = await supabase.from('time_blocks').select('*').eq('user_id', user.user.id).order('day_of_week', {
        ascending: true
      }).order('start_time', {
        ascending: true
      });
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
  const calculateLayout = useCallback((): {
    tasks: LayoutItem[];
    timeBlocks: LayoutItem[];
  } => {
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
        topPosition: topPosition,
        // Remove offset for exact alignment
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
        const overlappingItems = sortedItems.filter(other => doTimesOverlap(item.startMinutes, item.endMinutes, other.startMinutes, other.endMinutes));
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
          const leftOffset = columnIndex * columnWidth + 2; // 2% left margin

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
    return {
      tasks: resolvedTasks,
      timeBlocks: resolvedBlocks
    };
  }, [tasks, currentDate, timeBlocks]);

  // Generate time slots
  const generateTimeSlots = useCallback((): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    for (let slotIndex = 0; slotIndex < 48; slotIndex++) {
      const hour = Math.floor(slotIndex / 2);
      const minutes = slotIndex % 2 * 30;
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
    newDuration?: number | null;
  }>({
    isDragging: false,
    taskId: null,
    handle: null,
    startY: 0,
    startTime: null,
    previewHeight: null,
    previewTop: null
  });
  const [expandedTasks, setExpandedTasks] = useState<{
    [taskId: string]: number;
  }>({});
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  // Handler for task drag start
  const handleTaskDragStart = useCallback((e: React.DragEvent, taskId: string) => {
    // Prevent resize operations during drag
    if (dragState.isDragging) {
      e.preventDefault();
      return;
    }
    
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  }, [dragState.isDragging]);

  // Handler for task drop onto calendar slots
  const handleTaskDrop = useCallback(async (e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    setDragOverSlot(null);
    setDraggedTaskId(null);
    
    if (!taskId || !onTaskUpdate) return;
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    try {
      // Extract date and time from slotId (format: calendar-slot-YYYY-MM-DD-HH-MM)
      const parts = slotId.replace('calendar-slot-', '').split('-');
      if (parts.length === 5) {
        const [year, month, day, hour, minute] = parts.map(p => parseInt(p));
        const newDate = new Date(year, month - 1, day, hour, minute);
        
        // Set default 30-minute duration when dropping task onto calendar
        const updates: Partial<Task> = {
          dueDate: newDate.toISOString(),
          duration: task.duration || 30 // Set 30min default if no duration exists
        };
        
        await onTaskUpdate(taskId, updates);
      }
    } catch (error) {
      console.error('Error moving task:', error);
    }
  }, [tasks, onTaskUpdate]);

  // Enhanced drag over handler
  const handleTaskDragOver = useCallback((e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    setDragOverSlot(slotId);
    e.dataTransfer.dropEffect = 'move';
  }, []);
  const isEdgeClick = (e: React.MouseEvent, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const edgeThreshold = 8;
    const isLeftEdge = clickX <= edgeThreshold;
    const isRightEdge = clickX >= rect.width - edgeThreshold;
    const isTopEdge = clickY <= edgeThreshold;
    const isBottomEdge = clickY >= rect.height - edgeThreshold;
    return {
      isLeftEdge,
      isRightEdge,
      isTopEdge,
      isBottomEdge
    };
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
      const newDuration = currentDuration + 30 * newExpansion;
      setExpandedTasks(prev => ({
        ...prev,
        [taskId]: newExpansion
      }));
      await onTaskUpdate(taskId, {
        duration: newDuration
      });
    }
  }, [tasks, onTaskUpdate, expandedTasks]);
  const handleResizeStart = useCallback((e: React.MouseEvent, taskId: string, handle: 'top' | 'bottom') => {
    console.log(`Starting resize: taskId=${taskId}, handle=${handle}, clientY=${e.clientY}`);
    e.preventDefault();
    e.stopPropagation();
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
      console.log('Task not found');
      return;
    }
    
    console.log('Setting drag state');
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
    console.log('Mouse move detected during resize');
    if (!dragState.isDragging || !dragState.taskId || !dragState.startTime) {
      console.log('Not dragging or missing data:', { isDragging: dragState.isDragging, taskId: dragState.taskId, startTime: dragState.startTime });
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    const deltaY = e.clientY - dragState.startY;
    console.log('Delta Y:', deltaY);
    // Each 30-minute slot is 24px tall
    const slotsChanged = Math.round(deltaY / 24);
    const task = tasks.find(t => t.id === dragState.taskId);
    if (!task) return;
    
    const currentDuration = task.duration || 30;
    let newDuration: number;
    let newHeight: number;
    let newTop: number = 0;
    
    if (dragState.handle === 'top') {
      // When dragging top edge, we're changing start time and duration
      newDuration = currentDuration + (-slotsChanged * 30);
      if (newDuration < 30) newDuration = 30; // Minimum 30 minutes
      newHeight = Math.max(16, (newDuration / 30) * 24 - 8);
      newTop = Math.min(slotsChanged * 24, (currentDuration - 30) / 30 * 24);
    } else {
      // When dragging bottom edge, we're only changing duration
      newDuration = currentDuration + (slotsChanged * 30);
      if (newDuration < 30) newDuration = 30; // Minimum 30 minutes
      newHeight = Math.max(16, (newDuration / 30) * 24 - 8);
      newTop = 0;
    }
    
    console.log('Setting new preview:', { newHeight, newTop, newDuration });
    setDragState(prev => ({
      ...prev,
      previewHeight: newHeight,
      previewTop: newTop,
      newDuration
    }));
  }, [dragState, tasks]);

  const handleResizeEnd = useCallback(async (e: MouseEvent) => {
    console.log('handleResizeEnd called, isDragging:', dragState.isDragging);
    e.preventDefault();
    e.stopPropagation();
    
    // CRITICAL: Store current state and immediately reset to prevent continuous following
    const currentDragState = { ...dragState };
    
    // Reset drag state IMMEDIATELY to stop the drag operation
    setDragState({
      isDragging: false,
      taskId: null,
      handle: null,
      startY: 0,
      startTime: null,
      previewHeight: null,
      previewTop: null,
      newDuration: null
    });
    
    if (!currentDragState.isDragging || !currentDragState.taskId || !currentDragState.startTime || !onTaskUpdate) {
      console.log('Early return from handleResizeEnd - missing data');
      return;
    }
    
    const task = tasks.find(t => t.id === currentDragState.taskId);
    if (!task) {
      console.log('Task not found for ID:', currentDragState.taskId);
      return;
    }
    
    try {
      const deltaY = e.clientY - currentDragState.startY;
      console.log('Final deltaY for update:', deltaY);
      const slotsChanged = Math.round(deltaY / 24);
      const currentDuration = task.duration || 30;
      console.log('Slots changed:', slotsChanged, 'Current duration:', currentDuration);
      
      if (currentDragState.handle === 'top') {
        // When dragging top edge, change start time and duration
        const newDuration = Math.max(30, currentDuration + (-slotsChanged * 30));
        const timeChange = (currentDuration - newDuration) / 2; // Split the change
        const newStartTime = addMinutes(new Date(task.dueDate), timeChange);
        
        console.log('Updating task with new duration (top):', newDuration);
        await onTaskUpdate(currentDragState.taskId, {
          dueDate: newStartTime.toISOString(),
          duration: newDuration
        });
      } else {
        // When dragging bottom edge, only change duration
        const newDuration = Math.max(30, currentDuration + (slotsChanged * 30));
        
        console.log('Updating task with new duration (bottom):', newDuration);
        await onTaskUpdate(currentDragState.taskId, {
          duration: newDuration
        });
      }
      console.log('Task update completed successfully');
    } catch (error) {
      console.error('Error updating task during resize:', error);
    }
  }, [dragState, tasks, onTaskUpdate]);

  React.useEffect(() => {
    console.log('useEffect triggered, isDragging:', dragState.isDragging);
    
    if (dragState.isDragging) {
      console.log('Adding event listeners for resize');
      
      const handleMove = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Document mousemove triggered');
        handleResizeMove(e);
      };
      
      const handleEnd = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Document mouseup triggered');
        handleResizeEnd(e);
      };
      
      // Add event listeners - using 'once' for mouseup to ensure it only fires once
      document.addEventListener('mousemove', handleMove, { passive: false });
      document.addEventListener('mouseup', handleEnd, { passive: false, once: true });
      document.addEventListener('mouseleave', handleEnd, { passive: false, once: true });
      
      return () => {
        console.log('Cleaning up event listeners');
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('mouseleave', handleEnd);
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

  // Removed drag and drop functionality - keeping all other features

  const TimelineContent = () => (
    <div className="h-full flex backdrop-blur-xl bg-white/[0.02] border border-white/[0.08] shadow-lg rounded-xl overflow-hidden">
      {/* Main Timeline Area */}
      <div className="flex flex-col overflow-hidden" style={{
      width: isDragActive ? '100%' : 'calc(100% - 320px)'
    }}>
        {/* Column Headers */}
        <div className="border-b border-white/[0.08] bg-white/[0.05] backdrop-blur-sm">
          <div className="flex h-10">
            <div className="border-r border-white/[0.08] flex items-center justify-center bg-white/[0.02]" style={{
            width: '60px',
            minWidth: '60px',
            maxWidth: '60px'
          }}>
              <span className="text-xs font-medium text-white/60">Time</span>
            </div>
            <div className="border-r border-white/[0.08] flex items-center justify-center bg-white/[0.02]" style={{
            width: '200px',
            minWidth: '200px',
            maxWidth: '200px'
          }}>
              <span className="text-xs font-medium text-white/60">Blocks</span>
            </div>
            <div className="border-r border-white/[0.08] flex items-center justify-center flex-1">
              <span className="text-xs font-medium text-white/60">Task Name</span>
            </div>
            <div className="border-r border-white/[0.08] flex items-center justify-center" style={{
            width: '120px',
            minWidth: '120px',
            maxWidth: '120px'
          }}>
              <span className="text-xs font-medium text-white/60">Project</span>
            </div>
            <div className="border-r border-white/[0.08] flex items-center justify-center" style={{
            width: '80px',
            minWidth: '80px',
            maxWidth: '80px'
          }}>
              <span className="text-xs font-medium text-white/60">Duration</span>
            </div>
            <div className="flex items-center justify-center" style={{
            width: '80px',
            minWidth: '80px',
            maxWidth: '80px'
          }}>
              <span className="text-xs font-medium text-white/60">Priority</span>
            </div>
          </div>
        </div>
        
        {/* Timeline Grid */}
        <div className="flex-1 overflow-hidden relative">
          <div className="h-full overflow-auto">
            <div className="flex min-h-full">
              {/* Time Column */}
              <div className="border-r border-white/[0.08] bg-white/[0.02] backdrop-blur-sm shadow-inner relative" style={{
              width: '60px',
              minWidth: '60px',
              maxWidth: '60px'
            }}>
                {timeSlots.map((slot, index) => {
                const isFullHour = slot.hour % 2 === 0;
                const currentHour = currentTime.getHours();
                const currentMinutes = currentTime.getMinutes();
                const slotHour = Math.floor(slot.hour / 2);
                const slotMinutes = slot.hour % 2 * 30;
                const isCurrentSlot = isCurrentDay && slotHour === currentHour && (slotMinutes === 0 && currentMinutes >= 0 && currentMinutes < 30 || slotMinutes === 30 && currentMinutes >= 30 && currentMinutes < 60);
                return <div key={slot.hour} className={`h-6 border-b flex items-center justify-start pl-3 transition-colors hover:bg-white/[0.05] ${isFullHour ? 'border-b-white/[0.08] bg-white/[0.02]' : 'border-b-white/[0.05] bg-transparent'} ${isCurrentSlot ? 'bg-primary/10 border-primary/20' : ''}`}>
                       <span className={`font-inter leading-tight ${isFullHour ? 'text-xs font-medium text-white' : 'text-[10px] font-normal text-white'} ${isCurrentSlot ? 'text-primary font-semibold' : ''}`}>
                        {slot.label}
                      </span>
                    </div>;
              })}
              </div>
          
              {/* Current Time Indicator */}
              {isCurrentDay && <div className="absolute left-0 right-0 h-0.5 border-t-2 border-dotted border-blue-500 z-[1000] pointer-events-none" style={{
              top: `${(currentTime.getHours() * 2 + Math.floor(currentTime.getMinutes() / 30)) * 24 + currentTime.getMinutes() % 30 / 30 * 24}px`
            }}>
                  <div className="absolute left-8 -top-2 w-4 h-4 bg-blue-500 rounded-full shadow-md"></div>
                </div>}

              {/* Time Blocks Column */}
              <div className="border-r border-white/[0.08] bg-white/[0.02] backdrop-blur-sm relative" style={{
              width: '200px',
              minWidth: '200px',
              maxWidth: '200px'
            }}>
                {timeSlots.map((slot, index) => <div key={`timeblock-${slot.hour}`} className="h-6 border-b border-white/[0.05] relative">
                  </div>)}
                
                {/* Render time blocks with layout engine */}
                {layout.timeBlocks.map(item => {
                const block = item.data as TimeBlock;
                const actualColor = categoryColors[block.category] || block.color || categoryColors['Other'] || '217 33% 47%';
                return <div key={item.id} className="absolute rounded-md backdrop-blur-sm pointer-events-none z-10 border-2 shadow-sm" style={{
                  top: `${item.topPosition}px`,
                  height: `${item.height}px`,
                  backgroundColor: 'transparent',
                  borderColor: `hsl(${actualColor})`,
                  left: `${item.leftOffset}%`,
                  width: `${item.columnWidth}%`
                }}>
                      <div className="p-1 h-full flex flex-col justify-center">
                        <div className="text-xs font-semibold text-center drop-shadow-sm text-white font-inter">
                          {block.title}
                        </div>
                        {block.description && item.height > 30 && <div className="text-[10px] text-center opacity-80 mt-1 text-white font-inter">
                            {block.description}
                          </div>}
                      </div>
                    </div>;
              })}
              </div>

              {/* Task Name Column */}
              <div className="relative bg-gradient-to-b from-background/50 to-muted/10 flex-1">
                {timeSlots.map((slot, index) => {
                const slotHour = Math.floor(slot.hour / 2);
                const slotMinutes = slot.hour % 2 * 30;
                const currentDateStr = format(currentDate instanceof Date ? currentDate : new Date(currentDate), 'yyyy-MM-dd');
                const droppableId = `calendar-slot-${currentDateStr}-${slotHour.toString().padStart(2, '0')}-${slotMinutes.toString().padStart(2, '0')}`;
                  return (
                   <div 
                     key={`taskname-${slot.hour}`} 
                     className={cn(
                       "h-6 border-b border-border/10 relative transition-all duration-200",
                       dragOverSlot === droppableId 
                         ? "bg-primary/20 border-primary/40 shadow-sm" 
                         : "hover:bg-muted/10"
                     )}
                     data-droppable-id={droppableId}
                      onDrop={(e) => {
                        handleTaskDrop(e, droppableId);
                      }}
                      onDragOver={(e) => {
                        handleTaskDragOver(e, droppableId);
                      }}
                      onDragLeave={(e) => {
                        // Only clear drag over if we're leaving the slot (not moving to child element)
                        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                          setDragOverSlot(null);
                        }
                      }}
                    >
                      {dragOverSlot === droppableId && (
                        <div className="absolute inset-0 border-2 border-dashed border-primary/60 bg-primary/10 rounded-sm flex items-center justify-center">
                          <span className="text-xs font-medium text-primary px-2 py-1 bg-primary/20 rounded">
                            Drop task here
                          </span>
                        </div>
                      )}
                    </div>
                  );
               })}
                 
                  {/* Render task name parts in this column */}
                  {layout.tasks.map((item, index) => {
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

                 const isDraggedTask = draggedTaskId === task.id;

                  // Render task with drag functionality
                   return (
                     <div 
                       key={`taskname-${task.id}`}
                       draggable={!dragState.isDragging}
                       onDragStart={(e) => handleTaskDragStart(e, task.id)}
                       onDragEnd={() => {
                         setDraggedTaskId(null);
                         // Reset any resize state that might be interfering
                         setDragState(prev => ({
                           ...prev,
                           isDragging: false,
                           taskId: null,
                           handle: null
                         }));
                       }}
                       className={cn(
                         "absolute px-0 py-2 bg-white/90 backdrop-blur-sm border border-white/30 shadow-lg rounded-l-md flex items-center z-20 cursor-grab active:cursor-grabbing group hover:bg-white/95 transition-all duration-300 min-h-[32px]",
                         isDraggedTask && "opacity-50",
                         dragState.isDragging && dragState.taskId === task.id && "pointer-events-none"
                       )} 
                       style={{
                         top: `${topOffset}px`,
                         left: '0px',
                         right: '0px',
                         height: `${heightInPixels}px`,
                         minHeight: '20px'
                       }} 
                       onClick={e => !dragState.isDragging && handleEdgeClick(e, task.id)}
                     >
                      {/* Visual grip handle */}
                      <div 
                        className="w-12 h-full bg-transparent hover:bg-primary/30 flex items-center justify-center border-r border-gray-200 flex-shrink-0 cursor-grab active:cursor-grabbing transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="text-gray-600 text-xs font-bold">⋮⋮</div>
                      </div>
                    
                    {/* Task Content */}
                    <div className="flex-1 px-3 flex justify-between items-center h-full">
                      <div className="text-xs text-gray-900 font-medium truncate leading-tight">
                        {task.taskName}
                      </div>
                      <div className="text-xs text-gray-900 font-medium leading-tight ml-2 whitespace-nowrap">
                        {format(new Date(task.dueDate), 'HH:mm')} - {task.duration || 30}min
                      </div>
                    </div>
                   
                   {/* Resize handles - only show when not dragging */}
                   {!dragState.isDragging && (
                     <>
                       <div 
                         className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-12 h-3 cursor-n-resize bg-transparent hover:bg-primary/30 rounded-sm transition-all duration-200 z-30 flex items-center justify-center" 
                         onMouseDown={e => {
                           console.log('Top resize handle clicked');
                           e.preventDefault();
                           e.stopPropagation();
                           handleResizeStart(e, task.id, 'top');
                         }}
                         style={{ pointerEvents: 'auto' }}
                       >
                         <ChevronUp className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                       </div>
                       <div 
                         className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-12 h-3 cursor-s-resize bg-transparent hover:bg-primary/30 rounded-sm transition-all duration-200 z-30 flex items-center justify-center" 
                         onMouseDown={e => {
                           console.log('Bottom resize handle clicked');
                           e.preventDefault();
                           e.stopPropagation();
                           handleResizeStart(e, task.id, 'bottom');
                         }}
                         style={{ pointerEvents: 'auto' }}
                       >
                         <ChevronDown className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                       </div>
                     </>
                   )}
                 </div>
                );
              })}
              </div>

              {/* Project Column */}
              <div className="relative bg-gradient-to-b from-background/50 to-muted/10" style={{
              width: '120px',
              minWidth: '120px',
              maxWidth: '120px'
            }}>
                {timeSlots.map(slot => <div key={`project-${slot.hour}`} className="h-6 border-b border-border/10 relative">
                  </div>)}
                
                {/* Render project parts in this column */}
                {layout.tasks.map(item => {
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
                return <div key={`project-${task.id}`} className="absolute px-2 py-2 bg-white/90 backdrop-blur-sm border border-white/30 border-l-0 shadow-lg flex items-center justify-center z-20 hover:bg-white/95 transition-all duration-300" style={{
                  top: `${topOffset}px`,
                  left: '0px',
                  right: '0px',
                  height: `${heightInPixels}px`,
                  minHeight: '20px'
                }}>
                       <div className="text-xs text-gray-900 font-medium truncate text-center">
                         {task.projectName || 'No Project'}
                       </div>
                    </div>;
              })}
              </div>

              {/* Duration Column */}
              <div className="relative bg-gradient-to-b from-background/50 to-muted/10" style={{
              width: '80px',
              minWidth: '80px',
              maxWidth: '80px'
            }}>
                {timeSlots.map(slot => <div key={`duration-${slot.hour}`} className="h-6 border-b border-border/10 relative">
                  </div>)}
                
                {/* Render duration parts in this column */}
                {layout.tasks.map(item => {
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
                return <div key={`duration-${task.id}`} className="absolute px-2 py-2 bg-white/90 backdrop-blur-sm border border-white/30 border-l-0 shadow-lg flex items-center justify-center z-20 hover:bg-white/95 transition-all duration-300" style={{
                  top: `${topOffset}px`,
                  left: '0px',
                  right: '0px',
                  height: `${heightInPixels}px`,
                  minHeight: '20px'
                }}>
                       <div className="text-xs text-gray-900 font-medium">
                         {task.duration || 30}min
                       </div>
                    </div>;
              })}
              </div>

              {/* Priority Column */}
              <div className="relative bg-gradient-to-b from-background/50 to-muted/10" style={{
              width: '80px',
              minWidth: '80px',
              maxWidth: '80px'
            }}>
                {timeSlots.map(slot => <div key={`priority-${slot.hour}`} className="h-6 border-b border-border/10 relative">
                  </div>)}
                
                {/* Render priority parts in this column */}
                {layout.tasks.map(item => {
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
                return <div key={`priority-${task.id}`} className="absolute px-2 py-2 bg-white/90 backdrop-blur-sm border border-white/30 border-l-0 rounded-r-md shadow-lg flex items-center justify-center z-20 hover:bg-white/95 transition-all duration-300" style={{
                  top: `${topOffset}px`,
                  left: '0px',
                  right: '0px',
                  height: `${heightInPixels}px`,
                  minHeight: '20px'
                }}>
                       <div className="text-xs text-gray-900 font-medium">
                          {task.priority || 'Medium'}
                        </div>
                    </div>;
              })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      {!isDragActive && <TodaysOverview currentDate={currentDate} />}
    </div>
  );

  // Always return content directly - parent handles DragDropContext
  return <TimelineContent />;
};