import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useTaskAssignmentEmail = () => {
  const { toast } = useToast();

  const sendTaskAssignmentEmail = async (taskId: string) => {
    try {
      console.log('Sending task assignment email for task:', taskId);
      
      const { data, error } = await supabase.functions.invoke('send-task-assignment-email', {
        body: { taskId }
      });

      if (error) {
        console.error('Error sending task assignment email:', error);
        toast({
          title: 'Email Notification Failed',
          description: 'Failed to send task assignment email notification.',
          variant: 'destructive'
        });
        return { success: false, error };
      }

      console.log('Task assignment email sent successfully:', data);
      toast({
        title: 'Email Sent',
        description: 'Task assignment notification sent successfully.',
      });
      
      return { success: true, data };
    } catch (error) {
      console.error('Exception sending task assignment email:', error);
      return { success: false, error };
    }
  };

  return { sendTaskAssignmentEmail };
};
