import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { UserManagement } from '@/components/admin/UserManagement';

interface PlatformUserManagementProps {
  onNavigate: (page: string) => void;
}

export const PlatformUserManagement = ({ onNavigate }: PlatformUserManagementProps) => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={() => onNavigate('platform-dashboard')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold">User Management</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform Users</CardTitle>
        </CardHeader>
        <CardContent>
          <UserManagement />
        </CardContent>
      </Card>
    </div>
  );
};