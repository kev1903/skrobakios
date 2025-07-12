import React from 'react';
import { Crown, Settings, Users, Building2, Database, BarChart3, Shield, Cog } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

const platformItems = [
  { title: 'Dashboard', url: '/platform/dashboard', icon: BarChart3 },
  { title: 'Companies', url: '/platform/companies', icon: Building2 },
  { title: 'Users', url: '/platform/users', icon: Users },
  { title: 'Database', url: '/platform/database', icon: Database },
  { title: 'Security', url: '/platform/security', icon: Shield },
  { title: 'Settings', url: '/platform/settings', icon: Settings },
];

export function PlatformSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === 'collapsed';

  const isActive = (path: string) => currentPath === path;
  const isExpanded = platformItems.some((item) => isActive(item.url));

  const getNavClassName = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? 'bg-primary/10 text-primary font-medium border-r-2 border-primary' 
      : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground';

  return (
    <Sidebar className={isCollapsed ? 'w-14' : 'w-60'}>
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b">
        {!isCollapsed && (
          <>
            <Crown className="h-5 w-5 text-yellow-400" />
            <span className="font-semibold text-sm">Platform Mode</span>
          </>
        )}
        {isCollapsed && <Crown className="h-5 w-5 text-yellow-400 mx-auto" />}
      </div>

      <SidebarContent>
        <SidebarGroup>
          {!isCollapsed && <SidebarGroupLabel>Platform Admin</SidebarGroupLabel>}
          
          <SidebarGroupContent>
            <SidebarMenu>
              {platformItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={getNavClassName}
                      title={isCollapsed ? item.title : undefined}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* System Tools Section */}
        <SidebarGroup>
          {!isCollapsed && <SidebarGroupLabel>System Tools</SidebarGroupLabel>}
          
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/platform/system-config" 
                    className={getNavClassName}
                    title={isCollapsed ? 'System Config' : undefined}
                  >
                    <Cog className="h-4 w-4 flex-shrink-0" />
                    {!isCollapsed && <span>System Config</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}