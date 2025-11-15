import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronRight, ChevronDown, Plus, Trash2 } from 'lucide-react';

interface EstimationItem {
  id: string;
  wbsNumber: string;
  name: string;
  level: number;
  isExpanded: boolean;
  quantity?: number;
  unit?: string;
  unitRate?: number;
  totalCost?: number;
  children?: EstimationItem[];
}

interface EstimationWBSTableProps {
  onDataChange?: (data: any) => void;
}

export const EstimationWBSTable = ({ onDataChange }: EstimationWBSTableProps) => {
  const [items, setItems] = useState<EstimationItem[]>([
    {
      id: '1',
      wbsNumber: '1.0',
      name: 'Substructure',
      level: 0,
      isExpanded: true,
      quantity: 0,
      unit: 'm²',
      unitRate: 0,
      totalCost: 0,
      children: [
        {
          id: '1.1',
          wbsNumber: '1.1',
          name: 'Foundations',
          level: 1,
          isExpanded: false,
          quantity: 185.5,
          unit: 'm²',
          unitRate: 450,
          totalCost: 83475
        },
        {
          id: '1.2',
          wbsNumber: '1.2',
          name: 'Ground Floor Slab',
          level: 1,
          isExpanded: false,
          quantity: 185.5,
          unit: 'm²',
          unitRate: 280,
          totalCost: 51940
        }
      ]
    },
    {
      id: '2',
      wbsNumber: '2.0',
      name: 'Superstructure',
      level: 0,
      isExpanded: true,
      quantity: 0,
      unit: '',
      unitRate: 0,
      totalCost: 0,
      children: [
        {
          id: '2.1',
          wbsNumber: '2.1',
          name: 'Frame',
          level: 1,
          isExpanded: false,
          quantity: 350.7,
          unit: 'm²',
          unitRate: 520,
          totalCost: 182364
        },
        {
          id: '2.2',
          wbsNumber: '2.2',
          name: 'Upper Floors',
          level: 1,
          isExpanded: false,
          quantity: 165.2,
          unit: 'm²',
          unitRate: 380,
          totalCost: 62776
        },
        {
          id: '2.3',
          wbsNumber: '2.3',
          name: 'Roof',
          level: 1,
          isExpanded: false,
          quantity: 195.8,
          unit: 'm²',
          unitRate: 420,
          totalCost: 82236
        },
        {
          id: '2.4',
          wbsNumber: '2.4',
          name: 'Stairs',
          level: 1,
          isExpanded: false,
          quantity: 12,
          unit: 'nr',
          unitRate: 1850,
          totalCost: 22200
        },
        {
          id: '2.5',
          wbsNumber: '2.5',
          name: 'External Walls',
          level: 1,
          isExpanded: false,
          quantity: 285,
          unit: 'm²',
          unitRate: 340,
          totalCost: 96900
        }
      ]
    },
    {
      id: '3',
      wbsNumber: '3.0',
      name: 'Internal Finishes',
      level: 0,
      isExpanded: true,
      quantity: 0,
      unit: '',
      unitRate: 0,
      totalCost: 0,
      children: [
        {
          id: '3.1',
          wbsNumber: '3.1',
          name: 'Wall Finishes',
          level: 1,
          isExpanded: false,
          quantity: 450,
          unit: 'm²',
          unitRate: 85,
          totalCost: 38250
        },
        {
          id: '3.2',
          wbsNumber: '3.2',
          name: 'Floor Finishes',
          level: 1,
          isExpanded: false,
          quantity: 350.7,
          unit: 'm²',
          unitRate: 95,
          totalCost: 33316.5
        },
        {
          id: '3.3',
          wbsNumber: '3.3',
          name: 'Ceiling Finishes',
          level: 1,
          isExpanded: false,
          quantity: 350.7,
          unit: 'm²',
          unitRate: 110,
          totalCost: 38577
        }
      ]
    }
  ]);

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);
  const isSyncingRef = useRef(false);

  // Flatten items for rendering
  const flattenItems = (items: EstimationItem[]): EstimationItem[] => {
    const result: EstimationItem[] = [];
    
    const flatten = (item: EstimationItem) => {
      result.push(item);
      if (item.isExpanded && item.children) {
        item.children.forEach(flatten);
      }
    };
    
    items.forEach(flatten);
    return result;
  };

  const visibleItems = flattenItems(items);

  const toggleExpanded = (itemId: string) => {
    const updateItem = (items: EstimationItem[]): EstimationItem[] => {
      return items.map(item => {
        if (item.id === itemId) {
          return { ...item, isExpanded: !item.isExpanded };
        }
        if (item.children) {
          return { ...item, children: updateItem(item.children) };
        }
        return item;
      });
    };
    
    setItems(updateItem(items));
  };

  const updateItemValue = (itemId: string, field: keyof EstimationItem, value: any) => {
    const updateItem = (items: EstimationItem[]): EstimationItem[] => {
      return items.map(item => {
        if (item.id === itemId) {
          const updated = { ...item, [field]: value };
          // Recalculate total cost if quantity or unit rate changes
          if (field === 'quantity' || field === 'unitRate') {
            updated.totalCost = (updated.quantity || 0) * (updated.unitRate || 0);
          }
          return updated;
        }
        if (item.children) {
          return { ...item, children: updateItem(item.children) };
        }
        return item;
      });
    };
    
    setItems(updateItem(items));
  };

  // Synchronized scrolling
  const handleLeftScroll = useCallback(() => {
    if (isSyncingRef.current || !leftScrollRef.current || !rightScrollRef.current) return;
    
    isSyncingRef.current = true;
    rightScrollRef.current.scrollTop = leftScrollRef.current.scrollTop;
    setTimeout(() => { isSyncingRef.current = false; }, 10);
  }, []);

  const handleRightScroll = useCallback(() => {
    if (isSyncingRef.current || !leftScrollRef.current || !rightScrollRef.current) return;
    
    isSyncingRef.current = true;
    leftScrollRef.current.scrollTop = rightScrollRef.current.scrollTop;
    setTimeout(() => { isSyncingRef.current = false; }, 10);
  }, []);

  // Calculate totals
  const calculateGrandTotal = () => {
    return visibleItems.reduce((sum, item) => sum + (item.totalCost || 0), 0);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="shrink-0 h-12 px-4 border-b border-border/30 bg-white/80 backdrop-blur-xl flex items-center gap-2">
        <Button size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
        <div className="flex-1" />
        <div className="text-sm font-semibold text-foreground">
          Total: ${calculateGrandTotal().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>

      {/* Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - WBS & Name */}
        <div className="w-[420px] shrink-0 border-r border-border/30 bg-white overflow-hidden">
          <div 
            ref={leftScrollRef}
            onScroll={handleLeftScroll}
            className="h-full overflow-y-auto overflow-x-hidden scrollbar-thin"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 grid grid-cols-[80px_1fr] h-9 bg-muted/50 border-b border-border/30">
              <div className="px-3 flex items-center text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                WBS
              </div>
              <div className="px-3 flex items-center text-[10px] uppercase tracking-wider font-semibold text-muted-foreground border-l border-border/30">
                Description
              </div>
            </div>

            {/* Rows */}
            {visibleItems.map((item) => (
              <div
                key={item.id}
                className={`grid grid-cols-[80px_1fr] h-10 border-b border-border/10 hover:bg-accent/20 transition-all duration-150 ${
                  hoveredId === item.id ? 'bg-accent/20' : ''
                }`}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="px-3 flex items-center text-xs text-muted-foreground font-mono">
                  {item.wbsNumber}
                </div>
                <div className="px-3 flex items-center border-l border-border/10">
                  <div 
                    className="flex items-center gap-1.5 w-full"
                    style={{ paddingLeft: `${item.level * 20}px` }}
                  >
                    {item.children && item.children.length > 0 && (
                      <button
                        onClick={() => toggleExpanded(item.id)}
                        className="shrink-0 w-5 h-5 flex items-center justify-center hover:bg-accent/50 rounded transition-colors"
                      >
                        {item.isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                      </button>
                    )}
                    {!item.children && <div className="w-5" />}
                    <span className={`text-xs ${item.level === 0 ? 'font-semibold text-foreground' : 'text-foreground'}`}>
                      {item.name}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Estimation Details */}
        <div className="flex-1 overflow-hidden bg-white">
          <div 
            ref={rightScrollRef}
            onScroll={handleRightScroll}
            className="h-full overflow-y-auto overflow-x-auto scrollbar-thin"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 grid grid-cols-[110px_70px_110px_130px_70px] min-w-[600px] h-9 bg-muted/50 border-b border-border/30">
              <div className="px-3 flex items-center text-[10px] uppercase tracking-wider font-semibold text-muted-foreground border-l border-border/30">
                Quantity
              </div>
              <div className="px-3 flex items-center text-[10px] uppercase tracking-wider font-semibold text-muted-foreground border-l border-border/30">
                Unit
              </div>
              <div className="px-3 flex items-center text-[10px] uppercase tracking-wider font-semibold text-muted-foreground border-l border-border/30">
                Unit Rate
              </div>
              <div className="px-3 flex items-center text-[10px] uppercase tracking-wider font-semibold text-muted-foreground border-l border-border/30">
                Total Cost
              </div>
              <div className="px-3 flex items-center justify-center text-[10px] uppercase tracking-wider font-semibold text-muted-foreground border-l border-border/30">
                Actions
              </div>
            </div>

            {/* Rows */}
            {visibleItems.map((item) => (
              <div
                key={item.id}
                className={`grid grid-cols-[110px_70px_110px_130px_70px] min-w-[600px] h-10 border-b border-border/10 hover:bg-accent/20 transition-all duration-150 ${
                  hoveredId === item.id ? 'bg-accent/20' : ''
                }`}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="px-2 flex items-center border-l border-border/10">
                  <Input
                    type="number"
                    value={item.quantity || ''}
                    onChange={(e) => updateItemValue(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    className="h-7 text-xs bg-background/60 border-border/30 px-2"
                    disabled={item.level === 0}
                  />
                </div>
                <div className="px-2 flex items-center border-l border-border/10">
                  <Input
                    value={item.unit || ''}
                    onChange={(e) => updateItemValue(item.id, 'unit', e.target.value)}
                    className="h-7 text-xs bg-background/60 border-border/30 px-2"
                    disabled={item.level === 0}
                  />
                </div>
                <div className="px-2 flex items-center border-l border-border/10">
                  <Input
                    type="number"
                    value={item.unitRate || ''}
                    onChange={(e) => updateItemValue(item.id, 'unitRate', parseFloat(e.target.value) || 0)}
                    className="h-7 text-xs bg-background/60 border-border/30 px-2"
                    disabled={item.level === 0}
                  />
                </div>
                <div className="px-3 flex items-center border-l border-border/10">
                  <span className={`text-xs ${item.level === 0 ? 'font-semibold text-foreground' : 'text-foreground'}`}>
                    ${(item.totalCost || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="px-2 flex items-center justify-center border-l border-border/10">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 hover:bg-accent/50"
                    disabled={item.level === 0}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
