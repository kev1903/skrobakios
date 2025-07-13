import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ImpersonationGuardProps {
  children: React.ReactNode;
}

export const ImpersonationGuard = ({ children }: ImpersonationGuardProps) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setImpersonationMode } = useAuth();
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token && !isValidating) {
      validateImpersonationToken(token);
    }
  }, [searchParams, isValidating]);

  const validateImpersonationToken = async (token: string) => {
    setIsValidating(true);
    
    try {
      console.log('Validating impersonation token...');
      
      // Call the edge function to validate and use the token
      const { data, error } = await supabase.functions.invoke('validate-access-token', {
        body: { token }
      });

      if (error) {
        console.error('Error validating token:', error);
        toast.error('Invalid or expired impersonation token');
        navigate('/');
        return;
      }

      if (data.success && data.token_type === 'impersonation') {
        const targetUserId = data.user_id;
        
        // Fetch the target user's profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('email, first_name, last_name')
          .eq('user_id', targetUserId)
          .single();

        if (profileError) {
          console.error('Error fetching target user profile:', profileError);
          toast.error('Error loading user profile');
          navigate('/');
          return;
        }

        // Set impersonation mode
        setImpersonationMode({
          isImpersonating: true,
          targetUserId,
          targetUserInfo: {
            email: profile.email,
            name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
          }
        });

        // Remove token from URL and redirect to main page
        navigate('/', { replace: true });
        
        toast.success(`Now viewing as ${profile.email}`);
      } else {
        toast.error('Invalid impersonation token');
        navigate('/');
      }
    } catch (error) {
      console.error('Error during impersonation validation:', error);
      toast.error('Failed to validate impersonation token');
      navigate('/');
    } finally {
      setIsValidating(false);
    }
  };

  // Show loading state while validating token
  if (isValidating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center">
        <div className="text-slate-600">Validating impersonation token...</div>
      </div>
    );
  }

  return <>{children}</>;
};