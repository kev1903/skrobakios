import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ScheduleSection {
  id: string;
  schedule_id: string;
  name: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const useScheduleSections = (scheduleId: string) => {
  const [sections, setSections] = useState<ScheduleSection[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSections = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('schedule_sections')
        .select('*')
        .eq('schedule_id', scheduleId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setSections(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching sections",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (scheduleId) {
      fetchSections();
    }
  }, [scheduleId]);

  const createSection = async (name: string) => {
    try {
      const { data, error } = await supabase
        .from('schedule_sections')
        .insert({
          schedule_id: scheduleId,
          name,
          display_order: sections.length,
        })
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Section created",
        description: `${name} section has been created.`,
      });
      
      await fetchSections();
      return data;
    } catch (error: any) {
      toast({
        title: "Error creating section",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateSection = async (id: string, name: string) => {
    try {
      const { error } = await supabase
        .from('schedule_sections')
        .update({ name })
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Section updated",
        description: "Section has been updated successfully.",
      });
      
      await fetchSections();
    } catch (error: any) {
      toast({
        title: "Error updating section",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteSection = async (id: string) => {
    try {
      const { error } = await supabase
        .from('schedule_sections')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Section deleted",
        description: "Section has been deleted successfully.",
      });
      
      await fetchSections();
    } catch (error: any) {
      toast({
        title: "Error deleting section",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    sections,
    loading,
    createSection,
    updateSection,
    deleteSection,
    refetch: fetchSections,
  };
};
