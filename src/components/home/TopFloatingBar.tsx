import React, { useState } from 'react';
import { Menu, ClipboardList, Inbox, User, Save, Bell, LogIn, LogOut } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { NotificationBadge } from '@/components/ui/notification-badge';
import { NotificationDropdown } from '@/components/ui/notification-dropdown';
import { useUser } from '@/contexts/UserContext';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TopFloatingBarProps {
  onToggleRibbon: () => void;
  onNavigate: (page: string) => void;
  showSaveButton: boolean;
  onSaveMapPosition: () => Promise<void>;
}

export const TopFloatingBar = ({
  onToggleRibbon,
  onNavigate,
  showSaveButton,
  onSaveMapPosition
}: TopFloatingBarProps) => {
  const { userProfile } = useUser();
  const { unreadCount } = useNotifications();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Error",
          description: "Failed to log out. Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Successfully logged out",
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during logout",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed top-6 left-0 z-40 w-full">
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
               <NotificationDropdown>
                 <NotificationBadge count={unreadCount}>
                   <button className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors duration-200">
                     <Bell className="w-5 h-5 text-white" />
                   </button>
                 </NotificationBadge>
               </NotificationDropdown>
               
               {/* Inbox Icon */}
               <button 
                 onClick={() => onNavigate('inbox')} 
                 className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
               >
                 <Inbox className="w-5 h-5 text-white" />
               </button>
              
               {/* User Profile Display */}
               <div className="relative">
                 <div 
                   className="flex items-center gap-2 px-3 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 cursor-pointer hover:bg-white/30 transition-colors duration-200"
                   onMouseEnter={() => setShowProfileDropdown(true)}
                   onMouseLeave={() => setShowProfileDropdown(false)}
                 >
                   <Avatar className="w-6 h-6">
                     <AvatarImage 
                       src={userProfile.avatarUrl || undefined} 
                       alt={`${userProfile?.firstName || 'User'} ${userProfile?.lastName || ''}`.trim()}
                       onError={(e) => {
                         // Hide broken images and show fallback
                         e.currentTarget.style.display = 'none';
                       }}
                     />
                     <AvatarFallback className="bg-white/40 text-white text-xs">
                       {userProfile?.firstName && userProfile?.lastName 
                         ? `${userProfile.firstName.charAt(0)}${userProfile.lastName.charAt(0)}`.toUpperCase()
                         : userProfile?.firstName?.charAt(0)?.toUpperCase() || userProfile?.email?.charAt(0)?.toUpperCase() || 'U'
                       }
                     </AvatarFallback>
                   </Avatar>
                 </div>
                 
                 {/* Profile Dropdown */}
                 {showProfileDropdown && (
                   <div 
                     className="absolute right-0 top-full mt-2 w-48 bg-white/95 backdrop-blur-sm rounded-lg border border-white/30 shadow-elegant z-40"
                     onMouseEnter={() => setShowProfileDropdown(true)}
                     onMouseLeave={() => setShowProfileDropdown(false)}
                   >
                     <div className="p-3 border-b border-white/20">
                       <div className="flex items-center gap-3">
                         <Avatar className="w-8 h-8">
                           <AvatarImage 
                             src={userProfile.avatarUrl || undefined} 
                             alt={`${userProfile?.firstName || 'User'} ${userProfile?.lastName || ''}`.trim()}
                           />
                           <AvatarFallback className="bg-primary/20 text-primary text-xs">
                             {userProfile?.firstName && userProfile?.lastName 
                               ? `${userProfile.firstName.charAt(0)}${userProfile.lastName.charAt(0)}`.toUpperCase()
                               : userProfile?.firstName?.charAt(0)?.toUpperCase() || userProfile?.email?.charAt(0)?.toUpperCase() || 'U'
                             }
                           </AvatarFallback>
                         </Avatar>
                         <div className="flex-1 min-w-0">
                           <p className="text-sm font-medium text-foreground truncate">
                             {userProfile?.firstName && userProfile?.lastName 
                               ? `${userProfile.firstName} ${userProfile.lastName}`
                               : userProfile?.email || 'User'
                             }
                           </p>
                           <p className="text-xs text-muted-foreground truncate">
                             {userProfile?.email || ''}
                           </p>
                         </div>
                       </div>
                     </div>
                     
                     <div className="py-2">
                       <button 
                         onClick={handleLogout}
                         className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-foreground hover:bg-white/20 transition-colors duration-200"
                       >
                         <LogOut className="w-4 h-4" />
                         <span>Log out</span>
                       </button>
                     </div>
                   </div>
                 )}
               </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};