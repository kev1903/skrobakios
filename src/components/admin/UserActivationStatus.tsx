import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Mail, 
  KeyRound, 
  RefreshCw,
  Eye,
  Calendar
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface UserActivationStatusProps {
  user: any;
  onRefresh?: () => void;
}

export const UserActivationStatus = ({ user, onRefresh }: UserActivationStatusProps) => {
  const [sendingEmail, setSendingEmail] = useState(false);
  const [generatingToken, setGeneratingToken] = useState(false);
  const { toast } = useToast();

  const getActivationStatus = () => {
    if (user.account_activated && user.first_login_at) {
      return {
        status: 'activated',
        label: 'Activated',
        icon: CheckCircle,
        color: 'bg-green-100 text-green-800 border-green-200'
      };
    } else if (user.first_login_at && !user.account_activated) {
      return {
        status: 'partial',
        label: 'Partially Activated',
        icon: Clock,
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
      };
    } else {
      return {
        status: 'pending',
        label: 'Pending Activation',
        icon: XCircle,
        color: 'bg-red-100 text-red-800 border-red-200'
      };
    }
  };

  const generateNewAccessToken = async () => {
    setGeneratingToken(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-access-token', {
        body: {
          userId: user.user_id,
          tokenType: 'activation',
          expirationHours: 72
        }
      });

      if (error) throw error;

      // Send activation email
      const { error: emailError } = await supabase.functions.invoke('send-login-credentials', {
        body: {
          userEmail: user.email,
          userName: `${user.first_name} ${user.last_name}`,
          loginEmail: user.email,
          password: 'temporary-password-change-required',
          activationUrl: data.accessUrl
        }
      });

      if (emailError) {
        console.error('Error sending email:', emailError);
        toast({
          title: "Token Generated",
          description: "New activation token generated, but email sending failed. Please check email configuration.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Activation Link Sent",
          description: "New activation link has been generated and sent to the user.",
        });
      }

      onRefresh?.();
    } catch (error: any) {
      console.error('Error generating token:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate activation token",
        variant: "destructive",
      });
    } finally {
      setGeneratingToken(false);
    }
  };

  const resendCredentials = async () => {
    setSendingEmail(true);
    try {
      const { error } = await supabase.functions.invoke('send-login-credentials', {
        body: {
          userEmail: user.email,
          userName: `${user.first_name} ${user.last_name}`,
          loginEmail: user.email,
          password: 'password-change-required'
        }
      });

      if (error) throw error;

      toast({
        title: "Credentials Sent",
        description: "Login credentials have been resent to the user.",
      });
    } catch (error: any) {
      console.error('Error sending credentials:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send credentials",
        variant: "destructive",
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const activationStatus = getActivationStatus();
  const StatusIcon = activationStatus.icon;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <StatusIcon className="h-5 w-5" />
              {user.first_name} {user.last_name}
            </CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </div>
          <Badge className={activationStatus.color}>
            {activationStatus.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Created</span>
            </div>
            <p className="font-medium">
              {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>First Login</span>
            </div>
            <p className="font-medium">
              {user.first_login_at 
                ? formatDistanceToNow(new Date(user.first_login_at), { addSuffix: true })
                : 'Never'
              }
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Eye className="h-4 w-4" />
            <span>Account Status</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={user.password_change_required ? "destructive" : "secondary"}>
              {user.password_change_required ? "Password Change Required" : "Password Set"}
            </Badge>
            <Badge variant={user.account_activated ? "default" : "outline"}>
              {user.account_activated ? "Account Activated" : "Activation Pending"}
            </Badge>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={generateNewAccessToken}
            disabled={generatingToken}
            className="flex-1"
          >
            {generatingToken ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <KeyRound className="h-4 w-4 mr-2" />
            )}
            New Activation Link
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={resendCredentials}
            disabled={sendingEmail}
            className="flex-1"
          >
            {sendingEmail ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Mail className="h-4 w-4 mr-2" />
            )}
            Resend Credentials
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};