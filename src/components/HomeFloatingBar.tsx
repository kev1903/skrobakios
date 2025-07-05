import React from 'react';
import { Search, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useUser } from '@/contexts/UserContext';
interface HomeFloatingBarProps {
  onNavigate: (page: string) => void;
}
export const HomeFloatingBar = ({
  onNavigate
}: HomeFloatingBarProps) => {
  const {
    userProfile
  } = useUser();
  return <div className="fixed top-6 left-0 z-50 w-full">
        <div className="flex items-center justify-between py-0 px-6 mx-6">
        {/* Left side - Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 w-4 h-4" />
            <Input type="text" placeholder="Search projects, tasks, files..." className="pl-10 pr-4 text-sm border-white/20 focus:border-white/40 focus:ring-white/30 bg-white/20 backdrop-blur-sm shadow-sm text-white placeholder-white/60 hover:bg-white/25 transition-all duration-200 py-0 px-[36px]" />
          </div>
        </div>

        {/* Center - Company Logo */}
        <div className="flex-shrink-0 mx-8">
          <div className="flex items-center space-x-3">
            
            
          </div>
        </div>

        {/* Right side - User Profile */}
        <div className="flex-shrink-0">
          <button onClick={() => onNavigate('user-edit')} className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors duration-200 py-0 px-[90px]">
            <Avatar className="w-6 h-6">
              <AvatarImage src={userProfile.avatarUrl} alt="Profile" />
              <AvatarFallback className="bg-white/40 text-white text-xs">
                <User className="w-3 h-3" />
              </AvatarFallback>
            </Avatar>
          </button>
        </div>
      </div>
    </div>;
};