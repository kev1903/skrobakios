import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
interface ModuleSystemNotificationProps {
  className?: string;
}
export const ModuleSystemNotification = ({
  className = ""
}: ModuleSystemNotificationProps) => {
  return (
    <Alert className={className}>
      <CheckCircle2 className="h-4 w-4" />
      <AlertTitle>Module System Active</AlertTitle>
      <AlertDescription>
        Your company's module system is now configured and active. All enabled modules are ready to use.
      </AlertDescription>
    </Alert>
  );
};