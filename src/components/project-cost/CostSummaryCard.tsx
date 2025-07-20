import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface CostSummaryCardProps {
  costSummary: {
    totalBudgeted: number;
    totalActual: number;
    variance: number;
    stages: { [stage: string]: { budgeted: number; actual: number } };
  };
}

export const CostSummaryCard = ({ costSummary }: CostSummaryCardProps) => {
  const spentPercentage = costSummary.totalBudgeted > 0 
    ? (costSummary.totalActual / costSummary.totalBudgeted) * 100 
    : 0;

  const remainingBudget = costSummary.totalBudgeted - costSummary.totalActual;
  const isOverBudget = costSummary.variance < 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Cost Summary Overview
          {isOverBudget ? (
            <TrendingDown className="h-5 w-5 text-red-500" />
          ) : (
            <TrendingUp className="h-5 w-5 text-green-500" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Budget Utilization</span>
            <span className={isOverBudget ? 'text-red-600' : 'text-muted-foreground'}>
              {spentPercentage.toFixed(1)}%
            </span>
          </div>
          <Progress 
            value={Math.min(spentPercentage, 100)} 
            className={`h-2 ${isOverBudget ? 'bg-red-100' : ''}`}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Remaining Budget</p>
            <p className={`font-semibold ${remainingBudget < 0 ? 'text-red-600' : 'text-green-600'}`}>
              ${Math.abs(remainingBudget).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Active Stages</p>
            <p className="font-semibold">{Object.keys(costSummary.stages).length}</p>
          </div>
        </div>

        {isOverBudget && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 font-medium">Budget Alert</p>
            <p className="text-xs text-red-600">
              Project is ${Math.abs(costSummary.variance).toLocaleString()} over budget
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};