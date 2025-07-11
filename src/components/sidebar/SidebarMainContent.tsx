
import React from 'react';
import { SidebarContent } from '@/components/ui/sidebar';
import { NavigationSection } from './NavigationSection';
import { generalNavigation, businessNavigation, supportNavigation, adminNavigation } from './navigationData';
import { useUserRole } from '@/hooks/useUserRole';

interface SidebarMainContentProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isCollapsed: boolean;
}

export const SidebarMainContent = ({ currentPage, onNavigate, isCollapsed }: SidebarMainContentProps) => {
  const { isSuperAdmin } = useUserRole();

  return (
    <SidebarContent className="px-4 py-6 space-y-6 bg-white/5 backdrop-blur-xl border-r border-white/10 shadow-2xl shadow-black/20">
      <NavigationSection
        title="General"
        items={generalNavigation}
        currentPage={currentPage}
        onNavigate={onNavigate}
        isCollapsed={isCollapsed}
      />

      <NavigationSection
        title="Business"
        items={businessNavigation}
        currentPage={currentPage}
        onNavigate={onNavigate}
        isCollapsed={isCollapsed}
      />

      <NavigationSection
        title="Support"
        items={supportNavigation}
        currentPage={currentPage}
        onNavigate={onNavigate}
        isCollapsed={isCollapsed}
      />

      {isSuperAdmin() && (
        <NavigationSection
          title="Administration"
          items={adminNavigation}
          currentPage={currentPage}
          onNavigate={onNavigate}
          isCollapsed={isCollapsed}
        />
      )}
    </SidebarContent>
  );
};
