import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText } from 'lucide-react';

interface ContractUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ContractUploadDialog = ({ open, onOpenChange }: ContractUploadDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    file: null as File | null,
  });
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, file }));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUpload = async () => {
    if (!formData.file || !formData.name.trim()) {
      return;
    }

    setIsUploading(true);
    
    try {
      // TODO: Implement contract upload logic here
      console.log('Uploading contract:', formData);
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Reset form and close dialog
      setFormData({ name: '', description: '', file: null });
      onOpenChange(false);
    } catch (error) {
      console.error('Error uploading contract:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', description: '', file: null });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Upload Contract
          </DialogTitle>
          <DialogDescription>
            Upload a contract document for this project. Supported formats: PDF, DOC, DOCX.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="contract-name">Contract Name *</Label>
            <Input
              id="contract-name"
              placeholder="Enter contract name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contract-description">Description</Label>
            <Textarea
              id="contract-description"
              placeholder="Enter contract description (optional)"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contract-file">Contract File *</Label>
            <div className="flex items-center gap-4">
              <Input
                id="contract-file"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>
            {formData.file && (
              <p className="text-sm text-muted-foreground">
                Selected: {formData.file.name} ({Math.round(formData.file.size / 1024)} KB)
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!formData.file || !formData.name.trim() || isUploading}
            className="flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload Contract
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};