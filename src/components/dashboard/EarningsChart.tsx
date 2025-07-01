
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { date: "15 Aug", income: 35, expenses: 25 },
  { date: "16 Aug", income: 40, expenses: 30 },
  { date: "17 Aug", income: 55, expenses: 35 },
  { date: "18 Aug", income: 45, expenses: 25 },
  { date: "19 Aug", income: 35, expenses: 20 },
  { date: "20 Aug", income: 50, expenses: 30 },
  { date: "21 Aug", income: 45, expenses: 25 },
  { date: "22 Aug", income: 55, expenses: 35 },
  { date: "23 Aug", income: 50, expenses: 30 }
];

export const EarningsChart = () => {
  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-800">
          Earning by Project
        </CardTitle>
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Income</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-300 rounded-full"></div>
            <span>Expenses</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barCategoryGap="20%">
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                domain={[0, 60]}
                tickFormatter={(value) => `$${value}K`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1F2937',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                formatter={(value, name) => [`$${value}K`, name]}
              />
              <Bar dataKey="income" fill="#3B82F6" radius={[2, 2, 0, 0]} />
              <Bar dataKey="expenses" fill="#93C5FD" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
