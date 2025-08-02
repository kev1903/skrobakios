import React, { useEffect } from 'react';
import { Briefcase, Calendar, DollarSign, TrendingUp, Map, HelpCircle, Shield, Home, Settings, File, Mail, Database, CheckSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SidebarContextSwitcher } from '@/components/SidebarContextSwitcher';
import { useCompany } from '@/contexts/CompanyContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useAppContext } from '@/contexts/AppContextProvider';
import { useUserRole } from '@/hooks/useUserRole';
import { personalProfileNavigation } from '@/components/sidebar/navigationData';

interface NavigationRibbonProps {
  isOpen?: boolean;
  onSidePageSelect?: (page: string) => void;
  onNavigate: (page: string) => void;
  onClose?: () => void;
  currentPage?: string;
  isCollapsed?: boolean;
}

export const NavigationRibbon = ({
  isOpen = true,
  onSidePageSelect,
  onNavigate,
  onClose,
  currentPage = "",
  isCollapsed = false
}: NavigationRibbonProps) => {
  const { currentCompany } = useCompany();
  const { activeContext } = useAppContext();
  const { hasFeature, currentSubscription } = useSubscription();
  const { isSuperAdmin } = useUserRole();

  // Core business modules that should always be available (replace General section)
  const coreBusinessModules = [
    { id: "system", label: "Business Map", icon: Database },
    { id: "projects", label: "Projects", icon: Briefcase },
    { id: "sales", label: "Sales", icon: TrendingUp },
    { id: "finance", label: "Finance", icon: DollarSign },
  ];

  // Business navigation items mapped to their required subscription features
  const businessNavigationItems = [
    { id: "files", label: "Files", icon: File, requiredFeature: "basic_files" },
    { id: "projects", label: "Projects", icon: Briefcase, requiredFeature: "projects" },
    { id: "cost-contracts", label: "Cost & Contracts", icon: DollarSign, requiredFeature: "cost_contracts" },
    { id: "sales", label: "Sales", icon: TrendingUp, requiredFeature: "sales_management" },
    { id: "system", label: "SYSTEM", icon: Database }, // System should always be available
    { id: "settings", label: "Settings", icon: Settings }, // Settings should always be available
  ];

  // Filter business navigation based on subscription features (from SidebarMainContent)
  const businessNavigation = businessNavigationItems.filter(item => {
    // Settings and System should always be visible regardless of subscription
    if (item.id === "settings" || item.id === "system") {
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
    { id: "support", label: "Help Center", icon: HelpCircle },
  ];

  // All support navigation items are now available to everyone
  const filteredSupportNavigation = supportNavigation;

  // Debug logging to understand subscription-based filtering (from SidebarMainContent)
  useEffect(() => {
    console.log("🔍 Navigation Ribbon Debug Info:");
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

  const handleNavigateAndClose = (page: string) => {
    onNavigate(page);
    if (onClose) onClose();
  };

  // If not open and onClose function exists, don't render (floating mode)
  if (!isOpen && onClose) return null;

  // Determine if this is floating mode (has onClose) or embedded mode (no onClose)
  const isFloatingMode = !!onClose;

  const sidebarContent = (
    <>
      {/* Context Switcher - only show if in floating mode */}
      {isFloatingMode && (
        <div className="px-3 pb-4 pt-20 border-b border-white/20">
          <SidebarContextSwitcher onNavigate={onNavigate} isCollapsed={isCollapsed} />
        </div>
      )}
      
      <div className={`flex-1 flex flex-col space-y-2 overflow-y-auto ${isFloatingMode ? 'py-4 px-3' : 'p-4'}`}>
        {/* Show Profile Navigation when in personal context, otherwise show business sections */}
        {activeContext === 'personal' ? (
          <div className="space-y-1">
            <div className="text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider px-3 py-2">
              {!isCollapsed && "Profile Navigation"}
            </div>
            {personalProfileNavigation.map(item => {
              const Icon = item.icon;
              const isActive = item.active || currentPage === item.id;
              return (
                <button 
                  key={item.id} 
                  onClick={() => handleNavigateAndClose(item.id)} 
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 text-left ${
                    isActive 
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium backdrop-blur-sm border border-sidebar-border shadow-lg" 
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-all duration-200 ${isActive ? "text-sidebar-primary" : "text-sidebar-foreground/80"}`} />
                  {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                </button>
              );
            })}
          </div>
        ) : (
          <>
            {/* Core Business Modules (replacing General section) */}
            <div className="space-y-1">
              <div className="text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider px-3 py-2">
                {!isCollapsed && "Business Modules"}
              </div>
              {coreBusinessModules.map(item => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button 
                    key={item.id} 
                    onClick={() => handleNavigateAndClose(item.id)} 
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 text-left ${
                      isActive 
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium backdrop-blur-sm border border-sidebar-border shadow-lg" 
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    <Icon className={`w-4 h-4 transition-all duration-200 ${isActive ? "text-sidebar-primary" : "text-sidebar-foreground/80"}`} />
                    {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                  </button>
                );
              })}
            </div>

            {/* Additional Business Features (subscription-based) */}
            <div className="space-y-1">
              <div className="text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider px-3 py-2">
                {!isCollapsed && "Additional Features"}
              </div>
              {businessNavigation.filter(item => item.id !== "projects" && item.id !== "sales" && item.id !== "system").map(item => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button 
                    key={item.id} 
                    onClick={() => handleNavigateAndClose(item.id)} 
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 text-left ${
                      isActive 
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium backdrop-blur-sm border border-sidebar-border shadow-lg" 
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    <Icon className={`w-4 h-4 transition-all duration-200 ${isActive ? "text-sidebar-primary" : "text-sidebar-foreground/80"}`} />
                    {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                  </button>
                );
              })}
              
              {/* Direct link to My Tasks page */}
              <Link 
                to="/tasks"
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 text-left text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              >
                <CheckSquare className="w-4 h-4 transition-all duration-200 text-sidebar-foreground/80" />
                {!isCollapsed && <span className="text-sm font-medium">My Tasks</span>}
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Support Section */}
      {filteredSupportNavigation.length > 0 && (
        <div className={`border-t border-sidebar-border space-y-1 ${isFloatingMode ? 'px-3 py-4' : 'p-4'}`}>
          <div className="text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider px-3 py-2">
            {!isCollapsed && "Support"}
          </div>
          {filteredSupportNavigation.map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button 
                key={item.id}
                onClick={() => handleNavigateAndClose(item.id)} 
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 text-left ${
                  isActive 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium backdrop-blur-sm border border-sidebar-border shadow-lg" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            );
          })}
        </div>
      )}
    </>
  );

  // Return different containers based on mode
  if (isFloatingMode) {
    // Floating mode - fixed positioning
    return (
      <div className="fixed left-0 top-0 w-48 h-full glass-sidebar backdrop-blur-md border-r border-sidebar-border shadow-2xl z-40 transition-all duration-300">
        <div className="flex flex-col h-full">
          {sidebarContent}
        </div>
      </div>
    );
  } else {
    // Embedded mode - use SidebarContent wrapper
    return (
      <div className="h-full glass-sidebar backdrop-blur-md transition-all duration-300">
        <div className="flex flex-col h-full">
          {sidebarContent}
        </div>
      </div>
    );
  }
};