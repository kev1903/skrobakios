import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { ProfilePictureSection } from "@/components/user-edit/ProfilePictureSection";
import { PersonalInfoSection } from "@/components/user-edit/PersonalInfoSection";
import { ProfessionalInfoSection } from "@/components/user-edit/ProfessionalInfoSection";

interface InvitationData {
  email: string;
  invited_role: string;
  token: string;
  expires_at: string;
  used_at: string | null;
}

export default function Signup() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [loadingInvitation, setLoadingInvitation] = useState(true);
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  // Form state
  const [personalData, setPersonalData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: ""
  });

  const [professionalData, setProfessionalData] = useState({
    jobTitle: "",
    location: "",
    website: "",
    bio: ""
  });

  const [passwordData, setPasswordData] = useState({
    password: "",
    confirmPassword: ""
  });

  useEffect(() => {
    if (!token) {
      toast({
        title: "Invalid invitation",
        description: "No invitation token provided.",
        variant: "destructive"
      });
      navigate("/");
      return;
    }

    fetchInvitationData();
  }, [token]);

  const fetchInvitationData = async () => {
    try {
      const { data, error } = await supabase
        .from("user_invitations")
        .select("*")
        .eq("token", token)
        .is("used_at", null)
        .maybeSingle();

      if (error || !data) {
        toast({
          title: "Invalid invitation",
          description: "This invitation link is invalid or has expired.",
          variant: "destructive"
        });
        navigate("/");
        return;
      }

      // Check if invitation has expired
      const expiresAt = new Date(data.expires_at);
      if (expiresAt < new Date()) {
        toast({
          title: "Invitation expired",
          description: "This invitation link has expired. Please request a new one.",
          variant: "destructive"
        });
        navigate("/");
        return;
      }

      setInvitation(data);
      // Pre-populate email since it's read-only
      setPersonalData(prev => ({ ...prev, email: data.email }));
    } catch (error) {
      console.error("Error fetching invitation:", error);
      toast({
        title: "Error",
        description: "Failed to load invitation data.",
        variant: "destructive"
      });
      navigate("/");
    } finally {
      setLoadingInvitation(false);
    }
  };

  const handlePersonalInfoChange = (field: string, value: string) => {
    setPersonalData(prev => ({ ...prev, [field]: value }));
  };

  const handleProfessionalInfoChange = (field: string, value: string) => {
    setProfessionalData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (newAvatarUrl: string) => {
    setAvatarUrl(newAvatarUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!invitation) return;

    // Validate required fields
    if (!personalData.firstName.trim() || !personalData.lastName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in your first and last name.",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.password !== passwordData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match.",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invitation.email,
        password: passwordData.password,
        options: {
          data: {
            first_name: personalData.firstName,
            last_name: personalData.lastName
          },
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (authError) {
        toast({
          title: "Signup failed",
          description: authError.message,
          variant: "destructive"
        });
        return;
      }

      if (!authData.user) {
        toast({
          title: "Signup failed",
          description: "User creation failed.",
          variant: "destructive"
        });
        return;
      }

      // Update the profile with additional information
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: personalData.firstName,
          last_name: personalData.lastName,
          phone: personalData.phone || null,
          birth_date: personalData.birthDate || null,
          job_title: professionalData.jobTitle || null,
          location: professionalData.location || null,
          website: professionalData.website || null,
          bio: professionalData.bio || null,
          avatar_url: avatarUrl || null,
          status: 'active'
        })
        .eq("email", invitation.email);

      if (profileError) {
        console.error("Profile update error:", profileError);
      }

      // Mark invitation as used
      await supabase
        .from("user_invitations")
        .update({ used_at: new Date().toISOString() })
        .eq("token", token);

      toast({
        title: "Account created successfully!",
        description: "Welcome to the platform. You can now start using all features.",
      });

      navigate("/");

    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Signup failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingInvitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading invitation...</span>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold">Complete Your Account Setup</CardTitle>
          <CardDescription className="text-base">
            Welcome! You've been invited to join as <span className="font-semibold text-primary">{invitation.invited_role}</span>
          </CardDescription>
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <span>Email:</span>
            <span className="font-medium">{invitation.email}</span>
          </div>
        </CardHeader>

        <CardContent>
          {loadingInvitation && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span className="text-muted-foreground">Loading invitation details...</span>
            </div>
          )}

          {!loadingInvitation && invitation && (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Profile Picture Section */}
              <div className="animate-fade-in">
                <ProfilePictureSection
                  avatarUrl={avatarUrl}
                  firstName={personalData.firstName || "New"}
                  lastName={personalData.lastName || "User"}
                  onAvatarChange={handleAvatarChange}
                />
              </div>

              {/* Personal Information Section */}
              <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <PersonalInfoSection
                  profileData={personalData}
                  onInputChange={handlePersonalInfoChange}
                />
              </div>

              {/* Password Fields */}
              <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <CardHeader className="pb-6">
                    <CardTitle className="flex items-center space-x-3 text-slate-800">
                      <span className="text-xl font-semibold">Account Security</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password">Password *</Label>
                        <Input
                          id="password"
                          type="password"
                          value={passwordData.password}
                          onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                          required
                          minLength={6}
                          className="backdrop-blur-sm bg-white/60 border-white/30 focus:bg-white/80 focus:border-blue-300 transition-all duration-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password *</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          required
                          minLength={6}
                          className="backdrop-blur-sm bg-white/60 border-white/30 focus:bg-white/80 focus:border-blue-300 transition-all duration-200"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Professional Information Section */}
              <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <ProfessionalInfoSection
                  profileData={professionalData}
                  onInputChange={handleProfessionalInfoChange}
                />
              </div>

              {/* Submit Button */}
              <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
                  disabled={loading || !personalData.firstName.trim() || !personalData.lastName.trim() || !passwordData.password || !passwordData.confirmPassword}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Profile...
                    </>
                  ) : (
                    <>
                      <span className="text-lg">Create Profile</span>
                      <span className="ml-2 text-sm opacity-90">✨</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}