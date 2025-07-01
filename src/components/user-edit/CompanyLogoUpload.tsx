
import React, { useState, useRef } from 'react';
import { Upload, Building, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface CompanyLogoUploadProps {
  logoUrl: string;
  onLogoChange: (logoUrl: string) => void;
}

export const CompanyLogoUpload = ({ logoUrl, onLogoChange }: CompanyLogoUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onLogoChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveLogo = () => {
    onLogoChange('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-slate-800">Company Logo</h3>
        {logoUrl && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRemoveLogo}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <X className="w-4 h-4 mr-1" />
            Remove
          </Button>
        )}
      </div>

      {logoUrl ? (
        <Card className="backdrop-blur-sm bg-white/60 border-white/30">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-white shadow-md flex-shrink-0">
                <img 
                  src={logoUrl} 
                  alt="Company Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800">Logo uploaded successfully</p>
                <p className="text-xs text-slate-500 mt-1">Click to change or drag a new image</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClick}
                  className="mt-2"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Change Logo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card 
          className={`backdrop-blur-sm bg-white/60 border-white/30 transition-all duration-200 cursor-pointer hover:bg-white/70 ${
            isDragging ? 'border-blue-400 bg-blue-50/50' : ''
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <CardContent className="p-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200/60 flex items-center justify-center">
                <Building className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-medium text-slate-800 mb-2">Upload Company Logo</p>
                <p className="text-sm text-slate-600 mb-4">
                  Drag and drop your logo here, or click to browse
                </p>
                <Button variant="outline" className="backdrop-blur-sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
              </div>
              <p className="text-xs text-slate-500">
                Supported formats: PNG, JPG, GIF (Max 5MB)
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
