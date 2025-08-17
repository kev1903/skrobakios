
import React, { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useAuth } from '@/contexts/AuthContext';
import { useGlobalSidebar } from '@/contexts/GlobalSidebarContext';
import { User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BusinessSwitcher } from './BusinessSwitcher';

interface MobileHeaderProps {
  onNavigate: (page: string) => void;
}

export const MobileHeader = ({ onNavigate }: MobileHeaderProps) => {
  const { userProfile, loading } = useUser();
  const { user } = useAuth();
  const { isOpen, toggleSidebar } = useGlobalSidebar();

  // Get the user's display name from the database profile
  const getUserDisplayName = () => {
    if (loading) return 'Loading...';
    
    if (userProfile.firstName && userProfile.lastName) {
      return `${userProfile.firstName} ${userProfile.lastName}`;
    } else if (userProfile.firstName) {
      return userProfile.firstName;
    } else if (userProfile.lastName) {
      return userProfile.lastName;
    } else {
      return user?.email?.split('@')[0] || 'User';
    }
  };

  // Get the user's role/job title from the database profile
  const getUserRole = () => {
    if (loading) return '';
    return userProfile.jobTitle || '';
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 flex items-center justify-between px-4 bg-background/90 backdrop-blur-sm border-b border-border/50 shadow-sm md:hidden z-30">
      <div className="flex items-center space-x-3">
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Hamburger clicked - toggling mobile sidebar');
            toggleSidebar();
          }}
          className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
          aria-label="Toggle sidebar"
          style={{ position: 'relative', zIndex: 9999 }}
        >
          <Menu className="w-4 h-4 text-slate-700" />
        </button>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-br from-slate-600 to-blue-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs font-poppins">K</span>
          </div>
          <h1 className="text-sm font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent heading-modern">KAKSIK</h1>
        </div>
      </div>
      
      {/* Business Switcher */}
      <div className="flex-1 flex justify-center">
        <BusinessSwitcher />
      </div>
      
      <div className="flex items-center space-x-2 px-2 py-1 rounded-lg bg-white/10">
        <Avatar className="w-6 h-6">
          <AvatarImage 
            src={userProfile.avatarUrl || undefined} 
            alt={`${userProfile?.firstName || 'User'} ${userProfile?.lastName || ''}`.trim()}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <AvatarFallback className="bg-gradient-to-br from-slate-600 to-blue-700 text-white text-xs">
            {userProfile?.firstName && userProfile?.lastName 
              ? `${userProfile.firstName.charAt(0)}${userProfile.lastName.charAt(0)}`.toUpperCase()
              : userProfile?.firstName?.charAt(0)?.toUpperCase() || userProfile?.email?.charAt(0)?.toUpperCase() || <User className="w-3 h-3" />
            }
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start">
          <span className="text-xs font-medium text-slate-800 font-poppins">
            {getUserDisplayName()}
          </span>
          {getUserRole() && (
            <span className="text-xs text-slate-500 font-inter">
              {getUserRole()}
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
