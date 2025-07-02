import React from 'react';
import { SuperSearchBar } from '@/components/SuperSearchBar';

interface TopHeaderProps {
  onNavigate?: (page: string, data?: any) => void;
  onSelectProject?: (projectId: string) => void;
}

export const TopHeader = ({ onNavigate, onSelectProject }: TopHeaderProps) => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-16">
          <SuperSearchBar 
            onNavigate={onNavigate}
            onSelectProject={onSelectProject}
          />
        </div>
      </div>
    </header>
  );
};