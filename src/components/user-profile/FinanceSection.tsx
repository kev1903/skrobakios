import React from 'react';
import { DollarSign } from 'lucide-react';

export const FinanceSection = () => {
  return (
    <div className="space-y-8">
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6">
        <div className="text-center py-12">
          <DollarSign className="w-16 h-16 text-white/60 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Financial Information</h3>
          <p className="text-white/70">Manage your financial preferences and settings</p>
        </div>
      </div>
    </div>
  );
};