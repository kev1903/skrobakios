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
    <div className="inline-flex items-center gap-1 bg-white/80 border border-border/30 rounded-xl p-1 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-luxury-gold text-white shadow-[0_2px_8px_rgba(0,0,0,0.1)]'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
            }`}
          >
            <Icon className="w-4 h-4" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
