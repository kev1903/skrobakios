
import React from 'react';
import { SidebarHeader as SidebarHeaderBase } from '@/components/ui/sidebar';

interface SidebarHeaderProps {
  isCollapsed: boolean;
}

export const SidebarHeader = ({ isCollapsed }: SidebarHeaderProps) => {
  return (
    <SidebarHeaderBase className="p-6 border-b border-white/20">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-sm font-poppins">K</span>
        </div>
        {!isCollapsed && (
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent heading-modern">KAKSIK</h1>
            <p className="text-xs text-slate-500 font-inter">Modern Workspace</p>
          </div>
        )}
      </div>
    </SidebarHeaderBase>
  );
};
