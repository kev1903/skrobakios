import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useProjectUsers, formatUserName } from '@/hooks/useProjectUsers';
import { User } from 'lucide-react';

interface SimpleTeamAssignmentProps {
  projectId: string;
  currentAssignee?: { name: string; avatar: string; userId?: string };
  onAssigneeChange: (assignee: { name: string; avatar: string; userId: string } | null) => void;
  className?: string;
}

export function SimpleTeamAssignment({ 
  projectId, 
  currentAssignee, 
  onAssigneeChange, 
  className 
}: SimpleTeamAssignmentProps) {
  const { data: teamMembers, isLoading } = useProjectUsers(projectId);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleChange = (value: string) => {
    if (value === 'unassign') {
      onAssigneeChange(null);
      return;
    }
    
    const member = teamMembers?.find(m => (m.user_id || m.id) === value);
    if (member) {
      onAssigneeChange({
        name: formatUserName(member),
        avatar: member.profile?.avatar_url || '',
        userId: member.user_id || member.id
      });
    }
  };

  if (isLoading) {
    return (
      <div className={`h-7 flex items-center text-xs border-0 bg-transparent p-1 ${className}`}>
        <span className="text-xs text-muted-foreground">Loading...</span>
      </div>
    );
  }

  return (
    <Select 
      value={currentAssignee?.userId || 'unassigned'} 
      onValueChange={handleChange}
    >
      <SelectTrigger className={`h-7 text-xs border-0 bg-transparent hover:bg-accent/30 focus:ring-0 focus:ring-offset-0 p-1 ${className}`}>
        {currentAssignee?.name ? (
          <div className="flex items-center gap-1.5">
            <Avatar className="h-4 w-4">
              {currentAssignee.avatar ? (
                <AvatarImage src={currentAssignee.avatar} alt={currentAssignee.name} />
              ) : null}
              <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                {getInitials(currentAssignee.name)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground truncate">
              {currentAssignee.name}
            </span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground truncate">
            Assign to...
          </span>
        )}
      </SelectTrigger>
      <SelectContent className="min-w-[280px] bg-background border shadow-lg z-50 p-1">
        <SelectItem value="unassigned" className="text-xs py-2 pr-2 cursor-pointer">
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5">
              <AvatarFallback className="text-[10px] bg-muted">
                <User className="h-3 w-3" />
              </AvatarFallback>
            </Avatar>
            <span className="text-muted-foreground">Unassigned</span>
          </div>
        </SelectItem>
        {teamMembers?.filter(member => {
          const memberId = member.user_id || member.id;
          return memberId && memberId.trim() !== '';
        }).map((member) => {
          const memberName = formatUserName(member);
          const avatarUrl = member.profile?.avatar_url;
          
          return (
            <SelectItem 
              key={member.id} 
              value={member.user_id || member.id} 
              className="text-xs py-2 pr-2 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Avatar className="h-5 w-5">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt={memberName} />
                  ) : null}
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                    {getInitials(memberName)}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{memberName}</span>
                {member.isCurrentUser && (
                  <span className="text-xs text-blue-600">(Me)</span>
                )}
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
