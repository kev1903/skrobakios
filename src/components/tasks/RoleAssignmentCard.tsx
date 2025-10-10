import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, UserCheck } from 'lucide-react';

interface RoleAssignmentCardProps {
  role: 'assignee' | 'reviewer';
  name: string;
  avatar?: string;
  email?: string;
  status?: string;
}

export const RoleAssignmentCard = ({ role, name, avatar, email, status }: RoleAssignmentCardProps) => {
  const isAssignee = role === 'assignee';
  
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isAssignee ? 'bg-blue-500/10 text-blue-600' : 'bg-purple-500/10 text-purple-600'
        }`}>
          {isAssignee ? <User className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {isAssignee ? 'Assignee' : 'Reviewer'}
            </span>
            {status && (
              <Badge variant="outline" className="text-xs">
                {status}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback className="text-xs">
                {name
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{name}</p>
              {email && <p className="text-xs text-muted-foreground">{email}</p>}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
