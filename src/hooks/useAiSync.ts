import { useEffect, useCallback } from 'react';

interface AiSyncHook {
  triggerAiUpdate: () => void;
  onAiUpdate: (callback: () => void) => void;
}

export const useAiSync = (): AiSyncHook => {
  const triggerAiUpdate = useCallback(() => {
    // Dispatch custom event to notify components of AI updates
    const event = new CustomEvent('ai-task-update', {
      detail: { timestamp: Date.now() }
    });
    window.dispatchEvent(event);
  }, []);

  const onAiUpdate = useCallback((callback: () => void) => {
    const handleAiUpdate = () => callback();
    
    window.addEventListener('ai-task-update', handleAiUpdate);
    
    return () => {
      window.removeEventListener('ai-task-update', handleAiUpdate);
    };
  }, []);

  return {
    triggerAiUpdate,
    onAiUpdate
  };
};