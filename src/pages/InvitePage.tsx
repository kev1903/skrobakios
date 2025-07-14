import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Shield, 
  Edit, 
  Eye, 
  Building,
  Calendar
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const roleConfig = {
  project_admin: { 
    label: "Project Admin", 
    icon: Shield, 
    description: "Full access to project and team management" 
  },
  editor: { 
    label: "Editor", 
    icon: Edit, 
    description: "Can edit tasks, upload files, and manage content" 
  },
  viewer: { 
    label: "Viewer", 
    icon: Eye, 
    description: "Can view project content but not make changes" 
  },
  member: { 
    label: "Member", 
    icon: User, 
    description: "Standard project member with basic permissions" 
  },
};

export function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);

  // Check auth state
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Fetch invitation details
  const { data: invitation, isLoading, error } = useQuery({
    queryKey: ["invitation", token],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_invitations")
        .select(`
          *,
          project:project_id (
            id,
            name,
            description,
            company:company_id (
              id,
              name,
              logo_url
            )
          ),
          inviter:invited_by (
            first_name,
            last_name,
            email,
            avatar_url
          )
        `)
        .eq("token", token)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!token,
  });

  // Accept invitation mutation
  const acceptInvitation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error("You must be logged in to accept invitations");
      }

      const { data, error } = await supabase.rpc("accept_project_invitation", {
        invitation_token: token
      });

      if (error) throw error;
      const result = data as any;
      if (!result.success) throw new Error(result.error);
      
      return result;
    },
    onSuccess: (data) => {
      toast({
        title: "Invitation accepted!",
        description: "You've successfully joined the project team.",
      });
      navigate(`/projects/${(data as any).project_id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error accepting invitation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Decline invitation mutation
  const declineInvitation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("project_invitations")
        .update({ 
          status: "declined", 
          declined_at: new Date().toISOString(),
          updated_at: new Date().toISOString() 
        })
        .eq("token", token);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Invitation declined",
        description: "You have declined the project invitation.",
      });
      navigate("/");
    },
    onError: (error: any) => {
      toast({
        title: "Error declining invitation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>
              This invitation link is invalid, expired, or has already been used.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate("/")} variant="outline">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if invitation is expired
  const isExpired = new Date(invitation.expires_at) < new Date();
  const isAlreadyProcessed = invitation.status !== "pending";

  if (isExpired || isAlreadyProcessed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <CardTitle>
              {isExpired ? "Invitation Expired" : "Invitation Already Processed"}
            </CardTitle>
            <CardDescription>
              {isExpired 
                ? "This invitation has expired and is no longer valid."
                : `This invitation has already been ${invitation.status}.`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => navigate("/")} variant="outline">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user email matches invitation
  const emailMismatch = user && user.email !== invitation.email;

  const roleInfo = roleConfig[invitation.role as keyof typeof roleConfig] || roleConfig.member;
  const RoleIcon = roleInfo.icon;
  const inviter = invitation.inviter as any;
  const inviterName = inviter?.first_name && inviter?.last_name
    ? `${inviter.first_name} ${inviter.last_name}`.trim()
    : inviter?.email || "Team Admin";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Project Team Invitation</CardTitle>
          <CardDescription>
            You've been invited to join a project team
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Project Info */}
          <div className="p-4 bg-muted rounded-lg space-y-3">
            <div className="flex items-center space-x-3">
              {invitation.project?.company?.logo_url ? (
                <img 
                  src={invitation.project.company.logo_url} 
                  alt="Company logo"
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Building className="w-5 h-5 text-primary" />
                </div>
              )}
              <div>
                <h3 className="font-semibold">{invitation.project?.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {invitation.project?.company?.name}
                </p>
              </div>
            </div>
            
            {invitation.project?.description && (
              <p className="text-sm text-muted-foreground">
                {invitation.project.description}
              </p>
            )}
          </div>

          {/* Role Info */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <RoleIcon className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">{roleInfo.label}</p>
                <p className="text-sm text-muted-foreground">
                  {roleInfo.description}
                </p>
              </div>
            </div>
            <Badge variant="secondary">{roleInfo.label}</Badge>
          </div>

          {/* Invitation Details */}
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Invited by {inviterName}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>
                Expires {formatDistanceToNow(new Date(invitation.expires_at), { addSuffix: true })}
              </span>
            </div>
          </div>

          {invitation.message && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm">
                <span className="font-medium">Message from {inviterName}:</span>
              </p>
              <p className="text-sm mt-1">{invitation.message}</p>
            </div>
          )}

          {/* Auth Check */}
          {!user ? (
            <Alert>
              <AlertDescription>
                You need to sign in to accept this invitation. You'll be redirected back here after signing in.
              </AlertDescription>
            </Alert>
          ) : emailMismatch ? (
            <Alert>
              <AlertDescription>
                This invitation was sent to {invitation.email}, but you're signed in as {user.email}. 
                Please sign in with the correct account to accept this invitation.
              </AlertDescription>
            </Alert>
          ) : null}

          {/* Actions */}
          <div className="flex space-x-3">
            {user && !emailMismatch ? (
              <>
                <Button 
                  className="flex-1"
                  onClick={() => acceptInvitation.mutate()}
                  disabled={acceptInvitation.isPending}
                >
                  {acceptInvitation.isPending ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Accept Invitation
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => declineInvitation.mutate()}
                  disabled={declineInvitation.isPending}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Decline
                </Button>
              </>
            ) : (
              <Button 
                className="flex-1"
                onClick={() => navigate("/auth")}
              >
                Sign In to Accept
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}