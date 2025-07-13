import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Upload, FileText, Eye, Trash2, Plus } from 'lucide-react';
import { DrawingFile } from '../hooks/useMultiplePDFUpload';

interface DrawingSidebarProps {
  onBack?: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  drawings: DrawingFile[];
  activeDrawingId: string | null;
  onSetActiveDrawing: (id: string) => void;
  onRemoveDrawing: (id: string) => void;
}

export const DrawingSidebar = ({ 
  onBack, 
  fileInputRef, 
  handleFileUpload, 
  drawings, 
  activeDrawingId, 
  onSetActiveDrawing, 
  onRemoveDrawing 
}: DrawingSidebarProps) => {
  const [newTakeOffOpen, setNewTakeOffOpen] = useState(false);
  const [newTakeOff, setNewTakeOff] = useState({
    description: '',
    type: 'Area' as 'Area' | 'Linear' | 'Number' | 'Volume'
  });

  const takeOffs = [
    { id: '1', name: 'Foundation Areas', type: 'Area', quantity: '45.5 M²', status: 'complete' },
    { id: '2', name: 'Wall Lengths', type: 'Linear', quantity: '180 m', status: 'complete' },
    { id: '3', name: 'Door Count', type: 'Count', quantity: '8 units', status: 'pending' },
  ];

  const handleCreateTakeOff = () => {
    // Here you would typically save the new take-off
    console.log('Creating new take-off:', newTakeOff);
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
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Drawings</h3>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".pdf" 
            multiple 
            className="hidden" 
          />
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {/* Drawings Section */}
        <div className="p-4 border-b border-border">
          <h4 className="font-medium text-sm mb-3 text-muted-foreground uppercase tracking-wide">Drawings</h4>
          <div className="space-y-2">
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
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveDrawing(drawing.id);
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground">No drawings uploaded</p>
            )}
          </div>
        </div>

        {/* Take-Offs Section */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Take-Offs</h4>
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
          <div className="space-y-2">
            {takeOffs.map(takeOff => (
              <div key={takeOff.id} className="p-2 rounded-lg border hover:bg-muted/50">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium">{takeOff.name}</p>
                  <Badge 
                    variant={takeOff.status === 'complete' ? 'default' : 'secondary'} 
                    className="text-xs"
                  >
                    {takeOff.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{takeOff.type}</span>
                  <span className="font-medium">{takeOff.quantity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};