import { useState, useCallback } from 'react';

export interface ImagePosition {
  x: number;
  y: number;
}

export const useImageEditor = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempImage, setTempImage] = useState<string>('');
  const [imagePosition, setImagePosition] = useState<ImagePosition>({ x: 0, y: 0 });
  const [imageScale, setImageScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<ImagePosition>({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - imagePosition.x,
      y: e.clientY - imagePosition.y
    });
  }, [imagePosition]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const newPosition = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    };
    
    console.log('=== STEP 2: User dragging image ===');
    console.log('New position:', newPosition);
    
    setImagePosition(newPosition);
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleResetPosition = () => {
    // Reset to initial fit scale and center position
    const img = new Image();
    img.onload = () => {
      const frameSize = 256;
      const scaleToFit = Math.min(frameSize / img.width, frameSize / img.height);
      const initialScale = scaleToFit * 0.8;
      const scaledWidth = img.width * initialScale;
      const scaledHeight = img.height * initialScale;
      const centerX = (frameSize - scaledWidth) / 2;
      const centerY = (frameSize - scaledHeight) / 2;
      
      setImagePosition({ x: centerX, y: centerY });
      setImageScale(initialScale);
    };
    img.src = tempImage;
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setTempImage('');
  };

  const startEditing = (imageDataUrl: string) => {
    setTempImage(imageDataUrl);
    
    // Create an image to get its dimensions
    const img = new Image();
    img.onload = () => {
      console.log('=== STEP 1: Image loaded for editing ===');
      console.log('Original image dimensions:', img.width, 'x', img.height);
      
      // Calculate scale to fit image nicely in the 256px frame
      const frameSize = 256;
      const scaleToFit = Math.min(frameSize / img.width, frameSize / img.height);
      
      // Start with a scale that makes the image visible and manageable
      // Use 80% of the fit scale so user has room to adjust
      const initialScale = scaleToFit * 0.8;
      
      // Center the scaled image in the frame
      const scaledWidth = img.width * initialScale;
      const scaledHeight = img.height * initialScale;
      const centerX = (frameSize - scaledWidth) / 2;
      const centerY = (frameSize - scaledHeight) / 2;
      
      console.log('Calculated fit scale:', scaleToFit);
      console.log('Starting with scale:', initialScale);
      console.log('Centered at position:', centerX, centerY);
      
      setImagePosition({ x: centerX, y: centerY });
      setImageScale(initialScale);
      setIsEditing(true);
    };
    img.src = imageDataUrl;
  };

  const finishEditing = () => {
    setIsEditing(false);
    setTempImage('');
    setImagePosition({ x: 0, y: 0 });
    setImageScale(1);
  };

  return {
    isEditing,
    tempImage,
    imagePosition,
    imageScale,
    isDragging,
    setImageScale,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleResetPosition,
    handleCancelEdit,
    startEditing,
    finishEditing
  };
};