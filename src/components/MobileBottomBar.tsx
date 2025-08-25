import React from 'react';
import { ClipboardList, Calendar, MessageCircle, Inbox } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useIsMobileSmall, useViewportDimensions } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface MobileBottomBarProps {
  onNavigate: (page: string) => void;
}

export const MobileBottomBar = ({ onNavigate }: MobileBottomBarProps) => {
  const location = useLocation();
  const isMobileSmall = useIsMobileSmall();
  const { width } = useViewportDimensions();
  
  // Get current page from URL params
  const searchParams = new URLSearchParams(location.search);
  const currentPage = searchParams.get('page') || 'home';
  
  // Define navigation items
  const navItems = [
    {
      id: 'my-tasks',
      label: 'Tasks',
      icon: ClipboardList,
      page: 'my-tasks'
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: Calendar, 
      page: 'calendar'
    },
    {
      id: 'ai-chat',
      label: 'SkAi Chat',
      icon: MessageCircle,
      page: 'ai-chat'
    },
    {
      id: 'inbox',
      label: 'Inbox',
      icon: Inbox,
      page: 'inbox'
    }
  ];

  // Responsive sizing
  const buttonHeight = isMobileSmall ? 'h-12' : 'h-14';
  const iconSize = isMobileSmall ? 'w-5 h-5' : 'w-6 h-6';
  const textSize = isMobileSmall ? 'text-xs' : 'text-sm';
  const barHeight = isMobileSmall ? 'h-16' : 'h-18';
  const bottomPadding = 'pb-safe'; // Safe area padding for devices with home indicator

  const handleNavigation = (page: string) => {
    if (page === 'ai-chat') {
      // For AI chat, we might want to open a modal or navigate to a specific page
      // For now, let's navigate to a dedicated AI chat page
      onNavigate('ai-chat');
    } else {
      onNavigate(page);
    }
  };

  const isActive = (page: string) => {
    return currentPage === page;
  };

  return (
    <div className={cn(
      'fixed bottom-0 left-0 right-0 z-30',
      barHeight,
      'bg-background/95 backdrop-blur-md border-t border-border/50',
      'md:hidden', // Only show on mobile
      bottomPadding,
      'mobile-safe-area'
    )}>
      <div className="flex items-center justify-around h-full px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.page);
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.page)}
              className={cn(
                'flex flex-col items-center justify-center flex-1',
                buttonHeight,
                'rounded-lg transition-all duration-200',
                'touch-manipulation',
                active 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
              )}
              aria-label={item.label}
            >
              <Icon className={cn(iconSize, 'mb-1')} />
              <span className={cn(
                textSize, 
                'font-medium truncate max-w-full',
                active ? 'text-primary' : 'text-inherit'
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};