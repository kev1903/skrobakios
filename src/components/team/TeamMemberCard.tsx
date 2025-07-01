import { Mail, Clock, MoreVertical, Shield, User, Eye, FileText, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TeamMember } from "@/hooks/team/types";

interface TeamMemberCardProps {
  member: TeamMember;
  onRemove: (memberId: string) => void;
  onUpdateRole: (memberId: string, newRole: TeamMember['role']) => void;
  onResendInvitation?: (memberId: string) => void;
}

export const TeamMemberCard = ({ member, onRemove, onUpdateRole, onResendInvitation }: TeamMemberCardProps) => {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'project_admin':
        return Shield;
      case 'editor':
        return FileText;
      case 'viewer':
        return Eye;
      case 'guest':
        return Clock;
      default:
        return User;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'project_admin':
        return 'bg-purple-100 text-purple-800';
      case 'editor':
        return 'bg-blue-100 text-blue-800';
      case 'viewer':
        return 'bg-green-100 text-green-800';
      case 'guest':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const RoleIcon = getRoleIcon(member.role);

  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
      <div className="flex items-center space-x-4">
        <Avatar>
          <AvatarImage src={member.avatar_url} />
          <AvatarFallback>
            {member.name ? member.name.split(' ').map(n => n[0]).join('') : member.email[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-gray-900">{member.name || member.email}</h3>
            <Badge className={getStatusBadgeColor(member.status)}>
              {member.status}
            </Badge>
            <Badge className={getRoleBadgeColor(member.role)}>
              {member.role.replace('_', ' ')}
            </Badge>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
            <div className="flex items-center space-x-1">
              <RoleIcon className="w-4 h-4" />
              <span className="capitalize">{member.role.replace('_', ' ')}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Mail className="w-4 h-4" />
              <span>{member.email}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>Invited {new Date(member.invited_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {member.status === 'pending' && onResendInvitation && (
            <DropdownMenuItem onClick={() => onResendInvitation(member.id)}>
              <Send className="w-4 h-4 mr-2" />
              Resend Invitation
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => onUpdateRole(member.id, 'project_admin')}>
            Make Project Admin
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onUpdateRole(member.id, 'editor')}>
            Make Editor
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onUpdateRole(member.id, 'viewer')}>
            Make Viewer
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onUpdateRole(member.id, 'guest')}>
            Make Guest
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-red-600"
            onClick={() => onRemove(member.id)}
          >
            Remove Member
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
