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
      console.log('Validating impersonation session...');
      
      // Validate the impersonation session server-side
      const { data, error } = await supabase
        .rpc('validate_impersonation_session', { session_token: token });

      if (error) {
        console.error('Error validating impersonation session:', error);
        toast.error('Invalid or expired impersonation session');
        navigate('/');
        return;
      }

      // Check if we got a valid result
      const validationResult = Array.isArray(data) ? data[0] : data;
      
      if (!validationResult || !validationResult.is_valid) {
        toast.error('Invalid or expired impersonation session');
        navigate('/');
        return;
      }

      const { target_user_id, session_id } = validationResult;
      
      // Fetch the target user's profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email, first_name, last_name')
        .eq('user_id', target_user_id)
        .single();

      if (profileError) {
        console.error('Error fetching target user profile:', profileError);
        toast.error('Error loading user profile');
        navigate('/');
        return;
      }

      // Set impersonation mode with session ID for server-side validation
      setImpersonationMode({
        isImpersonating: true,
        targetUserId: target_user_id,
        sessionId: session_id,
        sessionToken: token,
        targetUserInfo: {
          email: profile.email,
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
        }
      });

      // Remove token from URL and redirect to main page
      navigate('/', { replace: true });
      
      toast.success(`Now viewing as ${profile.email}`);
    } catch (error) {
      console.error('Error during impersonation validation:', error);
      toast.error('Failed to validate impersonation session');
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