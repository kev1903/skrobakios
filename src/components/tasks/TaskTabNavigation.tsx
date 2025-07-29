
import React from 'react';
import { Button } from '@/components/ui/button';
import { List, Kanban, BarChart3, Users, TrendingUp } from 'lucide-react';

interface TaskTabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const TaskTabNavigation = ({ activeTab, onTabChange }: TaskTabNavigationProps) => {
  const tabs = [
    { id: 'list', label: 'List View', icon: List },
    { id: 'board', label: 'Board', icon: Kanban },
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'team', label: 'Team workload', icon: Users },
    { id: 'insights', label: 'Insights', icon: TrendingUp },
  ];

  return (
    <div className="mb-6 border-b border-slate-200 bg-white/40 backdrop-blur-sm rounded-t-lg overflow-hidden">
      <div className="flex overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors duration-200 whitespace-nowrap flex-shrink-0 ${
                activeTab === tab.id
                  ? 'border-slate-800 text-slate-800 bg-white/60'
                  : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-white/30'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
