import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface UserAvatarProps {
  name: string;
  avatar?: string;
  userId?: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  showTooltip?: boolean;
  role?: string;
  professionalTitle?: string;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  avatar,
  userId,
  size = 'md',
  showName = false,
  showTooltip = false,
  role,
  professionalTitle,
  className = ''
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'w-6 h-6 text-xs';
      case 'lg': return 'w-12 h-12 text-lg';
      default: return 'w-8 h-8 text-sm';
    }
  };

  const avatarComponent = (
    <div className={`flex items-center gap-2 ${className}`}>
      <Avatar className={getSizeClasses()}>
        <AvatarImage src={avatar} alt={`${name}'s avatar`} />
        <AvatarFallback className="bg-primary/10 text-primary">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>
      {showName && (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{name}</span>
          {professionalTitle && (
            <span className="text-xs text-muted-foreground">{professionalTitle}</span>
          )}
          {role && (
            <Badge variant="outline" className="text-xs w-fit">
              {role}
            </Badge>
          )}
        </div>
      )}
    </div>
  );

  if (showTooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {avatarComponent}
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-medium">{name}</p>
            {professionalTitle && (
              <p className="text-sm text-muted-foreground">{professionalTitle}</p>
            )}
            {role && (
              <Badge variant="outline" className="text-xs">
                {role}
              </Badge>
            )}
            {userId && (
              <p className="text-xs text-muted-foreground">ID: {userId.slice(0, 8)}...</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  return avatarComponent;
};