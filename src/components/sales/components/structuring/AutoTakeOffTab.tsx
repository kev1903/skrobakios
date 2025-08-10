import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Calculator, Lock, Unlock, Eye, Settings, Plus, Edit } from 'lucide-react';

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
    // Simulate auto take-off process
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
      wbsElement: '1.0 - Substructure',
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

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'bg-gray-100 text-gray-800';
    if (confidence >= 90) return 'bg-green-100 text-green-800';
    if (confidence >= 80) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      {/* Auto Take-Off Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Automated Take-Off
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="drawing-select">Target Drawing:</Label>
              <Select value={selectedDrawing} onValueChange={setSelectedDrawing}>
                <SelectTrigger className="w-48">
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
              className="flex items-center gap-2"
            >
              <Calculator className="w-4 h-4" />
              {isAutoRunning ? 'Running Auto Take-Off...' : 'Run Auto Take-Off'}
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            Automatically extract floor areas, wall areas, window counts, and roof areas from plan drawings. 
            Quantities will be linked to their corresponding WBS elements.
          </div>
        </CardContent>
      </Card>

      {/* Take-Off Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Take-Off Quantities</span>
            <div className="flex gap-2">
              <Button onClick={addManualTakeOff} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Add Manual
              </Button>
              <Button size="sm" variant="outline">
                <Settings className="w-4 h-4 mr-1" />
                Settings
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {takeOffItems.map((item, index) => (
              <div key={item.id} className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="text-lg">{getTypeIcon(item.type)}</div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{item.name}</span>
                        <Badge variant={item.source === 'auto' ? 'default' : 'secondary'}>
                          {item.source}
                        </Badge>
                        {item.confidence && (
                          <Badge variant="outline" className={getConfidenceColor(item.confidence)}>
                            {item.confidence}%
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        WBS: {item.wbsElement} • {item.drawing} • Layer: {item.layer}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, parseFloat(e.target.value) || 0)}
                        className="w-24 text-right"
                        disabled={item.locked}
                        step="0.1"
                      />
                      <span className="text-sm text-muted-foreground min-w-8">{item.unit}</span>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleLock(item.id)}
                      className="p-2"
                    >
                      {item.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    </Button>

                    <Button size="sm" variant="ghost" className="p-2">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-semibold text-blue-600">
                {takeOffItems.filter(item => item.type === 'area').length}
              </div>
              <div className="text-sm text-blue-700">Areas</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-lg font-semibold text-green-600">
                {takeOffItems.filter(item => item.type === 'length').length}
              </div>
              <div className="text-sm text-green-700">Lengths</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-lg font-semibold text-yellow-600">
                {takeOffItems.filter(item => item.type === 'count').length}
              </div>
              <div className="text-sm text-yellow-700">Counts</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-lg font-semibold text-purple-600">
                {takeOffItems.filter(item => item.locked).length}
              </div>
              <div className="text-sm text-purple-700">Locked</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Traceability Info */}
      <Card>
        <CardHeader>
          <CardTitle>Quantity Traceability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-600" />
              <span><strong>Locked quantities</strong> are protected from automatic updates and maintain traceability to original drawings.</span>
            </div>
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-green-600" />
              <span><strong>Auto-detected quantities</strong> are extracted directly from drawing geometry and can be re-calculated.</span>
            </div>
            <div className="flex items-center gap-2">
              <Edit className="w-4 h-4 text-orange-600" />
              <span><strong>Manual quantities</strong> are user-entered values that will be preserved across updates.</span>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> All quantities are automatically linked to their corresponding WBS elements. 
              Changes here will flow through to Step 3 (Cost Database) for rate application and Step 4 (Estimation Process) for final calculations.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};