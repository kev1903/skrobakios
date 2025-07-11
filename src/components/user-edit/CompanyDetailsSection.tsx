
import React, { useState } from 'react';
import { Building, Globe, MapPin, Users, MessageSquare, Plus, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CompanyLogoUpload } from './CompanyLogoUpload';
import { CreateCompanyDialog } from '@/components/CreateCompanyDialog';
import { useUserRole } from '@/hooks/useUserRole';

interface CompanyDetailsSectionProps {
  profileData: {
    companyName: string;
    abn: string;
    companyWebsite: string;
    companyAddress: string;
    companyMembers: string;
    companyLogo: string;
    companySlogan: string;
  };
  onInputChange: (field: string, value: string) => void;
}

export const CompanyDetailsSection = ({ profileData, onInputChange }: CompanyDetailsSectionProps) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { isSuperAdmin } = useUserRole();
  
  return (
    <>
      <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
        <Accordion type="single" collapsible defaultValue="company-details" className="w-full">
          <AccordionItem value="company-details" className="border-none">
            <AccordionTrigger className="hover:no-underline px-6 pt-6 pb-2">
              <CardTitle className="flex items-center justify-between w-full text-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200/60 backdrop-blur-sm">
                    <Building className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-xl font-semibold">
                    {profileData.companyName || 'Company Details'}
                  </span>
                </div>
                {isSuperAdmin() && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCreateDialog(true);
                    }}
                    className="ml-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50/50"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    New Company
                  </Button>
                )}
              </CardTitle>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
                {/* Company Logo Upload Section */}
                <CompanyLogoUpload 
                  logoUrl={profileData.companyLogo}
                  onLogoChange={(logoUrl) => onInputChange('companyLogo', logoUrl)}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="text-slate-700 font-medium">Company Name</Label>
                    <Input
                      id="companyName"
                      value={profileData.companyName}
                      onChange={(e) => onInputChange('companyName', e.target.value)}
                      placeholder="Your company name"
                      className="backdrop-blur-sm bg-white/60 border-white/30 focus:bg-white/80 focus:border-blue-300 transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="abn" className="text-slate-700 font-medium">ABN</Label>
                    <Input
                      id="abn"
                      value={profileData.abn}
                      onChange={(e) => onInputChange('abn', e.target.value)}
                      placeholder="12 345 678 901"
                      className="backdrop-blur-sm bg-white/60 border-white/30 focus:bg-white/80 focus:border-blue-300 transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companySlogan" className="flex items-center space-x-2 text-slate-700 font-medium">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    <span>Company Slogan</span>
                  </Label>
                  <Input
                    id="companySlogan"
                    value={profileData.companySlogan}
                    onChange={(e) => onInputChange('companySlogan', e.target.value)}
                    placeholder="Your company's motto or tagline"
                    className="backdrop-blur-sm bg-white/60 border-white/30 focus:bg-white/80 focus:border-blue-300 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyWebsite" className="flex items-center space-x-2 text-slate-700 font-medium">
                    <Globe className="w-4 h-4 text-blue-500" />
                    <span>Company Website</span>
                  </Label>
                  <Input
                    id="companyWebsite"
                    type="url"
                    value={profileData.companyWebsite}
                    onChange={(e) => onInputChange('companyWebsite', e.target.value)}
                    placeholder="https://company-website.com"
                    className="backdrop-blur-sm bg-white/60 border-white/30 focus:bg-white/80 focus:border-blue-300 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyAddress" className="flex items-center space-x-2 text-slate-700 font-medium">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    <span>Company Address</span>
                  </Label>
                  <Textarea
                    id="companyAddress"
                    value={profileData.companyAddress}
                    onChange={(e) => onInputChange('companyAddress', e.target.value)}
                    rows={3}
                    placeholder="Enter complete company address..."
                    className="backdrop-blur-sm bg-white/60 border-white/30 focus:bg-white/80 focus:border-blue-300 transition-all duration-200 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyMembers" className="flex items-center space-x-2 text-slate-700 font-medium">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span>Number of Members</span>
                  </Label>
                  <Input
                    id="companyMembers"
                    type="number"
                    value={profileData.companyMembers}
                    onChange={(e) => onInputChange('companyMembers', e.target.value)}
                    placeholder="15"
                    min="1"
                    className="backdrop-blur-sm bg-white/60 border-white/30 focus:bg-white/80 focus:border-blue-300 transition-all duration-200"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>
      
      <CreateCompanyDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </>
  );
};
