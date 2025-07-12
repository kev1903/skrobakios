
import { 
  Home, 
  Calendar, 
  Mail, 
  File, 
  Briefcase, 
  DollarSign, 
  TrendingUp, 
  HelpCircle,
  Shield,
  Building2,
  Users,
  UserCog,
  CreditCard,
  Settings,
  Activity,
  LifeBuoy,
  Database,
  Key,
  Globe,
  FileText,
  AlertTriangle,
  Bell,
} from "lucide-react";
import { NavigationItem } from './types';

export const generalNavigation: NavigationItem[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "my-tasks", label: "MY TASKS", icon: Calendar },
  { id: "schedules", label: "My Schedules", icon: Calendar },
  { id: "inbox", label: "Inbox", icon: Mail },
];

export const businessNavigation: NavigationItem[] = [
  { id: "files", label: "Files", icon: File },
  { id: "projects", label: "Projects", icon: Briefcase },
  { id: "cost-contracts", label: "Cost & Contracts", icon: DollarSign },
  { id: "finance", label: "Finance", icon: TrendingUp },
  { id: "sales", label: "Sales", icon: TrendingUp },
];

export const supportNavigation: NavigationItem[] = [
  { id: "company-settings", label: "Company", icon: Building2 },
  { id: "support", label: "Help Center", icon: HelpCircle },
];

export const platformNavigation: NavigationItem[] = [
  // Tenants
  { id: "platform-tenants", label: "Tenants", icon: Building2 },
  { id: "platform-tenant-plans", label: "Tenant Plans", icon: Database },
  
  // Users & Roles
  { id: "platform-users", label: "Global Users", icon: Users },
  { id: "platform-roles", label: "Roles & Permissions", icon: UserCog },
  
  // Billing
  { id: "platform-billing", label: "Billing Management", icon: CreditCard },
  { id: "platform-subscriptions", label: "Subscriptions", icon: FileText },
  
  // Settings
  { id: "platform-settings", label: "Platform Settings", icon: Settings },
  { id: "platform-integrations", label: "Integrations", icon: Globe },
  
  // Security & Logs
  { id: "platform-security", label: "Security", icon: Shield },
  { id: "platform-logs", label: "Activity Logs", icon: Activity },
  
  // Support
  { id: "platform-support", label: "Support Center", icon: LifeBuoy },
  { id: "platform-tickets", label: "Ticket Management", icon: Bell },
];
