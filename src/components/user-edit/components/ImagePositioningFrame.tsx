import React, { useEffect, useState } from 'react';
import type { ImagePosition } from '../hooks/useImageEditor';

interface ImagePositioningFrameProps {
  tempImage: string;
  imagePosition: ImagePosition;
  imageScale: number;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
}

export const ImagePositioningFrame = ({
  tempImage,
  imagePosition,
  imageScale,
  onMouseDown,
  onMouseMove,
  onMouseUp
}: ImagePositioningFrameProps) => {
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      console.log('=== STEP 2: Image loaded in editor ===');
      console.log('Natural dimensions:', img.naturalWidth, 'x', img.naturalHeight);
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = tempImage;
  }, [tempImage]);

  // Calculate the actual display size
  const displayWidth = imageDimensions.width * imageScale;
  const displayHeight = imageDimensions.height * imageScale;

  console.log('=== EDITOR PREVIEW ===');
  console.log('Current scale:', imageScale);
  console.log('Current position:', imagePosition);
  console.log('Display size:', displayWidth, 'x', displayHeight);

  return (
    <div className="flex justify-center">
      <div className="relative w-64 h-64 border-2 border-dashed border-blue-300 rounded-full overflow-hidden bg-white/20 backdrop-blur-sm">
        <div 
          className="relative w-full h-full cursor-move"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          {imageDimensions.width > 0 && (
            <img
              src={tempImage}
              alt="Preview"
              className="absolute pointer-events-none select-none"
              style={{
                width: `${displayWidth}px`,
                height: `${displayHeight}px`,
                left: `${imagePosition.x}px`,
                top: `${imagePosition.y}px`,
                transform: 'none' // Remove transforms, use direct positioning
              }}
              draggable={false}
            />
          )}
        </div>
        {/* Frame overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full rounded-full border-4 border-blue-500/50"></div>
        </div>
      </div>
    </div>
  );
};