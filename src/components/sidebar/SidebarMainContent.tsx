import React from 'react';
import { SidebarContent } from '@/components/ui/sidebar';
import { NavigationSection } from './NavigationSection';
import { File, Briefcase, DollarSign, TrendingUp, Settings, Home, Calendar, Mail, Shield, HelpCircle } from 'lucide-react';

interface SidebarMainContentProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isCollapsed: boolean;
}

export const SidebarMainContent = ({ currentPage, onNavigate, isCollapsed }: SidebarMainContentProps) => {
  // Define navigation items directly to ensure they're always available
  const generalNavigation = [
    { id: "home", label: "Home", icon: Home },
    { id: "my-tasks", label: "MY TASKS", icon: Calendar },
    { id: "schedules", label: "My Schedules", icon: Calendar },
    { id: "inbox", label: "Inbox", icon: Mail },
  ];

  const businessNavigation = [
    { id: "files", label: "Files", icon: File },
    { id: "projects", label: "Projects", icon: Briefcase },
    { id: "cost-contracts", label: "Cost & Contracts", icon: DollarSign },
    { id: "sales", label: "Sales", icon: TrendingUp },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const supportNavigation = [
    { id: "platform", label: "Platform", icon: Shield, requiredRole: "superadmin" as const },
    { id: "support", label: "Help Center", icon: HelpCircle },
  ];

  // Validation system to ensure Settings button is always present
  React.useEffect(() => {
    const settingsItem = businessNavigation.find(item => item.id === "settings");
    if (!settingsItem) {
      console.error("CRITICAL ERROR: Settings button missing from businessNavigation!");
      // Force add it if missing
      businessNavigation.push({ id: "settings", label: "Settings", icon: Settings });
    }
    console.log("✅ Navigation validation complete - Settings button verified:", !!settingsItem);
  }, []);

  return (
    <SidebarContent className="p-4 space-y-6">
      {/* General Navigation */}
      <NavigationSection
        title="General"
        items={generalNavigation}
        currentPage={currentPage}
        onNavigate={onNavigate}
        isCollapsed={isCollapsed}
      />

      {/* Business Navigation */}
      <NavigationSection
        title="Business"
        items={businessNavigation}
        currentPage={currentPage}
        onNavigate={onNavigate}
        isCollapsed={isCollapsed}
      />

      {/* Support Navigation */}
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