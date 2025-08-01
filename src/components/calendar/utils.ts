import { startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, startOfWeek, endOfWeek, isSameDay } from 'date-fns';
import { TimeBlock, CalendarViewData } from './types';

export const categoryColors = {
  work: '217 91% 60%',        // Blue  
  personal: '159 61% 51%',    // Green
  meeting: '263 69% 69%',     // Purple
  break: '43 96% 56%',        // Amber
  family: '327 73% 97%',      // Pink
  site_visit: '231 48% 48%',  // Indigo
  church: '262 83% 58%',      // Violet
  rest: '215 28% 60%'         // Slate
};

export const colorOptions = [
  { name: 'Blue', value: '217 91% 60%', hex: '#60a5fa' },
  { name: 'Green', value: '134 61% 52%', hex: '#4ade80' },
  { name: 'Purple', value: '263 69% 69%', hex: '#a78bfa' },
  { name: 'Amber', value: '43 96% 56%', hex: '#fbbf24' },
  { name: 'Pink', value: '327 73% 97%', hex: '#f472b6' },
  { name: 'Indigo', value: '231 48% 48%', hex: '#818cf8' },
  { name: 'Violet', value: '262 83% 58%', hex: '#a78bfa' },
  { name: 'Slate', value: '215 28% 60%', hex: '#94a3b8' },
  { name: 'Red', value: '0 85% 70%', hex: '#f87171' },
  { name: 'Orange', value: '20 91% 62%', hex: '#fb923c' },
  { name: 'Yellow', value: '54 92% 53%', hex: '#facc15' },
  { name: 'Emerald', value: '159 64% 52%', hex: '#34d399' },
  { name: 'Teal', value: '172 66% 51%', hex: '#2dd4bf' },
  { name: 'Cyan', value: '188 86% 53%', hex: '#22d3ee' },
  { name: 'Sky', value: '198 93% 60%', hex: '#38bdf8' },
  { name: 'Rose', value: '351 83% 75%', hex: '#fb7185' }
];

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
  const dayOfWeek = day.getDay();
  return timeBlocks.filter(block => block.dayOfWeek === dayOfWeek);
};

export const createTimeBlock = (
  newBlock: { title: string; description: string; dayOfWeek: number; startTime: string; endTime: string; category: TimeBlock['category'] }
): TimeBlock => {
  return {
    id: Date.now().toString(),
    title: newBlock.title,
    description: newBlock.description,
    dayOfWeek: newBlock.dayOfWeek,
    startTime: newBlock.startTime,
    endTime: newBlock.endTime,
    category: newBlock.category,
    color: categoryColors[newBlock.category]
  };
};