import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, User } from "lucide-react";

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
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
    company: "",
    jobTitle: "",
    phone: "",
    bio: "",
    location: "",
    website: ""
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
        .eq("used_at", null)
        .single();

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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (userId: string): Promise<string | null> => {
    if (!avatarFile) return null;

    const fileExt = avatarFile.name.split('.').pop();
    const fileName = `${userId}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(`public/${fileName}`, avatarFile, {
        upsert: true
      });

    if (uploadError) {
      console.error("Avatar upload error:", uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(`public/${fileName}`);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!invitation) return;

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match.",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 6) {
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
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName
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

      // Upload avatar if provided
      let avatarUrl = null;
      if (avatarFile) {
        avatarUrl = await uploadAvatar(authData.user.id);
      }

      // Update the profile with additional information
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          company: formData.company || null,
          job_title: formData.jobTitle || null,
          phone: formData.phone || null,
          bio: formData.bio || null,
          location: formData.location || null,
          website: formData.website || null,
          avatar_url: avatarUrl,
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
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarPreview} />
                  <AvatarFallback className="text-lg">
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <Label
                  htmlFor="avatar"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  <input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </Label>
              </div>
              <span className="text-sm text-muted-foreground">Upload your profile picture</span>
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Professional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
                placeholder="Tell us about yourself..."
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Complete Setup"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}