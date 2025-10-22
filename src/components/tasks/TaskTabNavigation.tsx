import React from 'react';
import { Button } from '@/components/ui/button';
import { List, Kanban } from 'lucide-react';

interface TaskTabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const TaskTabNavigation = ({ activeTab, onTabChange }: TaskTabNavigationProps) => {
  const tabs = [
    { id: 'list', label: 'List View', icon: List },
    { id: 'board', label: 'Board', icon: Kanban },
  ];

  return (
    <div className="border-b border-border/30">
      <div className="flex gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all duration-200 whitespace-nowrap rounded-t-lg ${
                activeTab === tab.id
                  ? 'border-luxury-gold text-foreground bg-white shadow-sm'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/30'
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
