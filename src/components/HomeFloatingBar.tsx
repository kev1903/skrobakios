import React from 'react';
import { Search, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useUser } from '@/contexts/UserContext';

interface HomeFloatingBarProps {
  onNavigate: (page: string) => void;
}

export const HomeFloatingBar = ({ onNavigate }: HomeFloatingBarProps) => {
  const { userProfile } = useUser();
  return <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-4xl px-6">
      <div style={{
      background: 'rgba(255, 255, 255, 0.25)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)'
    }} className="flex items-center justify-between rounded-2xl shadow-2xl py-0 px-[19px]">
        {/* Left side - Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 w-4 h-4" />
            <Input type="text" placeholder="Search projects, tasks, files..." className="pl-10 pr-4 py-2 text-sm border-white/20 focus:border-white/40 focus:ring-white/30 bg-white/20 backdrop-blur-sm shadow-sm text-white placeholder-white/60 hover:bg-white/25 transition-all duration-200" />
          </div>
        </div>

        {/* Center - Company Logo */}
        <div className="flex-shrink-0 mx-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <div className="text-white font-semibold text-lg tracking-wide">
              Lovable
            </div>
          </div>
        </div>

        {/* Right side - User Profile */}
        <div className="flex-shrink-0">
          <button 
            onClick={() => onNavigate('user-edit')}
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
          >
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