import React, { useEffect } from 'react';
import { Briefcase, Calendar, DollarSign, TrendingUp, Map, HelpCircle, Shield, Home, Settings, File, Mail, Database, CheckSquare, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SidebarContextSwitcher } from '@/components/SidebarContextSwitcher';
import { ModuleWrapper } from '@/components/ModuleWrapper';
import { useCompany } from '@/contexts/CompanyContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useAppContext } from '@/contexts/AppContextProvider';
import { useUserRole } from '@/hooks/useUserRole';
import { personalProfileNavigation } from '@/components/sidebar/navigationData';
import { useSidebar } from '@/components/ui/sidebar';

interface NavigationRibbonProps {
  isOpen?: boolean;
  onSidePageSelect?: (page: string) => void;
  onNavigate: (page: string) => void;
  onClose?: () => void;
  onCollapse?: () => void;
  currentPage?: string;
  isCollapsed?: boolean;
}

export const NavigationRibbon = ({
  isOpen = true,
  onSidePageSelect,
  onNavigate,
  onClose,
  onCollapse,
  currentPage = "",
  isCollapsed = false
}: NavigationRibbonProps) => {
  const { currentCompany } = useCompany();
  const { activeContext } = useAppContext();
  const { hasFeature, currentSubscription } = useSubscription();
  const { isSuperAdmin } = useUserRole();
  const { isMobile, setOpen, setOpenMobile, open } = useSidebar();

  // Core business modules that should always be available (replace General section)
  const coreBusinessModules = [
    { 
      id: "system", 
      label: "Business Map", 
      icon: Database, 
      moduleId: "business_map", 
      subModuleId: "business_map" 
    },
    { 
      id: "projects", 
      label: "Projects", 
      icon: Briefcase, 
      moduleId: "projects", 
      subModuleId: "dashboard" 
    },
    { 
      id: "sales", 
      label: "Sales", 
      icon: TrendingUp, 
      moduleId: "sales", 
      subModuleId: "leads" 
    },
    { 
      id: "finance", 
      label: "Finance", 
      icon: DollarSign, 
      moduleId: "finance", 
      subModuleId: "invoicing" 
    },
    { 
      id: "stakeholders", 
      label: "Stakeholders", 
      icon: Users, 
      moduleId: "stakeholders", 
      subModuleId: "clients" 
    },
  ];

  // Business navigation items mapped to their required subscription features
  const businessNavigationItems = [
    { id: "projects", label: "Projects", icon: Briefcase, requiredFeature: "projects" },
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
    if ('requiredFeature' in item && item.requiredFeature) {
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

const preClose = () => {
  if (onClose) onClose();
  if (onCollapse) onCollapse();
  else {
    if (isMobile) setOpenMobile(false);
    else setOpen(false);
  }
};

const handleNavigateAndClose = (page: string) => {
  // Close immediately on pointer down; this is a safety for click-only paths
  preClose();
  // Navigate on next frame so the close paint happens first
  requestAnimationFrame(() => onNavigate(page));
};

  // If not open and onClose function exists, don't render (floating mode)
  if (!isOpen && onClose) return null;

  // Determine if this is floating mode (has onClose) or embedded mode (no onClose)
  const isFloatingMode = !!onClose;

  const sidebarContent = (
    <>
      {/* Context Switcher - only show if in floating mode */}
      {isFloatingMode && (
        <div className="px-3 pb-4 pt-20 border-b border-gray-200">
          <SidebarContextSwitcher onNavigate={onNavigate} isCollapsed={isCollapsed} />
        </div>
      )}
      
      <div className={`flex-1 flex flex-col space-y-2 ${isFloatingMode ? 'overflow-y-auto' : 'overflow-visible'} ${isFloatingMode ? 'py-4 px-3' : 'p-4'}`}>
        {/* Show Profile Navigation when in personal context, otherwise show business sections */}
        {activeContext === 'personal' ? (
          <div className="space-y-1">
            <div className="text-xs font-medium text-gray-600 uppercase tracking-wider px-3 py-2">
              {!isCollapsed && "Profile Navigation"}
            </div>
            {personalProfileNavigation
              .filter(item => {
                // Filter Platform Admin based on superadmin role
                if (item.requiresSuperAdmin) {
                  return isSuperAdmin();
                }
                return true;
              })
              .map(item => {
              const Icon = item.icon;
              const isActive = item.active || currentPage === item.id;
              return (
                <button 
                  key={item.id} 
                  onMouseDown={(e) => { e.preventDefault(); handleNavigateAndClose(item.id); }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 text-left ${
                    isActive 
                      ? "bg-gradient-to-r from-blue-500/30 to-blue-600/30 text-white font-medium backdrop-blur-sm border border-blue-400/30 shadow-lg" 
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-all duration-200 ${isActive ? "text-blue-200" : "text-gray-600"}`} />
                  {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                </button>
              );
            })}
          </div>
        ) : (
          <>
            {/* Core Business Modules (replacing General section) */}
            <div className="space-y-1">
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wider px-3 py-2">
                {!isCollapsed && "Business Modules"}
              </div>
              {coreBusinessModules.map(item => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <ModuleWrapper
                    key={item.id}
                    moduleId={item.moduleId}
                    subModuleId={item.subModuleId}
                    companyId={currentCompany?.id || ''}
                    fallback={null} // Don't show anything if no access
                  >
                    <button 
                      onMouseDown={(e) => {
                        e.preventDefault();
                        if (item.id === "projects") {
                          handleNavigateAndClose("projects");
                        } else {
                          handleNavigateAndClose(item.id);
                        }
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 text-left ${
                        isActive 
                          ? "bg-gradient-to-r from-blue-500/30 to-blue-600/30 text-white font-medium backdrop-blur-sm border border-blue-400/30 shadow-lg" 
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className={`w-4 h-4 transition-all duration-200 ${isActive ? "text-blue-200" : "text-gray-600"}`} />
                      {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                    </button>
                  </ModuleWrapper>
                );
              })}
            </div>

            {/* Additional Business Features (subscription-based) */}
            <div className="space-y-1">
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wider px-3 py-2">
                {!isCollapsed && "Additional Features"}
              </div>
              {businessNavigation.filter(item => item.id !== "projects" && item.id !== "sales" && item.id !== "system").map(item => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button 
                    key={item.id} 
                    onMouseDown={(e) => { e.preventDefault(); handleNavigateAndClose(item.id); }} 
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 text-left ${
                      isActive 
                        ? "bg-gradient-to-r from-blue-500/30 to-blue-600/30 text-white font-medium backdrop-blur-sm border border-blue-400/30 shadow-lg" 
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className={`w-4 h-4 transition-all duration-200 ${isActive ? "text-blue-200" : "text-gray-600"}`} />
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
          <div className={`border-t border-gray-200 space-y-1 ${isFloatingMode ? 'px-3 py-4' : 'p-4'}`}>
          <div className="text-xs font-medium text-gray-600 uppercase tracking-wider px-3 py-2">
            {!isCollapsed && "Support"}
          </div>
          {filteredSupportNavigation.map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button 
                key={item.id}
                onMouseDown={(e) => { e.preventDefault(); handleNavigateAndClose(item.id); }} 
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 text-left ${
                  isActive 
                    ? "bg-gradient-to-r from-blue-500/30 to-blue-600/30 text-white font-medium backdrop-blur-sm border border-blue-400/30 shadow-lg" 
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className={`w-4 h-4 transition-all duration-200 ${isActive ? "text-blue-200" : "text-gray-600"}`} />
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
      <div className="fixed left-0 top-0 w-48 h-full bg-white border-r border-gray-200 shadow-lg z-40 transition-all duration-300">
        <div className="flex flex-col h-full">
          {sidebarContent}
        </div>
      </div>
    );
  } else {
    // Embedded mode - use SidebarContent wrapper
    return (
      <div className={`h-full transition-all duration-300 ${open ? 'bg-white' : 'bg-transparent'}`}>
        <div className="flex flex-col h-full">
          {sidebarContent}
        </div>
      </div>
    );
  }
};