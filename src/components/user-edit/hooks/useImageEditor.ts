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
    
    setImagePosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
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
    setImagePosition({ x: 0, y: 0 });
    setImageScale(1);
    setIsEditing(true);
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