import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Users, Settings, BarChart3 } from "lucide-react";
import { InvitationDialog } from './InvitationDialog';
import { InvitationList } from './InvitationList';
import { InvitationStats } from './InvitationStats';

interface BusinessInvitationManagerProps {
  onNavigate: (page: string) => void;
}

export const BusinessInvitationManager: React.FC<BusinessInvitationManagerProps> = ({ onNavigate }) => {
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Business Invitations</h1>
          <p className="text-muted-foreground">Manage platform access and user invitations</p>
        </div>
        <Button onClick={() => setShowInviteDialog(true)} className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Send Invitation
        </Button>
      </div>

      <InvitationStats />

      <Tabs defaultValue="invitations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="invitations" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Invitations
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="invitations">
          <InvitationList />
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Invitation Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Detailed analytics coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Invitation Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Invitation configuration settings coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <InvitationDialog 
        open={showInviteDialog} 
        onOpenChange={setShowInviteDialog} 
      />
    </div>
  );
};