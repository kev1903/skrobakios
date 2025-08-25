import React from 'react';
import { useScreenSize, useViewportDimensions } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface MobileLayoutProps {
  children: React.ReactNode;
  className?: string;
  withSafeArea?: boolean;
  fullHeight?: boolean;
}

export const MobileLayout = ({ 
  children, 
  className, 
  withSafeArea = true, 
  fullHeight = false 
}: MobileLayoutProps) => {
  const screenSize = useScreenSize();
  const { height } = useViewportDimensions();
  
  const isMobile = screenSize === 'mobile' || screenSize === 'mobile-small';
  
  if (!isMobile) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div 
      className={cn(
        'w-full',
        withSafeArea && 'mobile-safe-area',
        fullHeight && 'mobile-viewport-height',
        'overflow-x-hidden',
        className
      )}
      style={{
        ...(fullHeight && {
          minHeight: `${height}px`,
          height: `${height}px`
        })
      }}
    >
      {children}
    </div>
  );
};

interface MobileContentProps {
  children: React.ReactNode;
  className?: string;
  withPadding?: boolean;
}

export const MobileContent = ({ 
  children, 
  className, 
  withPadding = true 
}: MobileContentProps) => {
  const screenSize = useScreenSize();
  
  const paddingClass = withPadding 
    ? screenSize === 'mobile-small' 
      ? 'p-3' 
      : 'p-4'
    : '';

  return (
    <div className={cn('w-full', paddingClass, className)}>
      {children}
    </div>
  );
};

interface MobileScrollContainerProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileScrollContainer = ({ 
  children, 
  className 
}: MobileScrollContainerProps) => {
  return (
    <div 
      className={cn(
        'overflow-y-auto overflow-x-hidden',
        'scrollbar-thin',
        '-webkit-overflow-scrolling: touch',
        className
      )}
      style={{
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {children}
    </div>
  );
};