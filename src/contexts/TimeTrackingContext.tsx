import React, { createContext, useContext, ReactNode } from 'react';
import { useTimeTracking as useTimeTrackingHook, TimeEntry, TimeTrackingSettings } from '@/hooks/useTimeTracking';

interface TimeTrackingContextValue {
  timeEntries: TimeEntry[];
  settings: TimeTrackingSettings | null;
  activeTimer: TimeEntry | null;
  categories: string[];
  loading: boolean;
  loadTimeEntries: (date?: string, endDate?: string) => Promise<void>;
  loadCategories: () => Promise<void>;
  addCategory: (categoryName: string) => Promise<void>;
  startTimer: (taskActivity: string, category?: string, projectName?: string) => Promise<void>;
  stopTimer: () => Promise<void>;
  pauseTimer: () => Promise<void>;
  resumeTimer: () => Promise<void>;
  createTimeEntry: (entry: Partial<TimeEntry>) => Promise<any>;
  updateTimeEntry: (id: string, updates: Partial<TimeEntry>) => Promise<void>;
  deleteTimeEntry: (id: string) => Promise<void>;
  duplicateTimeEntry: (entry: TimeEntry) => Promise<void>;
  updateSettings: (newSettings: Partial<TimeTrackingSettings>) => Promise<void>;
  getDailyStats: (entries: TimeEntry[]) => any;
}

const TimeTrackingContext = createContext<TimeTrackingContextValue | undefined>(undefined);

interface TimeTrackingProviderProps {
  children: ReactNode;
}

export const TimeTrackingProvider: React.FC<TimeTrackingProviderProps> = ({ children }) => {
  const timeTrackingValue = useTimeTrackingHook();

  return (
    <TimeTrackingContext.Provider value={timeTrackingValue}>
      {children}
    </TimeTrackingContext.Provider>
  );
};

export const useTimeTracking = () => {
  const context = useContext(TimeTrackingContext);
  if (context === undefined) {
    throw new Error('useTimeTracking must be used within a TimeTrackingProvider');
  }
  return context;
};