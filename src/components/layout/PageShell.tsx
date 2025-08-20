import React from 'react';

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
  withPattern?: boolean;
}

// Universal page shell that offsets the global Menu bar and Sidebar
// Ensures consistent layout across all pages
export const PageShell: React.FC<PageShellProps> = ({ children, className = '', withPattern = false }) => {
  return (
    <div className={`relative mt-[var(--header-height,64px)] min-h-[calc(100vh-var(--header-height,64px))] overflow-auto bg-white w-full md:pr-[var(--ai-chat-offset,0px)] transition-[padding] duration-300 ${className}`}>
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
};
