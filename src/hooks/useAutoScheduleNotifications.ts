import { useState, useCallback } from 'react';

export interface AutoScheduleNotification {
  id: string;
  taskId: string;
  taskName: string;
  wbsId: string;
  oldStartDate?: string;
  newStartDate?: string;
  oldEndDate?: string;
  newEndDate?: string;
  type: 'scheduled' | 'warning' | 'error';
  message: string;
  timestamp: Date;
}

export const useAutoScheduleNotifications = () => {
  const [notifications, setNotifications] = useState<AutoScheduleNotification[]>([]);

  const addNotification = useCallback((notification: Omit<AutoScheduleNotification, 'id' | 'timestamp'>) => {
    const newNotification: AutoScheduleNotification = {
      ...notification,
      id: `auto-schedule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-dismiss after 5 seconds for successful schedules
    if (notification.type === 'scheduled') {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
      }, 5000);
    }
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const createTaskUpdatedNotification = useCallback((
    taskId: string,
    taskName: string,
    wbsId: string,
    oldStartDate?: string,
    newStartDate?: string,
    oldEndDate?: string,
    newEndDate?: string
  ) => {
    const hasDateChange = (oldStartDate && newStartDate && oldStartDate !== newStartDate) ||
                         (oldEndDate && newEndDate && oldEndDate !== newEndDate);
    
    if (hasDateChange) {
      addNotification({
        taskId,
        taskName,
        wbsId,
        oldStartDate,
        newStartDate,
        oldEndDate,
        newEndDate,
        type: 'scheduled',
        message: 'Task automatically rescheduled based on dependencies'
      });
    }
  }, [addNotification]);

  const createValidationWarning = useCallback((
    taskId: string,
    taskName: string,
    wbsId: string,
    message: string
  ) => {
    addNotification({
      taskId,
      taskName,
      wbsId,
      type: 'warning',
      message
    });
  }, [addNotification]);

  const createSchedulingError = useCallback((
    taskId: string,
    taskName: string,
    wbsId: string,
    message: string
  ) => {
    addNotification({
      taskId,
      taskName,
      wbsId,
      type: 'error',
      message
    });
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    dismissNotification,
    dismissAll,
    createTaskUpdatedNotification,
    createValidationWarning,
    createSchedulingError
  };
};