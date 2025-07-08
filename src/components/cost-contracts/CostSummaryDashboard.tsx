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
      {/* Overview Metrics */}
      <div className="glass-light rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground heading-modern mb-6">
          Project Financial Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {summaryMetrics.map((metric, index) => {
            const IconComponent = metric.icon;
            return (
              <div key={index} className="text-center p-4 rounded-lg bg-accent/30">
                <IconComponent className="w-8 h-8 text-primary mx-auto mb-3" />
                <p className="text-sm text-muted-foreground body-modern mb-1">
                  {metric.label}
                </p>
                <p className="text-2xl font-bold text-foreground heading-modern mb-1">
                  {metric.value}
                </p>
                <p className="text-xs text-muted-foreground body-modern">
                  {metric.trend} from last month
                </p>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Analytics Placeholder */}
      <div className="glass-light rounded-xl p-8 text-center">
        <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h4 className="text-xl font-semibold text-foreground heading-modern mb-2">
          Cost Analytics
        </h4>
        <p className="text-muted-foreground body-modern mb-4">
          Interactive charts and detailed analytics coming soon
        </p>
        <div className="text-sm text-muted-foreground body-modern">
          This section will include cost trends, budget analysis, and performance metrics
        </div>
      </div>
    </div>
  );
};