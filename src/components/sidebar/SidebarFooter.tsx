
import React from 'react';
import { LogOut, User } from 'lucide-react';
import { SidebarFooter as SidebarFooterBase } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
      <div className="w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg bg-white/10 backdrop-blur-md transition-all duration-300 shadow-sm justify-start">
        <Avatar className="w-8 h-8 shadow-lg">
          <AvatarImage 
            src={userProfile.avatarUrl || undefined} 
            alt={`${userProfile?.firstName || 'User'} ${userProfile?.lastName || ''}`.trim()}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <AvatarFallback className="bg-gradient-to-br from-slate-600 to-blue-700 text-white">
            {userProfile?.firstName && userProfile?.lastName 
              ? `${userProfile.firstName.charAt(0)}${userProfile.lastName.charAt(0)}`.toUpperCase()
              : userProfile?.firstName?.charAt(0)?.toUpperCase() || userProfile?.email?.charAt(0)?.toUpperCase() || <User className="w-4 h-4" />
            }
          </AvatarFallback>
        </Avatar>
        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate font-poppins">
              {getUserDisplayName()}
            </p>
            <p className="text-xs text-slate-500 truncate font-inter">{getUserRole()}</p>
          </div>
        )}
      </div>
      
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
