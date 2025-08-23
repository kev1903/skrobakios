import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Upload, Loader2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/contexts/CompanyContext';
import { toast } from 'sonner';

interface AddStakeholderDialogProps {
  onStakeholderAdded: () => void;
}

interface StakeholderFormData {
  display_name: string;
  category: 'client' | 'trade' | 'subcontractor' | 'supplier' | 'consultant';
  trade_industry?: string;
  primary_contact_name?: string;
  primary_email?: string;
  primary_phone?: string;
  tags: string[];
  notes?: string;
}

export const AddStakeholderDialog: React.FC<AddStakeholderDialogProps> = ({ onStakeholderAdded }) => {
  const { currentCompany } = useCompany();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [formData, setFormData] = useState<StakeholderFormData>({
    display_name: '',
    category: 'client',
    primary_email: '',
    primary_phone: '',
    tags: [],
    notes: ''
  });
  const [newTag, setNewTag] = useState('');

  const resetForm = () => {
    setFormData({
      display_name: '',
      category: 'client',
      primary_email: '',
      primary_phone: '',
      tags: [],
      notes: ''
    });
    setNewTag('');
  };

  const handleInputChange = (field: keyof StakeholderFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setExtracting(true);
    
    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Image = reader.result as string;
        
        // Call edge function to extract text from image
        const { data, error } = await supabase.functions.invoke('extract-contact-ocr', {
          body: { 
            image: base64Image
          }
        });

        if (error) {
          console.error('OCR extraction error:', error);
          toast.error('Failed to extract contact details from image');
          return;
        }

        if (data && data.contactData) {
          // Populate form with extracted data
          const extracted = data.contactData;
          
          setFormData(prev => ({
            ...prev,
            display_name: extracted.name || prev.display_name,
            primary_email: extracted.email || prev.primary_email,
            primary_phone: extracted.phone || prev.primary_phone,
            trade_industry: extracted.trade_industry || prev.trade_industry,
            category: extracted.category || prev.category,
            notes: extracted.notes || prev.notes,
            tags: [...prev.tags, ...(extracted.tags ? [extracted.tags].flat() : [])]
          }));
          
          toast.success('Contact details extracted successfully!');
        }
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Image processing error:', error);
      toast.error('Failed to process image');
    } finally {
      setExtracting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentCompany?.id) {
      toast.error('No company selected');
      return;
    }

    if (!formData.display_name.trim()) {
      toast.error('Company/Name is required');
      return;
    }

    setLoading(true);
    
    try {
      // Auto-generate tags based on category and trade industry
      const autoTags = [
        formData.category === 'client' ? 'Client' : 'Trade',
        formData.category === 'client' ? 'Customer' : 'Contractor',
        ...(formData.trade_industry ? [formData.trade_industry] : [])
      ];

      const finalTags = [...new Set([...autoTags, ...formData.tags])];

      const { error } = await supabase
        .from('stakeholders')
        .insert({
          company_id: currentCompany.id,
          display_name: formData.display_name.trim(),
          category: formData.category,
          trade_industry: formData.trade_industry?.trim() || null,
          primary_contact_name: formData.primary_contact_name?.trim() || null,
          primary_email: formData.primary_email?.trim() || null,
          primary_phone: formData.primary_phone?.trim() || null,
          status: 'active',
          compliance_status: 'valid',
          tags: finalTags,
          notes: formData.notes?.trim() || null
        });

      if (error) {
        console.error('Error adding stakeholder:', error);
        toast.error('Failed to add stakeholder');
        return;
      }

      toast.success('Stakeholder added successfully');
      resetForm();
      setOpen(false);
      onStakeholderAdded();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to add stakeholder');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add Stakeholder
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Stakeholder</DialogTitle>
          <DialogDescription>
            Add a new stakeholder by filling out the form or uploading a contact card image.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="form" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form">Manual Entry</TabsTrigger>
            <TabsTrigger value="image">Upload Contact Card</TabsTrigger>
          </TabsList>
          
          <TabsContent value="form" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="display_name">Company/Name *</Label>
                  <Input
                    id="display_name"
                    value={formData.display_name}
                    onChange={(e) => handleInputChange('display_name', e.target.value)}
                    placeholder="Enter company or person name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="trade">Trade</SelectItem>
                      <SelectItem value="subcontractor">Subcontractor</SelectItem>
                      <SelectItem value="supplier">Supplier</SelectItem>
                      <SelectItem value="consultant">Consultant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary_email">Email</Label>
                  <Input
                    id="primary_email"
                    type="email"
                    value={formData.primary_email || ''}
                    onChange={(e) => handleInputChange('primary_email', e.target.value)}
                    placeholder="email@company.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="primary_phone">Phone</Label>
                  <Input
                    id="primary_phone"
                    value={formData.primary_phone || ''}
                    onChange={(e) => handleInputChange('primary_phone', e.target.value)}
                    placeholder="+61 xxx xxx xxx"
                  />
                </div>
              </div>

              {(formData.category === 'trade' || formData.category === 'subcontractor') && (
                <div className="space-y-2">
                  <Label htmlFor="trade_industry">Industry/Specialization</Label>
                  <Input
                    id="trade_industry"
                    value={formData.trade_industry || ''}
                    onChange={(e) => handleInputChange('trade_industry', e.target.value)}
                    placeholder="e.g., Plumbing, Electrical, Roofing"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag..."
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    Add
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {formData.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:bg-destructive/20 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional notes, address, website, etc."
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Stakeholder
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="image" className="space-y-4">
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-slate-400" />
                <h3 className="mt-2 text-sm font-medium text-slate-900">Upload Contact Card</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Upload an image of a business card or contact details
                </p>
                <div className="mt-6">
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90"
                  >
                    {extracting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Extracting...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Choose Image
                      </>
                    )}
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="sr-only"
                    disabled={extracting}
                  />
                </div>
              </div>
              
              {/* Show extracted data in the form */}
              {(formData.display_name || formData.primary_email || formData.primary_phone) && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-slate-900 mb-4">Extracted Information:</h4>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="extracted_name">Company/Name *</Label>
                        <Input
                          id="extracted_name"
                          value={formData.display_name}
                          onChange={(e) => handleInputChange('display_name', e.target.value)}
                          placeholder="Enter company or person name"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="extracted_category">Category *</Label>
                        <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value as any)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="client">Client</SelectItem>
                            <SelectItem value="trade">Trade</SelectItem>
                            <SelectItem value="subcontractor">Subcontractor</SelectItem>
                            <SelectItem value="supplier">Supplier</SelectItem>
                            <SelectItem value="consultant">Consultant</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="extracted_email">Email</Label>
                        <Input
                          id="extracted_email"
                          type="email"
                          value={formData.primary_email || ''}
                          onChange={(e) => handleInputChange('primary_email', e.target.value)}
                          placeholder="email@company.com"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="extracted_phone">Phone</Label>
                        <Input
                          id="extracted_phone"
                          value={formData.primary_phone || ''}
                          onChange={(e) => handleInputChange('primary_phone', e.target.value)}
                          placeholder="+61 xxx xxx xxx"
                        />
                      </div>
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Add Stakeholder
                      </Button>
                    </DialogFooter>
                  </form>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};