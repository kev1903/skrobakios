import React from 'react';
import { Button } from './ui/button';
import { Trash2, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCompany } from '@/contexts/CompanyContext';

export function ChatDebugTools() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { currentCompany } = useCompany();

  const clearChatHistory = async () => {
    try {
      if (!user || !currentCompany) {
        toast({
          title: "Error",
          description: "Please log in and select a company first.",
          variant: "destructive"
        });
        return;
      }

      // Clear from database
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('user_id', user.id)
        .eq('company_id', currentCompany.id);

      if (error) throw error;

      // Clear old localStorage data
      localStorage.removeItem('aiChatMessages');
      localStorage.removeItem('currentConversationId');

      toast({
        title: "Chat history cleared",
        description: "All chat messages have been removed. Please refresh the page.",
      });
      
      // Force page reload to reset chat state
      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      console.error('Failed to clear chat history:', error);
      toast({
        title: "Error",
        description: "Failed to clear chat history.",
        variant: "destructive"
      });
    }
  };

  const cleanupLocalStorage = () => {
    try {
      // Remove old chat messages that are no longer needed
      localStorage.removeItem('aiChatMessages');
      
      toast({
        title: "Storage cleaned",
        description: "Removed old chat data from localStorage.",
      });
    } catch (error) {
      console.error('Failed to cleanup localStorage:', error);
    }
  };

  return null;
}