import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SyncStatusIndicatorProps {
  isConnected: boolean;
  isRetrying: boolean;
  onRetry?: () => void;
  variant?: 'default' | 'minimal' | 'detailed';
  className?: string;
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  isConnected,
  isRetrying,
  onRetry,
  variant = 'default',
  className
}) => {
  const getStatusConfig = () => {
    if (isConnected) {
      return {
        icon: Wifi,
        text: 'Live',
        color: 'text-green-400 bg-green-400/10 border-green-400/20',
        iconColor: 'text-green-400'
      };
    } else if (isRetrying) {
      return {
        icon: RotateCcw,
        text: 'Reconnecting...',
        color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
        iconColor: 'text-yellow-400 animate-spin'
      };
    } else {
      return {
        icon: WifiOff,
        text: 'Offline',
        color: 'text-red-400 bg-red-400/10 border-red-400/20',
        iconColor: 'text-red-400'
      };
    }
  };

  const status = getStatusConfig();
  const IconComponent = status.icon;

  if (variant === 'minimal') {
    return (
      <div 
        className={cn("flex items-center space-x-1", className)}
        onClick={!isConnected && !isRetrying ? onRetry : undefined}
      >
        <IconComponent className={cn("w-3 h-3", status.iconColor)} />
        {variant !== 'minimal' && (
          <span className={cn("text-xs", status.iconColor.split(' ')[0])}>
            {status.text}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <Badge 
        variant="outline" 
        className={cn(
          "flex items-center space-x-2 px-3 py-1",
          status.color,
          !isConnected && !isRetrying && "cursor-pointer hover:opacity-80",
          className
        )}
        onClick={!isConnected && !isRetrying ? onRetry : undefined}
      >
        <IconComponent className={cn("w-4 h-4", status.iconColor)} />
        <span className="text-xs font-medium">{status.text}</span>
        {!isConnected && !isRetrying && (
          <span className="text-xs opacity-75">(click to retry)</span>
        )}
      </Badge>
    );
  }

  return (
    <div 
      className={cn(
        "flex items-center space-x-2",
        !isConnected && !isRetrying && "cursor-pointer",
        className
      )}
      onClick={!isConnected && !isRetrying ? onRetry : undefined}
    >
      <IconComponent className={cn("w-4 h-4", status.iconColor)} />
      <span className={cn("text-xs", status.iconColor.split(' ')[0])}>
        {status.text}
      </span>
    </div>
  );
};