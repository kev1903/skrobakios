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
    activeProjects: 3, // Sample data from the image
    totalEarnings: 15420, // Sample data from the image  
    averageRating: 4.7, // Sample data from the image
    profileViews: 0,
    proposalsSent: 12 // Sample data from the image (completed projects)
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'project',
      title: 'Project completed',
      description: 'Website redesign for TechCorp',
      timestamp: '2h ago',
      status: 'completed'
    },
    {
      id: '2', 
      type: 'proposal',
      title: 'New proposal submitted',
      description: 'Mobile app development',
      timestamp: '1d ago',
      status: 'pending'
    },
    {
      id: '3',
      type: 'payment',
      title: 'Payment received',
      description: '$2,500.00 from client',
      timestamp: '2d ago',
      status: 'completed'
    }
  ]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header matching the image */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Platform Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back! Here's what's happening on your platform.
            </p>
          </div>
          <Button 
            onClick={() => onNavigate('project-dashboard')} 
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Post Project
          </Button>
        </div>

        {/* Key Metrics - matching the image layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Briefcase className="w-5 h-5 text-blue-600" />
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
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{stats.proposalsSent}</p>
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

        {/* Navigation Tabs - matching the image */}
        <div className="flex space-x-8 border-b border-gray-200">
          <button 
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'find-work' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('find-work')}
          >
            Find Work
          </button>
          <button 
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'browse-services' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('browse-services')}
          >
            Browse Services
          </button>
          <button 
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'my-work' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('my-work')}
          >
            My Work
          </button>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Overview Tab Content */}
          {activeTab === 'overview' && (
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
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Eye className="w-4 h-4 mr-2" />
                    Browse Available Projects
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Service
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    View Messages
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Other tab contents would go here */}
          {activeTab === 'find-work' && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Find Work</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Browse available projects and opportunities.</p>
              </CardContent>
            </Card>
          )}

          {activeTab === 'browse-services' && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Browse Services</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Explore services offered by other professionals.</p>
              </CardContent>
            </Card>
          )}

          {activeTab === 'my-work' && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>My Work</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Manage your active projects and assignments.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Success notification like in the image */}
        <div className="fixed bottom-6 right-6 max-w-sm">
          <Card className="glass-card shadow-lg border-green-200 bg-green-50/90 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <div>
                  <p className="text-sm font-medium text-green-800">Success</p>
                  <p className="text-xs text-green-600">Successfully logged in to Platform</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};