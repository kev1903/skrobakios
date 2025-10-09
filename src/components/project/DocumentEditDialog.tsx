import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ProjectDocument } from '@/hooks/useProjectDocuments';
import { Upload, File, Trash2 } from 'lucide-react';

interface DocumentEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: ProjectDocument | null;
  onDocumentUpdated: () => void;
  onDelete?: (documentId: string) => void;
}

export const DocumentEditDialog: React.FC<DocumentEditDialogProps> = ({
  open,
  onOpenChange,
  document,
  onDocumentUpdated,
  onDelete,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    document_type: '',
    document_status: '',
  });

  useEffect(() => {
    if (document) {
      setFormData({
        name: document.name || '',
        document_type: document.document_type || '',
        document_status: document.document_status || '',
      });
      setSelectedFile(null);
    }
  }, [document]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-populate name if empty
      if (!formData.name) {
        setFormData(prev => ({ ...prev, name: file.name }));
      }
    }
  };

  const handleFileUpload = async (): Promise<string | null> => {
    if (!selectedFile || !document) return null;

    setUploading(true);
    try {
      // Create a unique file path
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${document.project_id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `project-documents/${fileName}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('project-files')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload file',
        variant: 'destructive',
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!document) return;

    setLoading(true);
    try {
      // Upload file if a new one was selected
      let fileUrl = document.file_url;
      if (selectedFile) {
        const uploadedUrl = await handleFileUpload();
        if (uploadedUrl) {
          fileUrl = uploadedUrl;
        } else {
          // Upload failed, don't proceed
          setLoading(false);
          return;
        }
      }

      const { error } = await supabase
        .from('project_documents')
        .update({
          name: formData.name,
          document_type: formData.document_type,
          document_status: formData.document_status,
          file_url: fileUrl,
          file_size: selectedFile ? selectedFile.size : document.file_size,
          content_type: selectedFile ? selectedFile.type : document.content_type,
        })
        .eq('id', document.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Document details updated successfully',
      });

      onDocumentUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating document:', error);
      toast({
        title: 'Error',
        description: 'Failed to update document details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!document || !onDelete) return;
    
    if (window.confirm('Are you sure you want to delete this document?')) {
      onDelete(document.id);
      onOpenChange(false);
    }
  };

  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Document Details</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Document Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter document name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="document_type">Document Type</Label>
            <Select
              value={formData.document_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, document_type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="document">Document</SelectItem>
                <SelectItem value="drawing">Drawing</SelectItem>
                <SelectItem value="report">Report</SelectItem>
                <SelectItem value="specification">Specification</SelectItem>
                <SelectItem value="image">Image</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="document_status">Document Status</Label>
            <Select
              value={formData.document_status}
              onValueChange={(value) => setFormData(prev => ({ ...prev, document_status: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Issue for Review">Issue for Review</SelectItem>
                <SelectItem value="Issue for Approval">Issue for Approval</SelectItem>
                <SelectItem value="Issue for Construction">Issue for Construction</SelectItem>
                <SelectItem value="Issue for Use">Issue for Use</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Document File</Label>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.dwg"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1"
                disabled={uploading || loading}
              >
                <Upload className="w-4 h-4 mr-2" />
                {selectedFile ? 'Change File' : 'Upload New File'}
              </Button>
            </div>
            {selectedFile && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-2 rounded">
                <File className="w-4 h-4" />
                <span className="truncate">{selectedFile.name}</span>
                <span className="text-xs">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}
            {!selectedFile && document && (
              <p className="text-sm text-muted-foreground">
                Current file: {document.name}
              </p>
            )}
          </div>

          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={loading || uploading || !onDelete}
              className="mr-auto"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading || uploading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || uploading}>
                {uploading ? 'Uploading...' : loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
