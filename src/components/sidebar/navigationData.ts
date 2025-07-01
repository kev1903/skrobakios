
import { 
  Home, 
  Calendar, 
  Mail, 
  BarChart3, 
  File, 
  Briefcase, 
  DollarSign, 
  TrendingUp, 
  Settings, 
  HelpCircle,
} from "lucide-react";

export const generalNavigation = [
  { id: "tasks", label: "My Tasks", icon: Home, active: true },
  { id: "schedules", label: "My Schedules", icon: Calendar },
  { id: "inbox", label: "Inbox", icon: Mail },
];

export const businessNavigation = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "files", label: "Files", icon: File },
  { id: "projects", label: "Projects", icon: Briefcase },
  { id: "asset", label: "Asset", icon: DollarSign },
  { id: "finance", label: "Finance", icon: TrendingUp },
  { id: "sales", label: "Sales", icon: TrendingUp },
];

export const supportNavigation = [
  { id: "settings", label: "Settings", icon: Settings },
  { id: "support", label: "Help Center", icon: HelpCircle },
];
