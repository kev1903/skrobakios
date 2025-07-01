
import React from 'react';
import { LogOut, User } from 'lucide-react';
import { SidebarFooter as SidebarFooterBase } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUser } from "@/contexts/UserContext";
import { useAuth } from "@/contexts/AuthContext";

interface SidebarFooterProps {
  isCollapsed: boolean;
  onNavigate: (page: string) => void;
}

export const SidebarFooter = ({ isCollapsed, onNavigate }: SidebarFooterProps) => {
  const { userProfile } = useUser();
  const { user, userRole, signOut, isSuperAdmin, isAdmin } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      onNavigate('auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <SidebarFooterBase className="p-4 border-t border-white/20">
      <Button
        variant="ghost"
        onClick={() => onNavigate('user-edit')}
        className="w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg hover:bg-white/20 transition-all duration-200 group backdrop-blur-sm hover:shadow-md justify-start"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-blue-700 rounded-full flex items-center justify-center overflow-hidden shadow-lg">
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
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium text-slate-800 truncate font-poppins">
                {user?.email || userProfile.firstName + ' ' + userProfile.lastName}
              </p>
              {userRole && (
                <Badge variant={isSuperAdmin ? "destructive" : isAdmin ? "default" : "secondary"} className="text-xs">
                  {userRole}
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 truncate font-inter">{userProfile.jobTitle}</p>
          </div>
        )}
      </Button>
      
      <Button 
        variant="ghost"
        onClick={handleLogout}
        className="w-full flex items-center space-x-3 px-3 py-2 mt-2 text-left rounded-lg hover:bg-red-50/50 transition-all duration-200 text-slate-500 hover:text-red-600 group backdrop-blur-sm hover:shadow-md justify-start"
      >
        <LogOut className="w-4 h-4" />
        {!isCollapsed && <span className="text-sm font-inter">Logout</span>}
      </Button>
    </SidebarFooterBase>
  );
};
