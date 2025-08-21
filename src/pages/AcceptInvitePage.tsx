import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const AcceptInvitePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [inviteDetails, setInviteDetails] = useState<{
    businessName: string;
    roleName: string;
    inviterEmail: string;
  } | null>(null);
  
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link');
      return;
    }

    // Simulate loading invite details (in real app would fetch from database)
    const loadInviteDetails = () => {
      setInviteDetails({
        businessName: 'Skrobaki PM',
        roleName: 'Project Admin', 
        inviterEmail: 'admin@skrobaki.com'
      });
    };

    loadInviteDetails();
  }, [token]);

  const handleAcceptInvite = async () => {
    if (!token || !user) return;

    setLoading(true);
    setError(null);

    try {
      // In a real implementation, this would call an RPC or edge function
      // to validate the token, create the membership, and update the invite status
      
      // Simulate the accept process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess(true);
      
      // Redirect to the business dashboard after 2 seconds
      setTimeout(() => {
        navigate('/?page=home');
      }, 2000);
      
    } catch (err) {
      console.error('Error accepting invite:', err);
      setError('Failed to accept invitation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-destructive">Invalid Link</CardTitle>
            <CardDescription>
              This invitation link is invalid or malformed.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate('/')} className="w-full">
              Go to Homepage
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please sign in to accept this business invitation.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate('/?page=auth')} className="w-full">
              Sign In
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {success ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                Invitation Accepted!
              </>
            ) : (
              'Business Invitation'
            )}
          </CardTitle>
          <CardDescription>
            {success 
              ? `Welcome to ${inviteDetails?.businessName}! Redirecting to dashboard...`
              : `You've been invited to join ${inviteDetails?.businessName || 'a business'}`
            }
          </CardDescription>
        </CardHeader>

        {!success && inviteDetails && (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Business</Label>
              <Input value={inviteDetails.businessName} disabled />
            </div>
            
            <div className="space-y-2">
              <Label>Role</Label>
              <Input value={inviteDetails.roleName} disabled />
            </div>
            
            <div className="space-y-2">
              <Label>Invited by</Label>
              <Input value={inviteDetails.inviterEmail} disabled />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        )}

        {!success && (
          <CardFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="flex-1"
              disabled={loading}
            >
              Decline
            </Button>
            <Button 
              onClick={handleAcceptInvite}
              className="flex-1"
              disabled={loading || !inviteDetails}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Accepting...
                </>
              ) : (
                'Accept Invitation'
              )}
            </Button>
          </CardFooter>
        )}

        {success && (
          <CardContent>
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Redirecting to your new business dashboard...
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};