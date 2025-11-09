import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTimeTracking } from '@/contexts/TimeTrackingContext';

interface ProjectPageHeaderProps {
  projectName: string;
  pageTitle: string;
  onNavigate: (page: string) => void;
  actions?: React.ReactNode;
}

export const ProjectPageHeader = ({ projectName, pageTitle, onNavigate, actions }: ProjectPageHeaderProps) => {
  const { activeTimer } = useTimeTracking();
  const [elapsedTime, setElapsedTime] = useState<string>('00:00');

  // Update elapsed time every second when timer is active
  useEffect(() => {
    if (!activeTimer || activeTimer.status !== 'running') {
      return;
    }

    const updateElapsed = () => {
      const start = new Date(activeTimer.start_time).getTime();
      const now = Date.now();
      const diff = Math.floor((now - start) / 1000); // seconds
      
      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;
      
      const formatted = hours > 0 
        ? `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      setElapsedTime(formatted);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [activeTimer]);

  return (
    <div className="flex-shrink-0 border-b border-border bg-white">
      <div className="px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-foreground font-inter">{projectName}</h1>
          
          {/* Active Time Tracker Indicator */}
          {activeTimer && activeTimer.status === 'running' && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full animate-pulse-subtle">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <Clock className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-sm font-semibold text-primary">{elapsedTime}</span>
              <span className="text-xs text-muted-foreground max-w-[200px] truncate">
                {activeTimer.task_activity}
              </span>
            </div>
          )}
        </div>
        
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
};
