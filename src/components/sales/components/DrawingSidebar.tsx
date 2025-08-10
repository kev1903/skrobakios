import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ArrowLeft, FileText, Plus, ChevronDown } from 'lucide-react';
import { DrawingFile } from '../hooks/useMultiplePDFUpload';
import { TakeoffItem } from '../hooks/useTakeoffMeasurements';

interface DrawingSidebarProps {
  onBack?: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  drawings: DrawingFile[];
  activeDrawingId: string | null;
  onSetActiveDrawing: (id: string) => void;
  onRemoveDrawing: (id: string) => void;
  takeoffs: TakeoffItem[];
  onCreateTakeoff: (data: { description: string; type: 'Area' | 'Linear' | 'Number' | 'Volume' }) => void;
  onDeleteTakeoff: (id: string) => void;
}

export const DrawingSidebar = ({ 
  onBack, 
  fileInputRef, 
  handleFileUpload, 
  drawings, 
  activeDrawingId, 
  onSetActiveDrawing, 
  onRemoveDrawing,
  takeoffs,
  onCreateTakeoff,
  onDeleteTakeoff
}: DrawingSidebarProps) => {
  const [newTakeOffOpen, setNewTakeOffOpen] = useState(false);
  const [drawingsOpen, setDrawingsOpen] = useState(true);
  const [takeoffsOpen, setTakeoffsOpen] = useState(true);
  const [newTakeOff, setNewTakeOff] = useState({
    description: '',
    type: 'Area' as 'Area' | 'Linear' | 'Number' | 'Volume'
  });

  const handleCreateTakeOff = () => {
    if (!newTakeOff.description.trim()) return;
    
    onCreateTakeoff({
      description: newTakeOff.description.trim(),
      type: newTakeOff.type
    });
    
    setNewTakeOffOpen(false);
    setNewTakeOff({ description: '', type: 'Area' });
  };

  return (
    <div className="w-80 flex flex-col border-r border-border bg-background">
      {/* Header with Back Button */}
      <div className="p-4 border-b border-border">
        {onBack && <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center gap-2 mb-3 w-full justify-start hover:bg-muted">
            <ArrowLeft className="w-4 h-4" />
            Back to Estimates
          </Button>}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          accept=".pdf" 
          multiple 
          className="hidden" 
        />
      </div>

      <ScrollArea className="flex-1">
        {/* Drawings Section */}
        <Collapsible open={drawingsOpen} onOpenChange={setDrawingsOpen}>
          <div className="p-4 border-b border-border">
            <CollapsibleTrigger className="flex items-center justify-between w-full text-left">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Drawings</h4>
              <ChevronDown className={`w-4 h-4 transition-transform ${drawingsOpen ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="space-y-2 mt-3">
                {drawings.length > 0 ? drawings.map(drawing => (
                  <div 
                    key={drawing.id} 
                    className={`flex items-center justify-between p-2 rounded-lg border hover:bg-muted/50 cursor-pointer ${
                      activeDrawingId === drawing.id ? 'bg-muted border-primary' : ''
                    }`}
                    onClick={() => onSetActiveDrawing(drawing.id)}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{drawing.name.slice(0, 20)}{drawing.name.length > 20 ? '...' : ''}</p>
                      </div>
                      {activeDrawingId === drawing.id && <Badge variant="secondary" className="text-xs">Active</Badge>}
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground">No drawings uploaded</p>
                )}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {/* Take-Offs Section */}
        <Collapsible open={takeoffsOpen} onOpenChange={setTakeoffsOpen}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <CollapsibleTrigger className="flex items-center gap-2 text-left">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Take-Offs</h4>
                <ChevronDown className={`w-4 h-4 transition-transform ${takeoffsOpen ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <Dialog open={newTakeOffOpen} onOpenChange={setNewTakeOffOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-6 text-xs">
                    <Plus className="w-3 h-3 mr-1" />
                    New
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Take-Off</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Description</label>
                      <input
                        type="text"
                        value={newTakeOff.description}
                        onChange={(e) => setNewTakeOff({ ...newTakeOff, description: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-md text-sm"
                        placeholder="Enter take-off description"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Measurement Type</label>
                      <select
                        value={newTakeOff.type}
                        onChange={(e) => setNewTakeOff({ ...newTakeOff, type: e.target.value as 'Area' | 'Linear' | 'Number' | 'Volume' })}
                        className="w-full px-3 py-2 border border-border rounded-md text-sm"
                      >
                        <option value="Area">Area</option>
                        <option value="Linear">Linear</option>
                        <option value="Number">Number</option>
                        <option value="Volume">Volume</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setNewTakeOffOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateTakeOff}>
                      Create
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <CollapsibleContent>
              <div className="space-y-2">
                {takeoffs.map(takeoff => (
                  <div key={takeoff.id} className="p-2 rounded-lg border hover:bg-muted/50">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">{takeoff.name}</p>
                      <Badge 
                        variant={takeoff.status === 'complete' ? 'default' : 'secondary'} 
                        className="text-xs"
                      >
                        {takeoff.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{takeoff.type}</span>
                      <span className="font-medium">{takeoff.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      </ScrollArea>
    </div>
  );
};