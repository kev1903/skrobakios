import React, { useState } from 'react';
import { useNavigationWithHistory } from '@/hooks/useNavigationWithHistory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  Save, 
  FileText, 
  Calculator, 
  DollarSign, 
  BarChart3,
  Calendar,
  Building2,
  MapPin,
  Download,
  Mail,
  Plus
} from 'lucide-react';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface EstimateCreationPageProps {
  onNavigate: (page: string) => void;
}

export const EstimateCreationPage = ({ onNavigate }: EstimateCreationPageProps) => {
  const [activeTab, setActiveTab] = useState('scope');
  const [estimateDate, setEstimateDate] = useState<Date>();
  const [expiryDate, setExpiryDate] = useState<Date>();
  const { navigateBack } = useNavigationWithHistory({ onNavigate, currentPage: 'estimate-creation' });

  const handleBack = () => {
    navigateBack();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.15)_1px,transparent_0)] bg-[length:24px_24px] pointer-events-none" />
      
      <div className="relative z-10 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBack}
              className="flex items-center space-x-2 hover:bg-white/20 backdrop-blur-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground font-poppins">Construction Estimating</h1>
              <p className="text-muted-foreground font-inter">Create detailed estimates with graphical take-offs and cost analysis</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="glass-light border-white/20">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Save className="w-4 h-4 mr-2" />
              Save Estimate
            </Button>
          </div>
        </div>

        {/* Project Details Section */}
        <Card className="glass-light border-white/20 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-foreground">Project Details</CardTitle>
            <p className="text-muted-foreground">Set up your estimate basics</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="project-select">Select Project</Label>
                <Select>
                  <SelectTrigger className="glass-light border-white/20">
                    <SelectValue placeholder="Choose a project" />
                  </SelectTrigger>
                  <SelectContent className="glass-light border-white/20 backdrop-blur-xl">
                    <SelectItem value="project1">Office Building Renovation</SelectItem>
                    <SelectItem value="project2">Warehouse Extension</SelectItem>
                    <SelectItem value="project3">Residential Complex</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimate-name">Estimate Name</Label>
                <Input 
                  id="estimate-name"
                  placeholder="e.g., Initial Estimate v1.0"
                  className="glass-light border-white/20"
                />
              </div>

              <div className="space-y-2">
                <Label>Estimate Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal glass-light border-white/20",
                        !estimateDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {estimateDate ? format(estimateDate, "MMM dd, yyyy") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 glass-light border-white/20 backdrop-blur-xl">
                    <CalendarComponent
                      mode="single"
                      selected={estimateDate}
                      onSelect={setEstimateDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 glass-light border-white/20 backdrop-blur-xl">
            <TabsTrigger value="scope" className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="w-4 h-4" />
              <span>Scope & WBS</span>
            </TabsTrigger>
            <TabsTrigger value="takeoff" className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Calculator className="w-4 h-4" />
              <span>📋 Take-off & Quantities</span>
            </TabsTrigger>
            <TabsTrigger value="pricing" className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <DollarSign className="w-4 h-4" />
              <span>💰 Pricing</span>
            </TabsTrigger>
            <TabsTrigger value="summary" className="flex items-center space-x-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BarChart3 className="w-4 h-4" />
              <span>📊 Summary & Export</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="scope" className="space-y-4">
              <Card className="glass-light border-white/20 backdrop-blur-xl shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Project Scope & Work Breakdown Structure</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="project-description">Project Description</Label>
                        <Textarea 
                          id="project-description"
                          placeholder="Describe the scope of work..."
                          className="min-h-32 glass-light border-white/20 resize-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Project Location</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          <Input 
                            id="location"
                            placeholder="Enter project address"
                            className="pl-10 glass-light border-white/20"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="client-info">Client Information</Label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-3 text-muted-foreground w-4 h-4" />
                          <Textarea 
                            id="client-info"
                            placeholder="Client name and contact details..."
                            className="pl-10 min-h-32 glass-light border-white/20 resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-6">
                    <h3 className="text-lg font-semibold mb-4">Work Breakdown Structure</h3>
                    <div className="bg-muted/20 rounded-lg p-4 text-center">
                      <p className="text-muted-foreground">WBS structure will be built here</p>
                      <Button variant="outline" className="mt-2">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Work Package
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="takeoff" className="space-y-4">
              <Card className="glass-light border-white/20 backdrop-blur-xl shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calculator className="w-5 h-5" />
                    <span>Drawings & Take-offs</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                      <Calculator className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Upload Project Drawings</h3>
                      <p className="text-muted-foreground">Upload PDF drawings to start measuring quantities</p>
                    </div>
                    <Button>
                      <Download className="w-4 h-4 mr-2" />
                      Upload PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-4">
              <Card className="glass-light border-white/20 backdrop-blur-xl shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5" />
                    <span>Quantities & Rates</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                      <DollarSign className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Pricing & Cost Analysis</h3>
                      <p className="text-muted-foreground">Apply rates to measured quantities</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="summary" className="space-y-4">
              <Card className="glass-light border-white/20 backdrop-blur-xl shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Summary & Totals</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-muted/20 rounded-lg">
                      <div className="text-2xl font-bold text-foreground">$0</div>
                      <div className="text-sm text-muted-foreground">Subtotal</div>
                    </div>
                    <div className="text-center p-6 bg-muted/20 rounded-lg">
                      <div className="text-2xl font-bold text-foreground">$0</div>
                      <div className="text-sm text-muted-foreground">Tax</div>
                    </div>
                    <div className="text-center p-6 bg-primary/10 rounded-lg">
                      <div className="text-2xl font-bold text-primary">$0</div>
                      <div className="text-sm text-primary">Total</div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <h3 className="text-lg font-semibold">Export Options</h3>
                    <div className="flex space-x-4">
                      <Button variant="outline" className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Export PDF
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Mail className="w-4 h-4 mr-2" />
                        Send to Client
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};