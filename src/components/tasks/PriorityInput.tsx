import React from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

interface PriorityInputProps {
  index: number;
  value: string;
  checked: boolean;
  onValueChange: (value: string) => void;
  onCheckedChange: (checked: boolean) => void;
}

export const PriorityInput = ({
  index,
  value,
  checked,
  onValueChange,
  onCheckedChange
}: PriorityInputProps) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-white/70 w-4">{index + 1}.</span>
      <Input 
        value={value} 
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={`Priority ${index + 1}`} 
        className="text-sm h-8 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15 focus:border-white/30 flex-1" 
      />
      <Checkbox 
        checked={checked} 
        onCheckedChange={(checked) => onCheckedChange(checked as boolean)}
        className="data-[state=checked]:bg-white/20 data-[state=checked]:border-white/30 border-white/20 bg-white/10"
      />
    </div>
  );
};
