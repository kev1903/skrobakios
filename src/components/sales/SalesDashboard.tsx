import React from 'react';
import { DollarSign, TrendingUp, Users, Target, ArrowUpRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export const SalesDashboard = () => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Mock data for sales metrics
  const salesData = {
    totalRevenue: 2847000,
    revenueGrowth: 18.5,
    pipelineValue: 4250000,
    dealsWon: 34,
    activeCampaigns: 12,
    conversionRate: 24.8,
    avgDealSize: 83735,
    marketingROI: 287,
  };

  const performanceTrend = [
    { month: 'Jan', deals: 8, revenue: 245000 },
    { month: 'Feb', deals: 10, revenue: 298000 },
    { month: 'Mar', deals: 11, revenue: 325000 },
    { month: 'Apr', deals: 14, revenue: 412000 },
    { month: 'May', deals: 16, revenue: 478000 },
    { month: 'Jun', deals: 18, revenue: 523000 },
  ];

  const topPerformers = [
    { name: 'Sarah Johnson', avatar: 'SJ', deals: 28, revenue: 892000, trend: 15 },
    { name: 'Michael Chen', avatar: 'MC', deals: 24, revenue: 756000, trend: 12 },
    { name: 'Emma Williams', avatar: 'EW', deals: 21, revenue: 678000, trend: 9 },
    { name: 'David Brown', avatar: 'DB', deals: 18, revenue: 521000, trend: 7 },
  ];

  const campaigns = [
    { name: 'Summer Renovation Campaign', leads: 248, budget: 32500, spent: 45000, status: 'Active' },
    { name: 'Commercial Property Drive', leads: 412, budget: 58900, spent: 65000, status: 'Active' },
    { name: 'Residential Upgrade Series', leads: 189, budget: 28400, spent: 38000, status: 'Active' },
    { name: 'Green Building Initiative', leads: 325, budget: 45600, spent: 52000, status: 'Ending Soon' },
  ];

  const recentDeals = [
    { client: 'Westfield Corp', value: 450000, stage: 'Negotiation', probability: 75 },
    { client: 'Harbor Bay Development', value: 320000, stage: 'Proposal Sent', probability: 60 },
    { client: 'Metro Properties', value: 280000, stage: 'Qualified', probability: 45 },
    { client: 'Skyline Constructions', value: 195000, stage: 'Discovery', probability: 30 },
  ];

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Negotiation': return 'bg-green-100 text-green-700 border-green-200';
      case 'Proposal Sent': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Qualified': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Discovery': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCampaignStatus = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700 border-green-200';
      case 'Ending Soon': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats - Match Task page styling exactly */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Total Revenue YTD */}
        <div className="group relative bg-white rounded-2xl p-4 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-all duration-300 border border-[hsl(var(--border))]">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 tracking-wide">Total Revenue YTD</p>
              <p className="text-2xl font-semibold text-[hsl(var(--foreground))]">{formatCurrency(salesData.totalRevenue)}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))] flex items-center gap-1">
                <span className="text-green-600 flex items-center">
                  <ArrowUpRight className="h-3 w-3" />
                  +{salesData.revenueGrowth}%
                </span> 
                from last month
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Pipeline Value */}
        <div className="group relative bg-white rounded-2xl p-4 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-all duration-300 border border-[hsl(var(--border))]">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 tracking-wide">Pipeline Value</p>
              <p className="text-2xl font-semibold text-[hsl(var(--foreground))]">{formatCurrency(salesData.pipelineValue)}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{salesData.dealsWon} deals won this quarter</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Active Campaigns */}
        <div className="group relative bg-white rounded-2xl p-4 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-all duration-300 border border-[hsl(var(--border))]">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 tracking-wide">Active Campaigns</p>
              <p className="text-2xl font-semibold text-[hsl(var(--foreground))]">{salesData.activeCampaigns}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{salesData.conversionRate}% conversion rate</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Avg Deal Size */}
        <div className="group relative bg-white rounded-2xl p-4 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-all duration-300 border border-[hsl(var(--border))]">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 tracking-wide">Avg Deal Size</p>
              <p className="text-2xl font-semibold text-[hsl(var(--foreground))]">{formatCurrency(salesData.avgDealSize)}</p>
              <p className="text-xs text-[hsl(var(--muted-foreground))]">{salesData.marketingROI}% marketing ROI</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Sales Performance Trend */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)] border border-[hsl(var(--border))]">
        <h3 className="text-base font-semibold text-[hsl(var(--foreground))] mb-4">Sales Performance Trend</h3>
        <div className="space-y-3">
          {performanceTrend.map((month) => (
            <div key={month.month} className="flex items-center gap-4">
              <span className="text-sm font-medium text-[hsl(var(--foreground))] w-8">{month.month}</span>
              <div className="flex-1">
                <Progress value={(month.revenue / 600000) * 100} className="h-2" />
              </div>
              <span className="text-xs text-[hsl(var(--muted-foreground))] w-16 text-right">{month.deals} deals</span>
              <span className="text-sm font-medium text-[hsl(var(--foreground))] w-24 text-right">{formatCurrency(month.revenue)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)] border border-[hsl(var(--border))]">
          <h3 className="text-base font-semibold text-[hsl(var(--foreground))] mb-4">Top Performers</h3>
          <div className="space-y-3">
            {topPerformers.map((performer) => (
              <div key={performer.name} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[hsl(var(--accent))] transition-colors">
                <div className="w-10 h-10 rounded-full bg-[hsl(var(--luxury-gold))]/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-[hsl(var(--luxury-gold))]">{performer.avatar}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[hsl(var(--foreground))] truncate">{performer.name}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">{performer.deals} deals • {formatCurrency(performer.revenue)}</p>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  +{performer.trend}%
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Marketing Campaigns */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)] border border-[hsl(var(--border))]">
          <h3 className="text-base font-semibold text-[hsl(var(--foreground))] mb-4">Marketing Campaigns</h3>
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div key={campaign.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[hsl(var(--foreground))]">{campaign.name}</p>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">{campaign.leads} leads generated</p>
                  </div>
                  <Badge variant="outline" className={getCampaignStatus(campaign.status)}>
                    {campaign.status}
                  </Badge>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))] mb-1">
                    <span>Budget</span>
                    <span>{formatCurrency(campaign.budget)} / {formatCurrency(campaign.spent)}</span>
                  </div>
                  <Progress value={(campaign.budget / campaign.spent) * 100} className="h-1.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Deals Pipeline */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)] border border-[hsl(var(--border))]">
        <h3 className="text-base font-semibold text-[hsl(var(--foreground))] mb-4">Recent Deals in Pipeline</h3>
        <div className="space-y-3">
          {recentDeals.map((deal) => (
            <div key={deal.client} className="flex items-center gap-4 p-3 rounded-lg hover:bg-[hsl(var(--accent))] transition-colors">
              <div className="flex-1">
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">{deal.client}</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">{formatCurrency(deal.value)}</p>
              </div>
              <Badge variant="outline" className={getStageColor(deal.stage)}>
                {deal.stage}
              </Badge>
              <div className="text-right">
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">{deal.probability}%</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">Win prob.</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
