import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MousePointer, Square, Ruler, Hash, Upload } from 'lucide-react';
interface MeasurementToolbarProps {
  currentTool: 'pointer' | 'area' | 'linear' | 'count';
  onToolSelect: (tool: 'pointer' | 'area' | 'linear' | 'count') => void;
  onUploadClick?: () => void;
}
export const MeasurementToolbar = ({
  currentTool,
  onToolSelect,
  onUploadClick
}: MeasurementToolbarProps) => {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={currentTool === 'pointer' ? 'default' : 'outline'}
              size="icon"
              onClick={() => onToolSelect('pointer')}
              aria-pressed={currentTool === 'pointer'}
              aria-label="Pointer tool"
            >
              <MousePointer className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Pointer</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={currentTool === 'area' ? 'default' : 'outline'}
              size="icon"
              onClick={() => onToolSelect('area')}
              aria-pressed={currentTool === 'area'}
              aria-label="Area tool"
            >
              <Square className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Area</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={currentTool === 'linear' ? 'default' : 'outline'}
              size="icon"
              onClick={() => onToolSelect('linear')}
              aria-pressed={currentTool === 'linear'}
              aria-label="Linear tool"
            >
              <Ruler className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Linear</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={currentTool === 'count' ? 'default' : 'outline'}
              size="icon"
              onClick={() => onToolSelect('count')}
              aria-pressed={currentTool === 'count'}
              aria-label="Count tool"
            >
              <Hash className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Count</TooltipContent>
        </Tooltip>

        {onUploadClick && (
          <>
            <Separator orientation="vertical" className="h-6" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={onUploadClick} aria-label="Upload drawings">
                  <Upload className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Upload</TooltipContent>
            </Tooltip>
          </>
        )}
      </div>
    </TooltipProvider>
  );
};