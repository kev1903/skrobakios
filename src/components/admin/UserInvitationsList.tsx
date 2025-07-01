
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Clock, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserInvitation {
  id: string;
  email: string;
  invited_role: string;
  created_at: string;
  expires_at: string;
  used_at: string | null;
}

export const UserInvitationsList = () => {
  const [invitations, setInvitations] = useState<UserInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchInvitations = async () => {
    try {
      const { data, error } = await supabase
        .from('user_invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching invitations:', error);
        return;
      }

      setInvitations(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteInvitation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_invitations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting invitation:', error);
        toast({
          title: "Error",
          description: "Failed to delete invitation.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Invitation Deleted",
        description: "The invitation has been removed.",
      });

      fetchInvitations();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const getStatusBadge = (invitation: UserInvitation) => {
    if (invitation.used_at) {
      return <Badge variant="default" className="flex items-center space-x-1">
        <CheckCircle className="w-3 h-3" />
        <span>Accepted</span>
      </Badge>;
    }

    const isExpired = new Date(invitation.expires_at) < new Date();
    if (isExpired) {
      return <Badge variant="destructive" className="flex items-center space-x-1">
        <XCircle className="w-3 h-3" />
        <span>Expired</span>
      </Badge>;
    }

    return <Badge variant="secondary" className="flex items-center space-x-1">
      <Clock className="w-3 h-3" />
      <span>Pending</span>
    </Badge>;
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'destructive';
      case 'admin':
        return 'default';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Invitations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading invitations...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Mail className="w-5 h-5" />
            <span>User Invitations</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {invitations.length} total
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {invitations.length === 0 ? (
          <div className="text-center py-8">
            <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No invitations sent yet</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {invitations.map(invitation => (
              <div key={invitation.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-lg border border-slate-200/50 hover:shadow-md transition-all duration-200">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <p className="font-medium text-gray-900 truncate">{invitation.email}</p>
                    <Badge variant={getRoleBadgeVariant(invitation.invited_role)} className="text-xs">
                      {invitation.invited_role}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Sent: {new Date(invitation.created_at).toLocaleDateString()}</span>
                    <span>Expires: {new Date(invitation.expires_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(invitation)}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteInvitation(invitation.id)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
