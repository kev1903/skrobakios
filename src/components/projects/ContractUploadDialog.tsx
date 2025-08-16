import React, { useState, useCallback } from 'react';
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
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ContractUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: {
    id: string;
    project_id: string;
    name: string;
  };
  onUploadComplete?: () => void;
}

export const ContractUploadDialog = ({ open, onOpenChange, project, onUploadComplete }: ContractUploadDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    file: null as File | null,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, file }));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const validFile = files.find(file => 
      file.type === 'application/pdf' || 
      file.type === 'application/msword' || 
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    
    if (validFile) {
      setFormData(prev => ({ ...prev, file: validFile }));
    }
  }, []);

  const removeFile = () => {
    setFormData(prev => ({ ...prev, file: null }));
  };

  const handleUpload = async () => {
    if (!formData.file || !formData.name.trim()) {
      toast.error("Please provide a contract name and select a file.");
      return;
    }

    setIsUploading(true);
    
    try {
      // Upload file to Supabase Storage
      const fileExt = formData.file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `contracts/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, formData.file);

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Process contract with AI
      const { data, error } = await supabase.functions.invoke('process-contract', {
        body: {
          fileUrl: publicUrl,
          fileName: formData.file.name,
          projectId: project.id,
          name: formData.name,
          description: formData.description
        }
      });

      if (error) {
        throw new Error(`Processing failed: ${error.message}`);
      }

      if (data?.contractData) {
        toast.success(`Contract processed successfully! Customer: ${data.contractData.customer_name}, Value: ${data.contractData.contract_value || 'N/A'}`);
      } else {
        toast.success("Contract uploaded successfully!");
      }

      // Reset form and close dialog
      setFormData({ name: '', description: '', file: null });
      onOpenChange(false);
      
      // Call callback to refresh contracts list
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      console.error('Error uploading contract:', error);
      toast.error(`Failed to upload contract: ${error.message}`);
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Upload Contract
          </DialogTitle>
          <DialogDescription>
            Upload a contract document for this project. Supported formats: PDF, DOC, DOCX.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Drag & Drop Zone */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {!formData.file ? (
              <>
                <div className="flex flex-col items-center gap-4">
                  <div className="rounded-full bg-muted p-4">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium">Drop your contract here</p>
                    <p className="text-sm text-muted-foreground">
                      or{' '}
                      <label htmlFor="file-upload" className="text-primary cursor-pointer hover:underline">
                        browse files
                      </label>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Supports: PDF, DOC, DOCX</span>
                    <span>•</span>
                    <span>Max 10MB</span>
                  </div>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </>
            ) : (
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">{formData.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round(formData.file.size / 1024)} KB
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
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