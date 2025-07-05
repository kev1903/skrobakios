import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ModelControlsProps {
  showModel: boolean;
  onToggleVisibility: () => void;
}

export const ModelControls = ({
  showModel,
  onToggleVisibility
}: ModelControlsProps) => {
  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border-t pt-4">
      <Switch
        id="model-visibility"
        checked={showModel}
        onCheckedChange={onToggleVisibility}
      />
      <Label htmlFor="model-visibility" className="flex items-center space-x-2 cursor-pointer">
        {showModel ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
        <span className="font-medium">{showModel ? 'Hide' : 'Show'} 3D Model</span>
      </Label>
    </div>
  );
};