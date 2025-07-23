import { useState } from "react";
import { Mail, Lock, User, Phone, Building, CheckCircle, ArrowLeft, Eye, EyeOff, Users, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PlatformSignupPageProps {
  onNavigate: (page: string) => void;
}

type AccountType = 'individual' | 'business';
type UserRole = 'client' | 'service_provider' | 'both';

interface SignupFormData {
  accountType: AccountType;
  userRole: UserRole;
  // Personal info
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  // Business info (for business accounts)
  businessName: string;
  businessType: string;
  // Service provider info
  professionalTitle: string;
  skills: string[];
  // Agreements
  termsAccepted: boolean;
  marketingEmails: boolean;
}

export const PlatformSignupPage = ({ onNavigate }: PlatformSignupPageProps) => {
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<SignupFormData>({
    accountType: 'individual',
    userRole: 'client',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    businessName: '',
    businessType: 'small_business',
    professionalTitle: '',
    skills: [],
    termsAccepted: false,
    marketingEmails: false
  });

  const commonSkills = [
    'Web Development', 'Mobile Development', 'UI/UX Design', 'Graphic Design',
    'Content Writing', 'Digital Marketing', 'SEO', 'Data Analysis',
    'Project Management', 'Business Consulting', 'Photography', 'Video Editing'
  ];

  const handleInputChange = (field: keyof SignupFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.accountType && formData.userRole);
      case 2:
        return !!(
          formData.firstName && 
          formData.lastName && 
          formData.email && 
          formData.password && 
          formData.confirmPassword &&
          formData.password === formData.confirmPassword &&
          formData.password.length >= 6
        );
      case 3:
        if (formData.accountType === 'business') {
          return !!(formData.businessName && formData.businessType);
        }
        if (formData.userRole === 'service_provider' || formData.userRole === 'both') {
          return !!(formData.professionalTitle && formData.skills.length > 0);
        }
        return true;
      case 4:
        return formData.termsAccepted;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    } else {
      setError('Please fill in all required fields');
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      setError('Please accept the terms and conditions');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create auth user
      const { error: authError } = await signUp(
        formData.email,
        formData.password,
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          professionalTitle: formData.professionalTitle
        }
      );

      if (authError) {
        setError(authError.message);
        return;
      }

      // Create business profile if business account
      if (formData.accountType === 'business') {
        const { error: businessError } = await supabase
          .from('companies')
          .insert({
            name: formData.businessName,
            slug: formData.businessName.toLowerCase().replace(/\s+/g, '-'),
            business_type: formData.businessType as any,
            contact_preferences: {
              marketing_emails: formData.marketingEmails
            }
          });

        if (businessError) {
          console.error('Business creation error:', businessError);
        }
      }

      // Set user role
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const roleToSet = formData.userRole === 'both' ? 'business_admin' : 
                        formData.userRole === 'client' ? 'client' : 'business_admin';
        
        await supabase
          .from('user_roles')
          .update({ role: roleToSet })
          .eq('user_id', user.id);

        // Update profile with additional info
        await supabase
          .from('profiles')
          .update({
            skills: formData.skills,
            professional_title: formData.professionalTitle
          })
          .eq('user_id', user.id);
      }

      toast({
        title: "Account Created Successfully!",
        description: "Please check your email to verify your account before signing in.",
      });

      onNavigate('auth');
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">I want to:</Label>
              <RadioGroup
                value={formData.userRole}
                onValueChange={(value) => handleInputChange('userRole', value as UserRole)}
                className="mt-3"
              >
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="client" id="client" />
                  <Label htmlFor="client" className="flex-1 cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-medium">Hire service providers</div>
                        <div className="text-sm text-muted-foreground">Find and collaborate with professionals</div>
                      </div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="service_provider" id="service_provider" />
                  <Label htmlFor="service_provider" className="flex-1 cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <Building className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-medium">Offer my services</div>
                        <div className="text-sm text-muted-foreground">Provide professional services to clients</div>
                      </div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="both" id="both" />
                  <Label htmlFor="both" className="flex-1 cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-purple-600" />
                      <div>
                        <div className="font-medium">Both</div>
                        <div className="text-sm text-muted-foreground">Hire others and offer my own services</div>
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-base font-medium">Account type:</Label>
              <RadioGroup
                value={formData.accountType}
                onValueChange={(value) => handleInputChange('accountType', value as AccountType)}
                className="mt-3"
              >
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="individual" id="individual" />
                  <Label htmlFor="individual" className="flex-1 cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-medium">Individual</div>
                        <div className="text-sm text-muted-foreground">Personal account</div>
                      </div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
                  <RadioGroupItem value="business" id="business" />
                  <Label htmlFor="business" className="flex-1 cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <Building className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-medium">Business</div>
                        <div className="text-sm text-muted-foreground">Company or organization</div>
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
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
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Phone number"
                  className="pl-10"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>
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
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
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
                />
              </div>
              {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-sm text-red-600 mt-1">Passwords do not match</p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {formData.accountType === 'business' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Business Information</h3>
                <div>
                  <Label htmlFor="businessName">Business Name *</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="businessName"
                      type="text"
                      placeholder="Your business name"
                      className="pl-10"
                      value={formData.businessName}
                      onChange={(e) => handleInputChange('businessName', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="businessType">Business Type *</Label>
                  <Select 
                    value={formData.businessType} 
                    onValueChange={(value) => handleInputChange('businessType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small_business">Small Business</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                      <SelectItem value="agency">Agency</SelectItem>
                      <SelectItem value="freelancer">Freelancer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {(formData.userRole === 'service_provider' || formData.userRole === 'both') && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Professional Information</h3>
                <div>
                  <Label htmlFor="professionalTitle">Professional Title *</Label>
                  <Input
                    id="professionalTitle"
                    type="text"
                    placeholder="e.g., Web Developer, Graphic Designer"
                    value={formData.professionalTitle}
                    onChange={(e) => handleInputChange('professionalTitle', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Skills & Expertise *</Label>
                  <p className="text-sm text-muted-foreground mb-3">Select skills that match your expertise</p>
                  <div className="grid grid-cols-2 gap-2">
                    {commonSkills.map((skill) => (
                      <div key={skill} className="flex items-center space-x-2">
                        <Checkbox
                          id={skill}
                          checked={formData.skills.includes(skill)}
                          onCheckedChange={() => handleSkillToggle(skill)}
                        />
                        <Label htmlFor={skill} className="text-sm cursor-pointer">
                          {skill}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {formData.userRole === 'client' && formData.accountType === 'individual' && (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Almost Ready!</h3>
                <p className="text-muted-foreground">
                  Let's finish setting up your account.
                </p>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Terms and Preferences</h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.termsAccepted}
                  onCheckedChange={(checked) => handleInputChange('termsAccepted', !!checked)}
                />
                <Label htmlFor="terms" className="text-sm cursor-pointer">
                  I agree to the{' '}
                  <Button variant="link" className="p-0 h-auto text-sm">
                    Terms of Service
                  </Button>
                  {' '}and{' '}
                  <Button variant="link" className="p-0 h-auto text-sm">
                    Privacy Policy
                  </Button>
                  *
                </Label>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="marketing"
                  checked={formData.marketingEmails}
                  onCheckedChange={(checked) => handleInputChange('marketingEmails', !!checked)}
                />
                <Label htmlFor="marketing" className="text-sm cursor-pointer">
                  I'd like to receive updates about new features and opportunities
                </Label>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Account Summary</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
                <p><strong>Email:</strong> {formData.email}</p>
                <p><strong>Account Type:</strong> {formData.accountType === 'individual' ? 'Individual' : 'Business'}</p>
                <p><strong>Role:</strong> {
                  formData.userRole === 'client' ? 'Client' :
                  formData.userRole === 'service_provider' ? 'Service Provider' : 'Client & Service Provider'
                }</p>
                {formData.businessName && <p><strong>Business:</strong> {formData.businessName}</p>}
                {formData.professionalTitle && <p><strong>Title:</strong> {formData.professionalTitle}</p>}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-primary-foreground font-bold text-xl heading-modern">S</span>
          </div>
          <h1 className="text-3xl font-bold text-gradient heading-modern mb-2">
            Join SKROBAKI Platform
          </h1>
          <p className="text-muted-foreground body-modern">Create your account in a few easy steps</p>
        </div>

        <Card className="glass-card shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <CardTitle>
                {currentStep === 1 && "Account Type"}
                {currentStep === 2 && "Personal Information"}
                {currentStep === 3 && "Additional Details"}
                {currentStep === 4 && "Review & Confirm"}
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                Step {currentStep} of 4
              </span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {renderStep()}

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={() => {
                  if (currentStep === 1) {
                    onNavigate('auth');
                  } else {
                    setCurrentStep(prev => prev - 1);
                  }
                }}
                disabled={isLoading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {currentStep === 1 ? 'Back to Login' : 'Previous'}
              </Button>

              {currentStep < 4 ? (
                <Button
                  onClick={handleNext}
                  disabled={!validateStep(currentStep) || isLoading}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!validateStep(4) || isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};