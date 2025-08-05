import React, { useState, useCallback, useRef } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { format, isSameDay, setHours, setMinutes, addMinutes, subMinutes } from 'date-fns';
import { Clock, Plus, ChevronUp, ChevronDown, Target, GripVertical, FileText } from 'lucide-react';
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
  useOwnDragContext?: boolean; // New prop to control whether to wrap with own DragDropContext
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
  useOwnDragContext = false
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [priorities, setPriorities] = useState<string[]>(['', '', '']);
  const [priorityChecked, setPriorityChecked] = useState<boolean[]>([false, false, false]);
  const [notes, setNotes] = useState<string>('');
  const [dailyRecordId, setDailyRecordId] = useState<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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

  // Load daily priorities and notes for the current date
  const loadDailyData = useCallback(async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const dateString = format(currentDate instanceof Date ? currentDate : new Date(currentDate), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('daily_priorities_notes')
        .select('*')
        .eq('user_id', user.user.id)
        .eq('date', dateString)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading daily data:', error);
        return;
      }

      if (data) {
        setPriorities(data.priorities || ['', '', '']);
        setPriorityChecked(data.priority_checked || [false, false, false]);
        setNotes(data.notes || '');
        setDailyRecordId(data.id);
      } else {
        // Reset to defaults if no data for this date
        setPriorities(['', '', '']);
        setPriorityChecked([false, false, false]);
        setNotes('');
        setDailyRecordId(null);
      }
    } catch (error) {
      console.error('Error loading daily data:', error);
    }
  }, [currentDate]);

  // Save daily priorities and notes to database with debouncing
  const saveDailyData = useCallback(async (updatedPriorities?: string[], updatedChecked?: boolean[], updatedNotes?: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const dateString = format(currentDate instanceof Date ? currentDate : new Date(currentDate), 'yyyy-MM-dd');
      
      const dataToSave = {
        user_id: user.user.id,
        date: dateString,
        priorities: updatedPriorities || priorities,
        priority_checked: updatedChecked || priorityChecked,
        notes: updatedNotes || notes
      };

      if (dailyRecordId) {
        // Update existing record
        const { error } = await supabase
          .from('daily_priorities_notes')
          .update(dataToSave)
          .eq('id', dailyRecordId);
        
        if (error) {
          console.error('Error updating daily data:', error);
        }
      } else {
        // Create new record
        const { data, error } = await supabase
          .from('daily_priorities_notes')
          .insert(dataToSave)
          .select('id')
          .single();
        
        if (error) {
          console.error('Error creating daily data:', error);
        } else if (data) {
          setDailyRecordId(data.id);
        }
      }
    } catch (error) {
      console.error('Error saving daily data:', error);
    }
  }, [currentDate, priorities, priorityChecked, notes, dailyRecordId]);

  // Debounced save function
  const debouncedSave = useCallback((updatedPriorities?: string[], updatedChecked?: boolean[], updatedNotes?: string) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveDailyData(updatedPriorities, updatedChecked, updatedNotes);
    }, 500);
  }, [saveDailyData]);

  // Load daily data when component mounts or currentDate changes
  React.useEffect(() => {
    loadDailyData();
  }, [loadDailyData]);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
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
      const newDuration = currentDuration + -slotsChanged * 30;
      if (newDuration < 30) return;
      newHeight = Math.ceil(newDuration / 30) * 24 - 8;
      newTop = slotsChanged * 24;
    } else {
      const newDuration = currentDuration + slotsChanged * 30;
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
      const newDuration = currentDuration + -slotsChanged * 30;
      if (newDuration >= 30) {
        await onTaskUpdate(dragState.taskId, {
          dueDate: newStartTime.toISOString(),
          duration: newDuration
        });
      }
    } else {
      const heightDiff = (dragState.previewHeight || 0) - ((task.duration || 30) / 30 * 24 - 8);
      const slotsChanged = Math.round(heightDiff / 24);
      const newDuration = currentDuration + slotsChanged * 30;
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

  // Handle drag and drop for task scheduling
  const handleDragEnd = useCallback(async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If no destination or dragged to same position, do nothing
    if (!destination || 
        (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return;
    }

    // Extract task ID from draggableId (format: "task-{taskId}")
    const taskId = draggableId.replace('task-', '');
    const task = tasks.find(t => t.id === taskId);
    
    if (!task || !onTaskUpdate) return;

    try {
      // Handle dropping to calendar time slots
      if (destination.droppableId.startsWith('calendar-slot-')) {
        // Extract date and time from droppableId
        // Format: "calendar-slot-YYYY-MM-DD-HH-MM"
        const slotParts = destination.droppableId.replace('calendar-slot-', '').split('-');
        if (slotParts.length >= 5) {
          const [year, month, day, hour, minute] = slotParts;
          const newDateTime = new Date(
            parseInt(year),
            parseInt(month) - 1, // Month is 0-indexed
            parseInt(day),
            parseInt(hour),
            parseInt(minute)
          );

          await onTaskUpdate(taskId, {
            dueDate: newDateTime.toISOString(),
            duration: task.duration || 30 // Keep existing duration or default to 30
          });
        }
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  }, [tasks, onTaskUpdate]);

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
                return <Droppable key={`taskname-${slot.hour}`} droppableId={droppableId}>
                       {(provided, snapshot) => <div ref={provided.innerRef} {...provided.droppableProps} className={`h-6 border-b border-border/10 relative transition-colors ${snapshot.isDraggingOver ? 'bg-blue-500/20 border-blue-400/50' : 'hover:bg-muted/10'}`}>
                           {snapshot.isDraggingOver && <div className="absolute inset-0 flex items-center justify-center">
                               <span className="text-xs text-blue-300 font-medium">
                                 Drop here for {slot.label}
                               </span>
                             </div>}
                           {provided.placeholder}
                         </div>}
                     </Droppable>;
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

                // Conditionally render with or without Draggable based on enableDragDrop
                // TEMPORARILY DISABLED FOR DEBUGGING
                // if (enableDragDrop) {
                //   return (
                //     <Draggable key={`taskname-${task.id}`} draggableId={`task-${task.id}`} index={index}>
                //       {(provided, snapshot) => (
                //         <div 
                //           ref={provided.innerRef}
                //           {...provided.draggableProps}
                //           className={`absolute px-0 py-2 bg-white/90 backdrop-blur-sm border border-white/30 shadow-lg rounded-l-md flex items-center z-20 cursor-pointer group hover:bg-white/95 transition-all duration-300 min-h-[32px] ${
                //             snapshot.isDragging ? 'rotate-2 shadow-xl z-50' : ''
                //           }`} 
                //           style={{
                //             top: `${topOffset}px`,
                //             left: '0px',
                //             right: '0px',
                //             height: `${heightInPixels}px`,
                //             minHeight: '20px',
                //             ...provided.draggableProps.style
                //           }} 
                //           onClick={e => handleEdgeClick(e, task.id)}
                //         >
                //           {/* Drag Handle - Left Side */}
                //           <div 
                //             {...provided.dragHandleProps}
                //             className="w-6 h-full bg-gray-300 hover:bg-gray-400 cursor-grab flex items-center justify-center border-r border-gray-200 flex-shrink-0"
                //           >
                //             <div className="text-gray-600 text-xs font-bold">⋮⋮</div>
                //           </div>
                //           
                //           {/* Task Content */}
                //           <div className="flex-1 px-3 flex justify-between items-center h-full">
                //             <div className="text-xs text-gray-900 font-medium truncate leading-tight">
                //               {task.taskName}
                //             </div>
                //             <div className="text-xs text-gray-900 font-medium leading-tight ml-2 whitespace-nowrap">
                //               {format(new Date(task.dueDate), 'HH:mm')} - {task.duration || 30}min
                //             </div>
                //           </div>
                //          
                //          {/* Resize handles */}
                //          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-2 cursor-n-resize opacity-0 group-hover:opacity-100 bg-white/60 rounded-sm transition-opacity duration-200" onMouseDown={e => handleResizeStart(e, task.id, 'top')} />
                //          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-2 cursor-s-resize opacity-0 group-hover:opacity-100 bg-white/60 rounded-sm transition-opacity duration-200" onMouseDown={e => handleResizeStart(e, task.id, 'bottom')} />
                //        </div>
                //       )}
                //     </Draggable>
                //   );
                // } else {
                  // Render without Draggable when enableDragDrop is false (ALWAYS RENDERING THIS FOR DEBUG)
                  return (
                    <div 
                      key={`taskname-${task.id}`}
                      className="absolute px-0 py-2 bg-white/90 backdrop-blur-sm border border-white/30 shadow-lg rounded-l-md flex items-center z-20 cursor-pointer group hover:bg-white/95 transition-all duration-300 min-h-[32px]" 
                      style={{
                        top: `${topOffset}px`,
                        left: '0px',
                        right: '0px',
                        height: `${heightInPixels}px`,
                        minHeight: '20px'
                      }} 
                      onClick={e => handleEdgeClick(e, task.id)}
                    >
                      {/* Drag Handle - Left Side (visual only when not draggable) */}
                      <div className="w-6 h-full bg-gray-300 hover:bg-gray-400 cursor-grab flex items-center justify-center border-r border-gray-200 flex-shrink-0">
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
                     
                     {/* Resize handles */}
                     <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-2 cursor-n-resize opacity-0 group-hover:opacity-100 bg-white/60 rounded-sm transition-opacity duration-200" onMouseDown={e => handleResizeStart(e, task.id, 'top')} />
                     <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-2 cursor-s-resize opacity-0 group-hover:opacity-100 bg-white/60 rounded-sm transition-opacity duration-200" onMouseDown={e => handleResizeStart(e, task.id, 'bottom')} />
                   </div>
                  );
                // }
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
      {!isDragActive && <div className="w-80 border-l border-white/20 glass-card flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-white/20">
            <h3 className="text-lg font-semibold text-white font-inter">Today's Overview</h3>
          </div>

          {/* Top 3 Priorities */}
          <div className="p-4 border-b border-white/20">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-accent" />
              <h4 className="font-medium text-white">Top 3 Priorities</h4>
            </div>
            <div className="space-y-2">
              {priorities.map((priority, index) => <div key={index} className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white/70 w-4">{index + 1}.</span>
                  <Input 
                    value={priority} 
                    onChange={e => {
                      const newPriorities = [...priorities];
                      newPriorities[index] = e.target.value;
                      setPriorities(newPriorities);
                      // Debounced auto-save when priorities change
                      debouncedSave(newPriorities, priorityChecked, notes);
                    }} 
                    placeholder={`Priority ${index + 1}`} 
                    className="text-sm h-8 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-white/30 flex-1" 
                  />
                  <Checkbox 
                    checked={priorityChecked[index]} 
                    onCheckedChange={(checked) => {
                      const newChecked = [...priorityChecked];
                      newChecked[index] = checked as boolean;
                      setPriorityChecked(newChecked);
                      // Immediate save for checkbox changes
                      saveDailyData(priorities, newChecked, notes);
                    }}
                    className="data-[state=checked]:bg-white/20 data-[state=checked]:border-white/30 border-white/20 bg-white/10"
                  />
                </div>)}
            </div>
          </div>

          {/* Notes Section */}
          <div className="p-4 flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-accent" />
              <h4 className="font-medium text-white">Notes</h4>
            </div>
            <textarea 
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                // Debounced auto-save when notes change
                debouncedSave(priorities, priorityChecked, e.target.value);
              }}
              placeholder="Add your notes here..."
              className="w-full flex-1 bg-white/10 border border-white/20 rounded-lg p-3 text-sm text-white placeholder:text-white/50 resize-none focus:bg-white/15 focus:border-white/30 focus:outline-none"
            />
          </div>
        </div>}
    </div>
  );

  // Conditionally wrap with DragDropContext or return content directly
  return useOwnDragContext ? (
    <DragDropContext onDragEnd={handleDragEnd}>
      <TimelineContent />
    </DragDropContext>
  ) : (
    <TimelineContent />
  );
};