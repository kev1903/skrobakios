import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ImpersonationBannerProps {
  impersonatedUser: {
    email: string;
    name: string;
  };
}

export const ImpersonationBanner = ({ impersonatedUser }: ImpersonationBannerProps) => {
  const { exitImpersonation } = useAuth();

  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-3 shadow-lg">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5" />
          <div>
            <p className="font-semibold">
              Impersonating User: {impersonatedUser.name || impersonatedUser.email}
            </p>
            <p className="text-sm opacity-90">
              You are viewing the application as this user would see it
            </p>
          </div>
        </div>
        <Button
          onClick={exitImpersonation}
          variant="outline"
          size="sm"
          className="bg-white/20 border-white/30 text-white hover:bg-white/30"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Exit Impersonation
        </Button>
      </div>
    </div>
  );
};