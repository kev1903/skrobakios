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

// Auto-assign colors to categories
const categoryColors = {
  work: '200 30% 75%',          // Soft Blue-Gray  
  personal: '160 25% 70%',      // Muted Mint
  meeting: '280 20% 75%',       // Pale Lavender
  break: '25 35% 80%',          // Soft Peach
  family: '340 25% 82%',        // Dusty Rose
  site_visit: '180 25% 72%',    // Soft Teal
  church: '270 20% 78%',        // Gentle Purple
  rest: '220 15% 75%',          // Warm Gray
  // Additional categories from your calendar
  sleep: '220 15% 75%',         // Warm Gray
  devotion: '45 25% 75%',       // Muted Gold
  'get ready': '340 25% 82%',   // Dusty Rose
  'site visit': '180 25% 72%',  // Soft Teal
  'deep work': '160 25% 70%',   // Muted Mint
  lunch: '25 35% 80%',          // Soft Peach
  // Case variations
  Sleep: '220 15% 75%',
  Devotion: '45 25% 75%',
  'Get Ready': '340 25% 82%',
  'Site Visit': '180 25% 72%',
  'Deep Work': '160 25% 70%',
  Lunch: '25 35% 80%',
  Church: '270 20% 78%',
  Work: '200 30% 75%'
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