import React from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Clock, Trash2, Palette } from 'lucide-react';
import { TimeBlock, NewTimeBlock } from './types';

// Muted color palette for time blocks
const colorOptions = [
  { name: 'Dusty Blue', value: '200 30% 75%', hex: '#b3c5d1' },
  { name: 'Muted Mint', value: '160 25% 70%', hex: '#a8c5b5' },
  { name: 'Pale Lavender', value: '280 20% 75%', hex: '#c4b8d1' },
  { name: 'Soft Peach', value: '25 35% 80%', hex: '#e6c4a8' },
  { name: 'Dusty Rose', value: '340 25% 82%', hex: '#e0c0c8' },
  { name: 'Soft Teal', value: '180 25% 72%', hex: '#a8c5c5' },
  { name: 'Gentle Purple', value: '270 20% 78%', hex: '#c8bdd6' },
  { name: 'Warm Gray', value: '220 15% 75%', hex: '#bdc0c7' },
  { name: 'Sage Green', value: '140 20% 70%', hex: '#a8bfad' },
  { name: 'Soft Coral', value: '15 30% 78%', hex: '#d9b8a8' },
  { name: 'Muted Gold', value: '45 25% 75%', hex: '#cfc4a8' },
  { name: 'Powder Blue', value: '190 25% 78%', hex: '#b3cdd6' },
  { name: 'Blush Pink', value: '350 20% 80%', hex: '#d6c0c4' },
  { name: 'Seafoam', value: '170 20% 72%', hex: '#a8c7c0' },
  { name: 'Soft Mauve', value: '320 18% 75%', hex: '#d1bcc4' },
  { name: 'Gentle Olive', value: '80 15% 70%', hex: '#b8bfa8' }
];

// Auto-assign colors to categories - Bright and contrasted
const categoryColors = {
  work: '210 100% 65%',         // Bright Blue
  personal: '150 100% 60%',     // Bright Green
  meeting: '280 100% 70%',      // Bright Purple
  break: '30 100% 70%',         // Bright Orange
  family: '340 100% 75%',       // Bright Pink
  site_visit: '190 100% 65%',   // Bright Cyan
  church: '260 100% 75%',       // Bright Violet
  rest: '240 100% 80%',         // Bright Light Blue
  exercise: '120 100% 50%'      // Bright Forest Green
};

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
            {editingBlock ? 'Edit Weekly Time Block' : 'Create Weekly Time Block'}
            <span className="text-muted-foreground text-sm ml-2">
              (repeats every week)
            </span>
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
              onBlockChange({ 
                category: value,
                color: categoryColors[value]
              })
            }>
              <SelectTrigger className="input-glass">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-card bg-card border border-border z-50">
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="break">Break</SelectItem>
                <SelectItem value="family">Family</SelectItem>
                <SelectItem value="site_visit">Site Visit</SelectItem>
                <SelectItem value="church">Church</SelectItem>
                <SelectItem value="rest">Rest</SelectItem>
                <SelectItem value="exercise">Exercise</SelectItem>
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