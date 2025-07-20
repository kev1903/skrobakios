import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface CostByStageChartProps {
  tasksByStage: { [stage: string]: any[] };
}

export const CostByStageChart = ({ tasksByStage }: CostByStageChartProps) => {
  const chartData = Object.entries(tasksByStage).map(([stage, tasks]) => {
    const budgeted = tasks.reduce((sum, task) => sum + (task.budgeted_cost || 0), 0);
    const actual = tasks.reduce((sum, task) => sum + (task.actual_cost || 0), 0);
    
    return {
      stage: stage.length > 20 ? stage.substring(0, 17) + '...' : stage,
      fullStage: stage,
      budgeted,
      actual,
      variance: budgeted - actual
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{data.fullStage}</p>
          <p className="text-blue-600">Budgeted: ${data.budgeted.toLocaleString()}</p>
          <p className="text-purple-600">Actual: ${data.actual.toLocaleString()}</p>
          <p className={`${data.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            Variance: ${Math.abs(data.variance).toLocaleString()} 
            {data.variance >= 0 ? ' under' : ' over'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cost by Stage</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="stage" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis 
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="budgeted" fill="#3B82F6" name="Budgeted" />
              <Bar dataKey="actual" fill="#8B5CF6" name="Actual" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            No cost data available
          </div>
        )}
      </CardContent>
    </Card>
  );
};