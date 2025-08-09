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
    <div className={`relative mt-[var(--header-height)] lg:ml-64 min-h-[calc(100vh-var(--header-height))] overflow-auto bg-background ${className}`}>
      {withPattern && (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.15)_1px,transparent_0)] bg-[length:24px_24px]" />
      )}
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
};
