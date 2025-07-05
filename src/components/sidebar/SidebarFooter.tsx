
import React from 'react';
import { LogOut, User } from 'lucide-react';
import { SidebarFooter as SidebarFooterBase } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useUser } from "@/contexts/UserContext";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarFooterProps {
  isCollapsed: boolean;
  onNavigate: (page: string) => void;
}

export const SidebarFooter = ({ isCollapsed, onNavigate }: SidebarFooterProps) => {
  const { userProfile, loading } = useUser();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      onNavigate('auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Get the user's full name from the database profile
  const getUserDisplayName = () => {
    if (loading) return 'Loading...';
    
    if (userProfile.firstName && userProfile.lastName) {
      return `${userProfile.firstName} ${userProfile.lastName}`;
    } else if (userProfile.firstName) {
      return userProfile.firstName;
    } else if (userProfile.lastName) {
      return userProfile.lastName;
    } else {
      return user?.email || 'User';
    }
  };

  // Get the user's role/job title from the database profile
  const getUserRole = () => {
    if (loading) return '';
    return userProfile.jobTitle || 'No role specified';
  };

  return (
    <SidebarFooterBase className="p-4 border-t border-white/20 bg-white/5 backdrop-blur-sm">
      <Button
        variant="ghost"
        onClick={() => onNavigate('user-edit')}
        className="w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg hover:bg-white/15 hover:backdrop-blur-md transition-all duration-300 group shadow-sm hover:shadow-lg justify-start"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-blue-700 rounded-full flex items-center justify-center overflow-hidden shadow-lg backdrop-blur-sm">
          {userProfile.avatarUrl ? (
            <img 
              src={userProfile.avatarUrl} 
              alt="User Avatar" 
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-4 h-4 text-white" />
          )}
        </div>
        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate font-poppins">
              {getUserDisplayName()}
            </p>
            <p className="text-xs text-slate-500 truncate font-inter">{getUserRole()}</p>
          </div>
        )}
      </Button>
      
      <Button 
        variant="ghost"
        onClick={handleLogout}
        className="w-full flex items-center space-x-3 px-3 py-2 mt-2 text-left rounded-lg hover:bg-red-100/20 hover:backdrop-blur-md transition-all duration-300 text-slate-500 hover:text-red-600 group shadow-sm hover:shadow-lg justify-start"
      >
        <LogOut className="w-4 h-4" />
        {!isCollapsed && <span className="text-sm font-inter">Logout</span>}
      </Button>
    </SidebarFooterBase>
  );
};
