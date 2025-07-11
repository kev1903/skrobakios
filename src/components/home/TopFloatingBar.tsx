import React from 'react';
import { Menu, ClipboardList, Calendar as CalendarIcon, Inbox, User, Save, Bell, LogIn } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { NotificationBadge } from '@/components/ui/notification-badge';
import { useUser } from '@/contexts/UserContext';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/contexts/AuthContext';

interface TopFloatingBarProps {
  onToggleRibbon: () => void;
  onNavigate: (page: string) => void;
  onOpenSchedule: () => void;
  showSaveButton: boolean;
  onSaveMapPosition: () => Promise<void>;
}

export const TopFloatingBar = ({
  onToggleRibbon,
  onNavigate,
  onOpenSchedule,
  showSaveButton,
  onSaveMapPosition
}: TopFloatingBarProps) => {
  const { userProfile } = useUser();
  const { unreadCount } = useNotifications();
  const { isAuthenticated } = useAuth();

  return (
    <div className="fixed top-6 left-0 z-50 w-full">
      <div className="flex items-center justify-between py-0 px-6 mx-6">
        {/* Navigation Menu Icon */}
        <div className="flex-shrink-0 mr-4">
          <button 
            onClick={onToggleRibbon}
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Spacer for left side */}
        <div className="flex-shrink-0"></div>

        {/* Center - Spacer */}
        <div className="flex-1"></div>

        {/* Right side - Icons and User Profile */}
        <div className="flex-shrink-0 flex items-center gap-3">
          {!isAuthenticated ? (
            /* Sign In Button for unauthenticated users */
            <button 
              onClick={() => onNavigate('auth')} 
              className="flex items-center gap-2 px-4 py-2 bg-primary/20 backdrop-blur-sm rounded-lg border border-primary/30 text-white hover:bg-primary/30 transition-colors duration-200"
            >
              <LogIn className="w-4 h-4" />
              <span className="text-sm font-medium">Sign In</span>
            </button>
          ) : (
            <>
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
              
              {/* Save Map Position Icon */}
              {showSaveButton && (
                <button 
                  onClick={onSaveMapPosition}
                  className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
                >
                  <Save className="w-5 h-5 text-white" />
                </button>
              )}
               
               {/* Notification Icon */}
               <NotificationBadge count={unreadCount}>
                 <button 
                   onClick={() => onNavigate('notifications')} 
                   className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
                 >
                   <Bell className="w-5 h-5 text-white" />
                 </button>
               </NotificationBadge>
               
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};