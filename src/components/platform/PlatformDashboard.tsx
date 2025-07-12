import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Home, Users, Settings, Database, BarChart3, Shield, LogOut, Building2, FileText, Monitor, CreditCard, HeadphonesIcon, AlertTriangle, Activity, UserCog, DollarSign, Bell, Server, Lock, HelpCircle, Globe, ExternalLink, Puzzle, TrendingUp, Eye, Zap, Calendar, CheckSquare, FolderOpen, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Search, Filter, Edit } from 'lucide-react';
import { CompaniesTable } from '@/components/companies/CompaniesTable';
import { CompanyEditDialog } from '@/components/companies/CompanyEditDialog';
import { Company } from '@/types/company';
import { useCompanies } from '@/hooks/useCompanies';
import { useUserRole } from '@/hooks/useUserRole';
import { useCompanyModules, AVAILABLE_MODULES } from '@/hooks/useCompanyModules';
interface PlatformDashboardProps {
  onNavigate: (page: string) => void;
}
export const PlatformDashboard = ({
  onNavigate
}: PlatformDashboardProps) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [companyStats, setCompanyStats] = useState({
    totalActive: 0,
    monthlyGrowth: 0,
    isLoading: true
  });
  const [companies, setCompanies] = useState<any[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    weeklyGrowth: 0,
    isLoading: true
  });
  const {
    toast
  } = useToast();
  const {
    getUserCompanies,
    updateCompany
  } = useCompanies();
  const {
    isSuperAdmin,
    isOwner
  } = useUserRole();
  const navigate = useNavigate();
  const { modules, loading: modulesLoading, fetchCompanyModules } = useCompanyModules();

  // Additional state for table functionality
  const [filteredCompanies, setFilteredCompanies] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const canManageCompanies = isSuperAdmin() || isOwner();
  const [moduleStats, setModuleStats] = useState({
    companyModules: { active: 0, total: 0 },
    projectModules: { active: 0, total: 0 },
    totalCompaniesUsingModules: 0,
    averageAdoption: 0
  });

  // Filter companies based on search term
  useEffect(() => {
    const filtered = companies.filter(company => company.name?.toLowerCase().includes(searchTerm.toLowerCase()) || company.slug?.toLowerCase().includes(searchTerm.toLowerCase()) || company.website?.toLowerCase().includes(searchTerm.toLowerCase()) || company.address?.toLowerCase().includes(searchTerm.toLowerCase()));
    setFilteredCompanies(filtered);
  }, [searchTerm, companies]);

  // Calculate module statistics from real data
  useEffect(() => {
    const calculateModuleStats = () => {
      const companyModuleTypes = ['Projects', 'Finance', 'Sales'];
      const projectModuleTypes = ['Dashboard', 'Digital Twin', 'Cost & Contracts', 'Schedule', 'Tasks', 'Files', 'Team', 'Digital Objects'];
      
      const activeCompanyModules = AVAILABLE_MODULES.filter(m => 
        companyModuleTypes.includes(m.name)
      ).length;
      
      const activeProjectModules = AVAILABLE_MODULES.filter(m => 
        projectModuleTypes.includes(m.name)
      ).length;

      // Get unique companies using any modules
      const companiesUsingModules = new Set(modules.filter(m => m.enabled).map(m => m.company_id)).size;
      
      // Calculate average adoption rate
      const totalPossibleAdoptions = companies.length * AVAILABLE_MODULES.length;
      const actualAdoptions = modules.filter(m => m.enabled).length;
      const averageAdoption = totalPossibleAdoptions > 0 ? Math.round((actualAdoptions / totalPossibleAdoptions) * 100) : 0;

      setModuleStats({
        companyModules: { active: activeCompanyModules, total: companyModuleTypes.length },
        projectModules: { active: activeProjectModules, total: projectModuleTypes.length },
        totalCompaniesUsingModules: companiesUsingModules,
        averageAdoption
      });
    };

    calculateModuleStats();
  }, [modules, companies]);

  // Get module adoption statistics
  const getModuleAdoptionStats = (moduleName: string) => {
    const moduleUsage = modules.filter(m => m.module_name === moduleName && m.enabled);
    return moduleUsage.length;
  };

  const handleEditCompany = (company: Company) => {
    navigate(`/company/${company.id}/edit`);
  };
  const handleSaveCompany = async (updatedCompany: Partial<Company>) => {
    if (!selectedCompany) return;
    try {
      const result = await updateCompany(selectedCompany.id, updatedCompany);
      if (result) {
        // Update local state
        setCompanies(prev => prev.map(company => company.id === selectedCompany.id ? {
          ...company,
          ...result
        } : company));
        toast({
          title: "Success",
          description: "Company updated successfully"
        });
        setIsEditDialogOpen(false);
        setSelectedCompany(null);
      }
    } catch (error) {
      console.error('Error updating company:', error);
      toast({
        title: "Error",
        description: "Failed to update company",
        variant: "destructive"
      });
    }
  };
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "Successfully logged out from Platform"
      });
      onNavigate('home');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive"
      });
    }
  };
  const navigationItems = [{
    title: "Dashboard",
    icon: Home,
    id: "dashboard"
  }, {
    title: "Company",
    icon: Building2,
    id: "tenants"
  }, {
    title: "Modules",
    icon: Puzzle,
    id: "modules"
  }, {
    title: "Users & Roles",
    icon: UserCog,
    id: "users"
  }, {
    title: "Billing",
    icon: CreditCard,
    id: "billing"
  }, {
    title: "Settings",
    icon: Settings,
    id: "settings"
  }, {
    title: "Security & Logs",
    icon: Shield,
    id: "security"
  }, {
    title: "Support",
    icon: HeadphonesIcon,
    id: "support"
  }];

  // Fetch companies data
  const fetchCompanies = async () => {
    try {
      setCompaniesLoading(true);
      const {
        data: companiesData,
        error
      } = await supabase.from('companies').select(`
          id, 
          name, 
          slug, 
          logo_url, 
          created_at,
          updated_at,
          website,
          address,
          phone,
          abn,
          slogan,
          created_by
        `).order('created_at', {
        ascending: false
      });
      if (error) {
        throw error;
      }

      // Get company member counts
      const companiesWithStats = await Promise.all((companiesData || []).map(async company => {
        const {
          data: members,
          error: membersError
        } = await supabase.from('company_members').select('id').eq('company_id', company.id).eq('status', 'active');
        if (membersError) {
          console.error('Error fetching members for company:', company.id, membersError);
        }
        return {
          ...company,
          memberCount: members?.length || 0,
          status: 'active' // For now, all companies are active
        };
      }));
      setCompanies(companiesWithStats);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({
        title: "Error",
        description: "Failed to load companies",
        variant: "destructive"
      });
    } finally {
      setCompaniesLoading(false);
    }
  };

  // Fetch user statistics
  const fetchUserStats = async () => {
    try {
      setUserStats(prev => ({
        ...prev,
        isLoading: true
      }));

      // Get total users from profiles table
      const {
        data: profiles,
        error
      } = await supabase.from('profiles').select('id, created_at').eq('status', 'active').order('created_at', {
        ascending: false
      });
      if (error) {
        throw error;
      }
      const totalUsers = profiles?.length || 0;

      // Calculate weekly growth
      const currentDate = new Date();
      const oneWeekAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      const weeklyGrowth = profiles?.filter(profile => new Date(profile.created_at) >= oneWeekAgo).length || 0;
      setUserStats({
        totalUsers,
        weeklyGrowth,
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
      setUserStats(prev => ({
        ...prev,
        isLoading: false
      }));
    }
  };

  // Fetch company statistics
  useEffect(() => {
    const fetchCompanyStats = async () => {
      try {
        // Get total active companies
        const {
          data: companies,
          error
        } = await supabase.from('companies').select('id, created_at').order('created_at', {
          ascending: false
        });
        if (error) {
          throw error;
        }
        const totalActive = companies?.length || 0;

        // Calculate monthly growth
        const currentDate = new Date();
        const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        const thisMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const thisMonthCompanies = companies?.filter(company => new Date(company.created_at) >= thisMonth).length || 0;
        const lastMonthCompanies = companies?.filter(company => {
          const createdDate = new Date(company.created_at);
          return createdDate >= lastMonth && createdDate < thisMonth;
        }).length || 0;
        const monthlyGrowth = thisMonthCompanies;
        setCompanyStats({
          totalActive,
          monthlyGrowth,
          isLoading: false
        });
      } catch (error) {
        console.error('Error fetching company stats:', error);
        setCompanyStats(prev => ({
          ...prev,
          isLoading: false
        }));
      }
    };
    fetchCompanyStats();
    fetchCompanies();
    fetchUserStats();

    // Fetch modules data for all companies
    companies.forEach(company => {
      fetchCompanyModules(company.id);
    });

    // Set up real-time subscriptions
    const companyChannel = supabase.channel('company-changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'companies'
    }, () => {
      fetchCompanyStats();
      fetchCompanies();
    }).subscribe();
    const profilesChannel = supabase.channel('profiles-changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'profiles'
    }, () => {
      fetchUserStats();
    }).subscribe();
    return () => {
      supabase.removeChannel(companyChannel);
      supabase.removeChannel(profilesChannel);
    };
  }, []);
  const renderDashboardContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <div className="space-y-6">
            {/* Platform Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <Building2 className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Active Companies</p>
                      <p className="text-2xl font-bold">
                        {companyStats.isLoading ? <span className="animate-pulse">...</span> : companyStats.totalActive}
                      </p>
                      <p className="text-xs text-green-600">
                        {companyStats.isLoading ? <span className="animate-pulse">...</span> : `+${companyStats.monthlyGrowth} this month`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <Users className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Users</p>
                      <p className="text-2xl font-bold">
                        {userStats.isLoading ? <span className="animate-pulse">...</span> : userStats.totalUsers.toLocaleString()}
                      </p>
                      <p className="text-xs text-green-600">
                        {userStats.isLoading ? <span className="animate-pulse">...</span> : `+${userStats.weeklyGrowth} this week`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-orange-500/10">
                      <Activity className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">System Health</p>
                      <p className="text-2xl font-bold">99.2%</p>
                      <p className="text-xs text-orange-600">Last 30 days</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <DollarSign className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                      <p className="text-2xl font-bold">$47.2k</p>
                      <p className="text-xs text-green-600">+8.3% vs last month</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Status & Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="w-5 h-5" />
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Database Performance</span>
                    <Badge variant="secondary" className="bg-green-500/10 text-green-600">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>API Response Time</span>
                    <Badge variant="secondary" className="bg-green-500/10 text-green-600">142ms avg</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Storage Usage</span>
                    <div className="flex items-center gap-2">
                      <Progress value={67} className="w-20" />
                      <span className="text-sm">67%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>CDN Status</span>
                    <Badge variant="secondary" className="bg-green-500/10 text-green-600">Operational</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Recent Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">High API Usage</p>
                      <p className="text-xs text-muted-foreground">Company "TechCorp" exceeded 80% quota</p>
                    </div>
                    <span className="text-xs text-muted-foreground">2h ago</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <Monitor className="w-4 h-4 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">System Update</p>
                      <p className="text-xs text-muted-foreground">Security patch deployed successfully</p>
                    </div>
                    <span className="text-xs text-muted-foreground">6h ago</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <Users className="w-4 h-4 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">New Company</p>
                      <p className="text-xs text-muted-foreground">"StartupAI" onboarded successfully</p>
                    </div>
                    <span className="text-xs text-muted-foreground">1d ago</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>;
      case 'tenants':
        return <div className="space-y-6">
            <div className="flex items-center justify-between">
              
              <Button>
                <Building2 className="w-4 h-4 mr-2" />
                Create Company
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Companies ({filteredCompanies.length})</span>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input placeholder="Search companies..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 w-80" />
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  View and manage all companies in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CompaniesTable companies={filteredCompanies} onEditCompany={handleEditCompany} loading={companiesLoading} canManageCompanies={canManageCompanies} />
              </CardContent>
            </Card>

            {/* Company Stats Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Company Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Plan Distribution</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Enterprise</span>
                        <span className="text-sm">45%</span>
                      </div>
                      <Progress value={45} />
                      <div className="flex justify-between">
                        <span className="text-sm">Professional</span>
                        <span className="text-sm">35%</span>
                      </div>
                      <Progress value={35} />
                      <div className="flex justify-between">
                        <span className="text-sm">Basic</span>
                        <span className="text-sm">20%</span>
                      </div>
                      <Progress value={20} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Edit Dialog */}
            <CompanyEditDialog company={selectedCompany} open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} onSave={handleSaveCompany} />
          </div>;
      case 'modules':
        return <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Platform Modules</h2>
                <p className="text-muted-foreground">Manage available modules and features across the platform</p>
              </div>
              <Button>
                <Puzzle className="w-4 h-4 mr-2" />
                Create Module
              </Button>
            </div>


            {/* Company Modules */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Company Modules
                </CardTitle>
                <CardDescription>
                  Modules that operate at the company level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {AVAILABLE_MODULES.filter(module => ['projects', 'finance', 'sales'].includes(module.key)).map((module) => {
                    const adoptionCount = getModuleAdoptionStats(module.key);
                    const adoptionRate = companies.length > 0 ? Math.round((adoptionCount / companies.length) * 100) : 0;
                    const isActive = adoptionCount > 0;
                    
                    return (
                      <div key={module.name} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-500/10">
                            {module.key === 'projects' && <Building2 className="w-4 h-4 text-blue-500" />}
                            {module.key === 'finance' && <DollarSign className="w-4 h-4 text-blue-500" />}
                            {module.key === 'sales' && <TrendingUp className="w-4 h-4 text-blue-500" />}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{module.name}</h4>
                            <p className="text-sm text-muted-foreground">{module.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {adoptionCount} companies ({adoptionRate}% adoption)
                            </p>
                          </div>
                        </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={isActive ? "default" : "secondary"}>
                          {isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Button variant="outline" size="sm">
                          Configure
                        </Button>
                      </div>
                    </div>
                  )})}
                </div>
              </CardContent>
            </Card>

            {/* Project Modules */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Project Modules
                </CardTitle>
                <CardDescription>
                  Modules that operate within specific projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: 'Dashboard', description: 'Project overview and key metrics dashboard', icon: 'dashboard' },
                    { name: 'Digital Twin', description: 'Digital representation and modeling tools', icon: 'digital-twin' },
                    { name: 'Cost & Contracts', description: 'Financial tracking and contract management', icon: 'cost' },
                    { name: 'Schedule', description: 'Project timeline and scheduling tools', icon: 'schedule' },
                    { name: 'Tasks', description: 'Task management and assignment within projects', icon: 'tasks' },
                    { name: 'Files', description: 'Project document and file management', icon: 'files' },
                    { name: 'Team', description: 'Team collaboration and member management', icon: 'team' },
                    { name: 'Digital Objects', description: 'Project asset and digital object management', icon: 'objects' }
                  ].map((module) => {
                    const adoptionCount = getModuleAdoptionStats(module.name.toLowerCase().replace(/\s+/g, '_'));
                    const adoptionRate = companies.length > 0 ? Math.round((adoptionCount / companies.length) * 100) : 0;
                    const isEnabled = adoptionCount > 0;
                    
                    return (
                      <div key={module.name} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-green-500/10">
                            {module.icon === 'dashboard' && <Home className="w-4 h-4 text-green-500" />}
                            {module.icon === 'digital-twin' && <Zap className="w-4 h-4 text-green-500" />}
                            {module.icon === 'cost' && <DollarSign className="w-4 h-4 text-green-500" />}
                            {module.icon === 'schedule' && <Calendar className="w-4 h-4 text-green-500" />}
                            {module.icon === 'tasks' && <CheckSquare className="w-4 h-4 text-green-500" />}
                            {module.icon === 'files' && <FolderOpen className="w-4 h-4 text-green-500" />}
                            {module.icon === 'team' && <User className="w-4 h-4 text-green-500" />}
                            {module.icon === 'objects' && <Eye className="w-4 h-4 text-green-500" />}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{module.name}</h4>
                            <p className="text-sm text-muted-foreground">{module.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {adoptionCount} companies ({adoptionRate}% adoption)
                            </p>
                          </div>
                        </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={isEnabled ? "default" : "secondary"}>
                          {isEnabled ? "Active" : "Inactive"}
                        </Badge>
                        <Button variant="outline" size="sm">
                          Configure
                        </Button>
                      </div>
                    </div>
                  )})}
                </div>
              </CardContent>
            </Card>
          </div>;
      case 'users':
        return <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Users & Roles</h2>
                <p className="text-muted-foreground">Manage global users and their permissions</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <UserCog className="w-4 h-4 mr-2" />
                  Manage Roles
                </Button>
                <Button>
                  <Users className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold">8,429</p>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold">127</p>
                    <p className="text-sm text-muted-foreground">Admins</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold">45</p>
                    <p className="text-sm text-muted-foreground">Support Agents</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold">156</p>
                    <p className="text-sm text-muted-foreground">Active Today</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent User Activity</CardTitle>
                <CardDescription>Latest user registrations and role changes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[{
                  user: "john.doe@techcorp.com",
                  action: "Role changed to Admin",
                  tenant: "TechCorp",
                  time: "2 min ago"
                }, {
                  user: "sarah.wilson@startup.ai",
                  action: "New user registered",
                  tenant: "StartupAI",
                  time: "15 min ago"
                }, {
                  user: "mike.jones@design.co",
                  action: "Permission updated",
                  tenant: "DesignStudio",
                  time: "1 hour ago"
                }].map((activity, index) => <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{activity.user}</p>
                          <p className="text-sm text-muted-foreground">{activity.action}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{activity.tenant}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>)}
                </div>
              </CardContent>
            </Card>
          </div>;
      case 'billing':
        return <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Billing Management</h2>
                <p className="text-muted-foreground">Manage subscriptions, payments, and billing</p>
              </div>
              <Button>
                <CreditCard className="w-4 h-4 mr-2" />
                Generate Invoice
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">$47.2k</p>
                    <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold">247</p>
                    <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold">$2.1k</p>
                    <p className="text-sm text-muted-foreground">Overdue Amount</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold">23</p>
                    <p className="text-sm text-muted-foreground">Trial Accounts</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[{
                    tenant: "TechCorp Inc.",
                    amount: "$299",
                    status: "paid",
                    date: "Today"
                  }, {
                    tenant: "StartupAI",
                    amount: "$99",
                    status: "paid",
                    date: "Yesterday"
                  }, {
                    tenant: "DesignStudio",
                    amount: "$49",
                    status: "pending",
                    date: "2 days ago"
                  }].map((transaction, index) => <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{transaction.tenant}</p>
                          <p className="text-sm text-muted-foreground">{transaction.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{transaction.amount}</p>
                          <Badge variant={transaction.status === 'paid' ? 'secondary' : 'outline'}>
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Subscription Plans</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Enterprise Plan</h4>
                        <span className="text-lg font-bold">$299/mo</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">Unlimited users, advanced features</p>
                      <div className="flex justify-between text-sm">
                        <span>Active subscriptions:</span>
                        <span>112</span>
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Professional Plan</h4>
                        <span className="text-lg font-bold">$99/mo</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">Up to 50 users, core features</p>
                      <div className="flex justify-between text-sm">
                        <span>Active subscriptions:</span>
                        <span>87</span>
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Basic Plan</h4>
                        <span className="text-lg font-bold">$49/mo</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">Up to 10 users, basic features</p>
                      <div className="flex justify-between text-sm">
                        <span>Active subscriptions:</span>
                        <span>48</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>;
      case 'settings':
        return <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Platform Settings</h2>
              <p className="text-muted-foreground">Configure platform-wide settings and preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Platform Name</label>
                    <input type="text" defaultValue="Enterprise Platform" className="w-full mt-1 px-3 py-2 border rounded-md" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Support Email</label>
                    <input type="email" defaultValue="support@platform.com" className="w-full mt-1 px-3 py-2 border rounded-md" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Default Timezone</label>
                    <select className="w-full mt-1 px-3 py-2 border rounded-md">
                      <option>UTC</option>
                      <option>EST</option>
                      <option>PST</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Feature Flags</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[{
                  name: "Multi-tenant Support",
                  enabled: true
                }, {
                  name: "Advanced Analytics",
                  enabled: true
                }, {
                  name: "API Rate Limiting",
                  enabled: false
                }, {
                  name: "SSO Integration",
                  enabled: true
                }, {
                  name: "Custom Branding",
                  enabled: false
                }].map((feature, index) => <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{feature.name}</span>
                      <Badge variant={feature.enabled ? 'default' : 'secondary'}>
                        {feature.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>)}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Integrations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5" />
                      <div>
                        <p className="font-medium">Stripe</p>
                        <p className="text-sm text-muted-foreground">Payment processing</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-500/10 text-green-600">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5" />
                      <div>
                        <p className="font-medium">SendGrid</p>
                        <p className="text-sm text-muted-foreground">Email delivery</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-500/10 text-green-600">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-5 h-5" />
                      <div>
                        <p className="font-medium">Analytics</p>
                        <p className="text-sm text-muted-foreground">Usage tracking</p>
                      </div>
                    </div>
                    <Badge variant="outline">Not Connected</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Localization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Default Language</label>
                    <select className="w-full mt-1 px-3 py-2 border rounded-md">
                      <option>English (US)</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Supported Languages</label>
                    <div className="mt-2 space-y-2">
                      {['English', 'Spanish', 'French'].map((lang, index) => <div key={index} className="flex items-center gap-2">
                          <input type="checkbox" defaultChecked />
                          <span className="text-sm">{lang}</span>
                        </div>)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Landing Page & Domain</CardTitle>
                  <CardDescription>Manage your public-facing landing page and domain settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium">Skrobakios.com</p>
                          <p className="text-sm text-green-600">Active - Connected to Landing Page</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-500/10 text-green-600">Live</Badge>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => onNavigate('landing')}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <Globe className="w-4 h-4 mr-2" />
                        View Landing Page
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => window.open('https://skrobakios.com', '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      <p><strong>Domain Status:</strong> SSL Certificate Active</p>
                      <p><strong>Last Updated:</strong> 2 hours ago</p>
                      <p><strong>Analytics:</strong> 1,247 visits this month</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>;
      case 'security':
        return <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Security & Logs</h2>
              <p className="text-muted-foreground">Monitor security events and manage compliance</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Failed Login Attempts</span>
                    <Badge variant="secondary" className="bg-red-500/10 text-red-600">23 today</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Sessions</span>
                    <Badge variant="secondary">1,247</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">2FA Enabled Users</span>
                    <Badge variant="secondary" className="bg-green-500/10 text-green-600">87%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Security Scan</span>
                    <Badge variant="secondary">2 hours ago</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Recent Security Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[{
                    event: "Failed login attempt",
                    user: "john.doe@example.com",
                    ip: "192.168.1.100",
                    time: "2 min ago",
                    severity: "medium"
                  }, {
                    event: "Password changed",
                    user: "sarah.wilson@company.com",
                    ip: "10.0.0.15",
                    time: "15 min ago",
                    severity: "low"
                  }, {
                    event: "Suspicious API calls",
                    user: "api-user-123",
                    ip: "203.0.113.5",
                    time: "1 hour ago",
                    severity: "high"
                  }, {
                    event: "2FA enabled",
                    user: "mike.jones@startup.io",
                    ip: "192.168.1.50",
                    time: "2 hours ago",
                    severity: "low"
                  }].map((event, index) => <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-1 rounded-full ${event.severity === 'high' ? 'bg-red-500/10' : event.severity === 'medium' ? 'bg-yellow-500/10' : 'bg-green-500/10'}`}>
                            <Lock className={`w-3 h-3 ${event.severity === 'high' ? 'text-red-600' : event.severity === 'medium' ? 'text-yellow-600' : 'text-green-600'}`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{event.event}</p>
                            <p className="text-xs text-muted-foreground">{event.user} from {event.ip}</p>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">{event.time}</span>
                      </div>)}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">GDPR Compliance</span>
                    <Badge variant="secondary" className="bg-green-500/10 text-green-600">Compliant</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">SOC 2 Type II</span>
                    <Badge variant="secondary" className="bg-green-500/10 text-green-600">Certified</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">ISO 27001</span>
                    <Badge variant="outline">In Progress</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Data Retention</span>
                    <Badge variant="secondary">90 days</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Backup</span>
                    <Badge variant="secondary" className="bg-green-500/10 text-green-600">6 hours ago</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Access Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">IP Restrictions</label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">192.168.1.0/24</span>
                        <Badge variant="secondary">Allowed</Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">10.0.0.0/16</span>
                        <Badge variant="secondary">Allowed</Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Session Settings</label>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Session Timeout</span>
                        <span className="text-sm">4 hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Concurrent Sessions</span>
                        <span className="text-sm">3 max</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>;
      case 'support':
        return <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Support Center</h2>
                <p className="text-muted-foreground">Manage customer support and tickets</p>
              </div>
              <Button>
                <HelpCircle className="w-4 h-4 mr-2" />
                Create Ticket
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">23</p>
                    <p className="text-sm text-muted-foreground">Open Tickets</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">8</p>
                    <p className="text-sm text-muted-foreground">Pending Review</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">156</p>
                    <p className="text-sm text-muted-foreground">Resolved Today</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold">2.3h</p>
                    <p className="text-sm text-muted-foreground">Avg Response Time</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[{
                    id: "#12345",
                    subject: "Login issues with SSO",
                    customer: "TechCorp Inc.",
                    priority: "high",
                    status: "open"
                  }, {
                    id: "#12344",
                    subject: "Feature request: Export functionality",
                    customer: "StartupAI",
                    priority: "low",
                    status: "pending"
                  }, {
                    id: "#12343",
                    subject: "Billing inquiry",
                    customer: "DesignStudio",
                    priority: "medium",
                    status: "resolved"
                  }, {
                    id: "#12342",
                    subject: "Performance issues",
                    customer: "ConsultingPro",
                    priority: "high",
                    status: "open"
                  }].map((ticket, index) => <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{ticket.id}</p>
                          <p className="text-sm text-muted-foreground">{ticket.subject}</p>
                          <p className="text-xs text-muted-foreground">{ticket.customer}</p>
                        </div>
                        <div className="text-right space-y-1">
                          <Badge variant={ticket.priority === 'high' ? 'destructive' : ticket.priority === 'medium' ? 'default' : 'secondary'}>
                            {ticket.priority}
                          </Badge>
                          <div>
                            <Badge variant={ticket.status === 'resolved' ? 'secondary' : 'outline'}>
                              {ticket.status}
                            </Badge>
                          </div>
                        </div>
                      </div>)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Support Team</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[{
                    name: "Sarah Johnson",
                    role: "Senior Support",
                    tickets: 12,
                    status: "online"
                  }, {
                    name: "Mike Chen",
                    role: "Support Agent",
                    tickets: 8,
                    status: "busy"
                  }, {
                    name: "Emily Davis",
                    role: "Support Agent",
                    tickets: 15,
                    status: "online"
                  }, {
                    name: "David Wilson",
                    role: "Support Lead",
                    tickets: 6,
                    status: "away"
                  }].map((agent, index) => <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${agent.status === 'online' ? 'bg-green-500' : agent.status === 'busy' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                          <div>
                            <p className="font-medium">{agent.name}</p>
                            <p className="text-sm text-muted-foreground">{agent.role}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{agent.tickets} tickets</p>
                          <p className="text-xs text-muted-foreground">{agent.status}</p>
                        </div>
                      </div>)}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>;
      default:
        return <div>Select a section from the sidebar</div>;
    }
  };
  return <SidebarProvider>
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
              <SidebarGroupLabel>Administration</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map(item => <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton onClick={() => setActiveSection(item.id)} className={activeSection === item.id ? "bg-primary/10 text-primary" : ""}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>)}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Logout */}
            <div className="mt-auto p-4 border-t border-border">
              <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-muted-foreground hover:text-foreground">
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
            <h1 className="text-xl font-semibold text-foreground">
              {navigationItems.find(item => item.id === activeSection)?.title || 'Platform Dashboard'}
            </h1>
          </header>

          {/* Content */}
          <div className="flex-1 p-6 bg-background overflow-auto">
            <div className="max-w-7xl mx-auto">
              {renderDashboardContent()}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>;
};