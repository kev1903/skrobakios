import React from 'react';
import { SuperSearchBar } from '@/components/SuperSearchBar';

interface TopHeaderProps {
  onNavigate?: (page: string, data?: any) => void;
  onSelectProject?: (projectId: string) => void;
}

export const TopHeader = ({ onNavigate, onSelectProject }: TopHeaderProps) => {
  return (
    <div className="fixed top-20 right-4 z-50 w-full max-w-md">
      <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="px-4 py-2">
          <SuperSearchBar 
            onNavigate={onNavigate}
            onSelectProject={onSelectProject}
          />
        </div>
      </div>
    </div>
  );
};