import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type SortDirection = 'asc' | 'desc';

interface SortPreference {
  sort_field: string;
  sort_direction: SortDirection;
}

export const useSortPreferences = <T extends string>(tableName: string, defaultField: T) => {
  const [sortField, setSortField] = useState<T>(defaultField);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load sort preferences from database
  useEffect(() => {
    const loadSortPreferences = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_sort_preferences')
        .select('sort_field, sort_direction')
        .eq('user_id', user.id)
        .eq('table_name', tableName)
        .maybeSingle();

      if (error) {
        console.error('Error loading sort preferences:', error);
      } else if (data) {
        setSortField(data.sort_field as T);
        setSortDirection(data.sort_direction as SortDirection);
      }
      
      setLoading(false);
    };

    loadSortPreferences();
  }, [tableName]);

  // Save sort preferences to database
  const saveSortPreferences = async (field: T, direction: SortDirection) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('user_sort_preferences')
      .upsert({
        user_id: user.id,
        table_name: tableName,
        sort_field: field,
        sort_direction: direction,
      }, {
        onConflict: 'user_id,table_name'
      });

    if (error) {
      console.error('Error saving sort preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save sort preferences",
        variant: "destructive",
      });
    }
  };

  const handleSort = async (field: T) => {
    let newDirection: SortDirection = 'asc';
    
    if (sortField === field) {
      newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      newDirection = 'asc';
    }

    setSortField(field as T);
    setSortDirection(newDirection);
    
    // Save to database
    await saveSortPreferences(field, newDirection);
  };

  return {
    sortField,
    sortDirection,
    handleSort,
    loading,
  };
};