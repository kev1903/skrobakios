import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, Save } from 'lucide-react';

interface PermissionMatrixActionsProps {
  hasChanges: boolean;
  onSave: () => void;
  onReset: () => void;
}

export const PermissionMatrixActions = ({ hasChanges, onSave, onReset }: PermissionMatrixActionsProps) => {
  if (!hasChanges) return null;

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={onReset}>
        <RotateCcw className="w-4 h-4 mr-2" />
        Reset
      </Button>
      <Button size="sm" onClick={onSave}>
        <Save className="w-4 h-4 mr-2" />
        Save Changes
      </Button>
    </div>
  );
};