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
    <div className="border-t pt-4">
      <Label className="text-xs font-medium mb-2 block">Model Visibility</Label>
      <div className="flex items-center space-x-3">
        {showModel ? (
          <Eye className="w-4 h-4 text-blue-600" />
        ) : (
          <EyeOff className="w-4 h-4 text-gray-400" />
        )}
        <Switch
          checked={showModel}
          onCheckedChange={onToggleVisibility}
        />
        <span className="text-sm text-gray-600">
          {showModel ? 'Visible' : 'Hidden'}
        </span>
      </div>
    </div>
  );
};