import React from 'react';
import { SchedulePage } from '@/components/SchedulePage';

interface FullScreenScheduleProps {
  isOpen: boolean;
  onNavigate: (page: string) => void;
  onClose: () => void;
}

export const FullScreenSchedule = ({
  isOpen,
  onNavigate,
  onClose
}: FullScreenScheduleProps) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 pt-16 pb-20">
        <div 
          className="w-full h-full glass-card"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button for Schedule */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 w-8 h-8 glass-card rounded-full flex items-center justify-center hover:bg-muted transition-colors duration-200"
          >
            <span className="text-foreground text-lg">×</span>
          </button>
          <SchedulePage onNavigate={onNavigate} />
        </div>
      </div>
      
      {/* Overlay to close schedule when clicking outside */}
      <div 
        className="fixed inset-0 bg-background/20 backdrop-blur-sm z-30"
        onClick={onClose}
      />
    </>
  );
};