import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Building2, 
  User, 
  MapPin, 
  Phone, 
  Globe, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Upload
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCompanies } from '@/hooks/useCompanies';

interface BusinessOnboardingWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

interface BusinessProfile {
  name: string;
  slug: string;
  business_type: 'individual' | 'small_business' | 'enterprise' | 'agency' | 'freelancer';
  industry: string;
  company_size: string;
  website: string;
  phone: string;
  address: string;
  abn: string;
  slogan: string;
  services: string[];
  certification_status: string;
  year_established: number;
  service_areas: string[];
}

const BUSINESS_TYPES = [
  { value: 'individual', label: 'Individual/Freelancer' },
  { value: 'small_business', label: 'Small Business' },
  { value: 'enterprise', label: 'Enterprise' },
  { value: 'agency', label: 'Agency' },
  { value: 'freelancer', label: 'Freelancer' }
];

const INDUSTRIES = [
  'Construction', 'Technology', 'Design', 'Marketing', 'Consulting', 
  'Healthcare', 'Education', 'Finance', 'Real Estate', 'Other'
];

const COMPANY_SIZES = [
  '1 employee', '2-10 employees', '11-50 employees', 
  '51-200 employees', '201-500 employees', '500+ employees'
];

export const BusinessOnboardingWizard = ({ onComplete, onCancel }: BusinessOnboardingWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { createCompany } = useCompanies();

  const [profile, setProfile] = useState<BusinessProfile>({
    name: '',
    slug: '',
    business_type: 'small_business',
    industry: 'Construction',
    company_size: '1 employee',
    website: '',
    phone: '',
    address: '',
    abn: '',
    slogan: '',
    services: [],
    certification_status: 'pending',
    year_established: new Date().getFullYear(),
    service_areas: []
  });

  const [customService, setCustomService] = useState('');
  const [customArea, setCustomArea] = useState('');

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleInputChange = (field: keyof BusinessProfile, value: any) => {
    setProfile(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-generate slug when name changes
      if (field === 'name') {
        updated.slug = generateSlug(value);
      }
      
      return updated;
    });
  };

  const addService = () => {
    if (customService.trim() && !profile.services.includes(customService.trim())) {
      setProfile(prev => ({
        ...prev,
        services: [...prev.services, customService.trim()]
      }));
      setCustomService('');
    }
  };

  const removeService = (service: string) => {
    setProfile(prev => ({
      ...prev,
      services: prev.services.filter(s => s !== service)
    }));
  };

  const addServiceArea = () => {
    if (customArea.trim() && !profile.service_areas.includes(customArea.trim())) {
      setProfile(prev => ({
        ...prev,
        service_areas: [...prev.service_areas, customArea.trim()]
      }));
      setCustomArea('');
    }
  };

  const removeServiceArea = (area: string) => {
    setProfile(prev => ({
      ...prev,
      service_areas: prev.service_areas.filter(a => a !== area)
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(profile.name && profile.business_type && profile.industry);
      case 2:
        return !!(profile.phone || profile.website || profile.address);
      case 3:
        return profile.services.length > 0;
      case 4:
        return true; // Review step
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } else {
      toast({
        title: "Please complete required fields",
        description: "Fill in all required information before proceeding.",
        variant: "destructive"
      });
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await createCompany({
        name: profile.name,
        slug: profile.slug,
        website: profile.website,
        phone: profile.phone,
        address: profile.address,
        abn: profile.abn,
        slogan: profile.slogan
      });

      toast({
        title: "Business Profile Created!",
        description: "Your business profile has been successfully created.",
      });

      onComplete();
    } catch (error) {
      console.error('Error creating business profile:', error);
      toast({
        title: "Error",
        description: "Failed to create business profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <Building2 className="w-12 h-12 text-primary mx-auto" />
              <h2 className="text-2xl font-bold">Business Information</h2>
              <p className="text-muted-foreground">Tell us about your business</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Business Name *</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your business name"
                />
              </div>

              <div>
                <Label htmlFor="slug">Business URL</Label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">yoursite.com/company/</span>
                  <Input
                    id="slug"
                    value={profile.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="business-url"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="business_type">Business Type *</Label>
                <Select value={profile.business_type} onValueChange={(value) => handleInputChange('business_type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="industry">Industry *</Label>
                  <Select value={profile.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="company_size">Company Size</Label>
                  <Select value={profile.company_size} onValueChange={(value) => handleInputChange('company_size', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPANY_SIZES.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="slogan">Business Slogan</Label>
                <Input
                  id="slogan"
                  value={profile.slogan}
                  onChange={(e) => handleInputChange('slogan', e.target.value)}
                  placeholder="A short description of what you do"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <MapPin className="w-12 h-12 text-primary mx-auto" />
              <h2 className="text-2xl font-bold">Contact Details</h2>
              <p className="text-muted-foreground">How can clients reach you?</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={profile.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://your-website.com"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <Label htmlFor="address">Business Address</Label>
                <Textarea
                  id="address"
                  value={profile.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="123 Business St, City, State, ZIP"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="abn">ABN/Tax ID</Label>
                  <Input
                    id="abn"
                    value={profile.abn}
                    onChange={(e) => handleInputChange('abn', e.target.value)}
                    placeholder="Business registration number"
                  />
                </div>

                <div>
                  <Label htmlFor="year_established">Year Established</Label>
                  <Input
                    id="year_established"
                    type="number"
                    value={profile.year_established}
                    onChange={(e) => handleInputChange('year_established', parseInt(e.target.value))}
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <FileText className="w-12 h-12 text-primary mx-auto" />
              <h2 className="text-2xl font-bold">Services & Coverage</h2>
              <p className="text-muted-foreground">What services do you offer and where?</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label>Services Offered *</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={customService}
                    onChange={(e) => setCustomService(e.target.value)}
                    placeholder="Add a service..."
                    onKeyPress={(e) => e.key === 'Enter' && addService()}
                  />
                  <Button type="button" onClick={addService}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {profile.services.map((service) => (
                    <Badge key={service} variant="secondary" className="cursor-pointer" onClick={() => removeService(service)}>
                      {service} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Service Areas</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={customArea}
                    onChange={(e) => setCustomArea(e.target.value)}
                    placeholder="Add a service area..."
                    onKeyPress={(e) => e.key === 'Enter' && addServiceArea()}
                  />
                  <Button type="button" onClick={addServiceArea}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {profile.service_areas.map((area) => (
                    <Badge key={area} variant="outline" className="cursor-pointer" onClick={() => removeServiceArea(area)}>
                      {area} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
              <h2 className="text-2xl font-bold">Review & Complete</h2>
              <p className="text-muted-foreground">Review your business profile before creating</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{profile.name}</CardTitle>
                <CardDescription>{profile.slogan}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Business Type:</strong> {BUSINESS_TYPES.find(t => t.value === profile.business_type)?.label}
                  </div>
                  <div>
                    <strong>Industry:</strong> {profile.industry}
                  </div>
                  <div>
                    <strong>Company Size:</strong> {profile.company_size}
                  </div>
                  <div>
                    <strong>Established:</strong> {profile.year_established}
                  </div>
                </div>

                {profile.services.length > 0 && (
                  <div>
                    <strong>Services:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {profile.services.map((service) => (
                        <Badge key={service} variant="secondary">{service}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {profile.service_areas.length > 0 && (
                  <div>
                    <strong>Service Areas:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {profile.service_areas.map((area) => (
                        <Badge key={area} variant="outline">{area}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle>Business Onboarding</CardTitle>
                <CardDescription>Step {currentStep} of {totalSteps}</CardDescription>
              </div>
              <Button variant="ghost" onClick={onCancel}>Cancel</Button>
            </div>
            <Progress value={progress} className="w-full" />
          </CardHeader>

          <CardContent className="space-y-6">
            {renderStep()}

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {currentStep < totalSteps ? (
                <Button onClick={handleNext}>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Creating...' : 'Complete Setup'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};