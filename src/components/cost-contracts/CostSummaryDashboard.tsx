import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp } from 'lucide-react';

interface CostSummaryDashboardProps {
  onNavigate?: (page: string) => void;
}

export const CostSummaryDashboard = ({ onNavigate }: CostSummaryDashboardProps) => {
  const summaryMetrics = [
    {
      label: 'Total Contract Value',
      value: '$450,000',
      icon: BarChart3,
      trend: '+2.5%'
    },
    {
      label: 'Total Paid',
      value: '$275,000',
      icon: TrendingUp,
      trend: '+15%'
    },
    {
      label: 'Remaining',
      value: '$175,000',
      icon: BarChart3,
      trend: '-8.2%'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Clean Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {summaryMetrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <div key={index} className="text-center p-6 rounded-xl bg-muted/20 border border-border/50">
              <IconComponent className="w-10 h-10 text-primary mx-auto mb-4" />
              <p className="text-sm text-muted-foreground body-modern mb-2">
                {metric.label}
              </p>
              <p className="text-3xl font-bold text-foreground heading-modern mb-2">
                {metric.value}
              </p>
              <p className="text-xs text-muted-foreground body-modern">
                {metric.trend} from last month
              </p>
            </div>
          );
        })}
      </div>
      
      {/* Analytics Section */}
      <div className="text-center py-16 px-8 rounded-xl bg-muted/10 border border-border/30">
        <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
        <h3 className="text-2xl font-semibold text-foreground heading-modern mb-3">
          Advanced Analytics
        </h3>
        <p className="text-muted-foreground body-modern max-w-md mx-auto mb-6">
          Interactive charts, cost trends, budget analysis, and performance metrics will be available here
        </p>
        <div className="text-sm text-muted-foreground/70 body-modern">
          Coming soon in the next update
        </div>
      </div>
    </div>
  );
};