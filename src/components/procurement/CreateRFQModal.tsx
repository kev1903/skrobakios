import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useCompany } from '@/contexts/CompanyContext';
import { useWBS } from '@/hooks/useWBS';

interface CreateRFQModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onSuccess: () => void;
}

interface Vendor {
  id: string;
  name: string;
  trade_category: string;
  email?: string;
}

export const CreateRFQModal: React.FC<CreateRFQModalProps> = ({
  isOpen,
  onClose,
  projectId,
  onSuccess
}) => {
  const { currentCompany } = useCompany();
  const { wbsItems } = useWBS(projectId);
  const [currentStep, setCurrentStep] = useState(1);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  
  // Form data
  const [formData, setFormData] = useState({
    rfq_number: '',
    work_package: '',
    trade_category: '',
    scope_summary: '',
    due_date: '',
    status: 'draft'
  });
  
  const [selectedVendors, setSelectedVendors] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      fetchVendors();
      generateRFQNumber();
    }
  }, [isOpen]);

  const fetchVendors = async () => {
    if (!currentCompany) return;

    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('company_id', currentCompany.id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setVendors(data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast.error('Failed to load vendors');
    }
  };

  const generateRFQNumber = async () => {
    try {
      const { count } = await supabase
        .from('rfqs')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId);

      const nextNumber = (count || 0) + 1;
      setFormData(prev => ({
        ...prev,
        rfq_number: `RFQ-${String(nextNumber).padStart(4, '0')}`
      }));
    } catch (error) {
      console.error('Error generating RFQ number:', error);
    }
  };

  // Get WBS items that require RFQ
  const rfqRequiredItems = wbsItems.filter(item => item.rfq_required);

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.work_package || !formData.trade_category) {
        toast.error('Please fill in all required fields');
        return;
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const toggleVendor = (vendorId: string) => {
    setSelectedVendors(prev => {
      const newSet = new Set(prev);
      if (newSet.has(vendorId)) {
        newSet.delete(vendorId);
      } else {
        newSet.add(vendorId);
      }
      return newSet;
    });
  };

  const handleSubmit = async () => {
    if (!currentCompany) return;

    if (selectedVendors.size === 0) {
      toast.error('Please select at least one vendor');
      return;
    }

    try {
      // Create RFQ
      const { data: rfqData, error: rfqError } = await supabase
        .from('rfqs')
        .insert({
          rfq_number: formData.rfq_number,
          work_package: formData.work_package,
          trade_category: formData.trade_category,
          scope_summary: formData.scope_summary,
          due_date: formData.due_date,
          project_id: projectId,
          company_id: currentCompany.id,
          status: 'RFQ Issued'
        })
        .select()
        .single();

      if (rfqError) throw rfqError;

      // TODO: Create invitations when rfq_invitations table is available
      // For now, just show success message
      
      toast.success(`RFQ created successfully. ${selectedVendors.size} vendor(s) to be invited.`);
      onSuccess();
      resetForm();
    } catch (error) {
      console.error('Error creating RFQ:', error);
      toast.error('Failed to create RFQ');
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
      rfq_number: '',
      work_package: '',
      trade_category: '',
      scope_summary: '',
      due_date: '',
      status: 'draft'
    });
    setSelectedVendors(new Set());
  };

  const handleWBSSelect = (itemId: string) => {
    const selectedItem = rfqRequiredItems.find(item => item.id === itemId);
    if (selectedItem) {
      setFormData(prev => ({
        ...prev,
        work_package: selectedItem.title,
        trade_category: ''
      }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl border border-border/30 shadow-glass">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-foreground">
            Create New RFQ
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-200 ${
                    currentStep >= step
                      ? 'bg-luxury-gold text-white shadow-md'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {currentStep > step ? <Check className="w-5 h-5" /> : step}
                </div>
                <span className="text-xs mt-2 text-muted-foreground font-medium">
                  {step === 1 ? 'Details' : step === 2 ? 'Vendors' : 'Review'}
                </span>
              </div>
              {step < 3 && (
                <div className={`h-0.5 flex-1 ${currentStep > step ? 'bg-luxury-gold' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: RFQ Details */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rfq_number">RFQ Number</Label>
                <Input
                  id="rfq_number"
                  value={formData.rfq_number}
                  disabled
                  className="bg-muted/30"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="wbs_activity">WBS Activity *</Label>
                <Select onValueChange={handleWBSSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select WBS activity..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 backdrop-blur-xl">
                    {rfqRequiredItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.wbs_id} - {item.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="work_package">Work Package *</Label>
              <Input
                id="work_package"
                value={formData.work_package}
                onChange={(e) => setFormData(prev => ({ ...prev, work_package: e.target.value }))}
                placeholder="Enter work package name..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trade_category">Trade Category *</Label>
              <Input
                id="trade_category"
                value={formData.trade_category}
                onChange={(e) => setFormData(prev => ({ ...prev, trade_category: e.target.value }))}
                placeholder="e.g., Electrical, Plumbing, HVAC..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scope_summary">Scope Summary</Label>
              <Textarea
                id="scope_summary"
                value={formData.scope_summary}
                onChange={(e) => setFormData(prev => ({ ...prev, scope_summary: e.target.value }))}
                placeholder="Describe the scope of work..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Response Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              />
            </div>
          </div>
        )}

        {/* Step 2: Select Vendors */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">
                Select Vendors to Invite ({selectedVendors.size} selected)
              </h3>
              <p className="text-xs text-muted-foreground">
                Choose vendors who will receive this RFQ invitation
              </p>
            </div>

            {vendors.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-sm">No active vendors found</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {vendors.map((vendor) => (
                  <div
                    key={vendor.id}
                    className="flex items-center space-x-3 p-4 bg-white/80 backdrop-blur-md border border-border/30 rounded-lg hover:shadow-md transition-all duration-200"
                  >
                    <Checkbox
                      id={vendor.id}
                      checked={selectedVendors.has(vendor.id)}
                      onCheckedChange={() => toggleVendor(vendor.id)}
                    />
                    <label
                      htmlFor={vendor.id}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-foreground">
                          {vendor.name}
                        </span>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{vendor.trade_category}</span>
                          {vendor.email && <span>{vendor.email}</span>}
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Review */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="bg-accent/10 rounded-lg p-6 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                RFQ Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">RFQ Number</p>
                  <p className="text-sm font-semibold text-foreground">{formData.rfq_number}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Work Package</p>
                  <p className="text-sm font-semibold text-foreground">{formData.work_package}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Trade Category</p>
                  <p className="text-sm font-semibold text-foreground">{formData.trade_category}</p>
                </div>
                {formData.due_date && (
                  <div>
                    <p className="text-xs text-muted-foreground">Due Date</p>
                    <p className="text-sm font-semibold text-foreground">{formData.due_date}</p>
                  </div>
                )}
              </div>
              {formData.scope_summary && (
                <div>
                  <p className="text-xs text-muted-foreground">Scope Summary</p>
                  <p className="text-sm text-foreground mt-1">{formData.scope_summary}</p>
                </div>
              )}
            </div>

            <div className="bg-accent/10 rounded-lg p-6 space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Selected Vendors ({selectedVendors.size})
              </h3>
              <div className="space-y-2">
                {Array.from(selectedVendors).map(vendorId => {
                  const vendor = vendors.find(v => v.id === vendorId);
                  return vendor ? (
                    <div key={vendorId} className="flex items-center justify-between py-2">
                      <span className="text-sm font-medium text-foreground">{vendor.name}</span>
                      <span className="text-xs text-muted-foreground">{vendor.trade_category}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-border/30">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? onClose : handleBack}
            className="border-border/30"
          >
            {currentStep === 1 ? (
              'Cancel'
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </>
            )}
          </Button>

          {currentStep < 3 ? (
            <Button
              onClick={handleNext}
              className="bg-luxury-gold text-white hover:bg-luxury-gold/90"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              className="bg-luxury-gold text-white hover:bg-luxury-gold/90"
            >
              Create RFQ & Send Invitations
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
