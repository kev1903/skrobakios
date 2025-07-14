
import { LucideIcon } from 'lucide-react';

export interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
  requiredRole?: 'superadmin' | 'platform_admin' | 'company_admin';
  requiredCompanyRole?: 'owner' | 'admin' | 'member';
  requiresCompany?: boolean;
  isPremium?: boolean;
}

export interface ResponsiveSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}
