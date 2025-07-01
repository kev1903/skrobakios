
import React from 'react';
import { 
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
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
  LogOut,
  User,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/UserContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ResponsiveSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const ResponsiveSidebar = ({ currentPage, onNavigate }: ResponsiveSidebarProps) => {
  const { userProfile } = useUser();
  const { user, userRole, signOut, isSuperAdmin, isAdmin } = useAuth();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const generalNavigation = [
    { id: "tasks", label: "My Tasks", icon: Home, active: true },
    { id: "schedules", label: "My Schedules", icon: Calendar },
    { id: "inbox", label: "Inbox", icon: Mail },
  ];

  const businessNavigation = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "files", label: "Files", icon: File },
    { id: "projects", label: "Projects", icon: Briefcase },
    { id: "asset", label: "Asset", icon: DollarSign },
    { id: "finance", label: "Finance", icon: TrendingUp },
    { id: "sales", label: "Sales", icon: TrendingUp },
  ];

  const supportNavigation = [
    { id: "settings", label: "Settings", icon: Settings },
    { id: "support", label: "Help Center", icon: HelpCircle },
  ];

  // Add admin navigation if user has admin privileges
  const adminNavigation = isAdmin ? [
    { id: "admin", label: "Admin Panel", icon: Shield },
  ] : [];

  const handleLogout = async () => {
    try {
      await signOut();
      onNavigate('auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Sidebar className="backdrop-blur-xl bg-white/60 border-r border-white/20 shadow-xl">
      <SidebarHeader className="p-6 border-b border-white/20">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-sm font-poppins">K</span>
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent heading-modern">KAKSIK</h1>
              <p className="text-xs text-slate-500 font-inter">Modern Workspace</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 py-6 space-y-6">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 font-poppins">
            {!isCollapsed && "General"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {generalNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = item.id === "tasks";
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onNavigate(item.id)}
                      className={cn(
                        "w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-all duration-200 text-sm font-inter group",
                        isActive
                          ? "bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-700 font-medium backdrop-blur-sm border border-blue-500/20 shadow-lg"
                          : "text-slate-600 hover:bg-white/20 hover:text-slate-800 hover:backdrop-blur-sm hover:shadow-md"
                      )}
                    >
                      <Icon className={cn(
                        "w-4 h-4 transition-all duration-200",
                        isActive ? "text-blue-600" : "text-slate-500 group-hover:text-slate-700"
                      )} />
                      {!isCollapsed && <span>{item.label}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 font-poppins">
            {!isCollapsed && "Business"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {businessNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onNavigate(item.id)}
                      className={cn(
                        "w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-all duration-200 text-sm font-inter group",
                        isActive
                          ? "bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-700 font-medium backdrop-blur-sm border border-blue-500/20 shadow-lg"
                          : "text-slate-600 hover:bg-white/20 hover:text-slate-800 hover:backdrop-blur-sm hover:shadow-md"
                      )}
                    >
                      <Icon className={cn(
                        "w-4 h-4 transition-all duration-200",
                        isActive ? "text-blue-600" : "text-slate-500 group-hover:text-slate-700"
                      )} />
                      {!isCollapsed && <span>{item.label}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {adminNavigation.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 font-poppins">
              {!isCollapsed && "Administration"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {adminNavigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        onClick={() => onNavigate(item.id)}
                        className={cn(
                          "w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-all duration-200 text-sm font-inter group",
                          isActive
                            ? "bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-700 font-medium backdrop-blur-sm border border-blue-500/20 shadow-lg"
                            : "text-slate-600 hover:bg-white/20 hover:text-slate-800 hover:backdrop-blur-sm hover:shadow-md"
                        )}
                      >
                        <Icon className={cn(
                          "w-4 h-4 transition-all duration-200",
                          isActive ? "text-blue-600" : "text-slate-500 group-hover:text-slate-700"
                        )} />
                        {!isCollapsed && <span>{item.label}</span>}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 font-poppins">
            {!isCollapsed && "Support"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {supportNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onNavigate(item.id)}
                      className={cn(
                        "w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-all duration-200 text-sm font-inter group",
                        isActive
                          ? "bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-700 font-medium backdrop-blur-sm border border-blue-500/20 shadow-lg"
                          : "text-slate-600 hover:bg-white/20 hover:text-slate-800 hover:backdrop-blur-sm hover:shadow-md"
                      )}
                    >
                      <Icon className={cn(
                        "w-4 h-4 transition-all duration-200",
                        isActive ? "text-blue-600" : "text-slate-500 group-hover:text-slate-700"
                      )} />
                      {!isCollapsed && <span>{item.label}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-white/20">
        <Button
          variant="ghost"
          onClick={() => onNavigate('user-edit')}
          className="w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg hover:bg-white/20 transition-all duration-200 group backdrop-blur-sm hover:shadow-md justify-start"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-blue-700 rounded-full flex items-center justify-center overflow-hidden shadow-lg">
            {userProfile.avatarUrl ? (
              <img 
                src={userProfile.avatarUrl} 
                alt="User Avatar" 
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-4 h-4 text-white" />
            )}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium text-slate-800 truncate font-poppins">
                  {user?.email || userProfile.firstName + ' ' + userProfile.lastName}
                </p>
                {userRole && (
                  <Badge variant={isSuperAdmin ? "destructive" : isAdmin ? "default" : "secondary"} className="text-xs">
                    {userRole}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 truncate font-inter">{userProfile.jobTitle}</p>
            </div>
          )}
        </Button>
        
        <Button 
          variant="ghost"
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3 py-2 mt-2 text-left rounded-lg hover:bg-red-50/50 transition-all duration-200 text-slate-500 hover:text-red-600 group backdrop-blur-sm hover:shadow-md justify-start"
        >
          <LogOut className="w-4 h-4" />
          {!isCollapsed && <span className="text-sm font-inter">Logout</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};
