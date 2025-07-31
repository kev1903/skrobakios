export interface TimeBlock {
  id: string;
  title: string;
  description?: string;
  date: Date;
  startTime: string;
  endTime: string;
  category: 'work' | 'personal' | 'meeting' | 'break' | 'family' | 'site_visit' | 'church';
  color: string;
}

export interface NewTimeBlock {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  category: TimeBlock['category'];
}

export interface CalendarViewData {
  days: Date[];
  paddedDays: (Date | null)[];
  isCurrentPeriod: (day: Date) => boolean;
}