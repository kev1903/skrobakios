import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TreePine, Layers, CheckCircle, Circle, Wrench, Zap } from 'lucide-react';

interface WBSElement {
  id: string;
  code: string;
  name: string;
  standard: 'BCIS' | 'ICMS';
  level: number;
  parent?: string;
  children?: WBSElement[];
  detected: boolean;
  confidence: number;
  layers: string[];
}

interface WBSElementMappingTabProps {
  onDataChange?: (data: any) => void;
}

export const WBSElementMappingTab = ({ onDataChange }: WBSElementMappingTabProps) => {
  const [selectedStandard, setSelectedStandard] = useState<'BCIS' | 'ICMS'>('BCIS');
  const [autoDetecting, setAutoDetecting] = useState(false);
  const [wbsElements, setWBSElements] = useState<WBSElement[]>([
    {
      id: '1',
      code: '1.0',
      name: 'Substructure',
      standard: 'BCIS',
      level: 1,
      detected: true,
      confidence: 95,
      layers: ['FOUNDATION', 'FOOTINGS', 'BASEMENT']
    },
    {
      id: '2',
      code: '2.0',
      name: 'Superstructure',
      standard: 'BCIS',
      level: 1,
      detected: true,
      confidence: 90,
      layers: ['STRUCTURE', 'FRAME', 'WALLS'],
      children: [
        {
          id: '2.1',
          code: '2.1',
          name: 'Frame',
          standard: 'BCIS',
          level: 2,
          parent: '2',
          detected: true,
          confidence: 88,
          layers: ['FRAME', 'COLUMNS', 'BEAMS']
        },
        {
          id: '2.2',
          code: '2.2',
          name: 'Upper Floors',
          standard: 'BCIS',
          level: 2,
          parent: '2',
          detected: true,
          confidence: 85,
          layers: ['FLOOR', 'SLAB']
        },
        {
          id: '2.3',
          code: '2.3',
          name: 'Roof',
          standard: 'BCIS',
          level: 2,
          parent: '2',
          detected: true,
          confidence: 92,
          layers: ['ROOF', 'ROOFING']
        },
        {
          id: '2.4',
          code: '2.4',
          name: 'Stairs',
          standard: 'BCIS',
          level: 2,
          parent: '2',
          detected: false,
          confidence: 0,
          layers: []
        },
        {
          id: '2.5',
          code: '2.5',
          name: 'External Walls',
          standard: 'BCIS',
          level: 2,
          parent: '2',
          detected: true,
          confidence: 87,
          layers: ['WALL', 'EXTERNAL_WALL']
        }
      ]
    },
    {
      id: '3',
      code: '3.0',
      name: 'Internal Finishes',
      standard: 'BCIS',
      level: 1,
      detected: true,
      confidence: 75,
      layers: ['FINISHES', 'INTERIOR']
    },
    {
      id: '4',
      code: '4.0',
      name: 'Fittings, Furnishings & Equipment',
      standard: 'BCIS',
      level: 1,
      detected: false,
      confidence: 0,
      layers: []
    },
    {
      id: '5',
      code: '5.0',
      name: 'Services',
      standard: 'BCIS',
      level: 1,
      detected: true,
      confidence: 80,
      layers: ['ELECTRICAL', 'PLUMBING', 'HVAC'],
      children: [
        {
          id: '5.1',
          code: '5.1',
          name: 'Sanitary Appliances',
          standard: 'BCIS',
          level: 2,
          parent: '5',
          detected: true,
          confidence: 85,
          layers: ['PLUMBING', 'SANITARY']
        },
        {
          id: '5.2',
          code: '5.2',
          name: 'Services Equipment',
          standard: 'BCIS',
          level: 2,
          parent: '5',
          detected: true,
          confidence: 70,
          layers: ['HVAC', 'MECHANICAL']
        },
        {
          id: '5.3',
          code: '5.3',
          name: 'Electrical Installations',
          standard: 'BCIS',
          level: 2,
          parent: '5',
          detected: true,
          confidence: 88,
          layers: ['ELECTRICAL', 'POWER', 'LIGHTING']
        }
      ]
    },
    {
      id: '6',
      code: '6.0',
      name: 'External Works',
      standard: 'BCIS',
      level: 1,
      detected: true,
      confidence: 65,
      layers: ['LANDSCAPE', 'EXTERNAL', 'SITE']
    }
  ]);

  const handleAutoDetect = async () => {
    setAutoDetecting(true);
    // Simulate AI detection process
    setTimeout(() => {
      setAutoDetecting(false);
    }, 3000);
  };

  const toggleElementSelection = (elementId: string) => {
    setWBSElements(elements => 
      elements.map(element => {
        if (element.id === elementId) {
          return { ...element, detected: !element.detected };
        }
        if (element.children) {
          return {
            ...element,
            children: element.children.map(child =>
              child.id === elementId 
                ? { ...child, detected: !child.detected }
                : child
            )
          };
        }
        return element;
      })
    );
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-50';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const renderWBSElement = (element: WBSElement, level: number = 0) => (
    <div key={element.id} className={`${level > 0 ? 'ml-6 border-l border-border pl-4' : ''}`}>
      <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-3 flex-1">
          <Checkbox
            checked={element.detected}
            onCheckedChange={() => toggleElementSelection(element.id)}
          />
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{element.code}</span>
              <span>{element.name}</span>
              {element.detected && (
                <CheckCircle className="w-4 h-4 text-green-600" />
              )}
            </div>
            
            {element.layers.length > 0 && (
              <div className="flex gap-1 mt-1">
                {element.layers.map(layer => (
                  <Badge key={layer} variant="outline" className="text-xs">
                    {layer}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {element.detected && (
          <Badge 
            variant="secondary" 
            className={`ml-2 ${getConfidenceColor(element.confidence)}`}
          >
            {element.confidence}%
          </Badge>
        )}
      </div>

      {element.children && (
        <div className="mt-2">
          {element.children.map(child => renderWBSElement(child, level + 1))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TreePine className="w-5 h-5" />
            Work Breakdown Structure Setup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="standard">Cost Standard:</Label>
              <Select value={selectedStandard} onValueChange={(value: 'BCIS' | 'ICMS') => setSelectedStandard(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BCIS">BCIS</SelectItem>
                  <SelectItem value="ICMS">ICMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={handleAutoDetect}
              disabled={autoDetecting}
              className="flex items-center gap-2"
            >
              <Layers className="w-4 h-4" />
              {autoDetecting ? 'Auto-Detecting...' : 'AI Auto-Detect Elements'}
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            AI will scan drawing layers and specifications to automatically identify and map building elements to the selected cost standard.
          </div>
        </CardContent>
      </Card>

      {/* WBS Tree */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Building Elements ({selectedStandard})</span>
            <div className="flex gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                {wbsElements.reduce((count, el) => {
                  const mainCount = el.detected ? 1 : 0;
                  const childCount = el.children?.reduce((c, child) => c + (child.detected ? 1 : 0), 0) || 0;
                  return count + mainCount + childCount;
                }, 0)} Detected
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Circle className="w-3 h-3" />
                {wbsElements.reduce((count, el) => {
                  const mainCount = 1;
                  const childCount = el.children?.length || 0;
                  return count + mainCount + childCount;
                }, 0)} Total
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {wbsElements.map(element => renderWBSElement(element))}
          </div>
        </CardContent>
      </Card>

      {/* Detection Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            AI Detection Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">8</div>
              <div className="text-sm text-green-700">High Confidence</div>
              <div className="text-xs text-muted-foreground">≥80%</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">2</div>
              <div className="text-sm text-yellow-700">Medium Confidence</div>
              <div className="text-xs text-muted-foreground">60-79%</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">2</div>
              <div className="text-sm text-red-700">Not Detected</div>
              <div className="text-xs text-muted-foreground">Manual review required</div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Next Steps:</strong> Review and confirm the element mapping above. 
              These selections will determine how quantities are organized in Step 3 (Cost Database) 
              and how elemental breakdowns are structured in Step 4 (Estimation Process).
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};