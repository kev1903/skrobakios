import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SkaiUpdate {
  table: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  data: any;
  timestamp: string;
}

interface UseSkaiUpdatesProps {
  projectId?: string;
  onUpdate?: (update: SkaiUpdate) => void;
}

export const useSkaiUpdates = ({ projectId, onUpdate }: UseSkaiUpdatesProps = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<SkaiUpdate | null>(null);
  const channelRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Create a unique channel for this instance
    const channelName = `skai-updates-${projectId || 'global'}-${Date.now()}`;
    
    const channel = supabase
      .channel(channelName)
      .on('broadcast', { event: 'skai_update' }, (payload) => {
        console.log('Received Skai update:', payload);
        
        const update: SkaiUpdate = {
          table: payload.payload.table,
          operation: payload.payload.operation,
          data: payload.payload.data,
          timestamp: payload.payload.timestamp
        };
        
        setLastUpdate(update);
        
        // Call custom update handler if provided
        if (onUpdate) {
          onUpdate(update);
        }
        
        // Show toast notification based on operation
        const getUpdateMessage = (update: SkaiUpdate) => {
          switch (update.operation) {
            case 'INSERT':
              return `New ${update.table.replace(/_/g, ' ')} created`;
            case 'UPDATE':
              return `${update.table.replace(/_/g, ' ')} updated`;
            case 'DELETE':
              return `${update.table.replace(/_/g, ' ')} deleted`;
            default:
              return `${update.table.replace(/_/g, ' ')} changed`;
          }
        };
        
        toast({
          title: "Skai Update",
          description: getUpdateMessage(update),
          duration: 3000,
        });
      })
      .on('presence', { event: 'sync' }, () => {
        setIsConnected(true);
        console.log('Skai updates channel connected');
      })
      .on('presence', { event: 'join' }, () => {
        console.log('Joined Skai updates channel');
      })
      .on('presence', { event: 'leave' }, () => {
        console.log('Left Skai updates channel');
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to Skai updates');
          setIsConnected(true);
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        setIsConnected(false);
      }
    };
  }, [projectId, onUpdate, toast]);

  // Function to manually trigger a refresh
  const refreshData = () => {
    // This can be used by components to trigger data refetching
    // when they receive an update
    window.dispatchEvent(new CustomEvent('skai-data-refresh', {
      detail: { projectId, timestamp: new Date().toISOString() }
    }));
  };

  return {
    isConnected,
    lastUpdate,
    refreshData
  };
};