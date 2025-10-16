import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";

interface TransactionData {
  month: string;
  income: number;
  transactionAmount: number;
  client: string;
  description: string;
  date: string;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as TransactionData;
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-semibold text-foreground mb-1">{data.date}</p>
        <p className="text-xs text-muted-foreground mb-2">{data.client}</p>
        <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{data.description}</p>
        <div className="space-y-1">
          <p className="text-sm text-foreground">
            <span className="text-muted-foreground">Transaction: </span>
            <span className="font-semibold text-primary">
              ${data.transactionAmount.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </p>
          <p className="text-sm text-foreground border-t border-border pt-1">
            <span className="text-muted-foreground">Cumulative: </span>
            <span className="font-bold">
              ${data.income.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export const IncomeTrendChart = () => {
  const [transactionData, setTransactionData] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactionData();
  }, []);

  const fetchTransactionData = async () => {
    try {
      setLoading(true);
      
      // Get user's active company
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: companyMember } = await supabase
        .from('company_members')
        .select('company_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .limit(1)
        .maybeSingle();

      if (!companyMember) return;

      const { data: incomeData, error } = await supabase
        .from('income_transactions')
        .select('transaction_date, amount, client_source, description')
        .eq('company_id', companyMember.company_id)
        .eq('status', 'received')
        .order('transaction_date', { ascending: true });

      if (error) throw error;

      // Create a data point for each transaction with cumulative total
      let cumulativeTotal = 0;
      const chartData: TransactionData[] = (incomeData || []).map(record => {
        const transactionAmount = Number(record.amount);
        cumulativeTotal += transactionAmount;
        const date = new Date(record.transaction_date);
        const shortDate = date.toLocaleDateString('en-US', { 
          day: 'numeric',
          month: 'short'
        });
        const fullDate = date.toLocaleDateString('en-AU', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
        
        return {
          month: shortDate,
          income: cumulativeTotal,
          transactionAmount: transactionAmount,
          client: record.client_source,
          description: record.description,
          date: fullDate
        };
      });

      setTransactionData(chartData);
    } catch (error) {
      console.error('Error fetching transaction data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">Monthly Income Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Loading chart data...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (transactionData.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">Monthly Income Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No income data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-lg">Monthly Income Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={transactionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis 
              dataKey="month" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="income" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              dot={{ fill: "hsl(var(--primary))", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
