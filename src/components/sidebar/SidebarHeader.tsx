
import React from 'react';
import { SidebarHeader as SidebarHeaderBase } from '@/components/ui/sidebar';
import { useUser } from '@/contexts/UserContext';

interface SidebarHeaderProps {
  isCollapsed: boolean;
}

export const SidebarHeader = ({ isCollapsed }: SidebarHeaderProps) => {
  const { userProfile, loading } = useUser();

  return (
    <SidebarHeaderBase className="p-6 border-b border-white/20 bg-white/5 backdrop-blur-sm">
      <div className="flex items-center">
        {!isCollapsed && (
          <div className="p-3 rounded-lg bg-white/10 backdrop-blur-sm shadow-lg">
            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent heading-modern">
              {userProfile.companyName || 'KAKSIK'}
            </h1>
            <p className="text-xs text-slate-600 font-inter">
              {loading ? 'Loading...' : (userProfile.companySlogan || 'Modern Workspace')}
            </p>
          </div>
        )}
      </div>
    </SidebarHeaderBase>
  );
};
