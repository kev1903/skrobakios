import React from 'react';
import { SidebarContent } from '@/components/ui/sidebar';
import { NavigationSection } from './NavigationSection';
import { File, Briefcase, DollarSign, TrendingUp, Settings, Home, Calendar, Mail, Shield, HelpCircle } from 'lucide-react';
import { useCompanyModules } from '@/hooks/useCompanyModules';
import { useCompany } from '@/contexts/CompanyContext';

interface SidebarMainContentProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isCollapsed: boolean;
}

export const SidebarMainContent = ({ currentPage, onNavigate, isCollapsed }: SidebarMainContentProps) => {
  const { currentCompany } = useCompany();
  const { fetchCompanyModules, isModuleEnabled } = useCompanyModules();

  // Fetch company modules when component mounts or company changes
  React.useEffect(() => {
    if (currentCompany?.id) {
      fetchCompanyModules(currentCompany.id);
    }
  }, [currentCompany?.id, fetchCompanyModules]);

  // Define navigation items with module requirements
  const generalNavigation = [
    { id: "home", label: "Home", icon: Home },
    { id: "my-tasks", label: "MY TASKS", icon: Calendar },
    { id: "schedules", label: "My Schedules", icon: Calendar },
    { id: "inbox", label: "Inbox", icon: Mail },
  ];

  // Business navigation items mapped to their required modules
  const businessNavigationItems = [
    { id: "files", label: "Files", icon: File, requiredModule: "files" },
    { id: "projects", label: "Projects", icon: Briefcase, requiredModule: "projects" },
    { id: "cost-contracts", label: "Cost & Contracts", icon: DollarSign, requiredModule: "finance" },
    { id: "sales", label: "Sales", icon: TrendingUp, requiredModule: "sales" },
    { id: "settings", label: "Settings", icon: Settings }, // Settings should always be available
  ];

  // Filter business navigation based on enabled modules
  const businessNavigation = businessNavigationItems.filter(item => {
    // Settings should always be visible regardless of modules
    if (item.id === "settings") {
      return true;
    }
    
    // Check if the required module is enabled
    if (item.requiredModule && currentCompany?.id) {
      return isModuleEnabled(currentCompany.id, item.requiredModule);
    }
    
    // Show item if no module requirement or no company context
    return !item.requiredModule;
  });

  const supportNavigation = [
    { id: "platform", label: "Platform", icon: Shield, requiredRole: "superadmin" as const },
    { id: "support", label: "Help Center", icon: HelpCircle },
  ];

  // Debug logging to understand what's happening
  React.useEffect(() => {
    console.log("🔍 Debug Info:");
    console.log("Current Company:", currentCompany?.id);
    console.log("Business Navigation Items:", businessNavigationItems.length);
    console.log("Filtered Business Navigation:", businessNavigation.length);
    console.log("Settings visible:", businessNavigation.some(item => item.id === "settings"));
    
    if (currentCompany?.id) {
      businessNavigationItems.forEach(item => {
        if (item.requiredModule) {
          const enabled = isModuleEnabled(currentCompany.id, item.requiredModule);
          console.log(`Module ${item.requiredModule} for ${item.label}: ${enabled}`);
        }
      });
    }
  }, [currentCompany?.id, businessNavigation.length, businessNavigationItems, isModuleEnabled]);

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