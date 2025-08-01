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
  { name: 'Blue', value: 'bg-blue-400', hex: '#60a5fa' },
  { name: 'Green', value: 'bg-green-400', hex: '#4ade80' },
  { name: 'Purple', value: 'bg-purple-400', hex: '#a78bfa' },
  { name: 'Amber', value: 'bg-amber-400', hex: '#fbbf24' },
  { name: 'Pink', value: 'bg-pink-400', hex: '#f472b6' },
  { name: 'Indigo', value: 'bg-indigo-400', hex: '#818cf8' },
  { name: 'Violet', value: 'bg-violet-400', hex: '#a78bfa' },
  { name: 'Slate', value: 'bg-slate-400', hex: '#94a3b8' },
  { name: 'Red', value: 'bg-red-400', hex: '#f87171' },
  { name: 'Orange', value: 'bg-orange-400', hex: '#fb923c' },
  { name: 'Yellow', value: 'bg-yellow-400', hex: '#facc15' },
  { name: 'Emerald', value: 'bg-emerald-400', hex: '#34d399' },
  { name: 'Teal', value: 'bg-teal-400', hex: '#2dd4bf' },
  { name: 'Cyan', value: 'bg-cyan-400', hex: '#22d3ee' },
  { name: 'Sky', value: 'bg-sky-400', hex: '#38bdf8' },
  { name: 'Rose', value: 'bg-rose-400', hex: '#fb7185' }
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