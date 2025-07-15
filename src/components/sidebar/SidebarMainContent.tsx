import React from 'react';
import { SidebarContent } from '@/components/ui/sidebar';
import { NavigationSection } from './NavigationSection';
import { File, Briefcase, DollarSign, TrendingUp, Settings, Home, Calendar, Mail, Shield, HelpCircle } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

interface SidebarMainContentProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isCollapsed: boolean;
}

export const SidebarMainContent = ({ currentPage, onNavigate, isCollapsed }: SidebarMainContentProps) => {
  const { currentSubscription, hasFeature } = useSubscription();

  // Define navigation items with subscription feature requirements
  const generalNavigation = [
    { id: "home", label: "Home", icon: Home },
    { id: "my-tasks", label: "MY TASKS", icon: Calendar },
    { id: "schedules", label: "My Schedules", icon: Calendar },
    { id: "inbox", label: "Inbox", icon: Mail },
  ];

  // Business navigation items mapped to their required subscription features
  const businessNavigationItems = [
    { id: "files", label: "Files", icon: File, requiredFeature: "Document Management" },
    { id: "projects", label: "Projects", icon: Briefcase, requiredFeature: "Project Management" },
    { id: "cost-contracts", label: "Cost & Contracts", icon: DollarSign, requiredFeature: "Financial Management" },
    { id: "sales", label: "Sales", icon: TrendingUp, requiredFeature: "Sales Management" },
    { id: "settings", label: "Settings", icon: Settings }, // Settings should always be available
  ];

  // Filter business navigation based on subscription features
  const businessNavigation = businessNavigationItems.filter(item => {
    // Settings should always be visible regardless of subscription
    if (item.id === "settings") {
      return true;
    }
    
    // Check if the required feature is included in subscription
    if (item.requiredFeature) {
      return hasFeature(item.requiredFeature);
    }
    
    // Show item if no feature requirement
    return true;
  });

  const supportNavigation = [
    { id: "platform", label: "Platform", icon: Shield, requiredRole: "superadmin" as const },
    { id: "support", label: "Help Center", icon: HelpCircle },
  ];

  // Debug logging to understand subscription-based filtering
  React.useEffect(() => {
    console.log("🔍 Subscription Debug Info:");
    console.log("Current Subscription:", currentSubscription?.plan_name || 'None');
    console.log("Subscription Features:", currentSubscription?.features || []);
    console.log("Business Navigation Items:", businessNavigationItems.length);
    console.log("Filtered Business Navigation:", businessNavigation.length);
    console.log("Settings visible:", businessNavigation.some(item => item.id === "settings"));
    
    businessNavigationItems.forEach(item => {
      if (item.requiredFeature) {
        const hasAccess = hasFeature(item.requiredFeature);
        console.log(`Feature ${item.requiredFeature} for ${item.label}: ${hasAccess}`);
      }
    });
  }, [currentSubscription, businessNavigation.length, businessNavigationItems, hasFeature]);

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