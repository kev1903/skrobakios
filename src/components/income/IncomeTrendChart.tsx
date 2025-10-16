import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const monthlyData = [
  { month: "Jan", income: 45000 },
  { month: "Feb", income: 52000 },
  { month: "Mar", income: 48000 },
  { month: "Apr", income: 61000 },
  { month: "May", income: 55000 },
  { month: "Jun", income: 67000 },
  { month: "Jul", income: 72000 },
  { month: "Aug", income: 68000 },
  { month: "Sep", income: 75000 },
  { month: "Oct", income: 82000 },
  { month: "Nov", income: 78000 },
  { month: "Dec", income: 85000 },
];

export const IncomeTrendChart = () => {
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
