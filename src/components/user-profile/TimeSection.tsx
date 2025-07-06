import React from 'react';
import { Clock } from 'lucide-react';

export const TimeSection = () => {
  return (
    <div className="space-y-8">
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-6">
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-white/60 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Time Management</h3>
          <p className="text-white/70">Configure your time preferences and schedules</p>
        </div>
      </div>
    </div>
  );
};