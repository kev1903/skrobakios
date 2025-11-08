
import React from 'react';
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppSidebar } from "@/components/AppSidebar";
import { useMenuBarSpacing } from "@/hooks/useMenuBarSpacing";

interface PageLayoutProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  children: React.ReactNode;
  disableSpacing?: boolean; // When true, do not apply top margin/height offsets
}

export const PageLayout = ({ currentPage, onNavigate, children, disableSpacing = false }: PageLayoutProps) => {
  const { spacingClasses, fullHeightClasses } = useMenuBarSpacing(currentPage);
  const spacing = disableSpacing ? '' : spacingClasses;
  const fullHeight = disableSpacing ? 'h-full' : fullHeightClasses;
  
  // Check if this is a public BIM page (no authentication required)
  const urlParams = new URLSearchParams(window.location.search);
  const isPublicBimPage = currentPage === "project-bim" && urlParams.get('public') === 'true';
  
  // Auth page and public BIM pages have no layout wrapper and no authentication requirement
  if (currentPage === "auth" || isPublicBimPage) {
    return (
      <main className="w-full h-screen">
        {children}
      </main>
    );
  }

  // Profile pages need a single scroll container to avoid double scrollbars
  if (currentPage === "profile" || currentPage === "personal-dashboard" || currentPage === "user-profile") {
    return (
      <ProtectedRoute 
        onNavigate={onNavigate}
        requireSuperAdmin={false}
      >
        <main className={`w-full ${spacing} ${fullHeight} relative transition-[padding] duration-300 overflow-y-auto`}>
          {children}
        </main>
      </ProtectedRoute>
    );
  }

  // Sales, system, home, and tasks pages get consistent full-screen layout
  if (currentPage === "sales" || currentPage === "system" || currentPage === "home" || currentPage === "tasks") {
    return (
      <ProtectedRoute 
        onNavigate={onNavigate}
        requireSuperAdmin={false}
      >
        <main className={`w-full ${spacing} ${fullHeight} relative transition-[padding] duration-300 overflow-hidden`}>
          <div className="w-full h-full overflow-y-auto">
            {children}
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  // Default layout for all other pages - let individual pages handle their own scrolling
  return (
    <ProtectedRoute 
      onNavigate={onNavigate}
      requireSuperAdmin={currentPage === "admin" || currentPage === "user-management"}
      requireAdmin={currentPage === "platform-dashboard"}
    >
        <main className={`w-full ${spacing} ${fullHeight} relative transition-[padding] duration-300 overflow-hidden`}>
          <div className="w-full h-full overflow-y-auto">
            {children}
          </div>
        </main>
    </ProtectedRoute>
  );
};
