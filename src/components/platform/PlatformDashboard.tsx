import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarProvider,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { 
  Home, 
  Users, 
  Settings, 
  Database, 
  BarChart3, 
  Shield, 
  LogOut,
  Building2,
  FileText,
  Monitor
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PlatformDashboardProps {
  onNavigate: (page: string) => void;
}

export const PlatformDashboard = ({ onNavigate }: PlatformDashboardProps) => {
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "Successfully logged out from Platform",
      });
      onNavigate('home');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  const navigationItems = [
    { title: "Dashboard", icon: Home, id: "dashboard" },
    { title: "Companies", icon: Building2, id: "companies" },
    { title: "Users", icon: Users, id: "users" },
    { title: "Analytics", icon: BarChart3, id: "analytics" },
    { title: "Reports", icon: FileText, id: "reports" },
  ];

  const systemItems = [
    { title: "Database", icon: Database, id: "database" },
    { title: "System Monitor", icon: Monitor, id: "monitor" },
    { title: "Security", icon: Shield, id: "security" },
    { title: "Settings", icon: Settings, id: "settings" },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="border-r border-border">
          <SidebarContent className="bg-card">
            {/* Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Platform Admin</h2>
                  <p className="text-sm text-muted-foreground">System Management</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* System */}
            <SidebarGroup>
              <SidebarGroupLabel>System</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {systemItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Logout */}
            <div className="mt-auto p-4 border-t border-border">
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b border-border bg-card flex items-center px-6">
            <SidebarTrigger className="mr-4" />
            <h1 className="text-xl font-semibold text-foreground">Platform Dashboard</h1>
          </header>

          {/* Content */}
          <div className="flex-1 p-6 bg-background">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Welcome Section */}
              <div className="bg-card rounded-lg border border-border p-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to Platform Administration</h2>
                <p className="text-muted-foreground">
                  Manage your platform settings, monitor system health, and oversee user management from this central dashboard.
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-card rounded-lg border border-border p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <Building2 className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Companies</p>
                      <p className="text-2xl font-bold text-foreground">24</p>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-lg border border-border p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <Users className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Active Users</p>
                      <p className="text-2xl font-bold text-foreground">1,429</p>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-lg border border-border p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-500/10">
                      <Monitor className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">System Health</p>
                      <p className="text-2xl font-bold text-foreground">98.5%</p>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-lg border border-border p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <BarChart3 className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                      <p className="text-2xl font-bold text-foreground">$12.4k</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 py-3 border-b border-border last:border-b-0">
                    <div className="p-1 rounded-full bg-green-500/10">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">New company "TechCorp" registered</p>
                      <p className="text-xs text-muted-foreground">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 py-3 border-b border-border last:border-b-0">
                    <div className="p-1 rounded-full bg-blue-500/10">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">System backup completed successfully</p>
                      <p className="text-xs text-muted-foreground">1 hour ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 py-3 border-b border-border last:border-b-0">
                    <div className="p-1 rounded-full bg-orange-500/10">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">Security scan detected 0 vulnerabilities</p>
                      <p className="text-xs text-muted-foreground">3 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};