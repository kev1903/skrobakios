import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { CentralTask } from '@/services/centralTaskService';

interface CostAnalyticsProps {
  tasks: CentralTask[];
  costSummary: {
    totalBudgeted: number;
    totalActual: number;
    variance: number;
    stages: { [stage: string]: { budgeted: number; actual: number } };
  };
}

export const CostAnalytics = ({ tasks, costSummary }: CostAnalyticsProps) => {
  // Prepare data for pie chart (cost distribution by stage)
  const pieData = Object.entries(costSummary.stages).map(([stage, costs]) => ({
    name: stage.length > 15 ? stage.substring(0, 12) + '...' : stage,
    fullName: stage,
    value: costs.budgeted,
    actual: costs.actual
  }));

  // Colors for the pie chart
  const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6B7280'];

  // Prepare variance analysis data
  const varianceData = Object.entries(costSummary.stages).map(([stage, costs]) => ({
    stage: stage.length > 20 ? stage.substring(0, 17) + '...' : stage,
    fullStage: stage,
    variance: costs.budgeted - costs.actual,
    budgeted: costs.budgeted,
    actual: costs.actual
  }));

  // Cost efficiency metrics
  const totalTasks = tasks.length;
  const tasksWithCosts = tasks.filter(t => (t.budgeted_cost || 0) > 0).length;
  const avgTaskCost = tasksWithCosts > 0 
    ? costSummary.totalBudgeted / tasksWithCosts 
    : 0;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{data.fullName || data.fullStage}</p>
          {data.value && (
            <>
              <p className="text-blue-600">Budgeted: ${data.value.toLocaleString()}</p>
              <p className="text-purple-600">Actual: ${data.actual.toLocaleString()}</p>
            </>
          )}
          {data.variance !== undefined && (
            <p className={data.variance >= 0 ? 'text-green-600' : 'text-red-600'}>
              Variance: ${Math.abs(data.variance).toLocaleString()} 
              {data.variance >= 0 ? ' under' : ' over'}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Cost Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{totalTasks}</p>
              <p className="text-sm text-muted-foreground">Total Tasks</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{tasksWithCosts}</p>
              <p className="text-sm text-muted-foreground">Tasks with Costs</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">${avgTaskCost.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Avg Task Cost</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{Object.keys(costSummary.stages).length}</p>
              <p className="text-sm text-muted-foreground">Active Stages</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Distribution by Stage</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-muted-foreground">
                No cost data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Variance Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Variance Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            {varianceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={varianceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="stage" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="variance" 
                    fill="#8B5CF6"
                    name="Variance"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-muted-foreground">
                No variance data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};