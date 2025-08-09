
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
          <div className={`w-full h-screen overflow-hidden ${spacingClasses}`}>
            {children}
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // System page, home page, and tasks page should take full screen like sales page
  if (currentPage === "system" || currentPage === "home" || currentPage === "tasks") {
    return (
      <ProtectedRoute 
        onNavigate={onNavigate}
        requireSuperAdmin={false}
      >
        <div className={`w-full h-screen overflow-hidden ${spacingClasses}`}>
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
      <main className={`flex-1 overflow-hidden w-full ${spacingClasses}`}>
        {children}
      </main>
    </ProtectedRoute>
  );
};
