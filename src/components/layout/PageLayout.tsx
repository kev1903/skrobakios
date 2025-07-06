
import React from 'react';
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

interface PageLayoutProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  children: React.ReactNode;
}

export const PageLayout = ({ currentPage, onNavigate, children }: PageLayoutProps) => {
  if (currentPage === "auth" || currentPage === "home") {
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
    >
      <main className="flex-1 overflow-hidden backdrop-blur-xl bg-white/20 border border-white/20 shadow-xl transition-all duration-300 w-full">
        {children}
      </main>
    </ProtectedRoute>
  );
};
