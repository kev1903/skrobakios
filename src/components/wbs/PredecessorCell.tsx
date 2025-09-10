import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, X, AlertTriangle } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WBSPredecessor, DependencyType, WBSItem } from '@/types/wbs';
import { getDependencyTypeLabel, validateWBSTaskSchedule } from '@/utils/wbsPredecessorUtils';

interface AvailableWBSItem {
  id: string;
  name: string;
  wbsNumber: string;
  level: number;
}

interface PredecessorCellProps {
  id: string;
  type: 'phase' | 'component' | 'element';
  value?: WBSPredecessor[]; // Array of structured predecessors
  availableItems: AvailableWBSItem[];
  allItems?: WBSItem[]; // Full WBS items for validation
  className?: string;
  onUpdate?: (id: string, field: string, value: WBSPredecessor[]) => void;
}

export const PredecessorCell = ({
  id,
  type,
  value = [],
  availableItems,
  allItems = [],
  className = "",
  onUpdate
}: PredecessorCellProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPredecessors, setSelectedPredecessors] = useState<WBSPredecessor[]>(value);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [newPredecessor, setNewPredecessor] = useState<{
    id: string;
    type: DependencyType;
    lag: number;
  }>({
    id: '',
    type: 'FS',
    lag: 0
  });

  // Only allow predecessors for elements
  const isElement = type === 'element';
  const selectedIds = selectedPredecessors.map(p => p.id);

  // Validate schedule when predecessors change - defer validation to allow auto-scheduling
  useEffect(() => {
    if (isElement && allItems.length > 0) {
      // Defer validation to allow auto-scheduling to complete first
      const timeoutId = setTimeout(() => {
        const currentTask = allItems.find(t => t.id === id);
        if (currentTask) {
          const validation = validateWBSTaskSchedule(currentTask, allItems);
          setValidationErrors(validation.violations);
        }
      }, 500); // Wait 500ms for auto-scheduling to complete

      return () => clearTimeout(timeoutId);
    }
  }, [selectedPredecessors, allItems, id, isElement]);
  
  // Filter out the current item, already selected items, and show only elements (level 2)
  const filteredItems = availableItems.filter(item => 
    item.id !== id && !selectedIds.includes(item.id) && item.level === 2
  );

  const selectedItems = availableItems.filter(item => 
    selectedIds.includes(item.id)
  );

  const handleAddPredecessor = () => {
    // Validate that a predecessor is selected
    if (!newPredecessor.id) {
      console.warn('⚠️ No predecessor selected for adding');
      return;
    }
    
    // Check if this is an element and already has a dependency
    if (type === 'element' && selectedPredecessors.length >= 1) {
      console.warn('⚠️ Elements can only have 1 dependency');
      return;
    }
    
    // Check if this predecessor already exists
    if (selectedPredecessors.some(p => p.id === newPredecessor.id)) {
      console.warn('⚠️ Predecessor already exists:', newPredecessor.id);
      return;
    }

    const updated = [...selectedPredecessors, {
      id: newPredecessor.id,
      type: newPredecessor.type,
      lag: newPredecessor.lag
    }];
    
    console.log(`➕ Adding predecessor to item ${id}:`, newPredecessor);
    setSelectedPredecessors(updated);
    setNewPredecessor({ id: '', type: 'FS', lag: 0 });
    
    if (onUpdate) {
      console.log(`📝 Calling onUpdate for ${id} with predecessors:`, updated);
      onUpdate(id, 'predecessors', updated);
    } else {
      console.warn('⚠️ No onUpdate function provided');
    }
  };

  const handleRemovePredecessor = (predecessorId: string) => {
    const updated = selectedPredecessors.filter(p => p.id !== predecessorId);
    setSelectedPredecessors(updated);
    
    if (onUpdate) {
      onUpdate(id, 'predecessors', updated);
    }
  };

  const handleUpdatePredecessor = (predecessorId: string, field: keyof WBSPredecessor, value: any) => {
    const updated = selectedPredecessors.map(p => 
      p.id === predecessorId ? { ...p, [field]: value } : p
    );
    setSelectedPredecessors(updated);
    
    if (onUpdate) {
      onUpdate(id, 'predecessors', updated);
    }
  };

  const getDisplayText = () => {
    if (!isElement) {
      return "-"; // Show dash for non-elements
    }
    if (selectedPredecessors.length === 0) {
      return "None";
    }
    if (selectedPredecessors.length === 1) {
      const item = selectedItems[0];
      const pred = selectedPredecessors[0];
      return `${item.wbsNumber} (${pred.type})`;
    }
    return `${selectedPredecessors.length} dependencies`;
  };

  // If not an element, show read-only display
  if (!isElement) {
    return (
      <div className="w-full h-full flex items-center">
        <div className={cn(
          "w-full text-left p-1 h-auto text-muted-foreground/50",
          className
        )}>
          <span className="text-xs">-</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            role="combobox"
            aria-expanded={isOpen}
            className={cn(
              "w-full justify-between text-left font-normal p-1 h-auto",
              selectedItems.length === 0 && "text-muted-foreground",
              validationErrors.length > 0 && "text-destructive border border-destructive/20",
              className
            )}
          >
            <div className="flex items-center gap-1 text-xs flex-1">
              {validationErrors.length > 0 && (
                <AlertTriangle className="h-3 w-3 text-destructive" />
              )}
              <span className="truncate">{getDisplayText()}</span>
            </div>
            <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          {validationErrors.length > 0 && (
            <div className="p-3 border-b bg-destructive/5">
              <div className="text-xs font-medium text-destructive mb-1">Schedule Conflicts:</div>
              {validationErrors.map((error, index) => (
                <div key={index} className="text-xs text-destructive/80">{error}</div>
              ))}
            </div>
          )}
          <div className="p-3 border-b">
            <h4 className="text-sm font-medium mb-2">Add Dependency</h4>
            <div className="space-y-2">
              <div>
                <Label className="text-xs">Task</Label>
                <Select
                  value={newPredecessor.id}
                  onValueChange={(value) => setNewPredecessor(prev => ({ ...prev, id: value }))}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select task..." />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredItems.map((item) => (
                      <SelectItem key={item.id} value={item.id} className="text-xs">
                        {item.wbsNumber} - {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label className="text-xs">Type</Label>
                  <Select
                    value={newPredecessor.type}
                    onValueChange={(value: DependencyType) => 
                      setNewPredecessor(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FS" className="text-xs">FS - Finish to Start</SelectItem>
                      <SelectItem value="SS" className="text-xs">SS - Start to Start</SelectItem>
                      <SelectItem value="FF" className="text-xs">FF - Finish to Finish</SelectItem>
                      <SelectItem value="SF" className="text-xs">SF - Start to Finish</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-20">
                  <Label className="text-xs">Lag (days)</Label>
                  <Input
                    type="number"
                    value={newPredecessor.lag}
                    onChange={(e) => setNewPredecessor(prev => ({ 
                      ...prev, 
                      lag: parseInt(e.target.value) || 0 
                    }))}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
              
              <Button
                onClick={handleAddPredecessor}
                disabled={!newPredecessor.id || (type === 'element' && selectedPredecessors.length >= 1)}
                className="w-full h-8 text-xs"
                size="sm"
              >
                Add Dependency
              </Button>
              {type === 'element' && selectedPredecessors.length >= 1 && (
                <div className="text-xs text-muted-foreground mt-1 text-center">
                  Elements can only have 1 dependency
                </div>
              )}
            </div>
          </div>
          
          {selectedPredecessors.length > 0 && (
            <div className="p-3">
              <div className="text-xs font-medium mb-2">Current Dependencies:</div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedPredecessors.map((predecessor) => {
                  const item = availableItems.find(i => i.id === predecessor.id);
                  if (!item) return null;
                  
                  return (
                    <div key={predecessor.id} className="flex items-center gap-2 p-2 bg-muted rounded text-xs">
                      <div className="flex-1">
                        <div className="font-medium">{item.wbsNumber}</div>
                        <div className="text-muted-foreground truncate">{item.name}</div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Select
                          value={predecessor.type}
                          onValueChange={(value: DependencyType) => 
                            handleUpdatePredecessor(predecessor.id, 'type', value)
                          }
                        >
                          <SelectTrigger className="h-6 w-12 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="FS" className="text-xs">FS</SelectItem>
                            <SelectItem value="SS" className="text-xs">SS</SelectItem>
                            <SelectItem value="FF" className="text-xs">FF</SelectItem>
                            <SelectItem value="SF" className="text-xs">SF</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Input
                          type="number"
                          value={predecessor.lag || 0}
                          onChange={(e) => 
                            handleUpdatePredecessor(predecessor.id, 'lag', parseInt(e.target.value) || 0)
                          }
                          className="h-6 w-12 text-xs"
                        />
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemovePredecessor(predecessor.id)}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};