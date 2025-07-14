import React, { useEffect } from 'react';
import { Briefcase, Calendar, DollarSign, TrendingUp, Map, HelpCircle, Shield } from 'lucide-react';
import { SidebarContextSwitcher } from '@/components/SidebarContextSwitcher';
import { useCompany } from '@/contexts/CompanyContext';
import { useCompanyModules } from '@/hooks/useCompanyModules';
import { personalProfileNavigation } from '@/components/sidebar/navigationData';

interface NavigationRibbonProps {
  isOpen: boolean;
  onSidePageSelect: (page: string) => void;
  onNavigate: (page: string) => void;
  onClose: () => void;
  currentPage?: string;
}

// Define the company modules with their navigation details
const COMPANY_NAVIGATION_MODULES = [
  { 
    key: 'projects', 
    name: 'Projects', 
    icon: Briefcase, 
    page: 'projects' 
  },
  { 
    key: 'finance', 
    name: 'Finance', 
    icon: DollarSign, 
    page: 'finance' 
  },
  { 
    key: 'sales', 
    name: 'Sales', 
    icon: TrendingUp, 
    page: 'sales' 
  }
];

export const NavigationRibbon = ({
  isOpen,
  onSidePageSelect,
  onNavigate,
  onClose,
  currentPage = ""
}: NavigationRibbonProps) => {
  const { currentCompany } = useCompany();
  const { fetchCompanyModules, isModuleEnabled } = useCompanyModules();

  // Fetch company modules when component mounts or company changes
  useEffect(() => {
    if (currentCompany?.id) {
      fetchCompanyModules(currentCompany.id);
    }
  }, [currentCompany?.id]);

  if (!isOpen) return null;

  // Filter navigation modules based on enabled company modules
  const enabledNavigationModules = COMPANY_NAVIGATION_MODULES.filter(module => 
    currentCompany?.id ? isModuleEnabled(currentCompany.id, module.key) : false
  );

  return (
    <div className="fixed left-0 top-0 w-48 h-full bg-white/10 backdrop-blur-md border-r border-white/20 shadow-2xl z-40 transition-all duration-300">
      <div className="flex flex-col h-full pt-20">
        {/* Context Switcher */}
        <div className="px-3 pb-4 border-b border-white/20">
          <SidebarContextSwitcher onNavigate={onNavigate} />
        </div>
        
        {/* Profile Navigation Section */}
        <div className="flex-1 flex flex-col py-4 space-y-1 overflow-y-auto px-3">
          {/* Profile Navigation */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-white/60 uppercase tracking-wider px-3 py-2">
              Profile Navigation
            </div>
            {personalProfileNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = item.active || currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 text-left ${
                    isActive
                      ? "bg-gradient-to-r from-blue-500/30 to-blue-600/30 text-white font-medium backdrop-blur-sm border border-blue-400/30 shadow-lg"
                      : "text-white hover:bg-white/30"
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-all duration-200 ${
                    isActive ? "text-blue-200" : "text-white/80"
                  }`} />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Company Modules Section - if any are enabled */}
          {enabledNavigationModules.length > 0 && (
            <div className="space-y-1 pt-4 border-t border-white/20 mt-4">
              <div className="text-xs font-medium text-white/60 uppercase tracking-wider px-3 py-2">
                Business Modules
              </div>
              {enabledNavigationModules.map((module) => {
                const IconComponent = module.icon;
                return (
                  <button 
                    key={module.key}
                    onClick={() => {
                      onNavigate(module.page);
                      onClose();
                    }} 
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-white/30 transition-all duration-200 text-left"
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="text-sm font-medium">{module.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Support Section */}
        <div className="border-t border-white/20 px-3 py-4 space-y-1">
          <div className="text-xs font-medium text-white uppercase tracking-wider px-3 py-2">
            Support
          </div>
          <button onClick={() => {
            onNavigate('platform');
            onClose();
          }} className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-white/30 transition-all duration-200 text-left">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">Platform</span>
          </button>
          <button onClick={() => {
            onNavigate('support');
            onClose();
          }} className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-white hover:bg-white/30 transition-all duration-200 text-left">
            <HelpCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Help Center</span>
          </button>
        </div>
      </div>
    </div>
  );
};