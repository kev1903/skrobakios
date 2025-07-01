
import { Users, Shield, UserPlus, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface TeamMember {
  id: string;
  status: string;
}

interface ProjectAccessSettings {
  access_level: 'private_to_members' | 'public' | 'restricted';
}

interface TeamStatisticsProps {
  teamMembers: TeamMember[];
  accessSettings: ProjectAccessSettings;
}

export const TeamStatistics = ({ teamMembers, accessSettings }: TeamStatisticsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Members</p>
              <p className="text-2xl font-bold text-gray-900">{teamMembers.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Members</p>
              <p className="text-2xl font-bold text-gray-900">
                {teamMembers.filter(m => m.status === 'active').length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <UserPlus className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Invites</p>
              <p className="text-2xl font-bold text-gray-900">
                {teamMembers.filter(m => m.status === 'pending').length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <Settings className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Access Level</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">
                {accessSettings.access_level.replace('_', ' ')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
