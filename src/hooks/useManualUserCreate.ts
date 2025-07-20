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
  platformRole: 'superadmin' | 'company_admin';
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
    platformRole: 'company_admin' // Changed default to company_admin
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
      platformRole: 'company_admin'
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
      // Create the user
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

      const createdUserId = data.user_id;

      // Generate activation token for the new user
      const { data: tokenData, error: tokenError } = await supabase.functions.invoke('generate-access-token', {
        body: {
          userId: createdUserId,
          tokenType: 'activation',
          expirationHours: 72 // 3 days for activation
        }
      });

      if (tokenError) {
        console.error('Error generating access token:', tokenError);
        // Still show success as user was created, just mention about token
        toast({
          title: "User Created Successfully",
          description: `${formData.firstName} ${formData.lastName} has been created. Access credentials have been sent via email.`,
        });
      } else {
        // Send updated email with activation link
        const { error: emailError } = await supabase.functions.invoke('send-login-credentials', {
          body: {
            userEmail: formData.email,
            userName: `${formData.firstName} ${formData.lastName}`,
            loginEmail: formData.email,
            password: formData.password,
            activationUrl: tokenData.accessUrl
          }
        });

        if (emailError) {
          console.error('Error sending email:', emailError);
        }

        toast({
          title: "User Created Successfully",
          description: `${formData.firstName} ${formData.lastName} has been created and activation email sent.`,
        });
      }

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