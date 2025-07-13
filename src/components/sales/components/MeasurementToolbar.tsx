import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MousePointer, Square, Ruler, Hash, DollarSign, Download, Save, Upload } from 'lucide-react';

interface MeasurementToolbarProps {
  currentTool: 'pointer' | 'area' | 'linear' | 'count';
  onToolSelect: (tool: 'pointer' | 'area' | 'linear' | 'count') => void;
  onUploadClick?: () => void;
}

export const MeasurementToolbar = ({ currentTool, onToolSelect, onUploadClick }: MeasurementToolbarProps) => {
  return (
    <TooltipProvider>
      <div className="p-4 border-b border-border bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground mr-4">Measurement Tools:</span>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant={currentTool === 'pointer' ? 'default' : 'outline'} size="sm" onClick={() => onToolSelect('pointer')}>
                  <MousePointer className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Select Tool</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant={currentTool === 'area' ? 'default' : 'outline'} size="sm" onClick={() => onToolSelect('area')}>
                  <Square className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Area Tool (M²/M³)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant={currentTool === 'linear' ? 'default' : 'outline'} size="sm" onClick={() => onToolSelect('linear')}>
                  <Ruler className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Linear Tool (m)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant={currentTool === 'count' ? 'default' : 'outline'} size="sm" onClick={() => onToolSelect('count')}>
                  <Hash className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Count Tool (#)</p>
              </TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-6 mx-2" />
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  <DollarSign className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Rates</p>
              </TooltipContent>
            </Tooltip>
            
          </div>
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={onUploadClick}>
                  <Upload className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Import PDF</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export PDF</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90" size="sm">
                  <Save className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Save Estimate</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};