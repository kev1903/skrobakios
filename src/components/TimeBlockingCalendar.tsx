import React, { useState, useCallback, useEffect } from 'react';
import { CalendarGrid } from './calendar/CalendarGrid';
import { TimeBlockDialog } from './calendar/TimeBlockDialog';
import { TimeBlock, NewTimeBlock } from './calendar/types';
import { getCalendarData, createTimeBlock, categoryColors } from './calendar/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTimeTracking } from '@/hooks/useTimeTracking';

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
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { settings } = useTimeTracking();
  
  // Get category colors from time tracking settings
  const categoryColors = settings?.category_colors || {
    work: '#3b82f6',
    personal: '#10b981',
    meeting: '#8b5cf6',
    break: '#f59e0b',
    family: '#ec4899',
    site_visit: '#f97316',
    church: '#6366f1',
    rest: '#6b7280'
  };
  
  const [newBlock, setNewBlock] = useState<NewTimeBlock>({
    title: '',
    description: '',
    dayOfWeek: 0,
    startTime: '09:00',
    endTime: '10:00',
    category: 'work',
    color: 'bg-blue-400'
  });

  // Load time blocks from database
  const loadTimeBlocks = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('time_blocks')
        .select('*')
        .order('day_of_week', { ascending: true });

      if (error) throw error;

      const formattedBlocks: TimeBlock[] = data?.map(block => ({
        id: block.id,
        title: block.title,
        description: block.description || '',
        dayOfWeek: block.day_of_week,
        startTime: block.start_time,
        endTime: block.end_time,
        category: block.category as TimeBlock['category'],
        color: block.color
      })) || [];

      setTimeBlocks(formattedBlocks);
    } catch (error) {
      console.error('Error loading time blocks:', error);
      toast({
        title: "Error",
        description: "Failed to load time blocks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Load time blocks on component mount
  useEffect(() => {
    loadTimeBlocks();
  }, [loadTimeBlocks]);

  const { paddedDays, isCurrentPeriod } = getCalendarData(currentDate, viewMode);

  const handleDayClick = useCallback((day: Date) => {
    setSelectedDate(day);
    setEditingBlock(null);
    setNewBlock({
      title: '',
      description: '',
      dayOfWeek: day.getDay(),
      startTime: '09:00',
      endTime: '10:00',
      category: 'work',
      color: 'bg-blue-400'
    });
    setIsDialogOpen(true);
  }, []);

  const handleCreateTimeBlock = useCallback(async () => {
    if (!newBlock.title) return;

    try {
      const { data, error } = await supabase
        .from('time_blocks')
        .insert({
          title: newBlock.title,
          description: newBlock.description || null,
          day_of_week: newBlock.dayOfWeek,
          start_time: newBlock.startTime,
          end_time: newBlock.endTime,
          category: newBlock.category,
          color: newBlock.color,
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const formattedBlock: TimeBlock = {
          id: data.id,
          title: data.title,
          description: data.description || '',
          dayOfWeek: data.day_of_week,
          startTime: data.start_time,
          endTime: data.end_time,
          category: data.category as TimeBlock['category'],
          color: data.color
        };

        setTimeBlocks(prev => [...prev, formattedBlock]);
        toast({
          title: "Success",
          description: "Time block created successfully"
        });
      }

      setIsDialogOpen(false);
      setNewBlock({
        title: '',
        description: '',
        dayOfWeek: 0,
        startTime: '09:00',
        endTime: '10:00',
        category: 'work',
        color: 'bg-blue-400'
      });
    } catch (error) {
      console.error('Error creating time block:', error);
      toast({
        title: "Error",
        description: "Failed to create time block",
        variant: "destructive"
      });
    }
  }, [newBlock, toast]);

  const handleEditTimeBlock = useCallback((block: TimeBlock) => {
    setEditingBlock(block);
    setSelectedDate(null); // No longer need specific date
    setNewBlock({
      title: block.title,
      description: block.description || '',
      dayOfWeek: block.dayOfWeek,
      startTime: block.startTime,
      endTime: block.endTime,
      category: block.category,
      color: block.color
    });
    setIsDialogOpen(true);
  }, []);

  const handleUpdateTimeBlock = useCallback(async () => {
    if (!editingBlock) return;

    try {
      const { data, error } = await supabase
        .from('time_blocks')
        .update({
          title: newBlock.title,
          description: newBlock.description || null,
          day_of_week: newBlock.dayOfWeek,
          start_time: newBlock.startTime,
          end_time: newBlock.endTime,
          category: newBlock.category,
          color: newBlock.color
        })
        .eq('id', editingBlock.id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const updatedBlock: TimeBlock = {
          id: data.id,
          title: data.title,
          description: data.description || '',
          dayOfWeek: data.day_of_week,
          startTime: data.start_time,
          endTime: data.end_time,
          category: data.category as TimeBlock['category'],
          color: data.color
        };

        setTimeBlocks(prev => prev.map(block => 
          block.id === editingBlock.id ? updatedBlock : block
        ));
        
        toast({
          title: "Success",
          description: "Time block updated successfully"
        });
      }

      setIsDialogOpen(false);
      setEditingBlock(null);
    } catch (error) {
      console.error('Error updating time block:', error);
      toast({
        title: "Error",
        description: "Failed to update time block",
        variant: "destructive"
      });
    }
  }, [editingBlock, newBlock, toast]);

  const handleDeleteTimeBlock = useCallback(async (blockId: string) => {
    try {
      const { error } = await supabase
        .from('time_blocks')
        .delete()
        .eq('id', blockId);

      if (error) throw error;

      setTimeBlocks(prev => prev.filter(block => block.id !== blockId));
      toast({
        title: "Success",
        description: "Time block deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting time block:', error);
      toast({
        title: "Error",
        description: "Failed to delete time block",
        variant: "destructive"
      });
    }
  }, [toast]);

  const handleBlockChange = useCallback((changes: Partial<NewTimeBlock>) => {
    setNewBlock(prev => ({ ...prev, ...changes }));
  }, []);

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading time blocks...</div>
        </div>
      ) : (
        <CalendarGrid
          paddedDays={paddedDays}
          viewMode={viewMode}
          isCurrentPeriod={isCurrentPeriod}
          timeBlocks={timeBlocks}
          onDayClick={handleDayClick}
          onBlockEdit={handleEditTimeBlock}
          categoryColors={categoryColors}
        />
      )}

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