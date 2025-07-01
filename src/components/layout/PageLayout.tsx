
import React from 'react';
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { GlobalHeader } from "./GlobalHeader";

interface PageLayoutProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  children: React.ReactNode;
}

export const PageLayout = ({ currentPage, onNavigate, children }: PageLayoutProps) => {
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
    >
      <div className="min-h-screen flex flex-col">
        <GlobalHeader onNavigate={onNavigate} currentPage={currentPage} />
        
        <main className="flex-1 overflow-hidden backdrop-blur-xl bg-white/30 border-0 shadow-xl transition-all duration-300">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
};
