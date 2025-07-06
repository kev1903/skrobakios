import React from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Clock, Trash2 } from 'lucide-react';
import { TimeBlock, NewTimeBlock } from './types';

interface TimeBlockDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  editingBlock: TimeBlock | null;
  newBlock: NewTimeBlock;
  onBlockChange: (block: Partial<NewTimeBlock>) => void;
  onCreateBlock: () => void;
  onUpdateBlock: () => void;
  onDeleteBlock: (blockId: string) => void;
}

export const TimeBlockDialog = ({
  isOpen,
  onClose,
  selectedDate,
  editingBlock,
  newBlock,
  onBlockChange,
  onCreateBlock,
  onUpdateBlock,
  onDeleteBlock
}: TimeBlockDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card">
        <DialogHeader>
          <DialogTitle className="text-card-foreground">
            {editingBlock ? 'Edit Time Block' : 'Create Time Block'}
            {selectedDate && (
              <span className="text-muted-foreground text-sm ml-2">
                for {format(selectedDate, 'MMMM d, yyyy')}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={newBlock.title}
              onChange={(e) => onBlockChange({ title: e.target.value })}
              placeholder="Enter time block title"
              className="input-glass"
            />
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={newBlock.description}
              onChange={(e) => onBlockChange({ description: e.target.value })}
              placeholder="Enter description"
              className="input-glass"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={newBlock.startTime}
                onChange={(e) => onBlockChange({ startTime: e.target.value })}
                className="input-glass"
              />
            </div>

            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={newBlock.endTime}
                onChange={(e) => onBlockChange({ endTime: e.target.value })}
                className="input-glass"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={newBlock.category} onValueChange={(value: TimeBlock['category']) => 
              onBlockChange({ category: value })
            }>
              <SelectTrigger className="input-glass">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-card">
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="break">Break</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              onClick={editingBlock ? onUpdateBlock : onCreateBlock}
              disabled={!newBlock.title}
              className="flex-1"
            >
              <Clock className="w-4 h-4 mr-2" />
              {editingBlock ? 'Update Block' : 'Create Block'}
            </Button>
            
            {editingBlock && (
              <Button
                variant="destructive"
                onClick={() => {
                  onDeleteBlock(editingBlock.id);
                  onClose();
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};