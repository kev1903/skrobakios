import React from 'react';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { AdminHeader } from './AdminHeader';
import { EmailTestButton } from './EmailTestButton';

interface AdminPanelProps {
  onNavigate: (page: string) => void;
}

export const AdminPanel = ({ onNavigate }: AdminPanelProps) => {
  const { isSuperAdmin } = useAuth();

  if (!isSuperAdmin) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need superadmin privileges to access this panel.</p>
          <Button 
            onClick={() => onNavigate('dashboard')} 
            className="mt-4"
            variant="outline"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <AdminHeader onNavigate={onNavigate} />
        <EmailTestButton />
      </div>
      
      <div className="text-center p-8">
        <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Superadmin Panel</h2>
        <p className="text-muted-foreground">
          User management features have been removed. Only superadmin access remains.
        </p>
      </div>
    </div>
  );
};