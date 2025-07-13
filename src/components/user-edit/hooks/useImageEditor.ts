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
    setImagePosition({ x: 0, y: 0 });
    setImageScale(1);
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
      
      // Reset to default starting position and scale
      setImagePosition({ x: 0, y: 0 });
      setImageScale(1);
      setIsEditing(true);
      
      console.log('Editor initialized with position (0,0) and scale 1');
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