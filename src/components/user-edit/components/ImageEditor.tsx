import React, { useState } from 'react';
import { Move } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImagePositioningFrame } from './ImagePositioningFrame';
import { ImageControls } from './ImageControls';
import { useImageProcessor } from '../hooks/useImageProcessor';
import type { ImagePosition } from '../hooks/useImageEditor';

interface ImageEditorProps {
  tempImage: string;
  imagePosition: ImagePosition;
  imageScale: number;
  onScaleChange: (scale: number) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onReset: () => void;
  onCancel: () => void;
  onFinishEditing: () => void;
  onAvatarChange: (avatarUrl: string) => void;
}

export const ImageEditor = ({
  tempImage,
  imagePosition,
  imageScale,
  onScaleChange,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onReset,
  onCancel,
  onFinishEditing,
  onAvatarChange
}: ImageEditorProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { processImage } = useImageProcessor();

  const handleSavePosition = async () => {
    setIsProcessing(true);
    try {
      await processImage(tempImage, imagePosition, imageScale, onAvatarChange);
      onFinishEditing();
    } catch (error) {
      alert('Error processing image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="backdrop-blur-xl bg-white/40 border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center space-x-3 text-slate-800">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200/60 backdrop-blur-sm">
            <Move className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-xl font-semibold">Position Your Photo</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <ImagePositioningFrame
            tempImage={tempImage}
            imagePosition={imagePosition}
            imageScale={imageScale}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
          />
          
          <ImageControls
            imageScale={imageScale}
            onScaleChange={onScaleChange}
            onReset={onReset}
            onCancel={onCancel}
            onSave={handleSavePosition}
            isProcessing={isProcessing}
          />
        </div>
      </CardContent>
    </Card>
  );
};