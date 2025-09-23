import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProjectLink, CreateProjectLinkData, UpdateProjectLinkData } from '@/hooks/useProjectLinks';

interface ProjectLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateProjectLinkData | UpdateProjectLinkData) => Promise<void>;
  link?: ProjectLink;
  projectId: string;
  mode: 'create' | 'edit';
}

const LINK_CATEGORIES = [
  'General',
  'Portal',
  'Suppliers',
  'Guidelines',
  'Documentation',
  'Resources',
  'Tools',
  'Communication',
  'External'
];

export const ProjectLinkDialog: React.FC<ProjectLinkDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  link,
  projectId,
  mode
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    category: 'General'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && link) {
      setFormData({
        title: link.title,
        description: link.description || '',
        url: link.url,
        category: link.category
      });
    } else {
      setFormData({
        title: '',
        description: '',
        url: '',
        category: 'General'
      });
    }
  }, [mode, link, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.url.trim()) {
      return;
    }

    setLoading(true);
    try {
      const submitData = mode === 'create' 
        ? { ...formData, project_id: projectId } as CreateProjectLinkData
        : formData as UpdateProjectLinkData;
        
      await onSubmit(submitData);
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setLoading(false);
    }
  };

  const validateUrl = (url: string) => {
    if (!url) return false;
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  const isFormValid = formData.title.trim() && formData.url.trim() && validateUrl(formData.url);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add New Link' : 'Edit Link'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter link title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL *</Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://example.com"
              required
            />
            {formData.url && !validateUrl(formData.url) && (
              <p className="text-sm text-destructive">Please enter a valid URL</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {LINK_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Optional description"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || loading}
            >
              {loading ? 'Saving...' : mode === 'create' ? 'Add Link' : 'Update Link'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};