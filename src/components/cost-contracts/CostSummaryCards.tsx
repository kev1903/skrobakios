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
      color: 'text-primary'
    },
    {
      label: 'Committed',
      value: totals.committed,
      color: 'text-primary'
    },
    {
      label: 'Paid',
      value: totals.paid,
      color: 'text-primary'
    },
    {
      label: 'Remaining',
      value: totals.remaining,
      color: totals.remaining < 0 ? 'text-destructive' : 'text-primary'
    }
  ];

  return (
    <div className="glass-light rounded-xl p-6 mb-8">
      <h3 className="text-lg font-semibold text-foreground heading-modern mb-4">
        Financial Overview
      </h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className="text-center">
            <p className="text-sm text-muted-foreground body-modern mb-1">
              {metric.label}
            </p>
            <p className={`text-2xl font-bold heading-modern ${metric.color}`}>
              {formatCurrency(metric.value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};