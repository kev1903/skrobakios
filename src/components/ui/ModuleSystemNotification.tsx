import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ModuleSystemNotificationProps {
  className?: string;
}

export const ModuleSystemNotification = ({ className = "" }: ModuleSystemNotificationProps) => {
  return (
    <Alert className={`border-blue-200 bg-blue-50 ${className}`}>
      <CheckCircle2 className="h-4 w-4 text-blue-600" />
      <AlertTitle className="text-blue-800">Module System Active</AlertTitle>
      <AlertDescription className="text-blue-700">
        Your platform now uses a dynamic module system. Only enabled modules will appear in navigation. 
        Super admins can configure modules in Company Settings → Modules.
      </AlertDescription>
    </Alert>
  );
};