
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useDashboardData } from '@/hooks/useDashboardData';

export const UserWelcomePanel = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { onboardingTasks } = useDashboardData();

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    if (!firstName && !lastName) return 'U';
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getDisplayName = () => {
    if (profile?.first_name || profile?.last_name) {
      return `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
    }
    return user?.email?.split('@')[0] || 'User';
  };

  const pendingTasks = onboardingTasks.filter(task => !task.completed).length;

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 font-manrope-thin font-extralight">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className="relative">
            <Avatar className="w-20 h-20 mx-auto ring-4 ring-[#E6F0FF]">
              <AvatarImage src={profile?.avatar_url || "/lovable-uploads/39fa74b4-f31c-4e52-99aa-01226dcff8a5.png"} />
              <AvatarFallback className="bg-[#3366FF] text-white text-lg font-semibold">
                {getInitials(profile?.first_name, profile?.last_name)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-gray-900">{getDisplayName()}</h3>
            <p className="text-sm text-gray-600">{profile?.job_title || 'Team Member'}</p>
            {profile?.company && (
              <Badge className="bg-[#E6F0FF] text-[#3366FF] border-[#4D8BFF] px-3 py-1 text-xs font-medium">
                {profile.company}
              </Badge>
            )}
          </div>

          <div className="pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600 mb-2">Welcome back! 👋</p>
            <p className="text-xs text-gray-500">
              You have {pendingTasks} tasks pending today
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
