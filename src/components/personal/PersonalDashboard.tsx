import React, { useState, useEffect } from 'react';
import { User, Briefcase, Star, Calendar, TrendingUp, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/contexts/UserContext';
import { useCompany } from '@/contexts/CompanyContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface PersonalDashboardProps {
  onNavigate: (page: string) => void;
}

export const PersonalDashboard = ({ onNavigate }: PersonalDashboardProps) => {
  const { userProfile, loading: userLoading } = useUser();
  const { companies, loading: companyLoading } = useCompany();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [portfolioCount, setPortfolioCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      console.log('PersonalDashboard fetchData - authLoading:', authLoading, 'isAuthenticated:', isAuthenticated, 'userLoading:', userLoading, 'companyLoading:', companyLoading);
      
      // Wait for auth to finish loading first
      if (authLoading) {
        return;
      }
      
      // If not authenticated, set loading to false immediately
      if (!isAuthenticated) {
        console.log('PersonalDashboard - Not authenticated, skipping data fetch');
        setDataLoading(false);
        return;
      }
      
      // If authenticated, wait for contexts to load
      if (!userLoading && !companyLoading) {
        console.log('PersonalDashboard - Starting data fetch');
        setDataLoading(true);
        await Promise.all([fetchPortfolioCount(), fetchReviewCount()]);
        console.log('PersonalDashboard - Data fetch completed');
        setDataLoading(false);
      }
    };
    
    fetchData();
  }, [authLoading, isAuthenticated, userLoading, companyLoading]);

  const fetchPortfolioCount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { count, error } = await supabase
          .from('portfolio_items')
          .select('*', { count: 'exact', head: true })
          .eq('owner_id', user.id)
          .eq('owner_type', 'user');

        if (error) throw error;
        setPortfolioCount(count || 0);
      }
    } catch (error) {
      console.error('Error fetching portfolio count:', error);
    }
  };

  const fetchReviewCount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { count, error } = await supabase
          .from('reviews')
          .select('*', { count: 'exact', head: true })
          .eq('reviewee_id', user.id)
          .eq('reviewee_type', 'user')
          .eq('status', 'active');

        if (error) throw error;
        setReviewCount(count || 0);
      }
    } catch (error) {
      console.error('Error fetching review count:', error);
    }
  };

  // Show loading state while contexts are loading or data is fetching
  console.log('PersonalDashboard render - authLoading:', authLoading, 'isAuthenticated:', isAuthenticated, 'userLoading:', userLoading, 'companyLoading:', companyLoading, 'dataLoading:', dataLoading);
  if (authLoading || (isAuthenticated && (userLoading || companyLoading)) || dataLoading) {
    console.log('PersonalDashboard - Showing loading state');
    return (
      <div className="space-y-8 animate-pulse">
        {/* Header skeleton */}
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 bg-white/20 rounded-full"></div>
          <div>
            <div className="h-8 w-48 bg-white/20 rounded mb-2"></div>
            <div className="h-4 w-32 bg-white/20 rounded mb-2"></div>
            <div className="flex space-x-2">
              <div className="h-6 w-24 bg-white/20 rounded"></div>
              <div className="h-6 w-20 bg-white/20 rounded"></div>
            </div>
          </div>
        </div>
        
        {/* Stats skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white/10 backdrop-blur-md border-white/20 rounded-lg p-6">
              <div className="h-4 w-16 bg-white/20 rounded mb-2"></div>
              <div className="h-8 w-12 bg-white/20 rounded mb-1"></div>
              <div className="h-3 w-24 bg-white/20 rounded"></div>
            </div>
          ))}
        </div>
        
        {/* Quick actions skeleton */}
        <div>
          <div className="h-6 w-32 bg-white/20 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md border-white/20 rounded-lg p-6">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-white/20 rounded-lg"></div>
                  <div>
                    <div className="h-4 w-20 bg-white/20 rounded mb-1"></div>
                    <div className="h-3 w-32 bg-white/20 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Companies',
      value: companies.length,
      description: 'Organizations you belong to',
      icon: Briefcase,
      action: () => onNavigate('companies')
    },
    {
      title: 'Portfolio Items',
      value: portfolioCount,
      description: 'Projects in your portfolio',
      icon: Star,
      action: () => onNavigate('portfolio')
    },
    {
      title: 'Reviews',
      value: reviewCount,
      description: 'Reviews received',
      icon: TrendingUp,
      action: () => onNavigate('reviews')
    },
    {
      title: 'Upcoming',
      value: '0', // Placeholder for now
      description: 'Scheduled activities',
      icon: Calendar,
      action: () => onNavigate('calendar')
    }
  ];

  const quickActions = [
    {
      title: 'View Profile',
      description: 'View your personal information',
      icon: User,
      action: () => onNavigate('personal')
    },
    {
      title: 'Manage Portfolio',
      description: 'Add or edit your portfolio items',
      icon: Star,
      action: () => onNavigate('portfolio-manage')
    },
    {
      title: 'Settings',
      description: 'Configure your preferences',
      icon: Settings,
      action: () => onNavigate('settings')
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={userProfile.avatarUrl} alt={userProfile.firstName || 'User'} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold text-white">
              Welcome back, {userProfile.firstName || 'User'}!
            </h1>
            <p className="text-white/70">
              {userProfile.jobTitle ? (
                <>
                  {userProfile.jobTitle}
                  {userProfile.location && ` • ${userProfile.location}`}
                </>
              ) : (
                'Complete your profile to get started'
              )}
            </p>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant="secondary" className="bg-white/20 text-white">
                Personal Workspace
              </Badge>
              {companies.length > 0 && (
                <Badge variant="outline" className="border-white/30 text-white">
                  {companies.length} {companies.length === 1 ? 'Company' : 'Companies'}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card 
              key={index} 
              className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-colors cursor-pointer"
              onClick={stat.action}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  {stat.title}
                </CardTitle>
                <IconComponent className="h-4 w-4 text-white/70" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <p className="text-xs text-white/70">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <Card 
                key={index}
                className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-colors cursor-pointer"
                onClick={action.action}
              >
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-sm">{action.title}</CardTitle>
                      <CardDescription className="text-white/70 text-xs">
                        {action.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Recent Activity</CardTitle>
          <CardDescription className="text-white/70">
            Your latest updates and interactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-white/70">No recent activity to display</p>
            <Button 
              variant="outline" 
              className="mt-4 border-white/30 text-white hover:bg-white/20"
              onClick={() => onNavigate('activity')}
            >
              View All Activity
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};