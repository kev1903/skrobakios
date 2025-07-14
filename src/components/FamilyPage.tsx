import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, Calendar, MessageCircle, Home } from 'lucide-react';

interface FamilyPageProps {
  onNavigate?: (page: string) => void;
}

export const FamilyPage = ({ onNavigate }: FamilyPageProps) => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Family</h1>
        </div>
        <Button
          onClick={() => onNavigate?.('home')}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Family Members</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Manage your family members and connections.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Family Events</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Schedule and track important family events.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <span>Communication</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Stay connected with family members.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};