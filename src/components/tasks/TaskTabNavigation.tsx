import React from 'react';
import { Button } from '@/components/ui/button';

interface TaskTabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const TaskTabNavigation = ({ activeTab, onTabChange }: TaskTabNavigationProps) => {
  const tabs = ["overview", "list", "board", "timeline", "calendar"];

  return (
    <div className="flex items-center space-x-4 mb-6">
      {tabs.map((tab) => (
        <Button
          key={tab}
          variant={activeTab === tab ? "default" : "ghost"}
          onClick={() => onTabChange(tab)}
          className={`capitalize ${
            activeTab === tab
              ? "backdrop-blur-xl bg-white/20 border border-white/30 text-white"
              : "text-white/70 hover:bg-white/10 hover:text-white"
          }`}
        >
          {tab}
        </Button>
      ))}
    </div>
  );
};