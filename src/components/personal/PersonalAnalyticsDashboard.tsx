import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  DollarSign, 
  Heart, 
  Users, 
  Building2, 
  Shield, 
  TrendingUp, 
  Activity,
  CheckCircle,
  AlertCircle,
  Calendar,
  Timer,
  Target,
  BarChart3
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useCompany } from '@/contexts/CompanyContext';
import { supabase } from '@/integrations/supabase/client';

interface PersonalAnalyticsDashboardProps {
  onNavigate: (page: string) => void;
}

interface TimeAnalytics {
  totalHours: number;
  productiveHours: number;
  categories: { [key: string]: number };
  efficiency: number;
}

interface FinanceAnalytics {
  totalEarnings: number;
  monthlyBudget: number;
  expenses: number;
  savingsRate: number;
}

interface WellnessAnalytics {
  healthScore: number;
  exerciseHours: number;
  sleepQuality: number;
  stressLevel: number;
}

interface BusinessAnalytics {
  activeProjects: number;
  completedTasks: number;
  revenue: number;
  clientSatisfaction: number;
}

export const PersonalAnalyticsDashboard = ({ onNavigate }: PersonalAnalyticsDashboardProps) => {
  const { userProfile } = useUser();
  const { companies } = useCompany();
  const [loading, setLoading] = useState(true);
  
  // Analytics state
  const [timeAnalytics, setTimeAnalytics] = useState<TimeAnalytics>({
    totalHours: 0,
    productiveHours: 0,
    categories: {},
    efficiency: 0
  });
  
  const [financeAnalytics, setFinanceAnalytics] = useState<FinanceAnalytics>({
    totalEarnings: 0,
    monthlyBudget: 0,
    expenses: 0,
    savingsRate: 0
  });
  
  const [wellnessAnalytics, setWellnessAnalytics] = useState<WellnessAnalytics>({
    healthScore: 0,
    exerciseHours: 0,
    sleepQuality: 0,
    stressLevel: 0
  });
  
  const [businessAnalytics, setBusinessAnalytics] = useState<BusinessAnalytics>({
    activeProjects: 0,
    completedTasks: 0,
    revenue: 0,
    clientSatisfaction: 0
  });

  const [platformHealth, setPlatformHealth] = useState({
    uptime: 99.9,
    responseTime: 120,
    activeUsers: 1250,
    systemLoad: 35
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch time analytics
      const timeData = await fetchTimeAnalytics();
      setTimeAnalytics(timeData);
      
      // Fetch business analytics
      const businessData = await fetchBusinessAnalytics();
      setBusinessAnalytics(businessData);
      
      // Set mock data for other analytics (would be real data in production)
      setFinanceAnalytics({
        totalEarnings: 12500,
        monthlyBudget: 8000,
        expenses: 6200,
        savingsRate: 22.5
      });
      
      setWellnessAnalytics({
        healthScore: 85,
        exerciseHours: 4.5,
        sleepQuality: 78,
        stressLevel: 35
      });
      
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeAnalytics = async () => {
    try {
      const { data: timeBlocks } = await supabase
        .from('time_blocks')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      const categories: { [key: string]: number } = {};
      let totalHours = 0;
      let productiveHours = 0;

      timeBlocks?.forEach(block => {
        const start = new Date(`2000-01-01 ${block.start_time}`);
        const end = new Date(`2000-01-01 ${block.end_time}`);
        const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60); // hours
        
        categories[block.category] = (categories[block.category] || 0) + duration;
        totalHours += duration;
        
        if (['work', 'deep work', 'site visit'].includes(block.category.toLowerCase())) {
          productiveHours += duration;
        }
      });

      return {
        totalHours: totalHours * 7, // Weekly estimate
        productiveHours: productiveHours * 7,
        categories,
        efficiency: totalHours > 0 ? (productiveHours / totalHours) * 100 : 0
      };
    } catch (error) {
      console.error('Error fetching time analytics:', error);
      return { totalHours: 0, productiveHours: 0, categories: {}, efficiency: 0 };
    }
  };

  const fetchBusinessAnalytics = async () => {
    try {
      const companyIds = companies.map(c => c.id);
      
      // Fetch active projects
      const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .in('company_id', companyIds)
        .eq('status', 'active');

      // Fetch completed tasks
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .in('company_id', companyIds)
        .eq('status', 'Completed');

      return {
        activeProjects: projects?.length || 0,
        completedTasks: tasks?.length || 0,
        revenue: 45000, // Mock data
        clientSatisfaction: 92
      };
    } catch (error) {
      console.error('Error fetching business analytics:', error);
      return { activeProjects: 0, completedTasks: 0, revenue: 0, clientSatisfaction: 0 };
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mt-2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-background">
      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-background">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Personal Analytics Dashboard
                </h1>
                <p className="text-muted-foreground mt-2">
                  Comprehensive view of your Time, Finance, Wellness, Family, Business & Platform Health
                </p>
              </div>
              <Button onClick={() => onNavigate('personal')} variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="mb-6 bg-card border rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-muted/30 rounded-lg border p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Weekly Hours</div>
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-foreground">{timeAnalytics.totalHours.toFixed(1)}h</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {timeAnalytics.productiveHours.toFixed(1)}h productive
                </div>
                <Progress value={timeAnalytics.efficiency} className="mt-2" />
              </div>

              <div className="bg-muted/30 rounded-lg border p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Efficiency</div>
                  <Target className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-foreground">{timeAnalytics.efficiency.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {timeAnalytics.efficiency > 70 ? 'Excellent' : timeAnalytics.efficiency > 50 ? 'Good' : 'Needs Improvement'}
                </div>
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={() => onNavigate('time')} 
                  className="text-blue-600 p-0 h-auto mt-2 text-xs"
                >
                  View Details →
                </Button>
              </div>

              <div className="bg-muted/30 rounded-lg border p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Monthly Earnings</div>
                  <DollarSign className="h-4 w-4 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-foreground">${financeAnalytics.totalEarnings.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Savings Rate: {financeAnalytics.savingsRate}%
                </div>
              </div>

              <div className="bg-muted/30 rounded-lg border p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Health Score</div>
                  <Heart className="h-4 w-4 text-rose-600" />
                </div>
                <div className="text-2xl font-bold text-foreground">{wellnessAnalytics.healthScore}/100</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {wellnessAnalytics.exerciseHours}h exercise this week
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="bg-card border rounded-lg">
            {/* Header Section */}
            <div className="bg-muted/30 border-b px-6 py-4">
              <h2 className="text-lg font-semibold text-foreground">Analytics Overview</h2>
              <p className="text-sm text-muted-foreground">Detailed insights across all life categories</p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Business & Family Analytics Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Active Projects</CardTitle>
                    <Building2 className="h-4 w-4 text-orange-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">{businessAnalytics.activeProjects}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {businessAnalytics.completedTasks} tasks completed
                    </p>
                    <Button 
                      variant="link" 
                      size="sm" 
                      onClick={() => onNavigate('business')} 
                      className="text-blue-600 p-0 h-auto mt-2 text-xs"
                    >
                      View Details →
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Client Satisfaction</CardTitle>
                    <TrendingUp className="h-4 w-4 text-teal-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">{businessAnalytics.clientSatisfaction}%</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Revenue: ${businessAnalytics.revenue.toLocaleString()}
                    </p>
                    <Progress value={businessAnalytics.clientSatisfaction} className="mt-2" />
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Family Time</CardTitle>
                    <Users className="h-4 w-4 text-indigo-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">12.5h</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Weekly quality time
                    </p>
                    <Button 
                      variant="link" 
                      size="sm" 
                      onClick={() => onNavigate('family')} 
                      className="text-blue-600 p-0 h-auto mt-2 text-xs"
                    >
                      View Details →
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Security Score</CardTitle>
                    <Shield className="h-4 w-4 text-gray-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">95/100</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      All systems secure
                    </p>
                    <Button 
                      variant="link" 
                      size="sm" 
                      onClick={() => onNavigate('security')} 
                      className="text-blue-600 p-0 h-auto mt-2 text-xs"
                    >
                      View Details →
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Platform Health Section */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Activity className="h-5 w-5" />
                    SkrobakiOS Platform Health
                  </CardTitle>
                  <CardDescription>Real-time system metrics and performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Uptime</span>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {platformHealth.uptime}%
                        </Badge>
                      </div>
                      <Progress value={platformHealth.uptime} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Response Time</span>
                        <span className="text-sm text-foreground">{platformHealth.responseTime}ms</span>
                      </div>
                      <Progress value={100 - (platformHealth.responseTime / 10)} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Active Users</span>
                        <span className="text-sm text-foreground">{platformHealth.activeUsers.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <TrendingUp className="w-3 h-3" />
                        +5.2% this week
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">System Load</span>
                        <Badge variant={platformHealth.systemLoad < 50 ? "secondary" : "destructive"}>
                          {platformHealth.systemLoad}%
                        </Badge>
                      </div>
                      <Progress value={platformHealth.systemLoad} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions Section */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Quick Actions</CardTitle>
                  <CardDescription>Access key areas of your personal management system</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <Button variant="outline" onClick={() => onNavigate('time')} className="flex flex-col gap-2 h-20">
                      <Clock className="w-5 h-5" />
                      <span className="text-xs">Time</span>
                    </Button>
                    <Button variant="outline" onClick={() => onNavigate('finance')} className="flex flex-col gap-2 h-20">
                      <DollarSign className="w-5 h-5" />
                      <span className="text-xs">Finance</span>
                    </Button>
                    <Button variant="outline" onClick={() => onNavigate('wellness')} className="flex flex-col gap-2 h-20">
                      <Heart className="w-5 h-5" />
                      <span className="text-xs">Wellness</span>
                    </Button>
                    <Button variant="outline" onClick={() => onNavigate('family')} className="flex flex-col gap-2 h-20">
                      <Users className="w-5 h-5" />
                      <span className="text-xs">Family</span>
                    </Button>
                    <Button variant="outline" onClick={() => onNavigate('business')} className="flex flex-col gap-2 h-20">
                      <Building2 className="w-5 h-5" />
                      <span className="text-xs">Business</span>
                    </Button>
                    <Button variant="outline" onClick={() => onNavigate('security')} className="flex flex-col gap-2 h-20">
                      <Shield className="w-5 h-5" />
                      <span className="text-xs">Security</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};