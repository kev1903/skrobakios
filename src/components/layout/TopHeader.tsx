import React from 'react';
import { SuperSearchBar } from '@/components/SuperSearchBar';

interface TopHeaderProps {
  onNavigate?: (page: string, data?: any) => void;
  onSelectProject?: (projectId: string) => void;
}

export const TopHeader = ({ onNavigate, onSelectProject }: TopHeaderProps) => {
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="px-6 py-3">
          <SuperSearchBar 
            onNavigate={onNavigate}
            onSelectProject={onSelectProject}
          />
        </div>
      </div>
    </div>
  );
};