import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  AlertCircle,
  Calendar,
  BarChart3,
  PieChart 
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface AnalyticsData {
  revenue_billed: number;
  revenue_collected: number;
  accounts_receivable: number;
  accounts_payable: number;
  cost_committed: number;
  actual_cost: number;
  gross_margin: number;
  budget_variance: number;
}

interface AnalyticsModuleProps {
  projectId: string;
}

export const AnalyticsModule = ({ projectId }: AnalyticsModuleProps) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('monthly');
  const { toast } = useToast();

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch invoice data
      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('total, paid_to_date')
        .eq('project_id', projectId);

      if (invoicesError) throw invoicesError;

      // Fetch bills data
      const { data: bills, error: billsError } = await supabase
        .from('bills')
        .select('total, paid_to_date')
        .eq('project_id', projectId);

      if (billsError) throw billsError;

      // Calculate analytics
      const totalBilled = invoices?.reduce((sum, inv) => sum + inv.total, 0) || 0;
      const totalCollected = invoices?.reduce((sum, inv) => sum + inv.paid_to_date, 0) || 0;
      const totalBills = bills?.reduce((sum, bill) => sum + bill.total, 0) || 0;
      const totalBillsPaid = bills?.reduce((sum, bill) => sum + bill.paid_to_date, 0) || 0;

      const analyticsData: AnalyticsData = {
        revenue_billed: totalBilled,
        revenue_collected: totalCollected,
        accounts_receivable: totalBilled - totalCollected,
        accounts_payable: totalBills - totalBillsPaid,
        cost_committed: totalBills,
        actual_cost: totalBillsPaid,
        gross_margin: totalCollected - totalBillsPaid,
        budget_variance: 0, // This would come from project budget data
      };

      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [projectId]);

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="text-center py-8">No data available</div>;
  }

  const kpiCards = [
    {
      title: 'Revenue Billed',
      value: analytics.revenue_billed,
      icon: DollarSign,
      color: 'blue',
      delta: '+12.5%',
    },
    {
      title: 'Revenue Collected',
      value: analytics.revenue_collected,
      icon: TrendingUp,
      color: 'green',
      delta: '+8.2%',
    },
    {
      title: 'Accounts Receivable',
      value: analytics.accounts_receivable,
      icon: Clock,
      color: 'yellow',
      delta: '+2.1%',
    },
    {
      title: 'Accounts Payable',
      value: analytics.accounts_payable,
      icon: AlertCircle,
      color: 'red',
      delta: '-5.3%',
    },
    {
      title: 'Cost Committed',
      value: analytics.cost_committed,
      icon: BarChart3,
      color: 'purple',
      delta: '+15.7%',
    },
    {
      title: 'Actual Cost',
      value: analytics.actual_cost,
      icon: TrendingDown,
      color: 'orange',
      delta: '+9.4%',
    },
    {
      title: 'Gross Margin',
      value: analytics.gross_margin,
      icon: PieChart,
      color: 'emerald',
      delta: '+3.8%',
    },
    {
      title: 'Budget Variance',
      value: analytics.budget_variance,
      icon: Calendar,
      color: 'slate',
      delta: '0.0%',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Time Filter */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Financial Analytics</h2>
        <div className="flex items-center gap-2">
          <Button
            variant={timeframe === 'weekly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeframe('weekly')}
          >
            Weekly
          </Button>
          <Button
            variant={timeframe === 'monthly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeframe('monthly')}
          >
            Monthly
          </Button>
          <Button
            variant={timeframe === 'quarterly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeframe('quarterly')}
          >
            Quarterly
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          const isPositive = kpi.delta.startsWith('+');
          const isNeutral = kpi.delta === '0.0%';
          
          return (
            <Card key={index} className={`bg-gradient-to-br from-${kpi.color}-50 to-${kpi.color}-100 border-${kpi.color}-200`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className={`text-sm font-medium text-${kpi.color}-600`}>{kpi.title}</p>
                  <Icon className={`h-5 w-5 text-${kpi.color}-500`} />
                </div>
                <div className="space-y-1">
                  <p className={`text-2xl font-bold text-${kpi.color}-900`}>
                    {formatCurrency(kpi.value)}
                  </p>
                  <div className="flex items-center gap-1">
                    {isNeutral ? (
                      <span className="text-xs text-muted-foreground">{kpi.delta}</span>
                    ) : isPositive ? (
                      <>
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        <span className="text-xs text-green-600">{kpi.delta}</span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-3 w-3 text-red-500" />
                        <span className="text-xs text-red-600">{kpi.delta}</span>
                      </>
                    )}
                    <span className="text-xs text-muted-foreground">vs last month</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Forecast Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Cash Flow Forecast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted/50 rounded-lg flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-2" />
              <p>Interactive cash flow chart coming soon</p>
              <p className="text-sm">Will show projected inflows and outflows</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Variance Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Budget vs Actual by Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-muted/50 rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <PieChart className="h-12 w-12 mx-auto mb-2" />
                <p>Stage variance analysis</p>
                <p className="text-sm">Budget vs actual by WBS stages</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8-Week Cash Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-muted/50 rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-2" />
                <p>Cash flow calendar</p>
                <p className="text-sm">Expected inflows and outflows</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};