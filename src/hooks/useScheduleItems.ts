import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ScheduleItem {
  id: string;
  section_id: string;
  product_code: string | null;
  product_name: string | null;
  width: string | null;
  length: string | null;
  height: string | null;
  depth: string | null;
  qty: string | null;
  lead_time: string | null;
  brand: string | null;
  color: string | null;
  finish: string | null;
  material: string | null;
  supplier: string | null;
  url: string | null;
  image_url: string | null;
  price: number | null;
  status: string | null;
  created_at: string;
  updated_at: string;
}

export const useScheduleItems = (sectionId?: string) => {
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchItems = async () => {
    if (!sectionId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('schedule_items')
        .select('*')
        .eq('section_id', sectionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      toast({
        title: "Error fetching items",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [sectionId]);

  const createItem = async (sectionId: string, itemData?: Partial<ScheduleItem>) => {
    try {
      const { data, error } = await supabase
        .from('schedule_items')
        .insert({
          section_id: sectionId,
          status: 'Draft',
          ...itemData,
        })
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Product added",
        description: "Product has been added to the section.",
      });
      
      await fetchItems();
      return data;
    } catch (error: any) {
      toast({
        title: "Error adding product",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateItem = async (id: string, itemData: Partial<ScheduleItem>) => {
    try {
      const { error } = await supabase
        .from('schedule_items')
        .update(itemData)
        .eq('id', id);

      if (error) throw error;
      
      await fetchItems();
    } catch (error: any) {
      toast({
        title: "Error updating product",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('schedule_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Product deleted",
        description: "Product has been deleted successfully.",
      });
      
      await fetchItems();
    } catch (error: any) {
      toast({
        title: "Error deleting product",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    items,
    loading,
    createItem,
    updateItem,
    deleteItem,
    refetch: fetchItems,
  };
};
