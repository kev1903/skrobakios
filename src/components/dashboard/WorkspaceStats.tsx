
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export const WorkspaceStats = () => {
  const stats = [
    { number: '34', label: 'Deals' },
    { number: '20', label: 'Won' },
    { number: '3', label: 'Lost' }
  ];

  return (
    <div className="flex items-center gap-8">
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
          <div className="text-sm text-gray-500 uppercase tracking-wide">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};
