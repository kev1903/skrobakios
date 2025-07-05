import React from 'react';
import { User } from 'lucide-react';
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

  return (
    <div className="fixed top-6 left-0 z-50 w-full">
      <div className="flex items-center justify-end py-0 px-6 mx-6">
        {/* Right side - User Profile */}
        <div className="flex-shrink-0">
          <button onClick={() => onNavigate('user-edit')} className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 flex items-center justify-center hover:bg-white/30 transition-colors duration-200">
            <Avatar className="w-6 h-6">
              <AvatarImage src={userProfile.avatarUrl} alt="Profile" />
              <AvatarFallback className="bg-white/40 text-white text-xs">
                <User className="w-3 h-3" />
              </AvatarFallback>
            </Avatar>
          </button>
        </div>
      </div>
    </div>
  );
};