import React, { useState, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Clock, Edit, Trash2 } from 'lucide-react';

interface TimeBlock {
  id: string;
  title: string;
  description?: string;
  date: Date;
  startTime: string;
  endTime: string;
  category: 'work' | 'personal' | 'meeting' | 'break';
  color: string;
}

interface TimeBlockingCalendarProps {
  currentDate: Date;
  viewMode: 'week' | 'month';
  onMonthChange: (date: Date) => void;
}

const categoryColors = {
  work: 'bg-blue-500',
  personal: 'bg-green-500', 
  meeting: 'bg-purple-500',
  break: 'bg-orange-500'
};

export const TimeBlockingCalendar = ({ currentDate, viewMode, onMonthChange }: TimeBlockingCalendarProps) => {
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null);
  
  const [newBlock, setNewBlock] = useState({
    title: '',
    description: '',
    startTime: '09:00',
    endTime: '10:00',
    category: 'work' as TimeBlock['category']
  });

  // Calculate days based on view mode
  const getDaysForView = () => {
    if (viewMode === 'week') {
      const weekStart = startOfWeek(currentDate);
      const weekEnd = endOfWeek(currentDate);
      return {
        days: eachDayOfInterval({ start: weekStart, end: weekEnd }),
        paddedDays: eachDayOfInterval({ start: weekStart, end: weekEnd }),
        isCurrentPeriod: () => true // All days in week view are current
      };
    } else {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
      const startDayOfWeek = monthStart.getDay();
      const paddedDays = [
        ...Array(startDayOfWeek).fill(null),
        ...days
      ];
      return {
        days,
        paddedDays,
        isCurrentPeriod: (day: Date) => isSameMonth(day, currentDate)
      };
    }
  };

  const { days, paddedDays, isCurrentPeriod } = getDaysForView();

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleDayClick = useCallback((day: Date) => {
    setSelectedDate(day);
    setEditingBlock(null);
    setNewBlock({
      title: '',
      description: '',
      startTime: '09:00',
      endTime: '10:00',
      category: 'work'
    });
    setIsDialogOpen(true);
  }, []);

  const handleCreateTimeBlock = useCallback(() => {
    if (!selectedDate || !newBlock.title) return;

    const timeBlock: TimeBlock = {
      id: Date.now().toString(),
      title: newBlock.title,
      description: newBlock.description,
      date: selectedDate,
      startTime: newBlock.startTime,
      endTime: newBlock.endTime,
      category: newBlock.category,
      color: categoryColors[newBlock.category]
    };

    setTimeBlocks(prev => [...prev, timeBlock]);
    setIsDialogOpen(false);
    setNewBlock({
      title: '',
      description: '',
      startTime: '09:00',
      endTime: '10:00',
      category: 'work'
    });
  }, [selectedDate, newBlock]);

  const handleEditTimeBlock = useCallback((block: TimeBlock) => {
    setEditingBlock(block);
    setSelectedDate(block.date);
    setNewBlock({
      title: block.title,
      description: block.description || '',
      startTime: block.startTime,
      endTime: block.endTime,
      category: block.category
    });
    setIsDialogOpen(true);
  }, []);

  const handleUpdateTimeBlock = useCallback(() => {
    if (!editingBlock) return;

    const updatedBlock: TimeBlock = {
      ...editingBlock,
      title: newBlock.title,
      description: newBlock.description,
      startTime: newBlock.startTime,
      endTime: newBlock.endTime,
      category: newBlock.category,
      color: categoryColors[newBlock.category]
    };

    setTimeBlocks(prev => prev.map(block => 
      block.id === editingBlock.id ? updatedBlock : block
    ));
    setIsDialogOpen(false);
    setEditingBlock(null);
  }, [editingBlock, newBlock]);

  const handleDeleteTimeBlock = useCallback((blockId: string) => {
    setTimeBlocks(prev => prev.filter(block => block.id !== blockId));
  }, []);

  const getBlocksForDay = useCallback((day: Date) => {
    return timeBlocks.filter(block => isSameDay(block.date, day));
  }, [timeBlocks]);

  return (
    <div className="h-full flex flex-col">
      {/* Calendar Header */}
      <div className="grid grid-cols-7 gap-px mb-2">
        {weekDays.map(day => (
          <div key={day} className="p-3 text-center text-muted-foreground font-semibold text-lg bg-muted/20 rounded-lg">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 grid grid-cols-7 gap-px bg-border/30 rounded-lg overflow-hidden">
        {paddedDays.map((day, index) => {
          if (!day) {
            return <div key={index} className="bg-muted/10"></div>;
          }

          const dayBlocks = getBlocksForDay(day);
          const isCurrentPeriodDay = isCurrentPeriod(day);
          const isDayToday = isToday(day);

          return (
            <div
              key={day.toISOString()}
              className={`bg-card/80 backdrop-blur-sm p-2 cursor-pointer hover:bg-accent/50 transition-colors ${
                viewMode === 'week' ? 'min-h-[200px]' : 'min-h-[120px]'
              } flex flex-col ${
                !isCurrentPeriodDay ? 'opacity-40' : ''
              } ${isDayToday ? 'ring-2 ring-primary' : ''}`}
              onClick={() => handleDayClick(day)}
            >
              <div className={`text-sm font-medium mb-2 ${
                isDayToday ? 'text-primary font-bold' : 'text-card-foreground'
              }`}>
                {viewMode === 'week' ? format(day, 'EEE d') : format(day, 'd')}
              </div>
              
              <div className="flex-1 space-y-1 overflow-y-auto">
                {dayBlocks.map(block => (
                  <div
                    key={block.id}
                    className={`${block.color} text-white text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditTimeBlock(block);
                    }}
                  >
                    <div className="font-medium truncate">{block.title}</div>
                    <div className="text-white/80">{block.startTime}-{block.endTime}</div>
                  </div>
                ))}
                
                {dayBlocks.length > 2 && (
                  <div className="text-xs text-muted-foreground">
                    +{dayBlocks.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time Block Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                onChange={(e) => setNewBlock(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter time block title"
                className="input-glass"
              />
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={newBlock.description}
                onChange={(e) => setNewBlock(prev => ({ ...prev, description: e.target.value }))}
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
                  onChange={(e) => setNewBlock(prev => ({ ...prev, startTime: e.target.value }))}
                  className="input-glass"
                />
              </div>

              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={newBlock.endTime}
                  onChange={(e) => setNewBlock(prev => ({ ...prev, endTime: e.target.value }))}
                  className="input-glass"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={newBlock.category} onValueChange={(value: TimeBlock['category']) => 
                setNewBlock(prev => ({ ...prev, category: value }))
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
                onClick={editingBlock ? handleUpdateTimeBlock : handleCreateTimeBlock}
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
                    handleDeleteTimeBlock(editingBlock.id);
                    setIsDialogOpen(false);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};