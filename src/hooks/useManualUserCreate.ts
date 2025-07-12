import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  companyId: string;
  companyRole: 'owner' | 'admin' | 'member';
  platformRole: 'superadmin' | 'owner' | 'admin' | 'user';
}

interface UseManualUserCreateProps {
  onUserCreated?: () => void;
  onOpenChange: (open: boolean) => void;
}

export const useManualUserCreate = ({ onUserCreated, onOpenChange }: UseManualUserCreateProps) => {
  const { toast } = useToast();
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    companyId: '',
    companyRole: 'member',
    platformRole: 'user' // Changed default from 'user' to explicitly 'user'
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      companyId: '',
      companyRole: 'member',
      platformRole: 'user'
    });
  };

  const validateForm = (): boolean => {
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.password.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setCreating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-user-manually', {
        body: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          companyId: formData.companyId === 'none' ? undefined : formData.companyId || undefined,
          companyRole: formData.companyRole,
          platformRole: formData.platformRole
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: "User Created Successfully",
        description: `${formData.firstName} ${formData.lastName} has been created and can now log in`,
      });

      resetForm();
      onUserCreated?.();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating user:', error);
      
      let errorMessage = error.message || "Failed to create user. Please try again.";
      
      // Handle specific error cases with more helpful messages
      if (errorMessage.includes('already exists') || errorMessage.includes('already been registered')) {
        errorMessage = "This email address is already registered. Please use a different email address.";
      } else if (errorMessage.includes('duplicate key')) {
        errorMessage = "This user already exists in the system. Please check the email address.";
      } else if (errorMessage.includes('Insufficient permissions')) {
        errorMessage = "You don't have permission to create users. Contact your administrator.";
      }
      
      toast({
        title: "Error Creating User",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  return {
    formData,
    creating,
    handleInputChange,
    handleSubmit,
    handleCancel,
    resetForm
  };
};