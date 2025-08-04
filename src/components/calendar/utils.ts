import { startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, startOfWeek, endOfWeek, isSameDay } from 'date-fns';
import { TimeBlock, CalendarViewData } from './types';

export const categoryColors = {
  work: '200 30% 75%',          // Soft Blue-Gray  
  personal: '160 25% 70%',      // Muted Mint
  meeting: '280 20% 75%',       // Pale Lavender
  break: '25 35% 80%',          // Soft Peach
  family: '340 25% 82%',        // Dusty Rose
  site_visit: '180 25% 72%',    // Soft Teal
  church: '270 20% 78%',        // Gentle Purple
  rest: '220 15% 75%'           // Warm Gray
};

export const colorOptions = [
  { name: 'Dusty Blue', value: '200 30% 75%', hex: '#b3c5d1' },
  { name: 'Muted Mint', value: '160 25% 70%', hex: '#a8c5b5' },
  { name: 'Pale Lavender', value: '280 20% 75%', hex: '#c4b8d1' },
  { name: 'Soft Peach', value: '25 35% 80%', hex: '#e6c4a8' },
  { name: 'Dusty Rose', value: '340 25% 82%', hex: '#e0c0c8' },
  { name: 'Soft Teal', value: '180 25% 72%', hex: '#a8c5c5' },
  { name: 'Gentle Purple', value: '270 20% 78%', hex: '#c8bdd6' },
  { name: 'Warm Gray', value: '220 15% 75%', hex: '#bdc0c7' },
  { name: 'Sage Green', value: '140 20% 70%', hex: '#a8bfad' },
  { name: 'Soft Coral', value: '15 30% 78%', hex: '#d9b8a8' },
  { name: 'Muted Gold', value: '45 25% 75%', hex: '#cfc4a8' },
  { name: 'Powder Blue', value: '190 25% 78%', hex: '#b3cdd6' },
  { name: 'Blush Pink', value: '350 20% 80%', hex: '#d6c0c4' },
  { name: 'Seafoam', value: '170 20% 72%', hex: '#a8c7c0' },
  { name: 'Soft Mauve', value: '320 18% 75%', hex: '#d1bcc4' },
  { name: 'Gentle Olive', value: '80 15% 70%', hex: '#b8bfa8' }
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