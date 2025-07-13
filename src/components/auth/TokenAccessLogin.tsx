import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Key, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TokenAccessLoginProps {
  token: string;
  tokenType: string;
  onLoginSuccess: (user: any) => void;
  onError: (error: string) => void;
}

export const TokenAccessLogin = ({ token, tokenType, onLoginSuccess, onError }: TokenAccessLoginProps) => {
  const [isValidating, setIsValidating] = useState(true);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('validate-access-token', {
        body: { token }
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error);
      }

      setValidationResult(data);
      setIsValidating(false);

    } catch (error: any) {
      console.error('Token validation error:', error);
      setIsValidating(false);
      onError(error.message || 'Invalid or expired access token');
    }
  };

  const proceedWithLogin = async () => {
    if (!validationResult?.user?.email) {
      onError('No user information available');
      return;
    }

    setIsLoggingIn(true);

    try {
      // For security, we'll require the user to set a password if they don't have one
      // or if this is their first login
      if (validationResult.user.password_change_required) {
        onLoginSuccess({
          ...validationResult.user,
          requiresPasswordChange: true,
          tokenType: validationResult.tokenType
        });
        return;
      }

      // For activation tokens, we might want to automatically log them in
      // after they change their password
      toast({
        title: "Access Granted",
        description: "Please proceed with your account setup.",
      });

      onLoginSuccess({
        ...validationResult.user,
        tokenType: validationResult.tokenType
      });

    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: error.message || "Failed to process login. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const getTokenTypeDisplay = (type: string) => {
    switch (type) {
      case 'activation':
        return 'Account Activation';
      case 'password_reset':
        return 'Password Reset';
      case 'temporary_access':
        return 'Temporary Access';
      default:
        return 'Access Token';
    }
  };

  const getTokenTypeDescription = (type: string) => {
    switch (type) {
      case 'activation':
        return 'This link will activate your account and allow you to set up your password.';
      case 'password_reset':
        return 'This link will allow you to reset your password.';
      case 'temporary_access':
        return 'This link provides temporary access to the platform.';
      default:
        return 'This link provides access to the platform.';
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            </div>
            <CardTitle>Validating Access</CardTitle>
            <CardDescription>
              Please wait while we verify your access token...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!validationResult) {
    return null; // Error is handled by parent component
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle>{getTokenTypeDisplay(validationResult.tokenType)}</CardTitle>
          <CardDescription>
            {getTokenTypeDescription(validationResult.tokenType)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Key className="h-4 w-4" />
            <AlertDescription>
              Welcome, {validationResult.user.first_name} {validationResult.user.last_name}!
              <br />
              Email: {validationResult.user.email}
            </AlertDescription>
          </Alert>

          {validationResult.user.password_change_required && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                You will be required to set a new password for security purposes.
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={proceedWithLogin}
            className="w-full"
            disabled={isLoggingIn}
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Continue to Platform'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};