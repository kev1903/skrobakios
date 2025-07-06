import React from 'react';
import { Menu, ClipboardList, Calendar as CalendarIcon, Inbox, User } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useUser } from '@/contexts/UserContext';
import { HomeHoverDropdown } from './HomeHoverDropdown';

interface TopFloatingBarProps {
  isHomeHovered: boolean;
  setIsHomeHovered: (hovered: boolean) => void;
  onToggleRibbon: () => void;
  onNavigate: (page: string) => void;
  onOpenSchedule: () => void;
}

export const TopFloatingBar = ({
  isHomeHovered,
  setIsHomeHovered,
  onToggleRibbon,
  onNavigate,
  onOpenSchedule
}: TopFloatingBarProps) => {
  const { userProfile } = useUser();

  return (
    <div className="fixed top-6 left-0 z-50 w-full">
      <div className="flex items-center justify-between py-0 px-6 mx-6">
        {/* Navigation Menu Icon with Hover Dropdown */}
        <div className="flex-shrink-0 mr-4 relative">
          <button 
            onClick={onToggleRibbon}
            onMouseEnter={() => setIsHomeHovered(true)}
            onMouseLeave={() => setIsHomeHovered(false)}
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>
          
          <HomeHoverDropdown 
            isVisible={isHomeHovered}
            onMouseEnter={() => setIsHomeHovered(true)}
            onMouseLeave={() => setIsHomeHovered(false)}
            onOpenSchedule={onOpenSchedule}
          />
        </div>

        {/* Spacer for left side */}
        <div className="flex-shrink-0"></div>

        {/* Center - Spacer */}
        <div className="flex-1"></div>

        {/* Right side - Icons and User Profile */}
        <div className="flex-shrink-0 flex items-center gap-3">
          {/* Task Icon */}
          <button 
            onClick={() => onNavigate('tasks')} 
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
          >
            <ClipboardList className="w-5 h-5 text-white" />
          </button>
          
          {/* Schedule Icon */}
          <button 
            onClick={onOpenSchedule}
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
          >
            <CalendarIcon className="w-5 h-5 text-white" />
          </button>
          
          {/* Inbox Icon */}
          <button 
            onClick={() => onNavigate('inbox')} 
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
          >
            <Inbox className="w-5 h-5 text-white" />
          </button>
          
          {/* User Profile */}
          <button onClick={() => onNavigate('user-edit')} className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors duration-200">
            <Avatar className="w-6 h-6">
              <AvatarImage src={userProfile.avatarUrl} alt="Profile" />
              <AvatarFallback className="bg-white/40 text-white text-xs">
                <User className="w-3 h-3" />
              </AvatarFallback>
            </Avatar>
          </button>
        </div>
      </div>
    </div>
  );
};