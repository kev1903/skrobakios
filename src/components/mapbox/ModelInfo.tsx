import React from 'react';
import { Model3D } from './types';

interface ModelInfoProps {
  model: Model3D;
}

export const ModelInfo = ({ model }: ModelInfoProps) => {
  return (
    <>
      {/* Model Information */}
      <div className="space-y-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
        <div className="font-medium text-gray-800 mb-2">{model.name}</div>
        {model.description && (
          <div className="text-xs text-gray-600 mb-2">{model.description}</div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="font-medium">Location:</span>
            <div className="text-xs">{model.coordinates[1].toFixed(6)}, {model.coordinates[0].toFixed(6)}</div>
          </div>
          <div>
            <span className="font-medium">Scale:</span>
            <div>{model.scale}x</div>
          </div>
          <div>
            <span className="font-medium">Elevation:</span>
            <div>{model.elevation}m</div>
          </div>
          <div>
            <span className="font-medium">Rotation:</span>
            <div>{(model.rotation_x * 180 / Math.PI).toFixed(0)}° X-axis</div>
          </div>
        </div>
      </div>

      {/* Model URL Display */}
      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
        <div className="font-medium mb-1">Model Source:</div>
        <div className="break-all">{model.file_url}</div>
      </div>
    </>
  );
};