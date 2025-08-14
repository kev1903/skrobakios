import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Clock, Target, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, addWeeks, startOfWeek, isWithinInterval } from 'date-fns';
import { formatCurrency as defaultFormatCurrency } from '@/lib/utils';

// Analytics data interface
interface AnalyticsData {
  // KPIs
  revenueBilled: number;
  revenueCollected: number;
  accountsReceivable: number;
  accountsPayable: number;
  costCommitted: number;
  actualCost: number;
  estimateAtCompletion: number;
  varianceAtCompletion: number;
  grossMargin: number;
  daysOutstanding: number;
  daysPaidOutstanding: number;
  
  // Historical data for charts
  cashFlowForecast: Array<{
    week: string;
    inflow: number;
    outflow: number;
    net: number;
  }>;
  
  // Variance by stage
  stageVariance: Array<{
    stage: string;
    budget: number;
    committed: number;
    actual: number;
    forecast: number;
    variance: number;
  }>;

  // 8-week cash calendar
  cashCalendar: Array<{
    week: string;
    date: string;
    expectedInflow: number;
    expectedOutflow: number;
    netFlow: number;
    isNegative: boolean;
  }>;
}

interface AnalyticsModuleProps {
  projectId: string;
  formatCurrency?: (amount: number) => string;
  formatDate?: (date: Date | string) => string;
}

