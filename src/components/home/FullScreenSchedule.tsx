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
      <div className="fixed inset-0 z-40 pt-16 pb-4">
        <div 
          className="w-full h-full bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button for Schedule */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
          >
            <span className="text-white text-lg">×</span>
          </button>
          <SchedulePage onNavigate={onNavigate} />
        </div>
      </div>
      
      {/* Overlay to close schedule when clicking outside */}
      <div 
        className="fixed inset-0 bg-black/20 z-30"
        onClick={onClose}
      />
    </>
  );
};