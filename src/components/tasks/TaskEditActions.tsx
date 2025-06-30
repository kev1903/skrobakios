
import React from 'react';
import { Button } from '@/components/ui/button';

interface TaskEditActionsProps {
  onSave: () => void;
  onCancel: () => void;
}

export const TaskEditActions = ({ onSave, onCancel }: TaskEditActionsProps) => {
  return (
    <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
      <Button variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button onClick={onSave}>
        Save Changes
      </Button>
    </div>
  );
};
