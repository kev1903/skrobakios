import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DollarSign,
  Building2,
  Users,
  Calendar,
  TrendingUp
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
      case 'Negotiation': return 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30';
      case 'Proposal': return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      case 'Qualified': return 'bg-amber-500/20 text-amber-700 border-amber-500/30';
      case 'Discovery': return 'bg-purple-500/20 text-purple-700 border-purple-500/30';
      default: return 'bg-muted/20 text-muted-foreground border-border';
    }
  };

  const getCampaignStatus = (status: string) => {
    return status === 'Active' 
      ? 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30'
      : 'bg-amber-500/20 text-amber-700 border-amber-500/30';
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-3 font-playfair">
          Sales & Marketing <span className="text-primary">Dashboard</span>
        </h2>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          Monitor your sales pipeline, track marketing campaigns, and analyze performance metrics in real-time
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="glass-card hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-emerald-500" />
              <Badge className="bg-emerald-500/20 text-emerald-700">+{dashboardStats.monthlyGrowth}%</Badge>
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">
              {formatCurrency(dashboardStats.totalRevenue)}
            </div>
            <p className="text-sm text-muted-foreground">Total Revenue YTD</p>
          </CardContent>
        </Card>

        <Card className="glass-card hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Building2 className="w-8 h-8 text-blue-500" />
              <Badge className="bg-blue-500/20 text-blue-700">{dashboardStats.dealsWon} won</Badge>
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">
              {formatCurrency(dashboardStats.pipelineValue)}
            </div>
            <p className="text-sm text-muted-foreground">Pipeline Value</p>
          </CardContent>
        </Card>

        <Card className="glass-card hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-amber-500" />
              <Badge className="bg-amber-500/20 text-amber-700">{dashboardStats.conversionRate}%</Badge>
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">
              {dashboardStats.activeCampaigns}
            </div>
            <p className="text-sm text-muted-foreground">Active Campaigns</p>
          </CardContent>
        </Card>

        <Card className="glass-card hover:shadow-lg transition-all">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-purple-500" />
              <Badge className="bg-purple-500/20 text-purple-700">{dashboardStats.marketingROI}%</Badge>
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">
              {formatCurrency(dashboardStats.avgDealSize)}
            </div>
            <p className="text-sm text-muted-foreground">Avg Deal Size</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Performance Chart */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Sales Performance Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {salesPerformance.map((month, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{month.month}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">{month.deals} deals</span>
                    <span className={month.revenue >= month.target ? 'text-emerald-600 font-semibold' : 'text-amber-600'}>
                      {formatCurrency(month.revenue)}
                    </span>
                  </div>
                </div>
                <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`absolute inset-y-0 left-0 rounded-full ${
                      month.revenue >= month.target ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min((month.revenue / month.target) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performers & Active Campaigns */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformers.map((performer, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 rounded-lg bg-background/50 hover:bg-accent/30 transition-colors">
                  <Avatar className="w-12 h-12 border-2 border-primary/20">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {performer.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{performer.name}</p>
                    <p className="text-sm text-muted-foreground">{performer.deals} deals • {formatCurrency(performer.revenue)}</p>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-700">{performer.trend}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Campaigns */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Marketing Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeCampaigns.map((campaign, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-background/50 hover:bg-accent/30 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="font-semibold text-foreground mb-1">{campaign.name}</p>
                      <p className="text-sm text-muted-foreground">{campaign.leads} leads generated</p>
                    </div>
                    <Badge className={getCampaignStatus(campaign.status)}>
                      {campaign.status}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Budget</span>
                      <span className="font-medium">{formatCurrency(campaign.spent)} / {formatCurrency(campaign.budget)}</span>
                    </div>
                    <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="absolute inset-y-0 left-0 bg-primary rounded-full"
                        style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Deals Pipeline */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Recent Deals in Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentDeals.map((deal, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 rounded-lg bg-background/50 hover:bg-accent/30 transition-colors">
                <div className="flex-1">
                  <p className="font-semibold text-foreground mb-1">{deal.client}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{formatCurrency(deal.value)}</span>
                    <Badge variant="outline" className={getStageColor(deal.stage)}>
                      {deal.stage}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-foreground">{deal.probability}%</div>
                  <p className="text-xs text-muted-foreground">Win probability</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
