import { useCallback } from 'react';
import type { ImagePosition } from './useImageEditor';

export const useImageProcessor = () => {
  const processImage = useCallback(async (
    tempImage: string,
    imagePosition: ImagePosition,
    imageScale: number,
    onAvatarChange: (avatarUrl: string) => void
  ): Promise<void> => {
    try {
      console.log('Starting save position process...');
      console.log('Current position:', imagePosition);
      console.log('Current scale:', imageScale);
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      
      const img = new Image();
      
      return new Promise((resolve, reject) => {
        img.onload = () => {
          try {
            const frameSize = 256; // Output frame size
            canvas.width = frameSize;
            canvas.height = frameSize;
            
            // Create circular clipping path
            ctx.beginPath();
            ctx.arc(frameSize / 2, frameSize / 2, frameSize / 2, 0, 2 * Math.PI);
            ctx.clip();
            
            // Calculate how the image appears in the editor
            const scaledWidth = img.width * imageScale;
            const scaledHeight = img.height * imageScale;
            
            // The position in the editor corresponds directly to the canvas position
            // since both are 256x256
            const canvasX = imagePosition.x;
            const canvasY = imagePosition.y;
            
            console.log('Drawing image at:', canvasX, canvasY, 'with size:', scaledWidth, 'x', scaledHeight);
            
            // Draw the positioned and scaled image
            ctx.drawImage(
              img,
              canvasX,
              canvasY,
              scaledWidth,
              scaledHeight
            );
            
            // Convert to high-quality data URL
            const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.95);
            
            // Save the positioned and cropped image
            onAvatarChange(croppedDataUrl);
            
            console.log('Position saved successfully. Remember to save your profile to persist changes.');
            resolve();
          } catch (error) {
            console.error('Error in image processing:', error);
            reject(error);
          }
        };
        
        img.onerror = (error) => {
          console.error('Error loading image:', error);
          reject(new Error('Error loading image'));
        };
        
        img.src = tempImage;
      });
    } catch (error) {
      console.error('Error in processImage:', error);
      throw error;
    }
  }, []);

  return { processImage };
};