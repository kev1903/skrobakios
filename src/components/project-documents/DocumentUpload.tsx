import React, { useState, useRef } from 'react';
import { Upload, FileText, Image, X, Check, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface DocumentUploadProps {
  projectId: string;
  onUploadComplete?: () => void;
}

interface DocumentMetadata {
  title: string;
  version: string;
  author: string;
  date: string;
  type: string;
  status: string;
}

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  url?: string;
  metadata?: DocumentMetadata;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ projectId, onUploadComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showMetadataForm, setShowMetadataForm] = useState(false);
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles: UploadFile[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: 'pending',
      metadata: {
        title: file.name,
        version: '1.0',
        author: '',
        date: new Date().toISOString().split('T')[0],
        type: 'drawing',
        status: 'draft'
      }
    }));

    setUploadFiles(prev => [...prev, ...newFiles]);
    
    // Show metadata form for first file
    if (newFiles.length > 0) {
      setCurrentFileId(newFiles[0].id);
      setShowMetadataForm(true);
    }
  };

  const handleMetadataUpdate = (fileId: string, field: keyof DocumentMetadata, value: string) => {
    setUploadFiles(prev => prev.map(f => 
      f.id === fileId && f.metadata ? { 
        ...f, 
        metadata: { ...f.metadata, [field]: value } 
      } : f
    ));
  };

  const handleStartUpload = () => {
    setShowMetadataForm(false);
    setCurrentFileId(null);
    
    // Start uploading all pending files
    uploadFiles.filter(f => f.status === 'pending').forEach(uploadFile => {
      handleUpload(uploadFile);
    });
  };

  const handleUpload = async (uploadFile: UploadFile) => {
    setUploadFiles(prev => prev.map(f => 
      f.id === uploadFile.id ? { ...f, status: 'uploading' } : f
    ));

    try {
      const fileExt = uploadFile.file.name.split('.').pop();
      const fileName = `${Date.now()}-${uploadFile.file.name}`;
      const filePath = `project-documents/${projectId}/${fileName}`;

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadFiles(prev => prev.map(f => 
          f.id === uploadFile.id ? { 
            ...f, 
            progress: Math.min(f.progress + Math.random() * 30, 90) 
          } : f
        ));
      }, 200);

      const { data, error } = await supabase.storage
        .from('project-files')
        .upload(filePath, uploadFile.file);

      clearInterval(progressInterval);

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('project-files')
        .getPublicUrl(filePath);

      // Insert record into project_documents table with metadata
      const { error: dbError } = await supabase
        .from('project_documents')
        .insert({
          project_id: projectId,
          name: uploadFile.metadata?.title || uploadFile.file.name,
          file_url: urlData.publicUrl,
          content_type: uploadFile.file.type,
          file_size: uploadFile.file.size,
          document_type: uploadFile.metadata?.type || 'drawing',
          created_by: (await supabase.auth.getUser()).data.user?.id,
          metadata: {
            version: uploadFile.metadata?.version,
            author: uploadFile.metadata?.author,
            date: uploadFile.metadata?.date,
            status: uploadFile.metadata?.status,
            original_filename: uploadFile.file.name
          }
        });

      if (dbError) {
        throw dbError;
      }

      setUploadFiles(prev => prev.map(f => 
        f.id === uploadFile.id ? { 
          ...f, 
          progress: 100, 
          status: 'complete',
          url: urlData.publicUrl
        } : f
      ));

      toast({
        title: "Document Uploaded",
        description: `${uploadFile.file.name} has been uploaded successfully`,
      });

      onUploadComplete?.();

    } catch (error) {
      console.error('Upload error:', error);
      setUploadFiles(prev => prev.map(f => 
        f.id === uploadFile.id ? { ...f, status: 'error', progress: 0 } : f
      ));

      toast({
        title: "Upload Failed",
        description: `Failed to upload ${uploadFile.file.name}`,
        variant: "destructive",
      });
    }
  };

  const removeFile = (id: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== id));
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      return <Image className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setUploadFiles([]);
    setIsDragging(false);
    setShowMetadataForm(false);
    setCurrentFileId(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) handleClose();
      setIsOpen(open);
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Upload Documents
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Project Documents
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Metadata Form */}
          {showMetadataForm && currentFileId && (
            <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
              <h4 className="text-sm font-semibold">Document Information</h4>
              {uploadFiles.filter(f => f.id === currentFileId).map(file => (
                <div key={file.id} className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-xs font-medium">Document Title</label>
                    <input
                      type="text"
                      value={file.metadata?.title || ''}
                      onChange={(e) => handleMetadataUpdate(file.id, 'title', e.target.value)}
                      className="w-full px-3 py-2 text-sm border rounded-md bg-background"
                      placeholder="Enter document title"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-xs font-medium">Version</label>
                      <input
                        type="text"
                        value={file.metadata?.version || ''}
                        onChange={(e) => handleMetadataUpdate(file.id, 'version', e.target.value)}
                        className="w-full px-3 py-2 text-sm border rounded-md bg-background"
                        placeholder="e.g., 1.0"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-medium">Date</label>
                      <input
                        type="date"
                        value={file.metadata?.date || ''}
                        onChange={(e) => handleMetadataUpdate(file.id, 'date', e.target.value)}
                        className="w-full px-3 py-2 text-sm border rounded-md bg-background"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium">Author</label>
                    <input
                      type="text"
                      value={file.metadata?.author || ''}
                      onChange={(e) => handleMetadataUpdate(file.id, 'author', e.target.value)}
                      className="w-full px-3 py-2 text-sm border rounded-md bg-background"
                      placeholder="Document author"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-xs font-medium">Type</label>
                      <select
                        value={file.metadata?.type || 'drawing'}
                        onChange={(e) => handleMetadataUpdate(file.id, 'type', e.target.value)}
                        className="w-full px-3 py-2 text-sm border rounded-md bg-background"
                      >
                        <option value="specification">Specification</option>
                        <option value="drawing">Drawing</option>
                        <option value="report">Report</option>
                        <option value="image">Image</option>
                        <option value="document">Document</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-medium">Status</label>
                      <select
                        value={file.metadata?.status || 'draft'}
                        onChange={(e) => handleMetadataUpdate(file.id, 'status', e.target.value)}
                        className="w-full px-3 py-2 text-sm border rounded-md bg-background"
                      >
                        <option value="draft">Draft</option>
                        <option value="review">Under Review</option>
                        <option value="approved">Approved</option>
                        <option value="final">Final</option>
                      </select>
                    </div>
                  </div>

                  <Button 
                    onClick={handleStartUpload}
                    className="w-full"
                  >
                    Upload Document
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              isDragging 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">
              Drop files here or click to browse
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Supports PDF, DOC, DOCX, JPG, PNG, DWG files up to 20MB
            </p>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Select Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.dwg,.txt,.csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </div>

          {/* Upload Progress */}
          {uploadFiles.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Uploading Files</h4>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {uploadFiles.map(file => (
                  <div key={file.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    {getFileIcon(file.file.name)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.file.name}</p>
                      <p className="text-xs text-muted-foreground mb-2">
                        {(file.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <div className="flex items-center space-x-2">
                        <Progress value={file.progress} className="flex-1 h-2" />
                        <span className="text-xs text-muted-foreground">
                          {file.progress}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {file.status === 'complete' && (
                        <Check className="h-4 w-4 text-success" />
                      )}
                      {file.status === 'error' && (
                        <X className="h-4 w-4 text-destructive" />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Instructions */}
          <div className="text-xs text-muted-foreground bg-muted/50 p-4 rounded-lg">
            <strong>Document Types:</strong>
            <ul className="mt-2 space-y-1">
              <li>• <strong>Specifications:</strong> Technical specs, requirements documents</li>
              <li>• <strong>Drawings:</strong> Architectural plans, engineering drawings, CAD files</li>
              <li>• <strong>Reports:</strong> Site reports, analysis documents, compliance reports</li>
              <li>• <strong>Images:</strong> Site photos, reference images, progress photos</li>
              <li>• <strong>Documents:</strong> Contracts, permits, correspondence</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};