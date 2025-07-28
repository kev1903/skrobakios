import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Loader2, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CompanyLogoUploadProps {
  currentLogoUrl?: string;
  onLogoUpdate: (logoUrl: string) => void;
  companyName?: string;
}

export const CompanyLogoUpload = ({
  currentLogoUrl,
  onLogoUpdate,
  companyName = 'Company'
}: CompanyLogoUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, [toast]);

  const handleUpload = async () => {
    if (!selectedFile) {
      console.log('No file selected');
      return;
    }

    console.log('Starting upload for file:', selectedFile.name);
    setIsUploading(true);
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `company-logo-${Date.now()}.${fileExt}`;
      const filePath = `company-logos/${fileName}`;

      console.log('Uploading to path:', filePath);

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('Upload successful, getting public URL');

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      console.log('Public URL:', publicUrl);

      console.log('Calling onLogoUpdate with URL:', publicUrl);
      await onLogoUpdate(publicUrl);
      setSelectedImage(null);
      setSelectedFile(null);

      toast({
        title: "Logo updated successfully!",
        description: "Your company logo has been uploaded.",
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload logo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedImage(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="backdrop-blur-sm bg-white/60 border-white/30">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium">Company Logo</h4>
            <p className="text-xs md:text-sm text-slate-500">Upload your company logo for branding</p>
          </div>

          {/* Current Logo Display */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              {currentLogoUrl ? (
                <img
                  src={currentLogoUrl}
                  alt={`${companyName} logo`}
                  className="w-16 h-16 rounded-lg object-contain border-2 border-white/50 shadow-sm bg-white"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center border-2 border-white/50 shadow-sm">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700">
                {currentLogoUrl ? 'Current Logo' : 'No logo uploaded'}
              </p>
              <p className="text-xs text-slate-500">
                Recommended: Square image, at least 200x200px
              </p>
            </div>
          </div>

          {/* Preview Section */}
          {selectedImage && (
            <div className="space-y-4 p-4 bg-blue-50/50 rounded-lg border border-blue-200/30">
              <h5 className="text-sm font-medium text-slate-700">Preview</h5>
              <div className="flex items-center space-x-4">
                <img
                  src={selectedImage}
                  alt="Logo preview"
                  className="w-16 h-16 rounded-lg object-contain border-2 border-white shadow-sm bg-white"
                />
                <div className="flex-1">
                  <p className="text-sm text-slate-600">
                    New logo ready to upload
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Upload Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {!selectedImage ? (
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 sm:flex-initial"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose Logo
              </Button>
            ) : (
              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="flex-1 sm:flex-initial"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Logo
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isUploading}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="text-xs text-slate-500 space-y-1">
            <p>• Maximum file size: 5MB</p>
            <p>• Supported formats: JPG, PNG, GIF, SVG</p>
            <p>• Square images work best for consistent branding</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};