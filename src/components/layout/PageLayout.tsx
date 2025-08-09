
import React from 'react';
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppSidebar } from "@/components/AppSidebar";
import { useMenuBarSpacing } from "@/hooks/useMenuBarSpacing";

interface PageLayoutProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  children: React.ReactNode;
}

export const PageLayout = ({ currentPage, onNavigate, children }: PageLayoutProps) => {
  const { spacingClasses } = useMenuBarSpacing(currentPage);

  // Sales page should take full screen without main navigation
  if (currentPage === "sales") {
    return (
      <ProtectedRoute 
        onNavigate={onNavigate}
        requireSuperAdmin={false}
      >
        <div className="w-full h-screen overflow-hidden">
          {children}
        </div>
      </ProtectedRoute>
    );
  }

  if (currentPage === "system" || currentPage === "home" || currentPage === "tasks") {
    return (
      <ProtectedRoute 
        onNavigate={onNavigate}
        requireSuperAdmin={false}
      >
          <div className="w-full mt-[var(--header-height)] h-[calc(100vh-var(--header-height))] overflow-hidden min-h-0">
            {children}
          </div>
      </ProtectedRoute>
    );
  }

  if (currentPage === "auth") {
    return (
      <main className="flex-1 overflow-hidden w-full">
        {children}
      </main>
    );
  }

  return (
    <ProtectedRoute 
      onNavigate={onNavigate}
      requireSuperAdmin={currentPage === "admin" || currentPage === "user-management"}
      requireAdmin={currentPage === "platform-dashboard"}
    >
      <main className={`flex-1 overflow-hidden w-full mt-[var(--header-height)] h-[calc(100vh-var(--header-height))] min-h-0`}>
        {children}
      </main>
    </ProtectedRoute>
  );
};
