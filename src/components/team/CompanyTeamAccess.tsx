import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, Crown, User } from 'lucide-react';

interface CompanyTeamAccessProps {
  userRole: string | null;
  companyName?: string;
}

export const CompanyTeamAccess: React.FC<CompanyTeamAccessProps> = ({ userRole, companyName }) => {
  if (!userRole || !['owner', 'admin'].includes(userRole)) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertTriangle className="h-5 w-5" />
            <div>
              <p className="font-medium">Access Restricted</p>
              <p className="text-sm">
                Only company owners and administrators can manage team members.
                {userRole && (
                  <span className="block mt-1">Your current role: <strong>{userRole}</strong></span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 text-green-700">
          <Shield className="h-5 w-5" />
          <div>
            <p className="font-medium">Team Management Access</p>
            <p className="text-sm text-muted-foreground">
              You have {userRole} access to manage {companyName || 'this company'}'s team.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};