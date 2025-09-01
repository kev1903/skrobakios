import React, { useState } from 'react';
import { Input } from '@/components/ui/input';

interface DurationCellProps {
  id: string;
  type: 'phase' | 'component' | 'element';
  value?: number;
  className?: string;
  onUpdate?: (id: string, field: string, value: number) => void;
}

export const DurationCell = ({
  id,
  type,
  value = 0,
  className = "",
  onUpdate
}: DurationCellProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());

  const handleSave = () => {
    const numValue = Math.max(0, parseInt(inputValue) || 0);
    if (onUpdate) {
      onUpdate(id, 'duration', numValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setInputValue(value.toString());
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="w-full h-auto text-xs p-1 text-center border-0 bg-transparent focus:bg-white focus:border focus:ring-1"
        autoFocus
        type="number"
        min="0"
      />
    );
  }

  return (
    <div
      className={`w-full h-full flex items-center justify-center cursor-pointer hover:bg-accent/20 rounded px-1 ${className}`}
      onClick={() => {
        setInputValue(value.toString());
        setIsEditing(true);
      }}
      title="Click to edit duration (days)"
    >
      <span className="text-xs text-muted-foreground">
        {value > 0 ? `${value}d` : '-'}
      </span>
    </div>
  );
};