import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface CalendarEvent {
  id: string;
  time: string;
  title: string;
  type: 'meeting' | 'call' | 'review' | 'deadline' | 'task';
  color: string;
  date: string;
  description?: string;
}

export interface CalendarDay {
  day: string;
  date: number;
  isToday: boolean;
  events: number;
  fullDate: string;
}

export const useCalendarData = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const eventColors = {
    meeting: 'bg-blue-100 text-blue-700 border-blue-200',
    call: 'bg-green-100 text-green-700 border-green-200',
    review: 'bg-purple-100 text-purple-700 border-purple-200',
    deadline: 'bg-red-100 text-red-700 border-red-200',
    task: 'bg-yellow-100 text-yellow-700 border-yellow-200'
  };

  // Initialize with sample data and load from localStorage
  useEffect(() => {
    if (user) {
      const saved = localStorage.getItem(`calendar_events_${user.id}`);
      if (saved) {
        setEvents(JSON.parse(saved));
      } else {
        // Initialize with sample events
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        
        const sampleEvents: CalendarEvent[] = [
          {
            id: '1',
            time: '9:00 AM',
            title: 'Team Meeting',
            type: 'meeting',
            color: eventColors.meeting,
            date: today.toISOString().split('T')[0],
            description: 'Weekly team sync meeting'
          },
          {
            id: '2',
            time: '2:00 PM',
            title: 'Client Call',
            type: 'call',
            color: eventColors.call,
            date: today.toISOString().split('T')[0],
            description: 'Project review with client'
          },
          {
            id: '3',
            time: '4:30 PM',
            title: 'Project Review',
            type: 'review',
            color: eventColors.review,
            date: today.toISOString().split('T')[0],
            description: 'Review project deliverables'
          },
          {
            id: '4',
            time: '10:00 AM',
            title: 'Design Review',
            type: 'review',
            color: eventColors.review,
            date: tomorrow.toISOString().split('T')[0],
            description: 'Review latest design mockups'
          },
          {
            id: '5',
            time: '3:00 PM',
            title: 'Project Deadline',
            type: 'deadline',
            color: eventColors.deadline,
            date: tomorrow.toISOString().split('T')[0],
            description: 'Final deliverable due'
          }
        ];
        
        setEvents(sampleEvents);
        localStorage.setItem(`calendar_events_${user.id}`, JSON.stringify(sampleEvents));
      }
      setLoading(false);
    }
  }, [user]);

  // Save events to localStorage whenever they change
  useEffect(() => {
    if (user && events.length > 0) {
      localStorage.setItem(`calendar_events_${user.id}`, JSON.stringify(events));
    }
  }, [user, events]);

  const addEvent = (event: Omit<CalendarEvent, 'id' | 'color'>) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: Date.now().toString(),
      color: eventColors[event.type]
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const updateEvent = (id: string, updates: Partial<CalendarEvent>) => {
    setEvents(prev => prev.map(event => 
      event.id === id ? { ...event, ...updates } : event
    ));
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  };

  const getTodayEvents = (): CalendarEvent[] => {
    const today = new Date().toISOString().split('T')[0];
    return events.filter(event => event.date === today);
  };

  const getUpcomingDays = (): CalendarDay[] => {
    const today = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return Array.from({ length: 3 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() + index);
      const dateString = date.toISOString().split('T')[0];
      
      const dayEvents = events.filter(event => event.date === dateString);
      
      return {
        day: days[date.getDay()],
        date: date.getDate(),
        isToday: index === 0,
        events: dayEvents.length,
        fullDate: dateString
      };
    });
  };

  const getWeeklyEventCount = (): number => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const startStr = startOfWeek.toISOString().split('T')[0];
    const endStr = endOfWeek.toISOString().split('T')[0];
    
    return events.filter(event => event.date >= startStr && event.date <= endStr).length;
  };

  return {
    events,
    loading,
    addEvent,
    updateEvent,
    deleteEvent,
    getTodayEvents,
    getUpcomingDays,
    getWeeklyEventCount
  };
};