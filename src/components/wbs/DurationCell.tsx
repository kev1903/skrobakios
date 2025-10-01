import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';

interface DurationCellProps {
  id: string;
  type: 'phase' | 'component' | 'element' | 'task';
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
  
  // Update local state when prop value changes (for auto-calculated duration)
  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);
  
  // In flat structure, all items are editable
  const isEditable = true;

  const handleSave = () => {
    if (!isEditable) return;
    
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

  if (isEditing && isEditable) {
    return (
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="w-full h-6 text-xs px-2 font-medium border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
        autoFocus
        type="number"
        min="0"
      />
    );
  }

  return (
    <div
      className={`w-full h-full flex items-center justify-start rounded px-1 hover:bg-slate-100 transition-colors ${
        isEditable ? 'cursor-pointer' : 'cursor-default opacity-60'
      } ${className}`}
      onClick={() => {
        if (isEditable) {
          setInputValue(value.toString());
          setIsEditing(true);
        }
      }}
      title="Click to edit duration (days)"
    >
      <span className="text-xs font-medium text-slate-700">
        {value > 0 ? `${value}d` : '-'}
      </span>
    </div>
  );
};