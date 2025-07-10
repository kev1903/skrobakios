import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '../types';

interface InvitationFormData {
  name: string;
  email: string;
  role: UserRole | '';
}

export const useUserInvitation = (onSuccess?: () => void) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<InvitationFormData>({
    name: '',
    email: '',
    role: '',
  });

  const handleInputChange = (field: keyof InvitationFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: '',
    });
  };

  const sendInvitation = async () => {
    setLoading(true);
    try {
      if (!user) {
        throw new Error('You must be logged in to send invitations');
      }

      console.log('Calling edge function with data:', {
        email: formData.email,
        name: formData.name,
        role: formData.role,
        invitedBy: user.email || 'Admin',
      });
      
      const { data, error: emailError } = await supabase.functions.invoke('send-user-invitation', {
        body: {
          email: formData.email,
          name: formData.name,
          role: formData.role,
          invitedBy: user.email || 'Admin',
        }
      });

      console.log('Edge function response:', { data, emailError });

      if (emailError) {
        console.error('Edge function error details:', emailError);
        throw emailError;
      }

      toast({
        title: "Success",
        description: `Invitation sent to ${formData.email}`,
      });

      resetForm();
      onSuccess?.();

    } catch (error) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send invitation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    handleInputChange,
    sendInvitation,
    resetForm,
  };
};