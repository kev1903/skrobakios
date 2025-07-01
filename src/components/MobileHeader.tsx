
import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useUser } from '@/contexts/UserContext';
import { useAuth } from '@/contexts/AuthContext';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileHeaderProps {
  onNavigate: (page: string) => void;
}

export const MobileHeader = ({ onNavigate }: MobileHeaderProps) => {
  const { userProfile } = useUser();
  const { user } = useAuth();

  // Get the user's display name from the database profile
  const getUserDisplayName = () => {
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

  return (
    <header className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b border-white/20 shadow-sm md:hidden">
      <div className="flex items-center space-x-3">
        <SidebarTrigger />
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-br from-slate-600 to-blue-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs font-poppins">K</span>
          </div>
          <h1 className="text-sm font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent heading-modern">KAKSIK</h1>
        </div>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onNavigate('user-edit')}
        className="flex items-center space-x-2"
      >
        <div className="w-6 h-6 bg-gradient-to-br from-slate-600 to-blue-700 rounded-full flex items-center justify-center overflow-hidden">
          {userProfile.avatarUrl ? (
            <img 
              src={userProfile.avatarUrl} 
              alt="User Avatar" 
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-3 h-3 text-white" />
          )}
        </div>
        <div className="flex flex-col items-start">
          <span className="text-xs font-medium text-slate-800 font-poppins">
            {getUserDisplayName()}
          </span>
        </div>
      </Button>
    </header>
  );
};
