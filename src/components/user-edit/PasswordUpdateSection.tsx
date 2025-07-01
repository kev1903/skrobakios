
import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const PasswordUpdateSection = () => {
  const { toast } = useToast();
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setUpdatingPassword(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Password updated successfully",
        });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: "Error",
        description: "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center space-x-3 text-slate-800">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200/60 backdrop-blur-sm">
            <Lock className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-xl font-semibold">Update Password</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="newPassword" className="text-slate-700 font-medium">New Password</Label>
          <Input
            id="newPassword"
            type="password"
            value={passwordData.newPassword}
            onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
            placeholder="Enter new password"
            className="backdrop-blur-sm bg-white/60 border-white/30 focus:bg-white/80 focus:border-blue-300 transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-slate-700 font-medium">Confirm New Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={passwordData.confirmPassword}
            onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
            placeholder="Confirm new password"
            className="backdrop-blur-sm bg-white/60 border-white/30 focus:bg-white/80 focus:border-blue-300 transition-all duration-200"
          />
        </div>

        <div className="pt-4">
          <Button 
            onClick={handlePasswordUpdate}
            disabled={updatingPassword || !passwordData.newPassword || !passwordData.confirmPassword}
            className="backdrop-blur-sm bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {updatingPassword ? 'Updating Password...' : 'Update Password'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
