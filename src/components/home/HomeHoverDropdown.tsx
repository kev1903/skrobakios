import React from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';

interface HomeHoverDropdownProps {
  isVisible: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onOpenSchedule: () => void;
}

export const HomeHoverDropdown = ({
  isVisible,
  onMouseEnter,
  onMouseLeave,
  onOpenSchedule
}: HomeHoverDropdownProps) => {
  if (!isVisible) return null;

  return (
    <div 
      className="absolute top-12 left-0 w-48 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-xl z-50"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="p-2">
        <button
          onClick={onOpenSchedule}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-white hover:bg-white/20 transition-all duration-200 text-left text-sm"
        >
          <CalendarIcon className="w-4 h-4" />
          <span>My Schedule</span>
        </button>
      </div>
    </div>
  );
};