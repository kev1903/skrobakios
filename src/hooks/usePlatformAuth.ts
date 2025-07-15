import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePlatformAuth as usePlatformAuthContext } from '@/contexts/PlatformAuthContext';

export const usePlatformAuth = (onNavigate: (page: string) => void) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [tokenAccessUser, setTokenAccessUser] = useState<any>(null);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const { toast } = useToast();
  const { authenticatePlatform } = usePlatformAuthContext();

  // Check for token access on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const tokenType = urlParams.get('type');
    
    if (token && tokenType) {
      handleTokenAccess(token, tokenType);
    }
  }, []);

  const handleTokenAccess = async (token: string, tokenType: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('validate-access-token', {
        body: { token }
      });

      if (error || !data.success) {
        throw new Error(data?.error || 'Invalid access token');
      }

      setTokenAccessUser({
        ...data.user,
        tokenType,
        requiresPasswordChange: data.user.password_change_required
      });

      if (data.user.password_change_required) {
        setShowPasswordChange(true);
      } else {
        // Auto-login for activated users
            toast({
              title: "Access Granted",
              description: "Welcome back to SkrobakiOS!",
            });
            authenticatePlatform();
            onNavigate('platform-dashboard');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to validate access token');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChangeComplete = () => {
    setShowPasswordChange(false);
    setTokenAccessUser(null);
    toast({
      title: "Welcome to SkrobakiOS",
      description: "Your account is now fully activated!",
    });
    authenticatePlatform();
    onNavigate('platform-dashboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setError(error.message);
        } else {
          // Check if user needs to change password
          const { data: profile } = await supabase
            .from('profiles')
            .select('password_change_required, first_login_at')
            .eq('user_id', data.user.id)
            .single();

          if (profile?.password_change_required) {
            setTokenAccessUser({
              email: data.user.email,
              requiresPasswordChange: true
            });
            setShowPasswordChange(true);
          } else {
            // Track first login if applicable
            if (!profile?.first_login_at) {
              await supabase.rpc('track_first_login', {
                target_user_id: data.user.id
              });
            }

            toast({
              title: "Success",
              description: "Successfully logged in to Platform",
            });
            authenticatePlatform();
            onNavigate('platform-dashboard');
          }
        }
      } else {
        // Sign up
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          return;
        }

        const redirectUrl = `${window.location.origin}/`;
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl
          }
        });

        if (error) {
          setError(error.message);
        } else {
          toast({
            title: "Success",
            description: "Account created! Please check your email to verify your account.",
          });
          setIsLogin(true);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return {
    isLogin,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    isLoading,
    showPassword,
    setShowPassword,
    error,
    tokenAccessUser,
    showPasswordChange,
    handleSubmit,
    toggleMode,
    handlePasswordChangeComplete
  };
};