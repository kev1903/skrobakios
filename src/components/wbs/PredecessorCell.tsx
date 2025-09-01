import React, { useState } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

interface WBSItem {
  id: string;
  name: string;
  wbsNumber: string;
  level: number;
}

interface PredecessorCellProps {
  id: string;
  type: 'phase' | 'component' | 'element';
  value?: string[]; // Array of predecessor IDs
  availableItems: WBSItem[];
  className?: string;
  onUpdate?: (id: string, field: string, value: string[]) => void;
}

export const PredecessorCell = ({
  id,
  type,
  value = [],
  availableItems,
  className = "",
  onUpdate
}: PredecessorCellProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>(value);

  // Filter out the current item and its children from available predecessors
  const filteredItems = availableItems.filter(item => 
    item.id !== id && !selectedIds.includes(item.id)
  );

  const selectedItems = availableItems.filter(item => 
    selectedIds.includes(item.id)
  );

  const handleSelect = (itemId: string) => {
    const newSelection = [...selectedIds, itemId];
    setSelectedIds(newSelection);
    if (onUpdate) {
      onUpdate(id, 'predecessors', newSelection);
    }
  };

  const handleRemove = (itemId: string) => {
    const newSelection = selectedIds.filter(id => id !== itemId);
    setSelectedIds(newSelection);
    if (onUpdate) {
      onUpdate(id, 'predecessors', newSelection);
    }
  };

  const getDisplayText = () => {
    if (selectedItems.length === 0) {
      return "None";
    }
    if (selectedItems.length === 1) {
      return selectedItems[0].wbsNumber;
    }
    return `${selectedItems.length} items`;
  };

  return (
    <div className="w-full h-full flex items-center">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            role="combobox"
            aria-expanded={isOpen}
            className={cn(
              "w-full justify-between text-left font-normal p-1 h-auto hover:bg-accent/20",
              selectedItems.length === 0 && "text-muted-foreground",
              className
            )}
          >
            <div className="flex items-center gap-1 text-xs flex-1">
              <span className="truncate">{getDisplayText()}</span>
            </div>
            <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start">
          <Command>
            <CommandInput placeholder="Search items..." className="h-8 text-xs" />
            <CommandList>
              <CommandEmpty>No items found.</CommandEmpty>
              <CommandGroup>
                {filteredItems.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={`${item.wbsNumber} ${item.name}`}
                    onSelect={() => handleSelect(item.id)}
                    className="text-xs"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-3 w-3",
                        selectedIds.includes(item.id) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <span className="font-medium text-xs">{item.wbsNumber}</span>
                      <span className="truncate text-xs">{item.name}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
          
          {selectedItems.length > 0 && (
            <div className="border-t p-2">
              <div className="text-xs font-medium mb-1">Selected:</div>
              <div className="flex flex-wrap gap-1">
                {selectedItems.map((item) => (
                  <Badge
                    key={item.id}
                    variant="secondary"
                    className="text-xs px-1 py-0 h-5"
                  >
                    {item.wbsNumber}
                    <X
                      className="ml-1 h-2 w-2 cursor-pointer hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(item.id);
                      }}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};