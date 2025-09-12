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

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  url?: string;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ projectId, onUploadComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles: UploadFile[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: 'pending'
    }));

    setUploadFiles(prev => [...prev, ...newFiles]);
    
    // Start uploading files
    newFiles.forEach(uploadFile => {
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