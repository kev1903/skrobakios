
import React from 'react';
import { SidebarContent } from '@/components/ui/sidebar';
import { NavigationSection } from './NavigationSection';
import { generalNavigation, businessNavigation, supportNavigation, platformNavigation } from './navigationData';
import { useRoleContext } from '@/contexts/RoleContext';

interface SidebarMainContentProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isCollapsed: boolean;
}

export const SidebarMainContent = ({ currentPage, onNavigate, isCollapsed }: SidebarMainContentProps) => {
  const { isPlatformMode, isCompanyMode } = useRoleContext();

  return (
    <SidebarContent className="px-4 py-6 space-y-6 bg-white/5 backdrop-blur-xl border-r border-white/10 shadow-2xl shadow-black/20">
      {isPlatformMode && (
        <NavigationSection
          title="Platform Management"
          items={platformNavigation}
          currentPage={currentPage}
          onNavigate={onNavigate}
          isCollapsed={isCollapsed}
        />
      )}

      {isCompanyMode && (
        <>
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
        </>
      )}

      {isCompanyMode && (
        <NavigationSection
          title="Support"
          items={supportNavigation}
          currentPage={currentPage}
          onNavigate={onNavigate}
          isCollapsed={isCollapsed}
        />
      )}
    </SidebarContent>
  );
};
