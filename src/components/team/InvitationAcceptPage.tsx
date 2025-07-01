
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Users } from "lucide-react";

export const InvitationAcceptPage = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [memberName, setMemberName] = useState("");
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      fetchInvitation();
    } else {
      setError("No invitation token provided");
      setLoading(false);
    }
  }, [token]);

  const fetchInvitation = async () => {
    try {
      const { data: invitationData, error: invitationError } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('token', token)
        .is('used_at', null)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (invitationError) {
        if (invitationError.code === 'PGRST116') {
          setError("Invalid or expired invitation");
        } else {
          throw invitationError;
        }
        return;
      }

      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', invitationData.project_id)
        .single();

      if (projectError) throw projectError;

      setInvitation(invitationData);
      setProject(projectData);
    } catch (error: any) {
      console.error('Error fetching invitation:', error);
      setError("Failed to load invitation details");
    } finally {
      setLoading(false);
    }
  };

  const acceptInvitation = async () => {
    if (!invitation || !memberName.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name",
        variant: "destructive"
      });
      return;
    }

    setAccepting(true);
    try {
      // Mark invitation as used
      const { error: invitationUpdateError } = await supabase
        .from('team_invitations')
        .update({ used_at: new Date().toISOString() })
        .eq('id', invitation.id);

      if (invitationUpdateError) throw invitationUpdateError;

      // Update the team member record to active status
      const { error: memberUpdateError } = await supabase
        .from('team_members')
        .update({ 
          status: 'active',
          name: memberName.trim(),
          joined_at: new Date().toISOString()
        })
        .eq('email', invitation.email)
        .eq('project_id', invitation.project_id);

      if (memberUpdateError) throw memberUpdateError;

      setAccepted(true);
      toast({
        title: "Success",
        description: "Successfully joined the project team!"
      });
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to accept invitation",
        variant: "destructive"
      });
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Invitation Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">{error}</p>
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-green-600">Welcome to the Team!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              You have successfully joined the <strong>{project?.name}</strong> project team.
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Users className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <CardTitle>Join Project Team</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-gray-600">
                You've been invited to join the project:
              </p>
              <p className="font-semibold text-lg mt-2">{project?.name}</p>
              <p className="text-sm text-gray-500 mt-1">
                Invited to: {invitation?.email}
              </p>
            </div>

            <div>
              <Label htmlFor="memberName">Your Name</Label>
              <Input
                id="memberName"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                placeholder="Enter your full name"
                className="mt-1"
              />
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={acceptInvitation}
                disabled={accepting || !memberName.trim()}
                className="flex-1"
              >
                {accepting ? "Joining..." : "Accept Invitation"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/'}
                className="flex-1"
              >
                Decline
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
