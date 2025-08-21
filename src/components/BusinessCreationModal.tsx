import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useActiveBusiness } from '@/hooks/useActiveBusiness';

interface BusinessCreationModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (businessId: string) => void;
}

export const BusinessCreationModal: React.FC<BusinessCreationModalProps> = ({
  open,
  onClose,
  onSuccess
}) => {
  const { toast } = useToast();
  const { setActiveBusiness } = useActiveBusiness();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Business name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Generate slug if not provided
      const slug = formData.slug.trim() || 
        formData.name.toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();

      // Create the business
      const { data: business, error: businessError } = await supabase
        .from('companies')
        .insert({
          name: formData.name.trim(),
          slug: slug,
          created_by: user.id
        })
        .select()
        .single();

      if (businessError) throw businessError;

      // The trigger should automatically create default roles and owner membership
      // Set as active business
      await setActiveBusiness(business.id);

      toast({
        title: 'Business Created',
        description: `${business.name} has been created successfully!`
      });

      onSuccess?.(business.id);
      onClose();
      
      // Clear form
      setFormData({ name: '', slug: '' });
      
    } catch (err: any) {
      console.error('Error creating business:', err);
      setError(err.message || 'Failed to create business');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Create Your First Business
          </DialogTitle>
          <DialogDescription>
            Set up your business to start managing projects, teams, and more.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name *</Label>
            <Input
              id="businessName"
              placeholder="Enter your business name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessSlug">URL Slug (optional)</Label>
            <Input
              id="businessSlug"
              placeholder="my-business (leave blank to auto-generate)"
              value={formData.slug}
              onChange={(e) => handleInputChange('slug', e.target.value)}
              disabled={loading}
            />
            <p className="text-sm text-muted-foreground">
              This will be used in your business's public URL
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Business'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};