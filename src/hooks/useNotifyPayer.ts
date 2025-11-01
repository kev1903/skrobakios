import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export const useNotifyPayer = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const notifyPayers = async () => {
    setIsLoading(true);
    try {
      console.log('Sending payer notifications...');
      
      const { data, error } = await supabase.functions.invoke('notify-payer', {
        body: {}
      });

      if (error) {
        console.error('Error sending payer notifications:', error);
        toast({
          title: 'Notification Failed',
          description: 'Failed to send payer notifications.',
          variant: 'destructive'
        });
        return { success: false, error };
      }

      console.log('Payer notifications sent successfully:', data);
      toast({
        title: 'Notifications Sent',
        description: data.message || 'Payment notifications sent successfully.',
      });
      
      return { success: true, data };
    } catch (error) {
      console.error('Exception sending payer notifications:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive'
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return { notifyPayers, isLoading };
};
