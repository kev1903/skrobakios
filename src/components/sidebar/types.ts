
import { LucideIcon } from 'lucide-react';

export interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
}

export interface ResponsiveSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}
