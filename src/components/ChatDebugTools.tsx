import React from 'react';
import { Button } from './ui/button';
import { Trash2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ChatDebugTools() {
  const { toast } = useToast();

  const clearChatHistory = () => {
    try {
      localStorage.removeItem('aiChatMessages');
      toast({
        title: "Chat history cleared",
        description: "All stored chat messages have been removed. Please refresh the page.",
      });
      // Force page reload to reset chat state
      window.location.reload();
    } catch (error) {
      console.error('Failed to clear chat history:', error);
      toast({
        title: "Error",
        description: "Failed to clear chat history.",
        variant: "destructive"
      });
    }
  };

  const inspectChatHistory = () => {
    try {
      const raw = localStorage.getItem('aiChatMessages');
      if (raw) {
        const messages = JSON.parse(raw);
        console.log('Current chat history:', messages);
        
        // Check for non-English messages
        const nonEnglishMessages = messages.filter((m: any) => {
          return /[^\x00-\x7F]/.test(m.content);
        });
        
        if (nonEnglishMessages.length > 0) {
          console.warn('Found non-English messages:', nonEnglishMessages);
          toast({
            title: "Non-English messages detected",
            description: `Found ${nonEnglishMessages.length} non-English messages in chat history. Check console for details.`,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Chat history clean",
            description: "No non-English messages found in chat history.",
          });
        }
      } else {
        toast({
          title: "No chat history",
          description: "No chat messages found in localStorage.",
        });
      }
    } catch (error) {
      console.error('Failed to inspect chat history:', error);
      toast({
        title: "Error",
        description: "Failed to inspect chat history.",
        variant: "destructive"
      });
    }
  };

  return null;
}