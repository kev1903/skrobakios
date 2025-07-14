import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Shield, 
  TrendingUp, 
  Users, 
  Building2, 
  Settings, 
  Activity,
  BarChart3,
  Database,
  Server,
  Globe,
  UserCog,
  Monitor,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Plus,
  Edit,
  Trash2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PlatformUserManagement } from "@/components/admin/PlatformUserManagement";
import { BusinessesTable } from "@/components/companies/BusinessesTable";
import { BusinessEditDialog } from "@/components/companies/BusinessEditDialog";
import { Company } from "@/types/company";

interface ModernPlatformDashboardProps {
  onNavigate: (page: string) => void;
}

interface PlatformStats {
  totalUsers: number;
  totalCompanies: number;
  activeProjects: number;
  systemHealth: number;
}

interface SystemMetrics {
  totalRevenue: number;
  monthlyActiveUsers: number;
  storageUsed: number;
  apiCalls: number;
}

interface CompanyOption {
  id: string;
  name: string;
}

export const ModernPlatformDashboard = ({ onNavigate }: ModernPlatformDashboardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0,
    totalCompanies: 0,
    activeProjects: 0,
    systemHealth: 98
  });

  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalRevenue: 0,
    monthlyActiveUsers: 0,
    storageUsed: 0,
    apiCalls: 0
  });

  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [systemAlerts, setSystemAlerts] = useState<any[]>([]);

  useEffect(() => {
    loadPlatformData();
  }, [user]);

  const loadPlatformData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load platform statistics
      const [usersResponse, companiesResponse, projectsResponse] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('companies').select('*', { count: 'exact' }),
        supabase.from('projects').select('id', { count: 'exact' })
      ]);

      setStats({
        totalUsers: usersResponse.count || 0,
        totalCompanies: companiesResponse.count || 0,
        activeProjects: projectsResponse.count || 0,
        systemHealth: 98
      });

      // Set companies data for user management
      setCompanies(companiesResponse.data || []);

      // Load recent users
      const { data: recentUsersData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentUsers(recentUsersData || []);

      // Simulate metrics (in real app, these would come from analytics)
      setMetrics({
        totalRevenue: 45420,
        monthlyActiveUsers: 1247,
        storageUsed: 75,
        apiCalls: 28430
      });

    } catch (error) {
      console.error('Error loading platform data:', error);
      toast({
        title: "Error",
        description: "Failed to load platform data",
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "Successfully logged out from Platform"
      });
      onNavigate('landing');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleEditCompany = (company: Company) => {
    setSelectedCompany(company);
    setIsEditDialogOpen(true);
  };

  const handleSaveCompany = async (updatedCompany: Partial<Company>) => {
    try {
      const { error } = await supabase
        .from('companies')
        .update(updatedCompany)
        .eq('id', selectedCompany?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Business updated successfully"
      });

      loadPlatformData(); // Reload data
      setIsEditDialogOpen(false);
      setSelectedCompany(null);
    } catch (error) {
      console.error('Error updating business:', error);
      toast({
        title: "Error",
        description: "Failed to update business",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading platform data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              Platform Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your platform infrastructure and monitor system health
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="px-3 py-1">
              <Activity className="w-4 h-4 mr-2" />
              System Healthy
            </Badge>
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="companies">Businesses</TabsTrigger>
            <TabsTrigger value="system">System Health</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+12%</span> from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Businesses</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalCompanies.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+8%</span> from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeProjects.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+15%</span> from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Health</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.systemHealth}%</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">Excellent</span> performance
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Platform Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Platform Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Monthly Revenue</span>
                    <span className="font-semibold">${metrics.totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Monthly Active Users</span>
                    <span className="font-semibold">{metrics.monthlyActiveUsers.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Storage Used</span>
                    <span className="font-semibold">{metrics.storageUsed}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">API Calls (24h)</span>
                    <span className="font-semibold">{metrics.apiCalls.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Recent Users
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback>
                          {user.first_name?.[0]}{user.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {user.status}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col gap-2"
                    onClick={() => onNavigate('user-management')}
                  >
                    <UserCog className="w-6 h-6" />
                    <span className="text-sm">Manage Users</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Building2 className="w-6 h-6" />
                    <span className="text-sm">Business Settings</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Database className="w-6 h-6" />
                    <span className="text-sm">Database</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2">
                    <Monitor className="w-6 h-6" />
                    <span className="text-sm">System Monitor</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <PlatformUserManagement companies={companies} />
          </TabsContent>

          <TabsContent value="companies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Management</CardTitle>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search businesses..." className="pl-10" />
                  </div>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Business
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <BusinessesTable 
                  companies={companies} 
                  onEditCompany={handleEditCompany}
                  loading={loading}
                  canManageCompanies={true}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="w-5 h-5" />
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">API Gateway</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Operational
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Database</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Operational
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">File Storage</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Operational
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Authentication</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Operational
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Recent Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      No critical alerts in the last 24 hours
                    </div>
                    <Badge variant="outline" className="text-green-600">
                      All systems operational
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <BusinessEditDialog
          company={selectedCompany}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSave={handleSaveCompany}
        />
      </div>
    </div>
  );
};