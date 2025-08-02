import React, { useState, useEffect } from 'react';
import { Play, Pause, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTimeTracking } from '@/contexts/TimeTrackingContext';

export const TimerTopBar = () => {
  const { activeTimer, stopTimer, pauseTimer, resumeTimer } = useTimeTracking();
  const [currentDuration, setCurrentDuration] = useState(0);
  const isPaused = activeTimer?.status === 'paused';

  // Debug logging
  React.useEffect(() => {
    console.log('TimerTopBar activeTimer state:', activeTimer);
    console.log('TimerTopBar rendering, activeTimer exists:', !!activeTimer);
  }, [activeTimer]);

  useEffect(() => {
    if (!activeTimer) return;

    // Update duration every second when timer is active
    const interval = setInterval(() => {
      if (!isPaused && activeTimer.start_time) {
        const startTime = new Date(activeTimer.start_time).getTime();
        const now = Date.now();
        setCurrentDuration(Math.floor((now - startTime) / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer, isPaused]);

  // Initialize duration when activeTimer changes
  useEffect(() => {
    if (activeTimer?.start_time) {
      const startTime = new Date(activeTimer.start_time).getTime();
      const now = Date.now();
      setCurrentDuration(Math.floor((now - startTime) / 1000));
    }
  }, [activeTimer]);

  if (!activeTimer) {
    console.log('TimerTopBar: No active timer, not rendering');
    return null;
  }

  console.log('TimerTopBar: Rendering with active timer:', activeTimer);

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePauseResume = () => {
    if (isPaused) {
      resumeTimer();
    } else {
      pauseTimer();
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-orange-500' : 'bg-green-500'} animate-pulse`} />
            <span className="text-2xl font-mono font-semibold">
              {formatDuration(currentDuration)}
            </span>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {activeTimer.task_activity || 'No description'}
          </div>
          
          {activeTimer.category && (
            <span className="px-2 py-1 text-xs bg-muted rounded-md">
              {activeTimer.category}
            </span>
          )}
          
          {activeTimer.project_name && (
            <span className="px-2 py-1 text-xs bg-muted rounded-md">
              {activeTimer.project_name}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePauseResume}
            className="h-8 w-8 p-0"
          >
            {isPaused ? (
              <Play className="h-4 w-4" />
            ) : (
              <Pause className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={stopTimer}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
          >
            <Square className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};