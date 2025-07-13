import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface ImageControlsProps {
  imageScale: number;
  onScaleChange: (scale: number) => void;
  onReset: () => void;
  onCancel: () => void;
  onSave: () => void;
  isProcessing?: boolean;
}

export const ImageControls = ({
  imageScale,
  onScaleChange,
  onReset,
  onCancel,
  onSave,
  isProcessing = false
}: ImageControlsProps) => {
  return (
    <div className="flex flex-col items-center space-y-4">
      <p className="text-sm text-slate-600 text-center">
        Drag to position your photo within the circle frame
      </p>
      
      {/* Important Note */}
      <div className="bg-blue-50/80 border border-blue-200/50 rounded-lg p-3 max-w-sm">
        <p className="text-xs text-blue-700 text-center font-medium">
          💡 After saving position, click "Save" in the sidebar to persist changes
        </p>
      </div>
      
      {/* Scale Control */}
      <div className="flex items-center space-x-4">
        <span className="text-sm text-slate-600">Size:</span>
        <input
          type="range"
          min="0.5"
          max="3"
          step="0.1"
          value={imageScale}
          onChange={(e) => onScaleChange(parseFloat(e.target.value))}
          className="w-32"
        />
        <span className="text-sm text-slate-600 w-12">{Math.round(imageScale * 100)}%</span>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="backdrop-blur-sm bg-white/60 border-white/30 hover:bg-blue-50/60"
          disabled={isProcessing}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          className="backdrop-blur-sm bg-white/60 border-white/30 hover:bg-red-50/60"
          disabled={isProcessing}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={onSave}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
          disabled={isProcessing}
        >
          {isProcessing ? 'Saving...' : 'Save Position'}
        </Button>
      </div>
    </div>
  );
};