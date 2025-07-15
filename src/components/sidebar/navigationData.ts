
import { 
  User,
  Clock, 
  DollarSign, 
  Heart, 
  Users,
  Building2,
  Shield,
  Home, 
  Calendar, 
  Mail, 
  File, 
  Briefcase, 
  TrendingUp, 
  HelpCircle,
  Settings,
} from "lucide-react";
import { NavigationItem } from './types';

// Personal Profile Navigation - Based on user's reference image
export const personalProfileNavigation: NavigationItem[] = [
  { id: "personal", label: "Personal", icon: User },
  { id: "time", label: "Time", icon: Clock },
  { id: "finance", label: "Finance", icon: DollarSign },
  { id: "wellness", label: "Wellness", icon: Heart },
  { id: "family", label: "Family", icon: Users },
  { id: "business", label: "Business", icon: Building2 },
  { id: "security", label: "Security", icon: Shield },
];

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
  { id: "sales", label: "Sales", icon: TrendingUp },
  { id: "settings", label: "Settings", icon: Settings },
];

export const supportNavigation: NavigationItem[] = [
  { id: "platform", label: "Platform", icon: Shield },
  { id: "support", label: "Help Center", icon: HelpCircle },
];
