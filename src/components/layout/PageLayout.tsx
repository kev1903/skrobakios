
import React from 'react';
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppSidebar } from "@/components/AppSidebar";

interface PageLayoutProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  children: React.ReactNode;
}

export const PageLayout = ({ currentPage, onNavigate, children }: PageLayoutProps) => {
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

  if (currentPage === "auth") {
    return (
      <main className="flex-1 overflow-hidden w-full">
        {children}
      </main>
    );
  }

  // For all other pages (including home), render with sidebar
  const content = currentPage === "home" ? (
    <main className="flex-1 overflow-hidden w-full">
      {children}
    </main>
  ) : (
    <ProtectedRoute 
      onNavigate={onNavigate}
      requireSuperAdmin={currentPage === "admin"}
    >
      <main className="flex-1 overflow-hidden backdrop-blur-xl bg-white/20 border border-white/20 shadow-xl transition-all duration-300 w-full">
        {children}
      </main>
    </ProtectedRoute>
  );

  return (
    <AppSidebar currentPage={currentPage} onNavigate={onNavigate}>
      {content}
    </AppSidebar>
  );
};
