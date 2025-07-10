import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const EmailTestButton = () => {
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();

  const testEmail = async () => {
    setTesting(true);
    try {
      console.log('Testing email functionality...');
      
      const { data, error } = await supabase.functions.invoke('test-email', {
        body: {
          email: 'kevin@skrobaki.com' // Using verified email for testing
        }
      });

      console.log('Test email response:', { data, error });

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast({
          title: "Email Test Successful",
          description: "Test email sent successfully. Check your inbox.",
        });
      } else {
        throw new Error(data?.error || 'Email test failed');
      }
    } catch (error) {
      console.error('Email test error:', error);
      toast({
        title: "Email Test Failed",
        description: error instanceof Error ? error.message : "Failed to send test email",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Button
      onClick={testEmail}
      disabled={testing}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      <Mail className="h-4 w-4" />
      {testing ? 'Testing...' : 'Test Email'}
    </Button>
  );
};