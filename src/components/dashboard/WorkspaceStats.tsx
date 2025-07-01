
import React from 'react';

export const WorkspaceStats = () => {
  const stats = [
    { number: '34', label: 'Deals', color: 'text-[#3366FF]' },
    { number: '20', label: 'Won', color: 'text-green-600' },
    { number: '3', label: 'Lost', color: 'text-red-500' }
  ];

  return (
    <div className="grid grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="text-center p-4 bg-white/60 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
          <div className={`text-3xl font-bold mb-2 ${stat.color}`}>{stat.number}</div>
          <div className="text-sm text-gray-600 uppercase tracking-wide font-medium">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};
