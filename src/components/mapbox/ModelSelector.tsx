import React from 'react';
import { Label } from '@/components/ui/label';
import { Model3D } from './types';

interface ModelSelectorProps {
  availableModels: Model3D[];
  currentModel: Model3D | null;
  onModelSelect: (model: Model3D) => void;
}

export const ModelSelector = ({
  availableModels,
  currentModel,
  onModelSelect
}: ModelSelectorProps) => {
  if (availableModels.length <= 1) return null;

  return (
    <div className="border-t pt-4">
      <Label className="text-xs font-medium mb-2 block">Available Models</Label>
      <div className="space-y-1 max-h-24 overflow-y-auto">
        {availableModels.map((model) => (
          <button
            key={model.id}
            onClick={() => onModelSelect(model)}
            className={`w-full text-left p-2 rounded text-xs transition-all ${
              currentModel?.id === model.id
                ? 'bg-blue-100 border border-blue-200'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <div className="font-medium truncate">{model.name}</div>
            <div className="text-gray-500 truncate">{model.description || 'No description'}</div>
          </button>
        ))}
      </div>
    </div>
  );
};