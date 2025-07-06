import React, { useState, useCallback } from 'react';
import { CalendarGrid } from './calendar/CalendarGrid';
import { TimeBlockDialog } from './calendar/TimeBlockDialog';
import { TimeBlock, NewTimeBlock } from './calendar/types';
import { getCalendarData, createTimeBlock, categoryColors } from './calendar/utils';

interface TimeBlockingCalendarProps {
  currentDate: Date;
  viewMode: 'week' | 'month';
  onMonthChange: (date: Date) => void;
}

export const TimeBlockingCalendar = ({ currentDate, viewMode, onMonthChange }: TimeBlockingCalendarProps) => {
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null);
  
  const [newBlock, setNewBlock] = useState<NewTimeBlock>({
    title: '',
    description: '',
    startTime: '09:00',
    endTime: '10:00',
    category: 'work'
  });

  const { paddedDays, isCurrentPeriod } = getCalendarData(currentDate, viewMode);

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

    const timeBlock = createTimeBlock(selectedDate, newBlock);
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

  const handleBlockChange = useCallback((changes: Partial<NewTimeBlock>) => {
    setNewBlock(prev => ({ ...prev, ...changes }));
  }, []);

  return (
    <>
      <CalendarGrid
        paddedDays={paddedDays}
        viewMode={viewMode}
        isCurrentPeriod={isCurrentPeriod}
        timeBlocks={timeBlocks}
        onDayClick={handleDayClick}
        onBlockEdit={handleEditTimeBlock}
      />

      <TimeBlockDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        selectedDate={selectedDate}
        editingBlock={editingBlock}
        newBlock={newBlock}
        onBlockChange={handleBlockChange}
        onCreateBlock={handleCreateTimeBlock}
        onUpdateBlock={handleUpdateTimeBlock}
        onDeleteBlock={handleDeleteTimeBlock}
      />
    </>
  );
};