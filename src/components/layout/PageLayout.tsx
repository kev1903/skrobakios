
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
      <div className="h-screen w-full flex flex-col">
        <GlobalHeader onNavigate={onNavigate} currentPage={currentPage} />
        
        <main className="flex-1 w-full overflow-y-auto">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
};
