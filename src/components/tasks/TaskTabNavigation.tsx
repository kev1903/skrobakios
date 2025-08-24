
import React from 'react';
import { Button } from '@/components/ui/button';
import { List, Kanban, BarChart3, Users, TrendingUp } from 'lucide-react';

interface TaskTabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const TaskTabNavigation = ({ activeTab, onTabChange }: TaskTabNavigationProps) => {
  const tabs = [
    { id: 'tasks', label: 'List View', icon: List },
    { id: 'board', label: 'Board', icon: Kanban },
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'team', label: 'Team workload', icon: Users },
    { id: 'insights', label: 'Insights', icon: TrendingUp },
  ];

  return (
    <div className="border-b border-border/50 bg-gradient-to-r from-background/50 to-background/30 backdrop-blur-sm overflow-hidden">
      <div className="flex overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all duration-300 whitespace-nowrap flex-shrink-0 hover:bg-accent/30 ${
                activeTab === tab.id
                  ? 'border-primary text-foreground bg-background/60 shadow-sm'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
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
