import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, Upload, X, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PortfolioItem {
  title: string;
  description: string | null;
  category: string;
  media_urls: string[] | null;
  is_public: boolean | null;
  is_featured: boolean | null;
  case_study_url: string | null;
  project_date: string | null;
}

interface CreatePortfolioItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (item: PortfolioItem) => void;
}

const CATEGORIES = [
  'Web Development',
  'Mobile App',
  'Design',
  'Construction',
  'Architecture', 
  'Engineering',
  'Marketing',
  'Photography',
  'Video Production',
  'Consulting',
  'Other'
];

export const CreatePortfolioItemDialog: React.FC<CreatePortfolioItemDialogProps> = ({
  open,
  onOpenChange,
  onSubmit
}) => {
  const [formData, setFormData] = useState<PortfolioItem>({
    title: '',
    description: '',
    category: '',
    media_urls: [],
    is_public: true,
    is_featured: false,
    case_study_url: '',
    project_date: null
  });
  const [projectDate, setProjectDate] = useState<Date>();
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.category) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    const portfolioItem: PortfolioItem = {
      ...formData,
      description: formData.description || null,
      case_study_url: formData.case_study_url || null,
      project_date: projectDate ? projectDate.toISOString().split('T')[0] : null,
      media_urls: uploadedImages.length > 0 ? uploadedImages : null
    };

    onSubmit(portfolioItem);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      media_urls: [],
      is_public: true,
      is_featured: false,
      case_study_url: '',
      project_date: null
    });
    setProjectDate(undefined);
    setUploadedImages([]);
  };

  const handleImageUpload = async (files: FileList) => {
    if (!files.length) return;

    try {
      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('portfolio-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('portfolio-images')
          .getPublicUrl(fileName);

        return publicUrl;
      });

      const urls = await Promise.all(uploadPromises);
      setUploadedImages(prev => [...prev, ...urls]);

      toast({
        title: 'Success',
        description: 'Images uploaded successfully'
      });
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload images',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleDialogClose = () => {
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Portfolio Item</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter project title"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.category} onValueChange={(value) => 
              setFormData(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your project..."
              rows={4}
            />
          </div>

          {/* Project Date */}
          <div className="space-y-2">
            <Label>Project Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !projectDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {projectDate ? format(projectDate, "PPP") : "Select project date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={projectDate}
                  onSelect={setProjectDate}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Case Study URL */}
          <div className="space-y-2">
            <Label htmlFor="case_study_url">Case Study URL</Label>
            <Input
              id="case_study_url"
              type="url"
              value={formData.case_study_url || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, case_study_url: e.target.value }))}
              placeholder="https://example.com/case-study"
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Images</Label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                className="hidden"
                id="image-upload"
                disabled={uploading}
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600">
                  {uploading ? 'Uploading...' : 'Click to upload images or drag and drop'}
                </p>
              </label>
            </div>

            {uploadedImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                {uploadedImages.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_public">Public Visibility</Label>
                <p className="text-sm text-slate-500">
                  Allow others to view this portfolio item
                </p>
              </div>
              <Switch
                id="is_public"
                checked={formData.is_public || false}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, is_public: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_featured">Featured Item</Label>
                <p className="text-sm text-slate-500">
                  Highlight this item in your portfolio
                </p>
              </div>
              <Switch
                id="is_featured"
                checked={formData.is_featured || false}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, is_featured: checked }))
                }
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={handleDialogClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={uploading || !formData.title.trim() || !formData.category}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Portfolio Item
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};