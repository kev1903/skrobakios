import React, { useState } from 'react';
import { Camera } from '@capacitor/camera';
import { CameraResultType, CameraSource } from '@capacitor/camera';
import { Plus, Camera as CameraIcon, ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface PhotoUploadButtonProps {
  onPhotoSelected: (photoData: string) => void;
  disabled?: boolean;
}

export const PhotoUploadButton = ({ onPhotoSelected, disabled = false }: PhotoUploadButtonProps) => {
  const [showOptions, setShowOptions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleTakePhoto = async () => {
    try {
      setIsProcessing(true);
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      if (image.dataUrl) {
        onPhotoSelected(image.dataUrl);
        toast({
          title: "Photo captured",
          description: "Photo has been successfully captured",
        });
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      toast({
        title: "Camera Error",
        description: "Failed to capture photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setShowOptions(false);
    }
  };

  const handleSelectFromGallery = async () => {
    try {
      setIsProcessing(true);
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
      });

      if (image.dataUrl) {
        onPhotoSelected(image.dataUrl);
        toast({
          title: "Photo selected",
          description: "Photo has been successfully selected from gallery",
        });
      }
    } catch (error) {
      console.error('Error selecting photo:', error);
      toast({
        title: "Gallery Error",
        description: "Failed to select photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setShowOptions(false);
    }
  };

  const handleWebFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          onPhotoSelected(result);
          toast({
            title: "Photo uploaded",
            description: "Photo has been successfully uploaded",
          });
        }
      };
      reader.readAsDataURL(file);
    }
    setShowOptions(false);
  };

  if (showOptions) {
    return (
      <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-2 border border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowOptions(false)}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleTakePhoto}
          disabled={isProcessing}
          className="flex items-center gap-2 h-8"
        >
          <CameraIcon className="h-4 w-4" />
          <span className="text-xs">Camera</span>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSelectFromGallery}
          disabled={isProcessing}
          className="flex items-center gap-2 h-8"
        >
          <ImageIcon className="h-4 w-4" />
          <span className="text-xs">Gallery</span>
        </Button>

        {/* Fallback for web browsers */}
        <label className="cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleWebFileUpload}
            className="hidden"
          />
          <Button
            variant="ghost"
            size="sm"
            disabled={isProcessing}
            className="flex items-center gap-2 h-8"
            asChild
          >
            <span>
              <Plus className="h-4 w-4" />
              <span className="text-xs">Upload</span>
            </span>
          </Button>
        </label>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setShowOptions(true)}
      disabled={disabled || isProcessing}
      className="h-8 w-8 p-0 flex-shrink-0"
    >
      <Plus className="h-4 w-4" />
    </Button>
  );
};