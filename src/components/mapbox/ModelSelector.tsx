import React from 'react';
import { Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Model3D } from './types';

interface ModelSelectorProps {
  availableModels: Model3D[];
  currentModel: Model3D | null;
  onModelSelect: (model: Model3D) => void;
  onRemoveModel: (modelId: string) => void;
}

export const ModelSelector = ({
  availableModels,
  currentModel,
  onModelSelect,
  onRemoveModel
}: ModelSelectorProps) => {
  if (availableModels.length <= 1) return null;

  return (
    <div className="border-t pt-4">
      <Label className="text-xs font-medium mb-2 block">Available Models</Label>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {availableModels.map((model) => (
          <div
            key={model.id}
            className={`relative group rounded-lg border transition-all ${
              currentModel?.id === model.id
                ? 'bg-blue-50 border-blue-200'
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
          >
            <button
              onClick={() => onModelSelect(model)}
              className="w-full text-left p-3 text-sm"
            >
              <div className="font-medium truncate">{model.name}</div>
              <div className="text-gray-500 text-xs truncate">{model.description || 'No description'}</div>
            </button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveModel(model.id);
              }}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};