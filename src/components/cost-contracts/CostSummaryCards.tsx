import React from 'react';
import { CostTotals } from './types';

interface CostSummaryCardsProps {
  totals: CostTotals;
  formatCurrency: (amount: number) => string;
}

export const CostSummaryCards = ({ totals, formatCurrency }: CostSummaryCardsProps) => {
  const metrics = [
    {
      label: 'Total Budget',
      value: totals.budget,
      color: 'text-foreground'
    },
    {
      label: 'Committed',
      value: totals.committed,
      color: 'text-foreground'
    },
    {
      label: 'Paid',
      value: totals.paid,
      color: 'text-foreground'
    },
    {
      label: 'Remaining',
      value: totals.remaining,
      color: totals.remaining < 0 ? 'text-destructive' : 'text-foreground'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
      {metrics.map((metric, index) => (
        <div key={index} className="text-center">
          <p className="text-sm text-muted-foreground body-modern mb-2">
            {metric.label}
          </p>
          <p className={`text-3xl font-bold heading-modern ${metric.color}`}>
            {formatCurrency(metric.value)}
          </p>
        </div>
      ))}
    </div>
  );
};