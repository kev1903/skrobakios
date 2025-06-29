
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer
} from "recharts";

const forecastData = [
  { month: "May 25", value: 35000 },
  { month: "Jun 25", value: 42000 },
  { month: "Jul 25", value: 38000 },
  { month: "Aug 25", value: 45000 },
  { month: "Sep 25", value: 52000 },
  { month: "Oct 25", value: 48000 },
];

const chartConfig = {
  value: { label: "Cash Flow", color: "#3b82f6" },
};

export const CashFlowChart = () => {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-8">
      <CardHeader>
        <CardTitle className="text-lg text-gray-900">My Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value / 1000}k`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                fill="url(#colorGradient)" 
                strokeWidth={2}
              />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
