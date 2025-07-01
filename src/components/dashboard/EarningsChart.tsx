
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { TrendingUp } from "lucide-react";

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

const legendItems = [
  { name: "Income", color: "bg-emerald-500" },
  { name: "Expenses", color: "bg-red-400" }
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-lg border-0">
        <p className="text-sm font-medium mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: ${entry.value}K
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const EarningsChart = () => {
  const totalIncome = data.reduce((sum, item) => sum + item.income, 0);
  const totalExpenses = data.reduce((sum, item) => sum + item.expenses, 0);
  const netProfit = totalIncome - totalExpenses;
  const profitMargin = ((netProfit / totalIncome) * 100).toFixed(1);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-slate-800 mb-1">
              Financial Overview
            </CardTitle>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-600">Net profit margin:</span>
              <div className="flex items-center gap-1 text-emerald-600 font-semibold">
                <TrendingUp className="w-3 h-3" />
                <span>{profitMargin}%</span>
              </div>
            </div>
          </div>
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
            <BarChart data={data} barCategoryGap="25%" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                domain={[0, 60]}
                tickFormatter={(value) => `$${value}K`}
                width={35}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="income" 
                fill="#10B981" 
                radius={[2, 2, 0, 0]}
                className="hover:opacity-80 transition-opacity"
              />
              <Bar 
                dataKey="expenses" 
                fill="#F87171" 
                radius={[2, 2, 0, 0]}
                className="hover:opacity-80 transition-opacity"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100">
          <div className="text-center">
            <div className="text-lg font-bold text-emerald-600">${totalIncome}K</div>
            <div className="text-xs text-slate-500">Total Income</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-500">${totalExpenses}K</div>
            <div className="text-xs text-slate-500">Total Expenses</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-slate-800">${netProfit}K</div>
            <div className="text-xs text-slate-500">Net Profit</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
