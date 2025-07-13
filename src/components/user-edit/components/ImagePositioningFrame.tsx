import React from 'react';
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
          <img
            src={tempImage}
            alt="Preview"
            className="absolute pointer-events-none select-none"
            style={{
              transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${imageScale})`,
              transformOrigin: 'top left'
            }}
            draggable={false}
          />
        </div>
        {/* Frame overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full rounded-full border-4 border-blue-500/50"></div>
        </div>
      </div>
    </div>
  );
};