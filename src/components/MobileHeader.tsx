
import React, { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { useAppContext } from '@/contexts/AppContextProvider';
import { useGlobalSidebar } from '@/contexts/GlobalSidebarContext';
import { useNotifications } from '@/hooks/useNotifications';
import { useScreenSize, useIsMobileSmall, useViewportDimensions } from '@/hooks/use-mobile';
import { User, Menu, ClipboardList, Bell, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { NotificationBadge } from '@/components/ui/notification-badge';
import { NotificationDropdown } from '@/components/ui/notification-dropdown';


interface MobileHeaderProps {
  onNavigate: (page: string) => void;
}

export const MobileHeader = ({ onNavigate }: MobileHeaderProps) => {
  const { userProfile, loading } = useUser();
  const { user } = useAuth();
  const { currentCompany } = useCompany();
  const { activeContext } = useAppContext();
  const { isOpen, toggleSidebar } = useGlobalSidebar();
  const { unreadCount } = useNotifications();
  const screenSize = useScreenSize();
  const isMobileSmall = useIsMobileSmall();
  const { width } = useViewportDimensions();

  // Get the user's display name from the database profile
  const getUserDisplayName = () => {
    if (loading) return 'Loading...';
    
    if (userProfile.firstName && userProfile.lastName) {
      return `${userProfile.firstName} ${userProfile.lastName}`;
    } else if (userProfile.firstName) {
      return userProfile.firstName;
    } else if (userProfile.lastName) {
      return userProfile.lastName;
    } else {
      return user?.email?.split('@')[0] || 'User';
    }
  };

  // Get display text for company logo - same logic as desktop MenuBar
  const getCompanyDisplayText = () => {
    if (activeContext === 'personal') {
      // Show user's full name for personal context
      if (userProfile.firstName || userProfile.lastName) {
        return `${userProfile.firstName} ${userProfile.lastName}`.trim();
      }
      // Fallback to email for personal context
      return userProfile.email || "Personal";
    } else {
      // Show business name for company context
      // Check if company name looks like an auto-generated default
      const isDefaultCompanyName = currentCompany?.name && (
        currentCompany.name.includes('@') || 
        currentCompany.name.endsWith('\'s Business') ||
        currentCompany.name.endsWith('\'s Company')
      );
      
      // If we have a real company name (not auto-generated), show it
      if (currentCompany?.name && !isDefaultCompanyName) {
        return currentCompany.name;
      }
      
      // Fallback to user's name or default for company context
      if (userProfile.firstName || userProfile.lastName) {
        return `${userProfile.firstName} ${userProfile.lastName}`.trim();
      }
      
      return userProfile.email || "KAKSIK";
    }
  };

  // Get the user's role/job title from the database profile
  const getUserRole = () => {
    if (loading) return '';
    return userProfile.jobTitle || '';
  };

  // Responsive header height and padding
  const headerHeight = isMobileSmall ? 'h-14' : 'h-16';
  const headerPadding = isMobileSmall ? 'px-3' : width < 375 ? 'px-2' : 'px-4';
  const iconSize = isMobileSmall ? 'w-3 h-3' : 'w-4 h-4';
  const buttonSize = isMobileSmall ? 'w-7 h-7' : 'w-8 h-8';

  return (
    <header className={`fixed top-0 left-0 right-0 ${headerHeight} flex items-center justify-between ${headerPadding} bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm md:hidden z-30 mobile-safe-area`}>
      <div className={`flex items-center ${isMobileSmall ? 'space-x-2' : 'space-x-3'}`}>
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Hamburger clicked - toggling mobile sidebar');
            toggleSidebar();
          }}
          className={`${buttonSize} bg-muted/50 backdrop-blur-sm rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors duration-200 touch-manipulation`}
          aria-label="Toggle sidebar"
          style={{ position: 'relative', zIndex: 9999 }}
        >
          <Menu className={`${iconSize} text-foreground`} />
        </button>
        <div className={`flex items-center ${isMobileSmall ? 'space-x-1.5' : 'space-x-2'}`}>
          <div className={`${isMobileSmall ? 'w-5 h-5' : 'w-6 h-6'} bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center`}>
            <span className={`text-primary-foreground font-bold ${isMobileSmall ? 'text-xs' : 'text-xs'}`}>
              {getCompanyDisplayText().charAt(0).toUpperCase()}
            </span>
          </div>
          {width > 320 && (
            <h1 className={`${isMobileSmall ? 'text-xs' : 'text-sm'} font-bold text-foreground truncate max-w-[120px]`}>
              {getCompanyDisplayText()}
            </h1>
          )}
        </div>
      </div>
      
      {/* Navigation Icons */}
      <div className={`flex items-center ${isMobileSmall ? 'space-x-1.5' : 'space-x-2'}`}>
        {/* Tasks Icon - Only show on wider screens */}
        {width > 360 && (
          <button 
            onClick={() => onNavigate('my-tasks')}
            className={`${buttonSize} bg-muted/50 backdrop-blur-sm rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors duration-200 touch-manipulation`}
            aria-label="My Tasks"
          >
            <ClipboardList className={`${iconSize} text-foreground`} />
          </button>
        )}
        
        {/* Notifications */}
        <NotificationDropdown>
          <NotificationBadge count={unreadCount}>
            <button className={`${buttonSize} bg-muted/50 backdrop-blur-sm rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors duration-200 touch-manipulation`}>
              <Bell className={`${iconSize} text-foreground`} />
            </button>
          </NotificationBadge>
        </NotificationDropdown>
        
        {/* Inbox Icon - Only show on wider screens */}
        {width > 390 && (
          <button 
            onClick={() => onNavigate('inbox')}
            className={`${buttonSize} bg-muted/50 backdrop-blur-sm rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors duration-200 touch-manipulation`}
            aria-label="Inbox"
          >
            <Inbox className={`${iconSize} text-foreground`} />
          </button>
        )}
        
        {/* User Profile - Compact on small screens */}
        <div className={`flex items-center ${isMobileSmall ? 'space-x-1' : 'space-x-2'} ${isMobileSmall ? 'px-1.5 py-0.5' : 'px-2 py-1'} rounded-lg bg-muted/30`}>
          <Avatar className={`${isMobileSmall ? 'w-5 h-5' : 'w-6 h-6'}`}>
            <AvatarImage 
              src={userProfile.avatarUrl || undefined} 
              alt={`${userProfile?.firstName || 'User'} ${userProfile?.lastName || ''}`.trim()}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-xs">
              {userProfile?.firstName && userProfile?.lastName 
                ? `${userProfile.firstName.charAt(0)}${userProfile.lastName.charAt(0)}`.toUpperCase()
                : userProfile?.firstName?.charAt(0)?.toUpperCase() || userProfile?.email?.charAt(0)?.toUpperCase() || <User className={`${isMobileSmall ? 'w-2.5 h-2.5' : 'w-3 h-3'}`} />
              }
            </AvatarFallback>
          </Avatar>
          {width > 320 && !isMobileSmall && (
            <div className="flex flex-col items-start">
              <span className="text-xs font-medium text-foreground truncate max-w-[80px]">
                {getUserDisplayName()}
              </span>
              {getUserRole() && width > 380 && (
                <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                  {getUserRole()}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
