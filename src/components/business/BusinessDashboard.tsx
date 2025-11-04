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
import { useScreenSize } from '@/hooks/use-mobile';
import { MobileLayout, MobileContent, MobileScrollContainer } from '@/components/MobileLayout';
import { cn } from '@/lib/utils';

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
  const screenSize = useScreenSize();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  const isMobile = screenSize === 'mobile' || screenSize === 'mobile-small';
  const isTablet = screenSize === 'tablet';
  
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
    <MobileLayout withSafeArea={isMobile} fullHeight={false}>
      <MobileScrollContainer className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
        <MobileContent 
          withPadding={false}
          className={cn(
            "space-y-6",
            isMobile ? "p-4" : isTablet ? "p-5" : "container mx-auto p-6 space-y-8"
          )}
        >
          {/* Header */}
          <div className={cn(
            "flex items-start gap-4",
            isMobile ? "flex-col" : "flex-row justify-between items-center"
          )}>
            <div className="flex-1">
              <h1 className={cn(
                "font-bold text-foreground",
                isMobile ? "text-2xl" : "text-3xl"
              )}>
                Platform Dashboard
              </h1>
              <p className={cn(
                "text-muted-foreground mt-1",
                isMobile ? "text-sm" : "text-base"
              )}>
                Welcome back! Here's what's happening on your platform.
              </p>
            </div>
            <Button 
              onClick={() => onNavigate('project-dashboard')} 
              className={cn(
                "bg-blue-600 hover:bg-blue-700 text-white",
                isMobile && "w-full"
              )}
              size={isMobile ? "default" : "default"}
            >
              <Plus className="w-4 h-4 mr-2" />
              Post Project
            </Button>
          </div>

          {/* Key Metrics */}
          <div className={cn(
            "grid gap-4",
            isMobile ? "grid-cols-1" : isTablet ? "grid-cols-2" : "grid-cols-4"
          )}>
            <Card className="glass-card">
              <CardContent className={cn(isMobile ? "p-4" : "p-6")}>
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Projects</p>
                    <p className={cn("font-bold", isMobile ? "text-xl" : "text-2xl")}>
                      {stats.activeProjects}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className={cn(isMobile ? "p-4" : "p-6")}>
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className={cn("font-bold", isMobile ? "text-xl" : "text-2xl")}>
                      {stats.proposalsSent}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className={cn(isMobile ? "p-4" : "p-6")}>
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-lg bg-yellow-500/10">
                    <DollarSign className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Earnings</p>
                    <p className={cn("font-bold", isMobile ? "text-xl" : "text-2xl")}>
                      {formatCurrency(stats.totalEarnings)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardContent className={cn(isMobile ? "p-4" : "p-6")}>
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Star className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Rating</p>
                    <p className={cn("font-bold", isMobile ? "text-xl" : "text-2xl")}>
                      {stats.averageRating}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Navigation Tabs */}
          <div className={cn(
            "flex border-b border-gray-200",
            isMobile ? "space-x-4 overflow-x-auto scrollbar-thin" : "space-x-8"
          )}>
            <button 
              className={cn(
                "py-2 border-b-2 font-medium text-sm whitespace-nowrap",
                isMobile ? "px-0" : "px-1",
                activeTab === 'overview' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={cn(
                "py-2 border-b-2 font-medium text-sm whitespace-nowrap",
                isMobile ? "px-0" : "px-1",
                activeTab === 'find-work' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
              onClick={() => setActiveTab('find-work')}
            >
              Find Work
            </button>
            <button 
              className={cn(
                "py-2 border-b-2 font-medium text-sm whitespace-nowrap",
                isMobile ? "px-0" : "px-1",
                activeTab === 'browse-services' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
              onClick={() => setActiveTab('browse-services')}
            >
              Browse Services
            </button>
            <button 
              className={cn(
                "py-2 border-b-2 font-medium text-sm whitespace-nowrap",
                isMobile ? "px-0" : "px-1",
                activeTab === 'my-work' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
              onClick={() => setActiveTab('my-work')}
            >
              My Work
            </button>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Overview Tab Content */}
            {activeTab === 'overview' && (
              <div className={cn(
                "grid gap-6",
                isMobile || isTablet ? "grid-cols-1" : "grid-cols-2"
              )}>
                {/* Recent Activity */}
                <Card className="glass-card">
                  <CardHeader className={cn(isMobile ? "p-4" : "p-6")}>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <TrendingUp className="w-5 h-5" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className={cn("space-y-3", isMobile ? "p-4 pt-0" : "px-6 pb-6")}>
                    {recentActivity.map((activity) => (
                      <div 
                        key={activity.id} 
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-lg bg-muted/50",
                          isMobile && "flex-col space-y-2"
                        )}
                      >
                        <div className={cn(
                          "flex items-center gap-3",
                          isMobile ? "w-full" : "flex-1"
                        )}>
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            activity.type === 'project' ? 'bg-green-500' :
                            activity.type === 'proposal' ? 'bg-blue-500' :
                            activity.type === 'message' ? 'bg-yellow-500' : 'bg-purple-500'
                          }`}></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{activity.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {activity.description}
                            </p>
                          </div>
                        </div>
                        <span className={cn(
                          "text-xs text-muted-foreground whitespace-nowrap",
                          isMobile && "self-end"
                        )}>
                          {activity.timestamp}
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="glass-card">
                  <CardHeader className={cn(isMobile ? "p-4" : "p-6")}>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Building2 className="w-5 h-5" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className={cn("space-y-3", isMobile ? "p-4 pt-0" : "px-6 pb-6")}>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      size={isMobile ? "default" : "default"}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Browse Available Projects
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      size={isMobile ? "default" : "default"}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Service
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      size={isMobile ? "default" : "default"}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      View Messages
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      size={isMobile ? "default" : "default"}
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      View Analytics
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Other tab contents */}
            {activeTab === 'find-work' && (
              <Card className="glass-card">
                <CardHeader className={cn(isMobile ? "p-4" : "p-6")}>
                  <CardTitle className="text-base">Find Work</CardTitle>
                </CardHeader>
                <CardContent className={cn(isMobile ? "p-4 pt-0" : "px-6 pb-6")}>
                  <p className="text-muted-foreground text-sm">
                    Browse available projects and opportunities.
                  </p>
                </CardContent>
              </Card>
            )}

            {activeTab === 'browse-services' && (
              <Card className="glass-card">
                <CardHeader className={cn(isMobile ? "p-4" : "p-6")}>
                  <CardTitle className="text-base">Browse Services</CardTitle>
                </CardHeader>
                <CardContent className={cn(isMobile ? "p-4 pt-0" : "px-6 pb-6")}>
                  <p className="text-muted-foreground text-sm">
                    Explore services offered by other professionals.
                  </p>
                </CardContent>
              </Card>
            )}

            {activeTab === 'my-work' && (
              <Card className="glass-card">
                <CardHeader className={cn(isMobile ? "p-4" : "p-6")}>
                  <CardTitle className="text-base">My Work</CardTitle>
                </CardHeader>
                <CardContent className={cn(isMobile ? "p-4 pt-0" : "px-6 pb-6")}>
                  <p className="text-muted-foreground text-sm">
                    Manage your active projects and assignments.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Success notification - hide on mobile for better UX */}
          {!isMobile && (
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
          )}

        </MobileContent>
      </MobileScrollContainer>
    </MobileLayout>
  );
};