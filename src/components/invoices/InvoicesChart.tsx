
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

const chartData = [
  { date: "30 Jun", value: 15 },
  { date: "2 Jul", value: 0 },
  { date: "4 Jul", value: 0 },
  { date: "6 Jul", value: 0 },
  { date: "8 Jul", value: 0 },
  { date: "10 Jul", value: 0 },
  { date: "12 Jul", value: 0 },
  { date: "14 Jul", value: 0 },
  { date: "16 Jul", value: 0 },
  { date: "18 Jul", value: 0 },
  { date: "20 Jul", value: 0 },
  { date: "22 Jul", value: 0 },
  { date: "24 Jul", value: 0 },
  { date: "26 Jul", value: 0 },
  { date: "28 Jul", value: 0 },
  { date: "30 Jul", value: 0 },
];

export const InvoicesChart = () => {
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
                  domain={[0, 15]}
                  ticks={[0, 5, 10, 15]}
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
