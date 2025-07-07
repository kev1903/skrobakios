import { ModernGanttTask, TimelineHeader } from './types';

// Calculate bar position based on dates within the timeline
export const calculateBarPosition = (
  startDate: string,
  endDate: string,
  timelineStart: Date,
  timelineEnd: Date
): { left: string; width: string } => {
  const taskStart = new Date(startDate);
  const taskEnd = new Date(endDate);
  
  const totalDays = Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
  const startOffset = Math.ceil((taskStart.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
  const taskDuration = Math.ceil((taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24));
  
  const leftPercentage = Math.max(0, (startOffset / totalDays) * 100);
  const widthPercentage = Math.max(1, (taskDuration / totalDays) * 100);
  
  return {
    left: `${leftPercentage}%`,
    width: `${widthPercentage}%`
  };
};

// Calculate end date based on start date and duration
export const calculateEndDate = (startDate: string, duration: number): string => {
  const start = new Date(startDate);
  const end = new Date(start);
  end.setDate(start.getDate() + duration);
  return end.toISOString().split('T')[0];
};

// Calculate duration based on start and end dates
export const calculateDuration = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
};

// Generate timeline headers with extended date range
export const generateTimelineHeaders = (
  startDate: Date = new Date('2024-11-01'),
  months: number = 6
): TimelineHeader => {
  const timelineMonths: string[] = [];
  const timelineDays: number[] = [];
  
  const current = new Date(startDate);
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + months);
  
  for (let i = 0; i < months; i++) {
    const monthStr = current.toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
    timelineMonths.push(monthStr);
    
    // Generate days for this month
    const daysInMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      timelineDays.push(day);
    }
    
    current.setMonth(current.getMonth() + 1);
  }
  
  return {
    months: timelineMonths,
    days: timelineDays,
    startDate: new Date(startDate),
    endDate: endDate
  };
};

// Update task with automatic calculations
export const updateTaskWithCalculations = (
  task: ModernGanttTask,
  field: 'duration' | 'startDate' | 'endDate',
  value: string | number,
  timelineStart: Date,
  timelineEnd: Date
): ModernGanttTask => {
  const updatedTask = { ...task };
  
  if (field === 'duration') {
    updatedTask.duration = Number(value);
    updatedTask.endDate = calculateEndDate(updatedTask.startDate, updatedTask.duration);
  } else if (field === 'startDate') {
    updatedTask.startDate = String(value);
    updatedTask.endDate = calculateEndDate(updatedTask.startDate, updatedTask.duration);
  } else if (field === 'endDate') {
    updatedTask.endDate = String(value);
    updatedTask.duration = calculateDuration(updatedTask.startDate, updatedTask.endDate);
  }
  
  // Recalculate bar position
  const barPosition = calculateBarPosition(
    updatedTask.startDate,
    updatedTask.endDate,
    timelineStart,
    timelineEnd
  );
  
  updatedTask.barStyle = {
    ...updatedTask.barStyle,
    left: barPosition.left,
    width: barPosition.width,
    backgroundColor: updatedTask.barStyle?.backgroundColor || generateTaskColor(updatedTask.id)
  };
  
  return updatedTask;
};

// Generate consistent colors for tasks
export const generateTaskColor = (taskId: string): string => {
  const colors = ['#3B82F6', '#06B6D4', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];
  const hash = taskId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  return colors[Math.abs(hash) % colors.length];
};