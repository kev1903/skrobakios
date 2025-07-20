import React from 'react';
import { ChevronRight, Home, Building2, User, Settings, Shield, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCompany } from '@/contexts/CompanyContext';
import { useUserRole } from '@/hooks/useUserRole';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  href?: string;
  isActive?: boolean;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

interface ContextAwareBreadcrumbProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  className?: string;
}

const PAGE_MAPPINGS: Record<string, { 
  label: string; 
  icon: React.ComponentType<{ className?: string }>; 
  parent?: string;
  requiresCompany?: boolean;
  showBusinessType?: boolean;
}> = {
  home: { label: 'Dashboard', icon: Home },
  // 'user-edit' route removed
  tasks: { label: 'Tasks', icon: Settings, parent: 'home', requiresCompany: true, showBusinessType: true },
  projects: { label: 'Projects', icon: Building2, parent: 'home', requiresCompany: true, showBusinessType: true },
  team: { label: 'Team', icon: Users, parent: 'home', requiresCompany: true },
  security: { label: 'Security', icon: Shield, parent: 'home' },
  settings: { label: 'Settings', icon: Settings, parent: 'home' },
};

const BUSINESS_TYPE_LABELS = {
  individual: 'Individual',
  small_business: 'Small Business',
  enterprise: 'Enterprise',
  agency: 'Agency',
  freelancer: 'Freelancer'
};

export const ContextAwareBreadcrumb = ({ 
  currentPage, 
  onNavigate, 
  className 
}: ContextAwareBreadcrumbProps) => {
  const { currentCompany } = useCompany();
  const { role } = useUserRole();

  const buildBreadcrumbs = (): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = [];
    const pageConfig = PAGE_MAPPINGS[currentPage];
    
    if (!pageConfig) {
      return [{ label: 'Unknown Page', icon: Home, isActive: true }];
    }

    // Add parent pages
    if (pageConfig.parent) {
      const parentConfig = PAGE_MAPPINGS[pageConfig.parent];
      if (parentConfig) {
        breadcrumbs.push({
          label: parentConfig.label,
          icon: parentConfig.icon,
          href: pageConfig.parent
        });
      }
    }

    // Add company context if required and available
    if (pageConfig.requiresCompany && currentCompany) {
      breadcrumbs.push({
        label: currentCompany.name,
        icon: Building2,
        badge: currentCompany.role,
        badgeVariant: currentCompany.role === 'owner' ? 'default' : 'secondary'
      });
    }

    // Add current page
    const currentPageItem: BreadcrumbItem = {
      label: pageConfig.label,
      icon: pageConfig.icon,
      isActive: true
    };

    // Add business type indicator if relevant
    if (pageConfig.showBusinessType && currentCompany?.business_type) {
      currentPageItem.badge = BUSINESS_TYPE_LABELS[currentCompany.business_type as keyof typeof BUSINESS_TYPE_LABELS];
      currentPageItem.badgeVariant = 'outline';
    }

    breadcrumbs.push(currentPageItem);

    return breadcrumbs;
  };

  const breadcrumbs = buildBreadcrumbs();

  return (
    <nav className={cn("flex items-center space-x-1 text-sm", className)}>
      {breadcrumbs.map((item, index) => (
        <React.Fragment key={index}>
          <div className="flex items-center space-x-2">
            {item.href ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate(item.href!)}
                className="flex items-center space-x-1 px-2 py-1 h-auto text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
              >
                {item.icon && <item.icon className="w-4 h-4" />}
                <span>{item.label}</span>
              </Button>
            ) : (
              <div className={cn(
                "flex items-center space-x-1 px-2 py-1",
                item.isActive && "text-slate-900 font-medium"
              )}>
                {item.icon && (
                  <item.icon className={cn(
                    "w-4 h-4",
                    item.isActive ? "text-slate-900" : "text-slate-500"
                  )} />
                )}
                <span>{item.label}</span>
              </div>
            )}
            
            {item.badge && (
              <Badge 
                variant={item.badgeVariant || 'secondary'} 
                className="text-xs ml-1"
              >
                {item.badge}
              </Badge>
            )}
          </div>
          
          {index < breadcrumbs.length - 1 && (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
        </React.Fragment>
      ))}
      
      {/* Role indicator */}
      {role && (
        <div className="ml-4 flex items-center">
          <Badge 
            variant={role === 'superadmin' ? 'default' : 'secondary'}
            className={cn(
              "text-xs",
              role === 'superadmin' && "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
              
              role === 'company_admin' && "bg-green-500/20 text-green-700 border-green-500/30"
            )}
          >
            {role === 'superadmin' && '👑 '}
            
            {role === 'company_admin' && '🏢 '}
            {role.replace('_', ' ')}
          </Badge>
        </div>
      )}
    </nav>
  );
};