import { useState, useEffect } from "react";
import { Mail, Lock, AlertCircle, CheckCircle, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";

interface AuthPageProps {
  onNavigate: (page: string) => void;
}

export const AuthPage = ({ onNavigate }: AuthPageProps) => {
  const { signIn, resetPassword, isAuthenticated, loading } = useAuth();
  const [currentView, setCurrentView] = useState<'auth' | 'reset-password' | 'update-password'>('auth');
  const [loginData, setLoginData] = useState({ email: "", password: "", rememberMe: false });
  const [resetEmail, setResetEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    console.log(`🔐 AuthPage: isAuthenticated=${isAuthenticated}, loading=${loading}`);
    if (isAuthenticated && !loading) {
      console.log(`🔐 AuthPage: User already authenticated, redirecting to home`);
      onNavigate("home");
    }
  }, [isAuthenticated, loading, onNavigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    if (!loginData.email || !loginData.password) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await signIn(loginData.email, loginData.password, loginData.rememberMe);
      
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setError("Invalid email or password. Please check your credentials.");
        } else if (error.message.includes("Email not confirmed")) {
          setError("Please check your email and click the confirmation link before signing in.");
        } else {
          setError(error.message);
        }
      } else {
        setSuccess("Login successful! Redirecting...");
        setTimeout(() => onNavigate("home"), 1000);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    }
    
    setIsLoading(false);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    if (!resetEmail) {
      setError("Please enter your email address");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await resetPassword(resetEmail);
      
      if (error) {
        setError(error.message);
      } else {
        setSuccess("Password reset email sent! Please check your inbox.");
        setTimeout(() => setCurrentView('auth'), 3000);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    }
    
    setIsLoading(false);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (currentView === 'reset-password') {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-primary-foreground font-bold text-xl heading-modern">S</span>
            </div>
            <h1 className="text-3xl font-bold text-gradient heading-modern mb-2">
              Reset Password
            </h1>
            <p className="text-muted-foreground body-modern">Enter your email to receive reset instructions</p>
          </div>

          <Card className="glass-card shadow-xl">
            <CardContent className="p-6">
              <Button
                variant="ghost"
                onClick={() => setCurrentView('auth')}
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
              
              {success && (
                <Alert className="mb-4 border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div>
                  <Label htmlFor="reset-email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Reset Email"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-2">
      <div className="w-full max-w-lg">
        <div className="text-center mb-4">
            <img 
              src="/lovable-uploads/3a1e9978-cc53-4d2e-ae3a-8d5a295a8fdb.png" 
              alt="Skrobaki Logo" 
              className="w-[360px] h-[360px] object-contain mx-auto mb-2"
            />
          <h1 className="text-2xl font-bold text-gradient heading-modern mb-1">
            Welcome to SKROBAKI
          </h1>
          <p className="text-muted-foreground body-modern text-sm">Modern construction management platform</p>
        </div>

        <Card className="glass-card shadow-xl">
          <CardContent className="p-4">
            <Button
              variant="ghost"
              onClick={() => onNavigate('landing')}
              className="mb-4 p-0 text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to home
            </Button>
            {error && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="mb-4 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            <div className="w-full">
              <div className="text-center mb-4">
                <h2 className="text-lg font-semibold">Sign In</h2>
              </div>
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10"
                      value={loginData.email}
                      onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="pl-10 pr-10"
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      disabled={isLoading}
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

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember-me"
                      checked={loginData.rememberMe}
                      onCheckedChange={(checked) => 
                        setLoginData(prev => ({ ...prev, rememberMe: !!checked }))
                      }
                    />
                    <Label htmlFor="remember-me" className="text-sm">
                      Remember me
                    </Label>
                  </div>
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 text-sm"
                    onClick={() => setCurrentView('reset-password')}
                  >
                    Forgot password?
                  </Button>
                </div>
                
                <Button 
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};