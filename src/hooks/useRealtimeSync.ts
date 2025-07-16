import { useEffect, useRef, useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RealtimeSyncOptions {
  projectId?: string;
  tables: string[];
  onUpdate?: (table: string, payload: any) => void;
  retryCount?: number;
  retryDelay?: number;
}

interface SyncStatus {
  connected: boolean;
  retrying: boolean;
  lastUpdate?: Date;
  error?: string;
}

export const useRealtimeSync = (options: RealtimeSyncOptions) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ connected: false, retrying: false });
  const { toast } = useToast();
  const channelsRef = useRef<any[]>([]);
  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  const retryCountRef = useRef(0);
  
  const { projectId, tables, onUpdate, retryCount = 3, retryDelay = 2000 } = options;

  const showSyncNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const title = type === 'error' ? '🔴 Sync Error' : 
                  type === 'success' ? '🟢 Sync Active' : 
                  '🔵 Sync Update';
    
    toast({
      title,
      description: message,
      duration: type === 'error' ? 5000 : 3000
    });
  }, [toast]);

  const handleRealtimeUpdate = useCallback((table: string, payload: any) => {
    console.log(`Real-time update received for ${table}:`, payload);
    
    setSyncStatus(prev => ({ 
      ...prev, 
      connected: true, 
      lastUpdate: new Date(),
      error: undefined
    }));
    
    if (onUpdate) {
      onUpdate(table, payload);
    }
    
    // Show notification for user-initiated changes (likely from AI)
    if (payload.eventType !== 'SELECT') {
      const action = payload.eventType === 'INSERT' ? 'created' : 
                    payload.eventType === 'UPDATE' ? 'updated' : 'deleted';
      showSyncNotification(`Task ${action} via SkAi`, 'success');
    }
  }, [onUpdate, showSyncNotification]);

  const setupRealtimeSubscriptions = useCallback(async () => {
    console.log('Setting up real-time subscriptions for tables:', tables);
    
    // Clear existing subscriptions
    channelsRef.current.forEach(channel => {
      console.log('Removing existing channel');
      supabase.removeChannel(channel);
    });
    channelsRef.current = [];

    try {
      for (const table of tables) {
        let channelName: string;
        let filter: any = {};

        // Set up table-specific configurations
        if (table === 'sk_25008_design') {
          channelName = `sk_25008_design_sync_${Date.now()}`;
          // No filter needed for sk_25008_design
        } else if (table === 'tasks' && projectId) {
          channelName = `tasks_sync_${projectId}_${Date.now()}`;
          filter = { filter: `project_id=eq.${projectId}` };
        } else {
          channelName = `${table}_sync_${Date.now()}`;
        }

        const channel = supabase
          .channel(channelName)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: table,
              ...filter
            },
            (payload) => handleRealtimeUpdate(table, payload)
          )
          .subscribe((status) => {
            console.log(`${table} subscription status:`, status);
            
            if (status === 'SUBSCRIBED') {
              setSyncStatus(prev => ({ 
                ...prev, 
                connected: true, 
                retrying: false,
                error: undefined
              }));
              retryCountRef.current = 0;
            } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
              setSyncStatus(prev => ({ 
                ...prev, 
                connected: false,
                error: `Connection ${status.toLowerCase()}`
              }));
              
              // Retry logic
              if (retryCountRef.current < retryCount) {
                setSyncStatus(prev => ({ ...prev, retrying: true }));
                
                retryTimeoutRef.current = setTimeout(() => {
                  retryCountRef.current++;
                  console.log(`Retrying real-time connection (attempt ${retryCountRef.current})`);
                  setupRealtimeSubscriptions();
                }, retryDelay * retryCountRef.current); // Exponential backoff
              } else {
                showSyncNotification('Real-time sync connection lost. Retries exhausted.', 'error');
              }
            }
          });

        channelsRef.current.push(channel);
      }
      
      if (channelsRef.current.length > 0) {
        showSyncNotification('Real-time sync activated', 'success');
      }
      
    } catch (error) {
      console.error('Error setting up real-time subscriptions:', error);
      setSyncStatus(prev => ({ 
        ...prev, 
        connected: false, 
        error: 'Setup failed' 
      }));
      showSyncNotification('Failed to setup real-time sync', 'error');
    }
  }, [tables, projectId, handleRealtimeUpdate, retryCount, retryDelay, showSyncNotification]);

  // Setup subscriptions on mount and when dependencies change
  useEffect(() => {
    if (tables.length > 0) {
      setupRealtimeSubscriptions();
    }

    return () => {
      // Cleanup
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
      
      channelsRef.current.forEach(channel => {
        console.log('Cleaning up real-time channel');
        supabase.removeChannel(channel);
      });
      channelsRef.current = [];
    };
  }, [setupRealtimeSubscriptions]);

  // Listen for AI update events
  useEffect(() => {
    const handleAiUpdate = (event: CustomEvent) => {
      console.log('AI update event received:', event.detail);
      setSyncStatus(prev => ({ ...prev, retrying: true }));
      
      // Force reconnection to ensure fresh data
      setTimeout(() => {
        setupRealtimeSubscriptions();
        setSyncStatus(prev => ({ ...prev, retrying: false }));
      }, 500);
    };

    const handleForceRefresh = (event: CustomEvent) => {
      console.log('Force refresh event received:', event.detail);
      // Trigger immediate re-sync
      setupRealtimeSubscriptions();
    };

    window.addEventListener('ai-task-update' as any, handleAiUpdate);
    window.addEventListener('force-timeline-refresh' as any, handleForceRefresh);
    
    return () => {
      window.removeEventListener('ai-task-update' as any, handleAiUpdate);
      window.removeEventListener('force-timeline-refresh' as any, handleForceRefresh);
    };
  }, [setupRealtimeSubscriptions]);

  const forceResync = useCallback(() => {
    console.log('Force resyncing real-time connections');
    setSyncStatus(prev => ({ ...prev, retrying: true }));
    setupRealtimeSubscriptions();
  }, [setupRealtimeSubscriptions]);

  return {
    syncStatus,
    forceResync,
    isConnected: syncStatus.connected,
    isRetrying: syncStatus.retrying,
    lastUpdate: syncStatus.lastUpdate,
    error: syncStatus.error
  };
};