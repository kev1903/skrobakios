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
      console.log('=== STEP 3: Starting image processing ===');
      console.log('Input position:', imagePosition);
      console.log('Input scale:', imageScale);
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
      
      const img = new Image();
      
      return new Promise((resolve, reject) => {
        img.onload = () => {
          try {
            console.log('=== STEP 4: Processing loaded image ===');
            console.log('Image natural dimensions:', img.naturalWidth, 'x', img.naturalHeight);
            console.log('Image display dimensions:', img.width, 'x', img.height);
            
            const outputSize = 256;
            canvas.width = outputSize;
            canvas.height = outputSize;
            
            console.log('Canvas size set to:', outputSize, 'x', outputSize);
            
            // Fill background for debugging
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, outputSize, outputSize);
            
            // Create circular clipping path
            ctx.beginPath();
            ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, 2 * Math.PI);
            ctx.clip();
            
            // Now let's see exactly how the image is positioned in the editor
            // The editor shows the image at natural size with CSS transform scale applied
            const naturalWidth = img.naturalWidth;
            const naturalHeight = img.naturalHeight;
            const finalWidth = naturalWidth * imageScale;
            const finalHeight = naturalHeight * imageScale;
            
            console.log('=== STEP 5: Canvas drawing parameters ===');
            console.log('Final image size:', finalWidth, 'x', finalHeight);
            console.log('Final position:', imagePosition.x, imagePosition.y);
            console.log('Drawing with ctx.drawImage(img,', imagePosition.x, imagePosition.y, finalWidth, finalHeight, ')');
            
            // Draw the image exactly as it appears in the editor
            ctx.drawImage(
              img,
              imagePosition.x,
              imagePosition.y,
              finalWidth,
              finalHeight
            );
            
            // Convert to data URL
            const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.95);
            console.log('=== STEP 6: Image processing complete ===');
            console.log('Generated data URL length:', croppedDataUrl.length);
            
            onAvatarChange(croppedDataUrl);
            resolve();
          } catch (error) {
            console.error('Error in image processing:', error);
            reject(error);
          }
        };
        
        img.onerror = (error) => {
          console.error('Error loading image for processing:', error);
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