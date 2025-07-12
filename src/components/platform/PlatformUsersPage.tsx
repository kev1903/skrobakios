import React from 'react';
import { Users, Crown, Shield, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const PlatformUsersPage = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-yellow-100 rounded-lg">
          <Users className="h-6 w-6 text-yellow-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Platform Users</h1>
          <p className="text-muted-foreground">Manage all users across the platform</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-600" />
              Super Admins
            </CardTitle>
            <CardDescription>Platform administrators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">2</div>
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300 mt-2">
              Highest Access
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Company Owners
            </CardTitle>
            <CardDescription>Organization leaders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">15</div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 mt-2">
              Company Access
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-green-600" />
              Regular Users
            </CardTitle>
            <CardDescription>Team members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">284</div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 mt-2">
              Standard Access
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Platform-wide user administration and role management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>User management interface will be implemented here</p>
            <p className="text-sm">View, edit, and manage all platform users</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};