
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building, Settings } from 'lucide-react';

const CompanySettingsPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Company Settings</h1>
          <p className="text-muted-foreground">
            Manage your company information and settings
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Company Information */}
        <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input id="company-name" placeholder="Enter company name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-email">Company Email</Label>
              <Input id="company-email" type="email" placeholder="Enter company email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-phone">Company Phone</Label>
              <Input id="company-phone" placeholder="Enter company phone" />
            </div>
            <Button className="w-full bg-gradient-primary hover:opacity-90 text-white">
              Update Company Info
            </Button>
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Advanced Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground">Advanced settings will appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanySettingsPage;
