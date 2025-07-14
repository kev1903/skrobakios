import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Building2, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Star,
  Briefcase,
  MessageSquare,
  Calendar,
  Settings,
  Plus,
  Eye,
  FileText,
  Award
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/contexts/CompanyContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ServiceManagement } from './ServiceManagement';
import { BusinessOnboardingWizard } from './BusinessOnboardingWizard';

interface BusinessDashboardProps {
  onNavigate: (page: string) => void;
}

interface BusinessStats {
  totalServices: number;
  activeProjects: number;
  totalEarnings: number;
  averageRating: number;
  profileViews: number;
  proposalsSent: number;
}

interface RecentActivity {
  id: string;
  type: 'project' | 'proposal' | 'message' | 'payment';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
}

export const BusinessDashboard = ({ onNavigate }: BusinessDashboardProps) => {
  const { user } = useAuth();
  const { currentCompany, switchCompany } = useCompany();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  const [stats, setStats] = useState<BusinessStats>({
    totalServices: 0,
    activeProjects: 0,
    totalEarnings: 0,
    averageRating: 0,
    profileViews: 0,
    proposalsSent: 0
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  useEffect(() => {
    if (currentCompany && 'onboarding_completed' in currentCompany && currentCompany.onboarding_completed === false) {
      setShowOnboarding(true);
    } else {
      loadDashboardData();
    }
  }, [currentCompany]);

  const loadDashboardData = async () => {
    if (!user || !currentCompany) return;
    
    setLoading(true);
    try {
      // Load services count
      const { data: servicesData } = await supabase
        .from('services')
        .select('id, is_active')
        .eq('provider_id', user.id);

      // Load proposals count
      const { data: proposalsData } = await supabase
        .from('proposals')
        .select('id, status')
        .eq('provider_id', user.id);

      // Load portfolio items
      const { data: portfolioData } = await supabase
        .from('portfolio_items')
        .select('id')
        .eq('owner_id', user.id)
        .eq('owner_type', 'user');

      setStats({
        totalServices: servicesData?.length || 0,
        activeProjects: 3, // Mock data
        totalEarnings: 15420, // Mock data  
        averageRating: 4.7, // Mock data
        profileViews: 124, // Mock data
        proposalsSent: proposalsData?.length || 0
      });

      // Mock recent activity
      setRecentActivity([
        {
          id: '1',
          type: 'proposal',
          title: 'New proposal submitted',
          description: 'Website redesign project for TechCorp',
          timestamp: '2h ago',
          status: 'pending'
        },
        {
          id: '2',
          type: 'message',
          title: 'New message received',
          description: 'Client inquiry about mobile app development',
          timestamp: '5h ago'
        },
        {
          id: '3',
          type: 'project',
          title: 'Project milestone completed',
          description: 'Design phase completed for StartupCo',
          timestamp: '1d ago',
          status: 'completed'
        }
      ]);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    loadDashboardData();
    toast({
      title: "Welcome!",
      description: "Your business profile is now live and ready to attract clients.",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (showOnboarding) {
    return (
      <BusinessOnboardingWizard
        onComplete={handleOnboardingComplete}
        onCancel={() => onNavigate('platform-dashboard')}
      />
    );
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={currentCompany?.logo_url} />
              <AvatarFallback className="text-lg">
                {getInitials(currentCompany?.name || 'Business')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-gradient">
                {currentCompany?.name || 'Business Dashboard'}
              </h1>
              <p className="text-muted-foreground">
                Manage your business and grow your client base
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={() => onNavigate(`company/${currentCompany?.id}/edit`)}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Services</p>
                  <p className="text-2xl font-bold">{stats.totalServices}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Projects</p>
                  <p className="text-2xl font-bold">{stats.activeProjects}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <DollarSign className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalEarnings)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Star className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p className="text-2xl font-bold">{stats.averageRating}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="proposals">Proposals</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'project' ? 'bg-green-500' :
                        activity.type === 'proposal' ? 'bg-blue-500' :
                        activity.type === 'message' ? 'bg-yellow-500' : 'bg-purple-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.description}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Business Tools
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab('services')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Service
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => onNavigate('portfolio-manage')}>
                    <FileText className="w-4 h-4 mr-2" />
                    Manage Portfolio
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    View Messages
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Eye className="w-4 h-4 mr-2" />
                    View Public Profile
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services">
            <ServiceManagement onNavigate={onNavigate} />
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Active Projects</CardTitle>
                <CardDescription>Track your ongoing work</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No active projects</h3>
                  <p className="text-muted-foreground mb-4">Start applying to projects to see them here</p>
                  <Button onClick={() => onNavigate('platform-dashboard')}>
                    Browse Projects
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Proposals Tab */}
          <TabsContent value="proposals" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Proposal History</CardTitle>
                <CardDescription>Track your submitted proposals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No proposals submitted</h3>
                  <p className="text-muted-foreground mb-4">Start bidding on projects to track proposals here</p>
                  <Button onClick={() => onNavigate('platform-dashboard')}>
                    Find Projects
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg">Profile Views</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{stats.profileViews}</div>
                  <p className="text-sm text-muted-foreground">This month</p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg">Proposals Sent</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{stats.proposalsSent}</div>
                  <p className="text-sm text-muted-foreground">Total submitted</p>
                </CardContent>
              </Card>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-lg">Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">23%</div>
                  <p className="text-sm text-muted-foreground">Proposal to project</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};