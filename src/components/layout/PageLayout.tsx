
import React from 'react';
import { AppSidebar } from "@/components/AppSidebar";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

interface PageLayoutProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  children: React.ReactNode;
}

export const PageLayout = ({ currentPage, onNavigate, children }: PageLayoutProps) => {
  // Hide main sidebar for auth page, project-specific pages, user edit page, and sales page
  const showMainSidebar = !["auth", "project-detail", "project-tasks", "project-files", "project-settings", "project-schedule", "project-team", "project-wbs", "gantt-chart", "user-edit", "sales"].includes(currentPage);

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
      {showMainSidebar ? (
        <AppSidebar currentPage={currentPage} onNavigate={onNavigate}>
          <main className="flex-1 overflow-hidden backdrop-blur-xl bg-white/20 border border-white/20 shadow-xl transition-all duration-300 rounded-l-2xl ml-2 my-2 mr-2">
            {children}
          </main>
        </AppSidebar>
      ) : (
        <main className="flex-1 overflow-hidden backdrop-blur-xl bg-white/20 border border-white/20 shadow-xl transition-all duration-300 w-full">
          {children}
        </main>
      )}
    </ProtectedRoute>
  );
};
