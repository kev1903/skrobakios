import React, { useState, useCallback, useEffect } from 'react';
import { CalendarGrid } from './calendar/CalendarGrid';
import { TimeBlockDialog } from './calendar/TimeBlockDialog';
import { TimeBlock, NewTimeBlock } from './calendar/types';
import { getCalendarData, createTimeBlock, categoryColors } from './calendar/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTimeTracking } from '@/hooks/useTimeTracking';
import { useCompany } from '@/contexts/CompanyContext';
import { Button } from '@/components/ui/button';

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
  const { currentCompany } = useCompany();
  
  // Use consistent category colors from utils
  const calendarCategoryColors = categoryColors;
  
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
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        setTimeBlocks([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('time_blocks')
        .select('*')
        .eq('user_id', user.user.id)
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

  // Load time blocks on component mount only
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
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        throw new Error('User not authenticated');
      }

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
          user_id: user.user.id
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

  const handleCopyMondayBlocks = useCallback(async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      // Get Monday blocks (day_of_week = 1)
      const { data: mondayBlocks, error: fetchError } = await supabase
        .from('time_blocks')
        .select('*')
        .eq('user_id', user.user.id)
        .eq('day_of_week', 1);

      if (fetchError) throw fetchError;

      if (!mondayBlocks || mondayBlocks.length === 0) {
        toast({
          title: "No Monday blocks",
          description: "Create some Monday time blocks first to copy them",
          variant: "destructive"
        });
        return;
      }

      // Delete existing blocks for Tuesday-Friday (days 2-5)
      const { error: deleteError } = await supabase
        .from('time_blocks')
        .delete()
        .eq('user_id', user.user.id)
        .in('day_of_week', [2, 3, 4, 5]);

      if (deleteError) throw deleteError;

      // Create new blocks for Tuesday-Friday
      const newBlocks = [];
      for (const mondayBlock of mondayBlocks) {
        for (const dayOfWeek of [2, 3, 4, 5]) { // Tuesday to Friday
          newBlocks.push({
            title: mondayBlock.title,
            description: mondayBlock.description,
            day_of_week: dayOfWeek,
            start_time: mondayBlock.start_time,
            end_time: mondayBlock.end_time,
            category: mondayBlock.category,
            color: mondayBlock.color,
            user_id: user.user.id
          });
        }
      }

      const { error: insertError } = await supabase
        .from('time_blocks')
        .insert(newBlocks);

      if (insertError) throw insertError;
      
      // Reload time blocks to show the copied blocks
      await loadTimeBlocks();
      
      toast({
        title: "Success",
        description: "Monday time blocks copied to Tuesday-Friday"
      });
    } catch (error) {
      console.error('Error copying Monday blocks:', error);
      toast({
        title: "Error",
        description: "Failed to copy Monday blocks",
        variant: "destructive"
      });
    }
  }, [loadTimeBlocks, toast]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Time Blocking Calendar
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleCopyMondayBlocks}
          className="text-xs"
        >
          Copy Monday to Weekdays
        </Button>
      </div>
      
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
          categoryColors={calendarCategoryColors}
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
    </div>
  );
};