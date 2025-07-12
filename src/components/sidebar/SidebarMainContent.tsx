
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
  return null;
};
