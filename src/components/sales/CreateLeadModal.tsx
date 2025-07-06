import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Lead } from '@/hooks/useLeads';
import { 
  X,
  Save,
  Building2,
  User,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Globe
} from 'lucide-react';

interface CreateLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStage: string;
  onSave: (leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
}

export const CreateLeadModal = ({ isOpen, onClose, initialStage, onSave }: CreateLeadModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    company: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    description: '',
    value: 0,
    priority: 'Medium' as 'High' | 'Medium' | 'Low',
    source: 'Website',
    location: '',
    website: '',
    notes: '',
  });

  const handleSave = async () => {
    if (!formData.contact_name) {
      return; // Basic validation
    }

    setIsLoading(true);
    try {
      await onSave({
        ...formData,
        company: formData.contact_name, // Use contact name as company name
        stage: initialStage as any,
        avatar_url: null,
        last_activity: 'Just created',
      });
      
      // Reset form
      setFormData({
        company: '',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        description: '',
        value: 0,
        priority: 'Medium',
        source: 'Website',
        location: '',
        website: '',
        notes: '',
      });
      
      onClose();
    } catch (error) {
      console.error('Error creating lead:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      company: '',
      contact_name: '',
      contact_email: '',
      contact_phone: '',
      description: '',
      value: 0,
      priority: 'Medium',
      source: 'Website',
      location: '',
      website: '',
      notes: '',
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 glass-card">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-foreground font-poppins">
                Create New Lead
              </DialogTitle>
              <p className="text-muted-foreground font-inter mt-1">
                Adding to {initialStage} stage
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={handleSave} 
                disabled={isLoading || !formData.contact_name}
                className="font-inter"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Creating...' : 'Create Lead'}
              </Button>
              <Button onClick={handleCancel} variant="outline" className="font-inter">
                Cancel
              </Button>
              <Button onClick={onClose} variant="ghost" size="sm" className="h-8 w-8 p-0">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Contact Information */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground font-poppins flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Contact Information
                </h3>
                
                <div>
                  <Label className="font-inter text-foreground">Contact Name *</Label>
                  <Input
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                    placeholder="Enter contact person's name"
                    className="mt-1 font-inter"
                    required
                  />
                </div>

                <div>
                  <Label className="font-inter text-foreground">Email</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                      placeholder="contact@company.com"
                      className="pl-10 font-inter"
                    />
                  </div>
                </div>

                <div>
                  <Label className="font-inter text-foreground">Phone</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                      className="pl-10 font-inter"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Lead Details */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground font-poppins flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Lead Details
                </h3>

                <div>
                  <Label className="font-inter text-foreground">Project Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the project or opportunity..."
                    className="mt-1 font-inter"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-inter text-foreground">Estimated Value ($)</Label>
                    <Input
                      type="number"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                      className="mt-1 font-inter"
                      min="0"
                    />
                  </div>

                  <div>
                    <Label className="font-inter text-foreground">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value as any })}>
                      <SelectTrigger className="mt-1 font-inter">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-border">
                        <SelectItem value="High">High Priority</SelectItem>
                        <SelectItem value="Medium">Medium Priority</SelectItem>
                        <SelectItem value="Low">Low Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="font-inter text-foreground">Lead Source</Label>
                  <Select value={formData.source} onValueChange={(value) => setFormData({ ...formData, source: value })}>
                    <SelectTrigger className="mt-1 font-inter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-border">
                      <SelectItem value="Website">Website</SelectItem>
                      <SelectItem value="Referral">Referral</SelectItem>
                      <SelectItem value="Social Media">Social Media</SelectItem>
                      <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                      <SelectItem value="Google Ads">Google Ads</SelectItem>
                      <SelectItem value="Cold Email">Cold Email</SelectItem>
                      <SelectItem value="Partnership">Partnership</SelectItem>
                      <SelectItem value="Conference">Conference</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="font-inter text-foreground">Initial Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any additional notes about this lead..."
                    className="mt-1 font-inter"
                    rows={4}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};