
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


  return (
    <ProtectedRoute 
      onNavigate={onNavigate}
      requireSuperAdmin={currentPage === "admin"}
      requireAdmin={currentPage === "platform-dashboard"}
    >
      <main className="flex-1 overflow-hidden w-full">
        {children}
      </main>
    </ProtectedRoute>
  );
};
