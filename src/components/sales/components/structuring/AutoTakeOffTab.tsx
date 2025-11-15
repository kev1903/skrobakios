import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calculator, Lock, Unlock, Eye, Plus, Play, Table2 } from 'lucide-react';

interface TakeOffItem {
  id: string;
  name: string;
  type: 'area' | 'length' | 'count' | 'volume';
  quantity: number;
  unit: string;
  wbsElement: string;
  source: 'auto' | 'manual';
  locked: boolean;
  drawing: string;
  layer: string;
  confidence?: number;
}

interface AutoTakeOffTabProps {
  onDataChange?: (data: any) => void;
}

export const AutoTakeOffTab = ({ onDataChange }: AutoTakeOffTabProps) => {
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [selectedDrawing, setSelectedDrawing] = useState('all');
  const [takeOffItems, setTakeOffItems] = useState<TakeOffItem[]>([
    {
      id: '1',
      name: 'Ground Floor Area',
      type: 'area',
      quantity: 185.5,
      unit: 'm²',
      wbsElement: '2.2 - Upper Floors',
      source: 'auto',
      locked: false,
      drawing: 'Floor Plan - Ground',
      layer: 'FLOOR',
      confidence: 95
    },
    {
      id: '2',
      name: 'First Floor Area',
      type: 'area',
      quantity: 165.2,
      unit: 'm²',
      wbsElement: '2.2 - Upper Floors',
      source: 'auto',
      locked: false,
      drawing: 'Floor Plan - First',
      layer: 'FLOOR',
      confidence: 92
    },
    {
      id: '3',
      name: 'External Wall Area',
      type: 'area',
      quantity: 285.0,
      unit: 'm²',
      wbsElement: '2.5 - External Walls',
      source: 'auto',
      locked: true,
      drawing: 'Elevations',
      layer: 'WALL',
      confidence: 88
    },
    {
      id: '4',
      name: 'Windows Count',
      type: 'count',
      quantity: 18,
      unit: 'nr',
      wbsElement: '2.5 - External Walls',
      source: 'auto',
      locked: false,
      drawing: 'Floor Plans',
      layer: 'WINDOWS',
      confidence: 85
    },
    {
      id: '5',
      name: 'Roof Area',
      type: 'area',
      quantity: 195.8,
      unit: 'm²',
      wbsElement: '2.3 - Roof',
      source: 'auto',
      locked: false,
      drawing: 'Roof Plan',
      layer: 'ROOF',
      confidence: 90
    },
    {
      id: '6',
      name: 'Custom Measurement',
      type: 'length',
      quantity: 45.0,
      unit: 'm',
      wbsElement: '6.0 - External Works',
      source: 'manual',
      locked: false,
      drawing: 'Site Plan',
      layer: 'MANUAL'
    }
  ]);

  const handleAutoTakeOff = async () => {
    setIsAutoRunning(true);
    setTimeout(() => {
      setIsAutoRunning(false);
    }, 4000);
  };

  const toggleLock = (itemId: string) => {
    setTakeOffItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, locked: !item.locked } : item
      )
    );
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    setTakeOffItems(items =>
      items.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity, source: 'manual' } : item
      )
    );
  };

  const addManualTakeOff = () => {
    const newItem: TakeOffItem = {
      id: `manual_${Date.now()}`,
      name: 'New Measurement',
      type: 'area',
      quantity: 0,
      unit: 'm²',
      wbsElement: 'Select WBS',
      source: 'manual',
      locked: false,
      drawing: 'Manual Entry',
      layer: 'MANUAL'
    };
    setTakeOffItems([...takeOffItems, newItem]);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'area': return '⬜';
      case 'length': return '📏';
      case 'count': return '🔢';
      case 'volume': return '📦';
      default: return '📐';
    }
  };

  const getConfidenceBadge = (confidence?: number) => {
    if (!confidence) return null;
    const variant = confidence >= 90 ? 'default' : confidence >= 80 ? 'secondary' : 'destructive';
    return (
      <Badge variant={variant} className="text-xs">
        {confidence}%
      </Badge>
    );
  };

  const stats = {
    total: takeOffItems.length,
    auto: takeOffItems.filter(i => i.source === 'auto').length,
    manual: takeOffItems.filter(i => i.source === 'manual').length,
    locked: takeOffItems.filter(i => i.locked).length
  };

  return (
    <div className="space-y-6">
      {/* Auto Take-Off Controls */}
      <Card className="bg-white/80 backdrop-blur-xl border-border/30 shadow-[0_2px_16px_rgba(0,0,0,0.04)] rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Calculator className="w-5 h-5 text-primary" />
            Automated Take-Off
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="drawing-select" className="text-sm font-medium text-foreground">
                Target Drawing
              </Label>
              <Select value={selectedDrawing} onValueChange={setSelectedDrawing}>
                <SelectTrigger className="h-10 bg-background/60 backdrop-blur-md border-border/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Drawings</SelectItem>
                  <SelectItem value="floor-plans">Floor Plans</SelectItem>
                  <SelectItem value="elevations">Elevations</SelectItem>
                  <SelectItem value="sections">Sections</SelectItem>
                  <SelectItem value="details">Details</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={handleAutoTakeOff}
              disabled={isAutoRunning}
              className="h-10 px-6"
              size="default"
            >
              <Play className="w-4 h-4 mr-2" />
              {isAutoRunning ? 'Processing...' : 'Run Auto Take-Off'}
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            Automatically extract floor areas, wall areas, window counts, and roof areas from plan drawings. 
            Quantities will be linked to their corresponding WBS elements.
          </p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white/80 backdrop-blur-xl border-border/30 shadow-[0_2px_16px_rgba(0,0,0,0.04)] rounded-2xl">
          <CardContent className="pt-6">
            <div className="text-2xl font-semibold text-foreground">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Items</div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-xl border-border/30 shadow-[0_2px_16px_rgba(0,0,0,0.04)] rounded-2xl">
          <CardContent className="pt-6">
            <div className="text-2xl font-semibold text-primary">{stats.auto}</div>
            <div className="text-sm text-muted-foreground">Automated</div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-xl border-border/30 shadow-[0_2px_16px_rgba(0,0,0,0.04)] rounded-2xl">
          <CardContent className="pt-6">
            <div className="text-2xl font-semibold text-secondary-foreground">{stats.manual}</div>
            <div className="text-sm text-muted-foreground">Manual</div>
          </CardContent>
        </Card>
        <Card className="bg-white/80 backdrop-blur-xl border-border/30 shadow-[0_2px_16px_rgba(0,0,0,0.04)] rounded-2xl">
          <CardContent className="pt-6">
            <div className="text-2xl font-semibold text-accent-foreground">{stats.locked}</div>
            <div className="text-sm text-muted-foreground">Locked</div>
          </CardContent>
        </Card>
      </div>

      {/* Take-Off Table */}
      <Card className="bg-white/80 backdrop-blur-xl border-border/30 shadow-[0_2px_16px_rgba(0,0,0,0.04)] rounded-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Table2 className="w-5 h-5 text-primary" />
              Take-Off Quantities
            </CardTitle>
            <Button onClick={addManualTakeOff} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Manual
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-muted/30 rounded-xl border border-border/20">
              <div className="col-span-3 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                Item
              </div>
              <div className="col-span-2 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                WBS Element
              </div>
              <div className="col-span-2 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                Drawing
              </div>
              <div className="col-span-2 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                Quantity
              </div>
              <div className="col-span-2 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                Source
              </div>
              <div className="col-span-1 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground text-right">
                Actions
              </div>
            </div>

            {/* Table Rows */}
            {takeOffItems.map((item) => (
              <div 
                key={item.id} 
                className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-accent/30 rounded-xl border border-border/20 transition-all duration-200 group"
              >
                <div className="col-span-3 flex items-center gap-2">
                  <span className="text-lg">{getTypeIcon(item.type)}</span>
                  <span className="font-medium text-sm text-foreground">{item.name}</span>
                </div>
                
                <div className="col-span-2 flex items-center">
                  <span className="text-sm text-muted-foreground">{item.wbsElement}</span>
                </div>
                
                <div className="col-span-2 flex items-center">
                  <span className="text-sm text-muted-foreground">{item.drawing}</span>
                </div>
                
                <div className="col-span-2 flex items-center gap-2">
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, parseFloat(e.target.value) || 0)}
                    disabled={item.locked}
                    className="h-8 text-sm bg-background/60 border-border/30"
                  />
                  <span className="text-sm text-muted-foreground shrink-0">{item.unit}</span>
                </div>
                
                <div className="col-span-2 flex items-center gap-2">
                  <Badge variant={item.source === 'auto' ? 'default' : 'secondary'} className="text-xs">
                    {item.source}
                  </Badge>
                  {getConfidenceBadge(item.confidence)}
                </div>
                
                <div className="col-span-1 flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLock(item.id)}
                    className="h-8 w-8 p-0"
                  >
                    {item.locked ? (
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Unlock className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
