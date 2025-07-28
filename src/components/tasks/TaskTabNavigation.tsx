
import React from 'react';
import { Button } from '@/components/ui/button';
import { List, Kanban, Calendar, BarChart3 } from 'lucide-react';

interface TaskTabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const TaskTabNavigation = ({ activeTab, onTabChange }: TaskTabNavigationProps) => {
  const tabs = [
    { id: 'list', label: 'List View', icon: List },
    { id: 'board', label: 'Board', icon: Kanban },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'overview', label: 'Overview', icon: BarChart3 },
  ];

  return (
    <div className="mb-6 border-b border-slate-200 bg-white/40 backdrop-blur-sm rounded-t-lg">
      <div className="flex space-x-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors duration-200 ${
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
