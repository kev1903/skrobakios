
import { Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamMemberCard } from "./TeamMemberCard";

interface TeamMember {
  id: string;
  email: string;
  name?: string;
  role: 'project_admin' | 'editor' | 'viewer' | 'guest';
  status: string;
  invited_at: string;
  joined_at?: string;
  notify_on_task_added?: boolean;
  avatar_url?: string;
}

interface TeamMembersListProps {
  teamMembers: TeamMember[];
  onRemoveMember: (memberId: string) => void;
  onUpdateRole: (memberId: string, newRole: TeamMember['role']) => void;
  onResendInvitation?: (memberId: string) => void;
}

export const TeamMembersList = ({ teamMembers, onRemoveMember, onUpdateRole, onResendInvitation }: TeamMembersListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
      </CardHeader>
      <CardContent>
        {teamMembers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No team members yet. Start by inviting someone!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {teamMembers.map((member) => (
              <TeamMemberCard
                key={member.id}
                member={member}
                onRemove={onRemoveMember}
                onUpdateRole={onUpdateRole}
                onResendInvitation={onResendInvitation}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
