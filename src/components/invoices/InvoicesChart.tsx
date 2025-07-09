
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ChartData {
  date: string;
  value: number;
}

export const InvoicesChart = () => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    try {
      const { data: invoices, error } = await supabase
        .from('xero_invoices')
        .select('date, total');

      if (error) {
        console.error('Error fetching chart data:', error);
        setLoading(false);
        return;
      }

      if (!invoices || invoices.length === 0) {
        setLoading(false);
        return;
      }

      // Group invoices by date and sum totals
      const grouped = invoices.reduce((acc: Record<string, number>, invoice) => {
        if (!invoice.date) return acc;
        
        const date = new Date(invoice.date);
        const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const total = parseFloat(String(invoice.total || 0));
        
        acc[dateKey] = (acc[dateKey] || 0) + total;
        return acc;
      }, {});

      // Convert to chart format and sort by date
      const data = Object.entries(grouped)
        .map(([date, value]) => ({ date, value }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setChartData(data);
    } catch (error) {
      console.error('Error processing chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-3 animate-pulse">
          <CardContent className="p-6">
            <div className="h-48 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-3">
          <CardContent className="p-6">
            <div className="h-48 flex items-center justify-center text-gray-500">
              No invoice data available for chart
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const maxValue = Math.max(...chartData.map(d => d.value));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="md:col-span-3">
        <CardContent className="p-6">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  fontSize={12}
                  tick={{ fill: '#6B7280' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  fontSize={12}
                  tick={{ fill: '#6B7280' }}
                  domain={[0, maxValue * 1.1]}
                />
                <Bar 
                  dataKey="value" 
                  fill="#F59E0B"
                  radius={[2, 2, 0, 0]}
                  maxBarSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
