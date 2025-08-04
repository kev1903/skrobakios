import { startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, startOfWeek, endOfWeek, isSameDay } from 'date-fns';
import { TimeBlock, CalendarViewData } from './types';

export const categoryColors = {
  work: '213 40% 75%',          // Soft Blue  
  personal: '145 35% 70%',      // Soft Green
  meeting: '260 30% 75%',       // Soft Purple
  break: '35 45% 75%',          // Soft Orange
  family: '330 35% 80%',        // Soft Pink
  site_visit: '225 25% 70%',    // Soft Indigo
  church: '270 25% 75%',        // Soft Lavender
  rest: '210 15% 70%'           // Soft Gray
};

export const colorOptions = [
  { name: 'Soft Blue', value: '213 40% 75%', hex: '#a5c5e3' },
  { name: 'Soft Green', value: '145 35% 70%', hex: '#9bcfa6' },
  { name: 'Soft Purple', value: '260 30% 75%', hex: '#b5a8d9' },
  { name: 'Soft Orange', value: '35 45% 75%', hex: '#e6b88a' },
  { name: 'Soft Pink', value: '330 35% 80%', hex: '#e8b4cb' },
  { name: 'Soft Indigo', value: '225 25% 70%', hex: '#a5b4d1' },
  { name: 'Soft Lavender', value: '270 25% 75%', hex: '#c4b5d9' },
  { name: 'Soft Gray', value: '210 15% 70%', hex: '#adb5bd' },
  { name: 'Soft Coral', value: '10 40% 75%', hex: '#e3a5a5' },
  { name: 'Soft Peach', value: '25 45% 75%', hex: '#e6c49b' },
  { name: 'Soft Yellow', value: '50 35% 75%', hex: '#ddd19b' },
  { name: 'Soft Mint', value: '160 30% 75%', hex: '#a5d9c4' },
  { name: 'Soft Teal', value: '180 30% 70%', hex: '#9bcfcf' },
  { name: 'Soft Sky', value: '200 35% 75%', hex: '#a5c8e3' },
  { name: 'Soft Azure', value: '195 40% 75%', hex: '#9bc9e3' },
  { name: 'Soft Rose', value: '340 30% 75%', hex: '#e3b4c4' }
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