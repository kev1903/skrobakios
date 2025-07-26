
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface ImpersonationMode {
  isImpersonating: boolean;
  targetUserId?: string;
  targetUserInfo?: {
    email: string;
    name: string;
  };
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: any }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
  isAuthenticated: boolean;
  impersonationMode: ImpersonationMode;
  setImpersonationMode: (mode: ImpersonationMode) => void;
  exitImpersonation: () => void;
  acceptInvitation: (token: string, password: string, firstName: string, lastName: string) => Promise<{ error: any }>;
  inviteUser: (email: string, name: string, role: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [impersonationMode, setImpersonationMode] = useState<ImpersonationMode>({
    isImpersonating: false
  });

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email || 'No session');
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string, rememberMe = false) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    // Store remember me preference in localStorage if needed
    if (rememberMe) {
      localStorage.setItem('rememberMe', 'true');
    } else {
      localStorage.removeItem('rememberMe');
    }
    
    return { error };
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const signUpOptions: any = {
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    };

    // Add metadata if provided
    if (metadata) {
      signUpOptions.options.data = {
        first_name: metadata.firstName,
        last_name: metadata.lastName,
        phone: metadata.phone,
        job_title: metadata.jobTitle
      };
    }
    
    const { error } = await supabase.auth.signUp(signUpOptions);
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    // Redirect to landing page after logout
    window.location.href = '/';
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    });
    return { error };
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({
      password
    });
    return { error };
  };

  const exitImpersonation = () => {
    setImpersonationMode({ isImpersonating: false });
    // Redirect to main page
    window.location.href = '/';
  };

  const acceptInvitation = async (token: string, password: string, firstName: string, lastName: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('accept-invitation', {
        body: {
          token,
          password,
          firstName,
          lastName
        }
      });

      if (error) {
        console.error('Error accepting invitation:', error);
        return { error };
      }

      // If successful, sign in the user
      if (data?.success) {
        // Use the session URL to authenticate the user
        if (data.session_url) {
          window.location.href = data.session_url;
          return { error: null };
        }
        
        // Fallback: try to sign in with the credentials
        return await signIn(data.user.email, password);
      }

      return { error: new Error(data?.error || 'Failed to accept invitation') };
    } catch (error) {
      console.error('Accept invitation error:', error);
      return { error };
    }
  };

  const inviteUser = async (email: string, name: string, role: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-user-invitation', {
        body: {
          email,
          name,
          role,
          invitedBy: user?.email || 'Unknown'
        }
      });

      if (error) {
        console.error('Error sending invitation:', error);
        return { error };
      }

      if (!data?.success) {
        return { error: new Error(data?.error || 'Failed to send invitation') };
      }

      return { error: null };
    } catch (error) {
      console.error('Invite user error:', error);
      return { error };
    }
  };

  const isAuthenticated = !!session;

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
      isAuthenticated,
      impersonationMode,
      setImpersonationMode,
      exitImpersonation,
      acceptInvitation,
      inviteUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
