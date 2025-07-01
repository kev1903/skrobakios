
import React from 'react';
import { SidebarContent } from '@/components/ui/sidebar';
import { NavigationSection } from './NavigationSection';
import { generalNavigation, businessNavigation, supportNavigation } from './navigationData';

interface SidebarMainContentProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isCollapsed: boolean;
}

export const SidebarMainContent = ({ currentPage, onNavigate, isCollapsed }: SidebarMainContentProps) => {
  return (
    <SidebarContent className="px-4 py-6 space-y-6">
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
    </SidebarContent>
  );
};
