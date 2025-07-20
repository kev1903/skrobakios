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
import { Badge } from '@/components/ui/badge';
import { Lock, Crown, Star, Building2 } from 'lucide-react';
import { NavigationItem } from '../sidebar/types';
import { useUserRole } from '@/hooks/useUserRole';
import { useCompany } from '@/contexts/CompanyContext';

interface EnhancedNavigationSectionProps {
  title: string;
  items: NavigationItem[];
  currentPage: string;
  onNavigate: (page: string) => void;
  isCollapsed: boolean;
}

const BUSINESS_TYPE_INDICATORS = {
  individual: { icon: Star, color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
  small_business: { icon: Building2, color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  enterprise: { icon: Crown, color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  agency: { icon: Star, color: 'text-green-400', bgColor: 'bg-green-500/20' },
  freelancer: { icon: Star, color: 'text-pink-400', bgColor: 'bg-pink-500/20' }
};

export const EnhancedNavigationSection = ({ 
  title, 
  items, 
  currentPage, 
  onNavigate, 
  isCollapsed 
}: EnhancedNavigationSectionProps) => {
  const { role, hasRole } = useUserRole();
  const { currentCompany } = useCompany();

  const isItemAccessible = (item: NavigationItem): boolean => {
    // Check role-based permissions
    if (item.requiredRole) {
      if (!hasRole(item.requiredRole)) {
        return false;
      }
    }

    // Check company-specific permissions
    if (item.requiresCompany && !currentCompany) {
      return false;
    }

    // Check specific company role requirements
    if (item.requiredCompanyRole && currentCompany) {
      const roleHierarchy = { owner: 3, admin: 2, member: 1 };
      const userRoleLevel = roleHierarchy[currentCompany.role as keyof typeof roleHierarchy] || 0;
      const requiredRoleLevel = roleHierarchy[item.requiredCompanyRole as keyof typeof roleHierarchy] || 0;
      
      if (userRoleLevel < requiredRoleLevel) {
        return false;
      }
    }

    return true;
  };

  const getBusinessTypeIndicator = (businessType?: string) => {
    if (!businessType || isCollapsed) return null;
    
    const indicator = BUSINESS_TYPE_INDICATORS[businessType as keyof typeof BUSINESS_TYPE_INDICATORS];
    if (!indicator) return null;

    const IconComponent = indicator.icon;
    
    return (
      <div className={cn(
        "flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs",
        indicator.bgColor
      )}>
        <IconComponent className={cn("w-3 h-3", indicator.color)} />
        <span className={indicator.color}>
          {businessType.replace('_', ' ')}
        </span>
      </div>
    );
  };

  const getRoleIndicator = (item: NavigationItem) => {
    if (isCollapsed) return null;

    if (item.requiredRole === 'superadmin') {
      return <Crown className="w-3 h-3 text-yellow-400 ml-auto" />;
    }
    

    if (item.requiredCompanyRole === 'owner') {
      return <Crown className="w-3 h-3 text-purple-400 ml-auto" />;
    }

    if (item.requiredCompanyRole === 'admin') {
      return <Lock className="w-3 h-3 text-orange-400 ml-auto" />;
    }

    return null;
  };

  const getAccessibilityBadge = (item: NavigationItem) => {
    if (isCollapsed || isItemAccessible(item)) return null;

    return (
      <Badge 
        variant="secondary" 
        className="ml-auto text-xs bg-red-500/20 text-red-300 border-red-500/30"
      >
        <Lock className="w-2 h-2 mr-1" />
        Locked
      </Badge>
    );
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 font-poppins flex items-center justify-between">
        {!isCollapsed && (
          <>
            <span>{title}</span>
            {currentCompany && getBusinessTypeIndicator(currentCompany.business_type)}
          </>
        )}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = item.active || currentPage === item.id;
            const isAccessible = isItemAccessible(item);
            
            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  onClick={() => {
                    if (isAccessible) {
                      onNavigate(item.id);
                    }
                  }}
                  className={cn(
                    "w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-all duration-200 text-sm font-inter group relative",
                    isActive && isAccessible
                      ? "bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-700 font-medium backdrop-blur-sm border border-blue-500/20 shadow-lg"
                      : isAccessible
                      ? "text-slate-600 hover:bg-white/20 hover:text-slate-800 hover:backdrop-blur-sm hover:shadow-md"
                      : "text-slate-400 opacity-60 cursor-not-allowed hover:bg-red-500/10",
                    !isAccessible && "pointer-events-none"
                  )}
                  disabled={!isAccessible}
                >
                  <Icon className={cn(
                    "w-4 h-4 transition-all duration-200 flex-shrink-0",
                    isActive && isAccessible 
                      ? "text-blue-600" 
                      : isAccessible
                      ? "text-slate-500 group-hover:text-slate-700"
                      : "text-slate-400"
                  )} />
                  
                  {!isCollapsed && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {getRoleIndicator(item)}
                      {getAccessibilityBadge(item)}
                      
                      {/* Premium feature indicator */}
                      {item.isPremium && (
                        <Badge 
                          variant="secondary" 
                          className="text-xs bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 border-yellow-500/30"
                        >
                          <Star className="w-2 h-2 mr-1 fill-current" />
                          Pro
                        </Badge>
                      )}
                    </>
                  )}
                </SidebarMenuButton>
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && !isAccessible && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                    Access restricted
                  </div>
                )}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};