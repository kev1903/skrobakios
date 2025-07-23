import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff, CheckCircle, ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const InvitationSignupPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signUp, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get invitation details from URL parameters
  const invitedEmail = searchParams.get('email') || '';
  const invitedRole = searchParams.get('role') || 'user';
  const token = searchParams.get('token');

  // Pre-fill email if provided
  useEffect(() => {
    if (invitedEmail) {
      setFormData(prev => ({ ...prev, email: invitedEmail }));
    }
  }, [invitedEmail]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'Super Admin';
      case 'business_admin':
        return 'Business Admin';
      case 'project_admin':
        return 'Project Admin';
      case 'user':
        return 'User';
      case 'client':
        return 'Client';
      default:
        return 'User';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'business_admin':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'project_admin':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'user':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'client':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.firstName.trim()) {
      setError("First name is required");
      return false;
    }
    if (!formData.lastName.trim()) {
      setError("Last name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!formData.password) {
      setError("Password is required");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (!formData.termsAccepted) {
      setError("You must accept the terms and conditions");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error: authError } = await signUp(
        formData.email,
        formData.password,
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          invitedRole: invitedRole,
          invitationToken: token
        }
      );

      if (authError) {
        if (authError.message.includes("User already registered")) {
          setError("An account with this email already exists. Please sign in instead.");
        } else {
          setError(authError.message);
        }
        return;
      }

      toast({
        title: "Account Created Successfully!",
        description: "Please check your email to verify your account before signing in.",
      });

      // Redirect to login page
      navigate("/auth");

    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-primary-foreground font-bold text-xl heading-modern">S</span>
          </div>
          <h1 className="text-3xl font-bold text-gradient heading-modern mb-2">
            Complete Your Invitation
          </h1>
          <p className="text-muted-foreground body-modern">
            You've been invited to join SKROBAKI
          </p>
          
          {invitedRole && (
            <div className="flex items-center justify-center mt-4">
              <span className="text-sm text-muted-foreground mr-2">Invited as:</span>
              <Badge className={getRoleBadgeColor(invitedRole)}>
                {getRoleDisplayName(invitedRole)}
              </Badge>
            </div>
          )}
        </div>

        <Card className="glass-card shadow-xl">
          <CardContent className="p-6">
            <Button
              variant="ghost"
              onClick={() => navigate('/auth')}
              className="mb-4 p-0 text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to login
            </Button>

            {error && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="First name"
                      className="pl-10"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Last name"
                      className="pl-10"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={isLoading || !!invitedEmail}
                    required
                  />
                </div>
                {invitedEmail && (
                  <p className="text-xs text-muted-foreground mt-1">
                    This email was provided in your invitation
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create password (min 6 characters)"
                    className="pl-10 pr-10"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    disabled={isLoading}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm password"
                    className="pl-10"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
                {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">Passwords do not match</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.termsAccepted}
                  onCheckedChange={(checked) => 
                    handleInputChange('termsAccepted', !!checked)
                  }
                  disabled={isLoading}
                />
                <Label htmlFor="terms" className="text-sm">
                  I accept the{' '}
                  <Button variant="link" className="p-0 h-auto text-sm font-medium">
                    Terms and Conditions
                  </Button>
                  {' '}and{' '}
                  <Button variant="link" className="p-0 h-auto text-sm font-medium">
                    Privacy Policy
                  </Button>
                </Label>
              </div>

              <Button 
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete Signup
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Button
                  variant="link"
                  className="p-0 text-sm font-medium"
                  onClick={() => navigate('/auth')}
                >
                  Sign in
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};