import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign,
  Building2,
  Users,
  Target
} from 'lucide-react';

export const SalesDashboard = () => {
  // Mock data for Sales & Marketing Dashboard
  const dashboardStats = {
    totalRevenue: 2847000,
    monthlyGrowth: 18.5,
    activeCampaigns: 12,
    conversionRate: 24.8,
    pipelineValue: 4250000,
    dealsWon: 34,
    avgDealSize: 83735,
    marketingROI: 287
  };

  const salesPerformance = [
    { month: 'Jan', revenue: 245000, target: 280000, deals: 8 },
    { month: 'Feb', revenue: 298000, target: 290000, deals: 10 },
    { month: 'Mar', revenue: 325000, target: 300000, deals: 11 },
    { month: 'Apr', revenue: 412000, target: 350000, deals: 14 },
    { month: 'May', revenue: 478000, target: 380000, deals: 16 },
    { month: 'Jun', revenue: 523000, target: 420000, deals: 18 }
  ];

  const topPerformers = [
    { name: 'Sarah Johnson', deals: 28, revenue: 892000, avatar: 'SJ', trend: '+15%' },
    { name: 'Michael Chen', deals: 24, revenue: 756000, avatar: 'MC', trend: '+12%' },
    { name: 'Emma Williams', deals: 21, revenue: 678000, avatar: 'EW', trend: '+9%' },
    { name: 'David Brown', deals: 18, revenue: 521000, avatar: 'DB', trend: '+7%' }
  ];

  const activeCampaigns = [
    { name: 'Summer Renovation Campaign', budget: 45000, spent: 32500, leads: 248, status: 'Active' },
    { name: 'Commercial Property Drive', budget: 65000, spent: 58900, leads: 412, status: 'Active' },
    { name: 'Residential Upgrade Series', budget: 38000, spent: 28400, leads: 189, status: 'Active' },
    { name: 'Green Building Initiative', budget: 52000, spent: 45600, leads: 325, status: 'Ending Soon' }
  ];

  const recentDeals = [
    { client: 'Tech Innovations Ltd', value: 185000, stage: 'Negotiation', probability: 85 },
    { client: 'Urban Developments', value: 342000, stage: 'Proposal', probability: 65 },
    { client: 'Green Living Spaces', value: 228000, stage: 'Qualified', probability: 45 },
    { client: 'Skyline Constructions', value: 495000, stage: 'Discovery', probability: 30 },
    { client: 'Metro Housing Corp', value: 156000, stage: 'Negotiation', probability: 75 }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Negotiation': return 'text-green-600 bg-green-50 border-green-200';
      case 'Proposal': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Qualified': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'Discovery': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getCampaignStatus = (status: string) => {
    return status === 'Active' 
      ? 'text-green-600 bg-green-50 border-green-200'
      : 'text-amber-600 bg-amber-50 border-amber-200';
  };

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue YTD</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(dashboardStats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 font-medium">+{dashboardStats.monthlyGrowth}%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pipeline Value</CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(dashboardStats.pipelineValue)}</div>
            <p className="text-xs text-muted-foreground">{dashboardStats.dealsWon} deals won this quarter</p>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Campaigns</CardTitle>
            <Users className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{dashboardStats.activeCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-amber-600 font-medium">{dashboardStats.conversionRate}%</span> conversion rate
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Deal Size</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(dashboardStats.avgDealSize)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-purple-600 font-medium">{dashboardStats.marketingROI}%</span> marketing ROI
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Performance Chart */}
      <Card className="bg-card border border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">Sales Performance Trend</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {salesPerformance.map((month, idx) => {
            const percentage = Math.min((month.revenue / month.target) * 100, 100);
            return (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{month.month}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground">{month.deals} deals</span>
                    <span className={`text-sm font-medium ${
                      month.revenue >= month.target ? 'text-green-600' : 'text-amber-600'
                    }`}>
                      {formatCurrency(month.revenue)}
                    </span>
                  </div>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Two Column Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card className="bg-card border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">Top Performers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {topPerformers.map((performer, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <Avatar className="h-10 w-10 border border-border">
                  <AvatarFallback className="bg-muted text-foreground font-medium text-sm">
                    {performer.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{performer.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {performer.deals} deals • {formatCurrency(performer.revenue)}
                  </p>
                </div>
                <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">
                  {performer.trend}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Marketing Campaigns */}
        <Card className="bg-card border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">Marketing Campaigns</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeCampaigns.map((campaign, idx) => {
              const spentPercentage = (campaign.spent / campaign.budget) * 100;
              return (
                <div key={idx} className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{campaign.name}</p>
                      <p className="text-xs text-muted-foreground">{campaign.leads} leads generated</p>
                    </div>
                    <Badge variant="outline" className={getCampaignStatus(campaign.status)}>
                      {campaign.status}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Budget</span>
                      <span className="text-foreground font-medium">
                        {formatCurrency(campaign.spent)} / {formatCurrency(campaign.budget)}
                      </span>
                    </div>
                    <Progress value={spentPercentage} className="h-2" />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Recent Deals Pipeline */}
      <Card className="bg-card border border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-foreground">Recent Deals in Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentDeals.map((deal, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{deal.client}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-muted-foreground">{formatCurrency(deal.value)}</span>
                    <Badge variant="outline" className={getStageColor(deal.stage)}>
                      {deal.stage}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-foreground">{deal.probability}%</div>
                  <p className="text-xs text-muted-foreground whitespace-nowrap">Win probability</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
