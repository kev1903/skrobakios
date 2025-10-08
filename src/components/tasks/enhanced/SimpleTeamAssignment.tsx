import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProjectUsers, formatUserName } from '@/hooks/useProjectUsers';

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
      <div className={`h-7 text-xs border-0 bg-transparent p-1 ${className}`}>
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
        <span className="text-xs text-muted-foreground truncate">
          {currentAssignee?.name || 'Assign to...'}
        </span>
      </SelectTrigger>
      <SelectContent className="min-w-48 bg-white border shadow-lg z-50 p-1">
        <SelectItem value="unassigned" className="text-xs py-2 px-2 cursor-pointer">
          <span className="text-muted-foreground">Unassigned</span>
        </SelectItem>
        {teamMembers?.map((member) => (
          <SelectItem 
            key={member.id} 
            value={member.user_id || member.id} 
            className="text-xs py-2 px-2 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">{formatUserName(member)}</span>
              {member.isCurrentUser && (
                <span className="text-xs text-blue-600">(Me)</span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
