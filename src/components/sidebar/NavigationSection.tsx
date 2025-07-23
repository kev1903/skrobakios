import React from 'react';
import { 
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { cn } from "@/lib/utils";
import { NavigationItem } from './types';
import { useUserRole } from '@/hooks/useUserRole';

interface NavigationSectionProps {
  title: string;
  items: NavigationItem[];
  currentPage: string;
  onNavigate: (page: string) => void;
  isCollapsed: boolean;
}

export const NavigationSection = ({ title, items, currentPage, onNavigate, isCollapsed }: NavigationSectionProps) => {
  const { isSuperAdmin, isBusinessAdmin, isProjectAdmin, isUser, isClient } = useUserRole();

  // Filter items based on user role
  const filteredItems = items.filter((item) => {
    if (!item.requiredRole) return true;
    
    switch (item.requiredRole) {
      case 'superadmin':
        return isSuperAdmin();
      case 'business_admin':
        return isBusinessAdmin();
      case 'project_admin':
        return isProjectAdmin();
      case 'user':
        return isUser();
      case 'client':
        return isClient();
      default:
        return true;
    }
  });

  // Don't render the section if no items are visible
  if (filteredItems.length === 0) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 font-poppins">
        {!isCollapsed && title}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="space-y-1">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.active || currentPage === item.id;
            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    "w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-all duration-200 text-sm font-inter group",
                    isActive
                      ? "bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-700 font-medium backdrop-blur-sm border border-blue-500/20 shadow-lg"
                      : "text-slate-600 hover:bg-white/20 hover:text-slate-800 hover:backdrop-blur-sm hover:shadow-md"
                  )}
                >
                  <Icon className={cn(
                    "w-4 h-4 transition-all duration-200",
                    isActive ? "text-blue-600" : "text-slate-500 group-hover:text-slate-700"
                  )} />
                  {!isCollapsed && <span>{item.label}</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};