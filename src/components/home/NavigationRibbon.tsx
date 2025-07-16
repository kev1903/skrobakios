import React, { useEffect } from 'react';
import { Briefcase, Calendar, DollarSign, TrendingUp, Map, HelpCircle, Shield, Home, Settings, File, Mail } from 'lucide-react';
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
    { id: "projects", label: "Projects", icon: Briefcase },
    { id: "finance", label: "Finance", icon: DollarSign },
    { id: "sales", label: "Sales", icon: TrendingUp },
  ];

  // Business navigation items mapped to their required subscription features
  const businessNavigationItems = [
    { id: "files", label: "Files", icon: File, requiredFeature: "basic_files" },
    { id: "projects", label: "Projects", icon: Briefcase, requiredFeature: "projects" },
    { id: "cost-contracts", label: "Cost & Contracts", icon: DollarSign, requiredFeature: "cost_contracts" },
    { id: "sales", label: "Sales", icon: TrendingUp, requiredFeature: "sales_management" },
    { id: "settings", label: "Settings", icon: Settings }, // Settings should always be available
  ];

  // Filter business navigation based on subscription features (from SidebarMainContent)
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

  // Filter support navigation based on user role
  const filteredSupportNavigation = supportNavigation.filter((item) => {
    if (!item.requiredRole) return true;
    if (item.requiredRole === 'superadmin') return isSuperAdmin();
    return true;
  });

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
      
      <div className={`flex-1 flex flex-col space-y-6 overflow-y-auto ${isFloatingMode ? 'py-4 px-3' : 'p-4'}`}>
        {/* Show Profile Navigation when in personal context, otherwise show business sections */}
        {activeContext === 'personal' ? (
          <div className="space-y-1">
            <div className="text-xs font-medium text-white/60 uppercase tracking-wider px-3 py-2">
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
                      ? "bg-gradient-to-r from-blue-500/30 to-blue-600/30 text-white font-medium backdrop-blur-sm border border-blue-400/30 shadow-lg" 
                      : "text-white hover:bg-white/30"
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-all duration-200 ${isActive ? "text-blue-200" : "text-white/80"}`} />
                  {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                </button>
              );
            })}
          </div>
        ) : (
          <>
            {/* Core Business Modules (replacing General section) */}
            <div className="space-y-1">
              <div className="text-xs font-medium text-white/60 uppercase tracking-wider px-3 py-2">
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
                        ? "bg-gradient-to-r from-blue-500/30 to-blue-600/30 text-white font-medium backdrop-blur-sm border border-blue-400/30 shadow-lg" 
                        : "text-white hover:bg-white/30"
                    }`}
                  >
                    <Icon className={`w-4 h-4 transition-all duration-200 ${isActive ? "text-blue-200" : "text-white/80"}`} />
                    {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                  </button>
                );
              })}
            </div>

            {/* Additional Business Features (subscription-based) */}
            <div className="space-y-1">
              <div className="text-xs font-medium text-white/60 uppercase tracking-wider px-3 py-2">
                {!isCollapsed && "Additional Features"}
              </div>
              {businessNavigation.filter(item => item.id !== "projects" && item.id !== "sales").map(item => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button 
                    key={item.id} 
                    onClick={() => handleNavigateAndClose(item.id)} 
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 text-left ${
                      isActive 
                        ? "bg-gradient-to-r from-blue-500/30 to-blue-600/30 text-white font-medium backdrop-blur-sm border border-blue-400/30 shadow-lg" 
                        : "text-white hover:bg-white/30"
                    }`}
                  >
                    <Icon className={`w-4 h-4 transition-all duration-200 ${isActive ? "text-blue-200" : "text-white/80"}`} />
                    {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Support Section */}
      {filteredSupportNavigation.length > 0 && (
        <div className={`border-t border-white/20 space-y-1 ${isFloatingMode ? 'px-3 py-4' : 'p-4'}`}>
          <div className="text-xs font-medium text-white/60 uppercase tracking-wider px-3 py-2">
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
                    ? "bg-gradient-to-r from-blue-500/30 to-blue-600/30 text-white font-medium backdrop-blur-sm border border-blue-400/30 shadow-lg" 
                    : "text-white hover:bg-white/30"
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
      <div className="fixed left-0 top-0 w-48 h-full bg-white/10 backdrop-blur-md border-r border-white/20 shadow-2xl z-30 transition-all duration-300">
        <div className="flex flex-col h-full">
          {sidebarContent}
        </div>
      </div>
    );
  } else {
    // Embedded mode - use SidebarContent wrapper
    return (
      <div className="h-full bg-white/10 backdrop-blur-md transition-all duration-300">
        <div className="flex flex-col h-full">
          {sidebarContent}
        </div>
      </div>
    );
  }
};