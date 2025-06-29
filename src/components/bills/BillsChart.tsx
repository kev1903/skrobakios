
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { month: "Jan", amount: 8200 },
  { month: "Feb", amount: 7800 },
  { month: "Mar", amount: 9200 },
  { month: "Apr", amount: 8600 },
  { month: "May", amount: 8900 },
  { month: "Jun", amount: 8450 },
];

export const BillsChart = () => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Monthly Bills Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip 
              formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']}
            />
            <Line 
              type="monotone" 
              dataKey="amount" 
              stroke="#ef4444" 
              strokeWidth={2}
              dot={{ fill: '#ef4444' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
