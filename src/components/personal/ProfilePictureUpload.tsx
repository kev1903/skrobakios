import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Camera, Upload, RotateCw, Move, ZoomIn, ZoomOut, Save, X, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProfilePictureUploadProps {
  currentAvatarUrl: string;
  onAvatarUpdate: (avatarUrl: string) => void;
  userName?: string;
}

export const ProfilePictureUpload = ({ 
  currentAvatarUrl, 
  onAvatarUpdate, 
  userName = '' 
}: ProfilePictureUploadProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [cropData, setCropData] = useState({
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      setSelectedImage(imageData);
      setIsEditing(true);
      setCropData({ x: 0, y: 0, scale: 1, rotation: 0 });
    };
    reader.readAsDataURL(file);
  }, []);

  const handleCropChange = useCallback((updates: Partial<typeof cropData>) => {
    setCropData(prev => ({ ...prev, ...updates }));
  }, []);

  const generateCroppedImage = useCallback((): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!selectedImage || !canvasRef.current) {
        reject(new Error('No image or canvas available'));
        return;
      }

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      const img = new Image();
      img.onload = () => {
        const size = 300; // Output size
        canvas.width = size;
        canvas.height = size;

        // Clear canvas
        ctx.clearRect(0, 0, size, size);

        // Save context state
        ctx.save();

        // Translate to center
        ctx.translate(size / 2, size / 2);

        // Apply rotation
        ctx.rotate((cropData.rotation * Math.PI) / 180);

        // Apply scale
        ctx.scale(cropData.scale, cropData.scale);

        // Calculate image dimensions to maintain aspect ratio
        const aspectRatio = img.width / img.height;
        let drawWidth = size;
        let drawHeight = size;

        if (aspectRatio > 1) {
          drawWidth = size;
          drawHeight = size / aspectRatio;
        } else {
          drawWidth = size * aspectRatio;
          drawHeight = size;
        }

        // Draw image centered with crop offset
        ctx.drawImage(
          img,
          -drawWidth / 2 - cropData.x,
          -drawHeight / 2 - cropData.y,
          drawWidth,
          drawHeight
        );

        // Restore context state
        ctx.restore();

        // Convert to blob
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        }, 'image/jpeg', 0.8);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = selectedImage;
    });
  }, [selectedImage, cropData]);

  const handleSave = async () => {
    if (!selectedImage) return;

    setUploading(true);
    try {
      // Generate cropped image
      const croppedBlob = await generateCroppedImage();
      
      // Upload to Supabase storage
      const fileName = `avatar-${Date.now()}.jpg`;
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, croppedBlob, {
          contentType: 'image/jpeg',
          cacheControl: '3600'
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update avatar URL
      onAvatarUpdate(publicUrl);
      
      setIsEditing(false);
      setSelectedImage(null);
      
      toast({
        title: "Success",
        description: "Profile picture updated successfully"
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload profile picture. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedImage(null);
    setCropData({ x: 0, y: 0, scale: 1, rotation: 0 });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isEditing && selectedImage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="w-5 h-5" />
            <span>Edit Profile Picture</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Image Preview */}
            <div className="flex-1">
              <div className="relative w-full max-w-md mx-auto">
                <div 
                  className="relative w-80 h-80 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50"
                  style={{
                    backgroundImage: `url(${selectedImage})`,
                    backgroundSize: `${100 * cropData.scale}%`,
                    backgroundPosition: `${50 + cropData.x}% ${50 + cropData.y}%`,
                    backgroundRepeat: 'no-repeat',
                    transform: `rotate(${cropData.rotation}deg)`
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-60 h-60 border-4 border-white rounded-full shadow-lg bg-white/10 backdrop-blur-sm" />
                  </div>
                </div>
              </div>
              
              {/* Hidden canvas for processing */}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Controls */}
            <div className="flex-1 space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">Position X</label>
                  <Input
                    type="range"
                    min="-50"
                    max="50"
                    value={cropData.x}
                    onChange={(e) => handleCropChange({ x: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Position Y</label>
                  <Input
                    type="range"
                    min="-50"
                    max="50"
                    value={cropData.y}
                    onChange={(e) => handleCropChange({ y: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Scale</label>
                  <Input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={cropData.scale}
                    onChange={(e) => handleCropChange({ scale: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Rotation</label>
                  <Input
                    type="range"
                    min="0"
                    max="360"
                    value={cropData.rotation}
                    onChange={(e) => handleCropChange({ rotation: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCropChange({ scale: cropData.scale * 1.1 })}
                >
                  <ZoomIn className="w-4 h-4 mr-1" />
                  Zoom In
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCropChange({ scale: Math.max(0.5, cropData.scale * 0.9) })}
                >
                  <ZoomOut className="w-4 h-4 mr-1" />
                  Zoom Out
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCropChange({ rotation: cropData.rotation + 90 })}
                >
                  <RotateCw className="w-4 h-4 mr-1" />
                  Rotate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCropData({ x: 0, y: 0, scale: 1, rotation: 0 })}
                >
                  <Move className="w-4 h-4 mr-1" />
                  Reset
                </Button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={uploading}>
              <Save className="w-4 h-4 mr-2" />
              {uploading ? 'Saving...' : 'Save Picture'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Camera className="w-5 h-5" />
          <span>Profile Picture</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-6">
          <Avatar className="w-24 h-24">
            <AvatarImage src={currentAvatarUrl} alt={userName} />
            <AvatarFallback className="text-2xl">
              {userName ? getInitials(userName) : <User className="w-8 h-8" />}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col space-y-3">
            <p className="text-sm text-muted-foreground">
              Upload a new profile picture. For best results, use a square image.
            </p>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload New Picture</span>
              </Button>
              
              {currentAvatarUrl && (
                <Button
                  variant="ghost"
                  onClick={() => onAvatarUpdate('')}
                  className="text-destructive hover:text-destructive"
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
};