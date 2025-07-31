import { startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, startOfWeek, endOfWeek, isSameDay } from 'date-fns';
import { TimeBlock, CalendarViewData } from './types';

export const categoryColors = {
  work: 'bg-blue-400',
  personal: 'bg-green-400', 
  meeting: 'bg-purple-400',
  break: 'bg-amber-400',
  family: 'bg-pink-400',
  site_visit: 'bg-indigo-400',
  church: 'bg-violet-400',
  rest: 'bg-slate-400'
};

export const getCalendarData = (currentDate: Date, viewMode: 'week' | 'month'): CalendarViewData => {
  if (viewMode === 'week') {
    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(currentDate);
    return {
      days: eachDayOfInterval({ start: weekStart, end: weekEnd }),
      paddedDays: eachDayOfInterval({ start: weekStart, end: weekEnd }),
      isCurrentPeriod: () => true // All days in week view are current
    };
  } else {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startDayOfWeek = monthStart.getDay();
    const paddedDays = [
      ...Array(startDayOfWeek).fill(null),
      ...days
    ];
    return {
      days,
      paddedDays,
      isCurrentPeriod: (day: Date) => isSameMonth(day, currentDate)
    };
  }
};

export const getBlocksForDay = (day: Date, timeBlocks: TimeBlock[]): TimeBlock[] => {
  return timeBlocks.filter(block => isSameDay(block.date, day));
};

export const createTimeBlock = (
  selectedDate: Date,
  newBlock: { title: string; description: string; startTime: string; endTime: string; category: TimeBlock['category'] }
): TimeBlock => {
  return {
    id: Date.now().toString(),
    title: newBlock.title,
    description: newBlock.description,
    date: selectedDate,
    startTime: newBlock.startTime,
    endTime: newBlock.endTime,
    category: newBlock.category,
    color: categoryColors[newBlock.category]
  };
};