export const AnalyticsModule = ({ projectId, formatCurrency, formatDate }: AnalyticsModuleProps) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('weekly');
  const { toast } = useToast();

  // Load analytics data
  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch all necessary data in parallel
      const [invoicesRes, paymentsRes, billsRes, billPaymentsRes, activitiesRes] = await Promise.all([
        supabase.from('invoices').select('*').eq('project_id', projectId),
        supabase.from('invoice_payments').select('*, invoices!inner(project_id)').eq('invoices.project_id', projectId),
        supabase.from('bills').select('*').eq('project_id', projectId),
        supabase.from('bill_payments').select('*, bills!inner(project_id)').eq('bills.project_id', projectId),
        supabase.from('activities').select('stage, cost_est, cost_actual').eq('project_id', projectId)
      ]);

      if (invoicesRes.error) throw invoicesRes.error;
      if (paymentsRes.error) throw paymentsRes.error;
      if (billsRes.error) throw billsRes.error;
      if (billPaymentsRes.error) throw billPaymentsRes.error;
      if (activitiesRes.error) throw activitiesRes.error;

      const invoices = invoicesRes.data || [];
      const payments = paymentsRes.data || [];
      const bills = billsRes.data || [];
      const billPayments = billPaymentsRes.data || [];
      const activities = activitiesRes.data || [];

      // Calculate KPIs
      const revenueBilled = invoices.reduce((sum, inv) => sum + inv.total, 0);
      const revenueCollected = payments.reduce((sum, pay) => sum + pay.amount, 0);
      const accountsReceivable = revenueBilled - revenueCollected;
      
      const billsTotal = bills.reduce((sum, bill) => sum + bill.total, 0);
      const billsPaid = billPayments.reduce((sum, pay) => sum + pay.amount, 0);
      const accountsPayable = billsTotal - billsPaid;
      
      const costCommitted = bills.filter(b => ['approved', 'scheduled'].includes(b.status)).reduce((sum, bill) => sum + (bill.total - bill.paid_to_date), 0);
      const actualCost = billsPaid;
      
      const totalBudget = activities.reduce((sum, act) => sum + (act.cost_est || 0), 0);
      const estimateAtCompletion = actualCost + costCommitted;
      const varianceAtCompletion = totalBudget - estimateAtCompletion;
      const grossMargin = revenueCollected - actualCost;

      // Generate cash flow forecast (8 weeks)
      const cashFlowForecast = [];
      const startDate = startOfWeek(new Date());
      
      for (let i = 0; i < 8; i++) {
        const weekStart = addWeeks(startDate, i);
        const weekEnd = addWeeks(weekStart, 1);
        const weekLabel = format(weekStart, 'MMM dd');
        
        // Calculate expected inflows (invoices due this week)
        const weeklyInflow = invoices
          .filter(inv => inv.status === 'sent' && 
            isWithinInterval(new Date(inv.due_date), { start: weekStart, end: weekEnd }))
          .reduce((sum, inv) => sum + (inv.total - inv.paid_to_date) * 0.8, 0); // 80% probability

        // Calculate expected outflows (bills due this week)
        const weeklyOutflow = bills
          .filter(bill => ['approved', 'scheduled'].includes(bill.status) && 
            isWithinInterval(new Date(bill.due_date), { start: weekStart, end: weekEnd }))
          .reduce((sum, bill) => sum + (bill.total - bill.paid_to_date), 0);

        cashFlowForecast.push({
          week: weekLabel,
          inflow: weeklyInflow,
          outflow: weeklyOutflow,
          net: weeklyInflow - weeklyOutflow
        });
      }

      // Generate stage variance data
      const stageMap = activities.reduce((acc, act) => {
        const stage = act.stage || 'No Stage';
        if (!acc[stage]) {
          acc[stage] = { budget: 0, actual: 0 };
        }
        acc[stage].budget += act.cost_est || 0;
        acc[stage].actual += act.cost_actual || 0;
        return acc;
      }, {} as Record<string, { budget: number; actual: number }>);

      const stageVariance = Object.entries(stageMap).map(([stage, data]) => {
        const committed = bills
          .filter(b => ['approved', 'scheduled'].includes(b.status))
          .reduce((sum, bill) => sum + (bill.total - bill.paid_to_date), 0) / Object.keys(stageMap).length; // Simplified allocation
        
        const forecast = data.actual + committed;
        return {
          stage,
          budget: data.budget,
          committed,
          actual: data.actual,
          forecast,
          variance: data.budget - forecast
        };
      });

      // Generate 8-week cash calendar
      const cashCalendar = cashFlowForecast.map(week => ({
        week: week.week,
        date: week.week,
        expectedInflow: week.inflow,
        expectedOutflow: week.outflow,
        netFlow: week.net,
        isNegative: week.net < 0
      }));

      setAnalyticsData({
        revenueBilled,
        revenueCollected,
        accountsReceivable,
        accountsPayable,
        costCommitted,
        actualCost,
        estimateAtCompletion,
        varianceAtCompletion,
        grossMargin,
        daysOutstanding: 30, // Simplified
        daysPaidOutstanding: 30, // Simplified
        cashFlowForecast,
        stageVariance,
        cashCalendar
      });

    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    );
  }

  const kpiCards = [
    {
      title: "Revenue Billed",
      value: analyticsData.revenueBilled,
      icon: DollarSign,
      trend: "+12%",
      positive: true
    },
    {
      title: "Revenue Collected",
      value: analyticsData.revenueCollected,
      icon: TrendingUp,
      trend: "+8%",
      positive: true
    },
    {
      title: "Accounts Receivable",
      value: analyticsData.accountsReceivable,
      icon: Clock,
      trend: "-5%",
      positive: true
    },
    {
      title: "Accounts Payable",
      value: analyticsData.accountsPayable,
      icon: AlertTriangle,
      trend: "+3%",
      positive: false
    },
    {
      title: "Cost Committed",
      value: analyticsData.costCommitted,
      icon: Target,
      trend: "+15%",
      positive: false
    },
    {
      title: "Actual Cost",
      value: analyticsData.actualCost,
      icon: DollarSign,
      trend: "+10%",
      positive: false
    },
    {
      title: "EAC",
      value: analyticsData.estimateAtCompletion,
      icon: TrendingUp,
      trend: "+5%",
      positive: false
    },
    {
      title: "VAC",
      value: analyticsData.varianceAtCompletion,
      icon: analyticsData.varianceAtCompletion >= 0 ? TrendingUp : TrendingDown,
      trend: analyticsData.varianceAtCompletion >= 0 ? "On track" : "Over budget",
      positive: analyticsData.varianceAtCompletion >= 0
    }
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpiCards.map((kpi, index) => (
          <Card key={index}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">{kpi.title}</p>
                  <p className="text-lg font-bold">{formatCurrency ? formatCurrency(kpi.value) : defaultFormatCurrency(kpi.value)}</p>
                  <p className={`text-xs ${kpi.positive ? 'text-green-600' : 'text-red-600'}`}>
                    {kpi.trend}
                  </p>
                </div>
                <kpi.icon className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cash Flow Forecast Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Cash Flow Forecast</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={selectedTimeframe === 'weekly' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTimeframe('weekly')}
              >
                Weekly
              </Button>
              <Button
                variant={selectedTimeframe === 'monthly' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTimeframe('monthly')}
              >
                Monthly
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData.cashFlowForecast}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip formatter={(value) => [formatCurrency ? formatCurrency(Number(value)) : defaultFormatCurrency(Number(value)), '']} />
                <Legend />
                <Line type="monotone" dataKey="inflow" stroke="hsl(var(--primary))" name="Expected Inflow" />
                <Line type="monotone" dataKey="outflow" stroke="hsl(var(--destructive))" name="Expected Outflow" />
                <Line type="monotone" dataKey="net" stroke="hsl(var(--accent))" name="Net Cash Flow" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stage Variance Table */}
        <Card>
          <CardHeader>
            <CardTitle>Budget vs Actual by Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.stageVariance.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No stage data available</p>
              ) : (
                analyticsData.stageVariance.map((stage, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">{stage.stage}</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Budget</p>
                         <p className="font-medium">{formatCurrency ? formatCurrency(stage.budget) : defaultFormatCurrency(stage.budget)}</p>
                       </div>
                       <div>
                         <p className="text-muted-foreground">Actual</p>
                         <p className="font-medium">{formatCurrency ? formatCurrency(stage.actual) : defaultFormatCurrency(stage.actual)}</p>
                       </div>
                       <div>
                         <p className="text-muted-foreground">Forecast</p>
                         <p className="font-medium">{formatCurrency ? formatCurrency(stage.forecast) : defaultFormatCurrency(stage.forecast)}</p>
                       </div>
                       <div>
                         <p className="text-muted-foreground">Variance</p>
                         <p className={`font-medium ${stage.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                           {formatCurrency ? formatCurrency(Math.abs(stage.variance)) : defaultFormatCurrency(Math.abs(stage.variance))}
                         </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* 8-Week Cash Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>8-Week Cash Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {analyticsData.cashCalendar.map((week, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-lg border ${week.isNegative ? 'bg-red-50 border-red-200 dark:bg-red-900/20' : 'bg-green-50 border-green-200 dark:bg-green-900/20'}`}
                >
                  <p className="font-medium text-sm">{week.week}</p>
                   <p className="text-xs text-muted-foreground">In: {formatCurrency ? formatCurrency(week.expectedInflow) : defaultFormatCurrency(week.expectedInflow)}</p>
                   <p className="text-xs text-muted-foreground">Out: {formatCurrency ? formatCurrency(week.expectedOutflow) : defaultFormatCurrency(week.expectedOutflow)}</p>
                   <p className={`text-sm font-medium ${week.isNegative ? 'text-red-600' : 'text-green-600'}`}>
                     Net: {formatCurrency ? formatCurrency(week.netFlow) : defaultFormatCurrency(week.netFlow)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};