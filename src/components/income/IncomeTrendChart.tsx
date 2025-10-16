import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";

interface MonthlyData {
  month: string;
  income: number;
}

export const IncomeTrendChart = () => {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMonthlyData();
  }, []);

  const fetchMonthlyData = async () => {
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
        .select('transaction_date, amount')
        .eq('company_id', companyMember.company_id)
        .eq('status', 'received')
        .order('transaction_date', { ascending: true });

      if (error) throw error;

      // Create a data point for each transaction with cumulative total
      let cumulativeTotal = 0;
      const chartData: MonthlyData[] = (incomeData || []).map(record => {
        cumulativeTotal += Number(record.amount);
        const date = new Date(record.transaction_date);
        const formattedDate = date.toLocaleDateString('en-US', { 
          day: 'numeric',
          month: 'short'
        });
        
        return {
          month: formattedDate,
          income: cumulativeTotal
        };
      });

      setMonthlyData(chartData);
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

  if (monthlyData.length === 0) {
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
          <LineChart data={monthlyData}>
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
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, "Income"]}
            />
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
