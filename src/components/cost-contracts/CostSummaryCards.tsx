import React from 'react';
import { CostTotals } from './types';

interface CostSummaryCardsProps {
  totals: CostTotals;
  formatCurrency: (amount: number) => string;
}

export const CostSummaryCards = ({ totals, formatCurrency }: CostSummaryCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white p-3 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xs font-medium text-gray-600">Total Budget</h3>
          <div className="w-8 h-6 bg-blue-50 rounded flex items-center justify-center">
            <div className="w-4 h-3 bg-blue-200 rounded-sm"></div>
          </div>
        </div>
        <p className="text-xl font-bold text-gray-900">{formatCurrency(totals.budget)}</p>
      </div>

      <div className="bg-white p-3 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xs font-medium text-gray-600">Committed</h3>
          <div className="w-8 h-6 bg-blue-50 rounded flex items-center justify-center">
            <div className="w-4 h-3 bg-blue-200 rounded-sm"></div>
          </div>
        </div>
        <p className="text-xl font-bold text-gray-900">{formatCurrency(totals.committed)}</p>
      </div>

      <div className="bg-white p-3 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xs font-medium text-gray-600">Paid</h3>
          <div className="w-8 h-6 bg-blue-50 rounded flex items-center justify-center">
            <div className="w-4 h-3 bg-blue-200 rounded-sm"></div>
          </div>
        </div>
        <p className="text-xl font-bold text-gray-900">{formatCurrency(totals.paid)}</p>
      </div>

      <div className="bg-white p-3 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xs font-medium text-gray-600">Remaining</h3>
          <div className="w-8 h-6 bg-blue-50 rounded flex items-center justify-center">
            <div className="w-4 h-3 bg-blue-200 rounded-sm"></div>
          </div>
        </div>
        <p className={`text-xl font-bold ${totals.remaining < 0 ? 'text-red-600' : 'text-gray-900'}`}>
          {formatCurrency(totals.remaining)}
        </p>
      </div>
    </div>
  );
};