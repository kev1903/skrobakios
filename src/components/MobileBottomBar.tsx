import React from 'react';
import { ClipboardList, Calendar, MessageCircle, Inbox } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useIsMobileSmall } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface MobileBottomBarProps {
  onNavigate: (page: string) => void;
}

export const MobileBottomBar = ({ onNavigate }: MobileBottomBarProps) => {
  const location = useLocation();
  const isMobileSmall = useIsMobileSmall();
  
  // Get current page from URL params
  const searchParams = new URLSearchParams(location.search);
  const currentPage = searchParams.get('page') || 'home';
  
  // Define navigation items
  const navItems = [
    { id: 'my-tasks', label: 'Tasks', icon: ClipboardList, page: 'my-tasks' },
    { id: 'calendar', label: 'Calendar', icon: Calendar, page: 'calendar' },
    { id: 'ai-chat', label: 'SkAi Chat', icon: MessageCircle, page: 'ai-chat' },
    { id: 'inbox', label: 'Inbox', icon: Inbox, page: 'inbox' }
  ];

  // Responsive sizing
  const iconSize = isMobileSmall ? 'w-5 h-5' : 'w-6 h-6';
  const textSize = isMobileSmall ? 'text-[11px]' : 'text-sm';
  const barHeight = isMobileSmall ? 'h-16' : 'h-20';
  const bottomPadding = 'pb-safe'; // Safe area padding for devices with home indicator

  const handleNavigation = (page: string) => {
    if (page === 'ai-chat') {
      onNavigate('ai-chat');
    } else {
      onNavigate(page);
    }
  };

  const isActive = (page: string) => {
    if (currentPage === 'home' && page === 'my-tasks') return true;
    return currentPage === page;
  };

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-30',
        barHeight,
        'bg-background/95 backdrop-blur-md border-t border-border/50',
        'md:hidden', // Only show on mobile
        bottomPadding,
        'mobile-safe-area'
      )}
      style={{ ['--mobile-bottom-bar-height' as any]: isMobileSmall ? '64px' : '80px' }}
      role="navigation"
      aria-label="Bottom Navigation"
    >
      {/* Equal-width, perfectly centered buttons using grid */}
      <div className="grid grid-cols-4 h-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.page);

          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.page)}
              className={cn(
                'w-full h-full flex flex-col items-center justify-center gap-1',
                'px-2 transition-all duration-200 touch-manipulation',
                active
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
              )}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className={cn(iconSize, 'flex-shrink-0')} />
              <span
                className={cn(
                  textSize,
                  'font-medium leading-none text-center',
                  'max-w-full truncate',
                  active ? 'text-primary' : 'text-inherit'
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
