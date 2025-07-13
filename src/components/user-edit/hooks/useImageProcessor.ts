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
            const outputSize = 256; // Final output size
            
            canvas.width = outputSize;
            canvas.height = outputSize;
            
            // Create circular clipping path
            ctx.beginPath();
            ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, 2 * Math.PI);
            ctx.clip();
            
            // The image in the editor is already scaled and positioned correctly
            // We just need to draw it exactly as shown
            const finalDisplayWidth = img.width * imageScale;
            const finalDisplayHeight = img.height * imageScale;
            
            console.log('Image original size:', img.width, 'x', img.height);
            console.log('Final display size:', finalDisplayWidth, 'x', finalDisplayHeight);
            console.log('Final position:', imagePosition.x, imagePosition.y);
            
            // Draw the image exactly as it appears in the editor
            ctx.drawImage(
              img,
              imagePosition.x,
              imagePosition.y,
              finalDisplayWidth,
              finalDisplayHeight
            );
            
            // Convert to high-quality data URL
            const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.95);
            
            // Save the positioned and cropped image
            onAvatarChange(croppedDataUrl);
            
            console.log('Position saved successfully. Image processed to match editor preview.');
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