import React, { useState, useRef } from 'react';
import { Upload, FileText, Image, X, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SK25008FileUploadProps {
  onUploadComplete: () => void;
}

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  url?: string;
}

export const SK25008FileUpload: React.FC<SK25008FileUploadProps> = ({ onUploadComplete }) => {
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
      const filePath = `designs/${fileName}`;

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
        .from('sk-25008-design')
        .upload(filePath, uploadFile.file);

      clearInterval(progressInterval);

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('sk-25008-design')
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
        title: "File Uploaded",
        description: `${uploadFile.file.name} has been uploaded successfully`,
      });

      onUploadComplete();

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

  return (
    <Card className="max-w-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-sm">
          <Upload className="h-4 w-4 mr-2" />
          Design Files
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        {/* Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">
            Drop files here or click to browse
          </p>
          <p className="text-xs text-muted-foreground">
            Supports PDF, JPG, PNG, DWG files up to 10MB
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.dwg,.doc,.docx"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
        </div>

        {/* Upload Progress */}
        {uploadFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Uploading Files</h4>
            {uploadFiles.map(file => (
              <div key={file.id} className="flex items-center space-x-3 p-2 border rounded">
                {getFileIcon(file.file.name)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.file.name}</p>
                  <div className="flex items-center space-x-2">
                    <Progress value={file.progress} className="flex-1 h-2" />
                    <span className="text-xs text-muted-foreground">
                      {file.progress}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {file.status === 'complete' && (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                  {file.status === 'error' && (
                    <X className="h-4 w-4 text-red-500" />
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
        )}

        {/* Upload Instructions */}
        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded">
          <strong>File Guidelines:</strong>
          <ul className="mt-1 space-y-1">
            <li>• Concept designs: Sketches, floor plans, elevations</li>
            <li>• Detailed designs: Working drawings, specifications</li>
            <li>• Documentation: Compliance reports, calculations</li>
            <li>• Site photos: Existing conditions, progress shots</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};