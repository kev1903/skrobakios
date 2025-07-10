import React from 'react';
import { cn } from '@/lib/utils';

interface NotificationBadgeProps {
  count: number;
  children: React.ReactNode;
  className?: string;
  maxCount?: number;
}

export const NotificationBadge = ({ 
  count, 
  children, 
  className,
  maxCount = 99 
}: NotificationBadgeProps) => {
  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();
  const shouldShow = count > 0;

  return (
    <div className={cn("relative inline-block", className)}>
      {children}
      {shouldShow && (
        <div className="absolute -top-2 -right-2 flex items-center justify-center">
          <div className="bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 shadow-lg animate-pulse">
            {displayCount}
          </div>
        </div>
      )}
    </div>
  );
};