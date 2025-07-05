import React from 'react';
import { SidebarHeader as SidebarHeaderBase } from '@/components/ui/sidebar';
import { useUser } from '@/contexts/UserContext';
interface SidebarHeaderProps {
  isCollapsed: boolean;
}
export const SidebarHeader = ({
  isCollapsed
}: SidebarHeaderProps) => {
  const {
    userProfile,
    loading
  } = useUser();
  return;
};