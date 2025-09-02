import React from 'react';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface AutoScheduleNotification {
  id: string;
  taskId: string;
  taskName: string;
  wbsId: string;
  oldStartDate?: string;
  newStartDate?: string;
  oldEndDate?: string;
  newEndDate?: string;
  type: 'scheduled' | 'warning' | 'error';
  message: string;
  timestamp: Date;
}

interface AutoScheduleNotificationProps {
  notifications: AutoScheduleNotification[];
  onDismiss?: (id: string) => void;
  onDismissAll?: () => void;
}

export const AutoScheduleNotification: React.FC<AutoScheduleNotificationProps> = ({
  notifications,
  onDismiss,
  onDismissAll
}) => {
  if (notifications.length === 0) return null;

  const getIcon = (type: AutoScheduleNotification['type']) => {
    switch (type) {
      case 'scheduled':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getVariant = (type: AutoScheduleNotification['type']) => {
    switch (type) {
      case 'scheduled':
        return 'default';
      case 'warning':
        return 'destructive';
      case 'error':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {notifications.slice(-3).map((notification) => (
        <Alert key={notification.id} variant={getVariant(notification.type)} className="shadow-lg">
          <div className="flex items-start gap-2">
            {getIcon(notification.type)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary" className="text-xs">
                  {notification.wbsId}
                </Badge>
                <span className="text-xs text-muted-foreground truncate">
                  {notification.taskName}
                </span>
              </div>
              <AlertDescription className="text-sm">
                {notification.message}
              </AlertDescription>
              {notification.newStartDate && notification.oldStartDate !== notification.newStartDate && (
                <div className="text-xs text-muted-foreground mt-1">
                  Start: {notification.oldStartDate} → {notification.newStartDate}
                </div>
              )}
            </div>
            {onDismiss && (
              <button
                onClick={() => onDismiss(notification.id)}
                className="text-muted-foreground hover:text-foreground text-xs p-1"
              >
                ×
              </button>
            )}
          </div>
        </Alert>
      ))}
      
      {notifications.length > 3 && (
        <Alert className="shadow-lg">
          <div className="flex items-center justify-between">
            <AlertDescription className="text-sm">
              {notifications.length - 3} more auto-schedule updates...
            </AlertDescription>
            {onDismissAll && (
              <button
                onClick={onDismissAll}
                className="text-xs text-primary hover:underline"
              >
                Clear All
              </button>
            )}
          </div>
        </Alert>
      )}
    </div>
  );
};