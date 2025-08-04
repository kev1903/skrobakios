export interface TimeBlock {
  id: string;
  title: string;
  description?: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string;
  endTime: string;
  category: 'work' | 'personal' | 'meeting' | 'break' | 'family' | 'site_visit' | 'church' | 'rest' | 'exercise';
  color: string;
}

export interface NewTimeBlock {
  title: string;
  description: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  category: TimeBlock['category'];
  color: string;
}

export interface CalendarViewData {
  days: Date[];
  paddedDays: (Date | null)[];
  isCurrentPeriod: (day: Date) => boolean;
}