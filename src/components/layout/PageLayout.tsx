
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

  // Auth page has no layout wrapper - no protection needed
  if (currentPage === "auth") {
    return (
      <main className="w-full h-screen">
        {children}
      </main>
    );
  }

  // All protected pages use consistent layout with overflow-hidden container
  // Individual page components handle their own scrolling
  return (
    <ProtectedRoute 
      onNavigate={onNavigate}
      requireSuperAdmin={currentPage === "admin" || currentPage === "user-management" || currentPage === "platform-admin"}
      requireAdmin={currentPage === "platform-dashboard"}
    >
      <main className={`w-full ${spacing} ${fullHeight} relative transition-[padding] duration-300 overflow-hidden`}>
        {children}
      </main>
    </ProtectedRoute>
  );
};
