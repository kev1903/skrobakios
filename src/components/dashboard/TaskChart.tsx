
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { date: "19 Aug", value: 38 },
  { date: "20 Aug", value: 48 },
  { date: "21 Aug", value: 35 },
  { date: "22 Aug", value: 25 },
  { date: "23 Aug", value: 45 },
  { date: "24 Aug", value: 30 },
  { date: "25 Aug", value: 50 },
  { date: "26 Aug", value: 35 },
  { date: "27 Aug", value: 42 },
  { date: "28 Aug", value: 28 }
];

const legendItems = [
  { name: "Projects", color: "bg-blue-500" },
  { name: "Finance", color: "bg-purple-400" },
  { name: "Sales", color: "bg-emerald-500" }
];

export const TaskChart = () => {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-800">
            Incomplete Tasks by Project
          </CardTitle>
          <div className="flex items-center gap-4">
            {legendItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                <span className="text-xs text-slate-600 font-medium">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 11, fill: '#64748B' }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 11, fill: '#64748B' }}
                width={30}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#0F172A',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}
                cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
              />
              <Bar 
                dataKey="value" 
                fill="#3B82F6" 
                radius={[3, 3, 0, 0]}
                className="hover:opacity-80 transition-opacity"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
