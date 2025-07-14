import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Lock, Key, Eye, Home } from 'lucide-react';

interface SecurityPageProps {
  onNavigate?: (page: string) => void;
}

export const SecurityPage = ({ onNavigate }: SecurityPageProps) => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Security</h1>
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
              <Lock className="w-5 h-5" />
              <span>Password Security</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Manage your password and authentication settings.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="w-5 h-5" />
              <span>Two-Factor Auth</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Set up two-factor authentication for enhanced security.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="w-5 h-5" />
              <span>Privacy Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Control your privacy and data sharing preferences.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};