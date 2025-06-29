
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { month: "Jan", income: 42000, expenses: 11500 },
  { month: "Feb", income: 43500, expenses: 12000 },
  { month: "Mar", income: 44200, expenses: 11800 },
  { month: "Apr", income: 45000, expenses: 12200 },
  { month: "May", income: 44800, expenses: 12100 },
  { month: "Jun", income: 45230, expenses: 12450 },
];

export const RecurringChart = () => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Recurring Income vs Expenses Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name="Income" />
            <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
