import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface TimeEntry {
  id: string;
  date: string;
  hours: number;
  description?: string;
}

export interface WeeklyProgress {
  day: string;
  hours: number;
  target: number;
  date: number;
  isToday: boolean;
}

export const useTimeTracker = () => {
  const { user } = useAuth();
  const [isTracking, setIsTracking] = useState(false);
  const [currentTime, setCurrentTime] = useState(0); // in seconds
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [weeklyEntries, setWeeklyEntries] = useState<TimeEntry[]>([]);
  const [weeklyTarget] = useState(40); // 40 hours per week

  // Load saved time data
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`time_tracker_${user.id}`);
      if (saved) {
        const data = JSON.parse(saved);
        setWeeklyEntries(data.weeklyEntries || []);
        setCurrentTime(data.currentTime || 0);
        
        // Check if there was an active session
        if (data.isTracking && data.startTime) {
          const savedStartTime = new Date(data.startTime);
          const elapsed = Math.floor((Date.now() - savedStartTime.getTime()) / 1000);
          setCurrentTime(data.currentTime + elapsed);
          setStartTime(savedStartTime);
          setIsTracking(true);
        }
      }
    }
  }, [user]);

  // Update timer every second when tracking
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTracking && startTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
        setCurrentTime(elapsed);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTracking, startTime]);

  // Save data to localStorage
  const saveData = useCallback(() => {
    if (user) {
      const data = {
        weeklyEntries,
        currentTime,
        isTracking,
        startTime: startTime?.toISOString(),
      };
      localStorage.setItem(`time_tracker_${user.id}`, JSON.stringify(data));
    }
  }, [user, weeklyEntries, currentTime, isTracking, startTime]);

  useEffect(() => {
    saveData();
  }, [saveData]);

  const startTracking = () => {
    const now = new Date();
    setStartTime(now);
    setIsTracking(true);
  };

  const pauseTracking = () => {
    setIsTracking(false);
    setStartTime(null);
  };

  const stopTracking = () => {
    if (currentTime > 0) {
      const today = new Date().toISOString().split('T')[0];
      const hours = currentTime / 3600;
      
      setWeeklyEntries(prev => {
        const existing = prev.find(entry => entry.date === today);
        if (existing) {
          return prev.map(entry =>
            entry.date === today
              ? { ...entry, hours: entry.hours + hours }
              : entry
          );
        } else {
          return [...prev, {
            id: Date.now().toString(),
            date: today,
            hours,
            description: 'Work session'
          }];
        }
      });
    }
    
    setCurrentTime(0);
    setIsTracking(false);
    setStartTime(null);
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTodayHours = (): number => {
    const today = new Date().toISOString().split('T')[0];
    const todayEntry = weeklyEntries.find(entry => entry.date === today);
    const trackedHours = todayEntry?.hours || 0;
    const currentHours = currentTime / 3600;
    return trackedHours + currentHours;
  };

  const getWeeklyProgress = (): WeeklyProgress[] => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      const dateString = date.toISOString().split('T')[0];
      
      const entry = weeklyEntries.find(e => e.date === dateString);
      let hours = entry?.hours || 0;
      
      // Add current session time if it's today
      if (dateString === today.toISOString().split('T')[0]) {
        hours += currentTime / 3600;
      }

      return {
        day: weekDays[index],
        hours,
        target: 8,
        date: date.getDate(),
        isToday: dateString === today.toISOString().split('T')[0]
      };
    });
  };

  const getTotalWeeklyHours = (): number => {
    const weeklyProgress = getWeeklyProgress();
    return weeklyProgress.reduce((total, day) => total + day.hours, 0);
  };

  const getWeeklyProgressPercentage = (): number => {
    const totalHours = getTotalWeeklyHours();
    return Math.round((totalHours / weeklyTarget) * 100);
  };

  return {
    isTracking,
    currentTime: formatTime(currentTime),
    currentTimeRaw: currentTime,
    startTracking,
    pauseTracking,
    stopTracking,
    getTodayHours,
    getWeeklyProgress,
    getTotalWeeklyHours,
    getWeeklyProgressPercentage,
    weeklyTarget
  };
};