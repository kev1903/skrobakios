import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DocumentCategory {
  id: string;
  name: string;
  description?: string;
  document_type: string;
  section_number: number;
  section_name: string;
  sort_order: number;
  is_active: boolean;
}

export const useDocumentCategories = () => {
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('document_categories')
        .select('*')
        .eq('is_active', true)
        .order('section_number', { ascending: true })
        .order('sort_order', { ascending: true });

      if (fetchError) throw fetchError;
      setCategories(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching document categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const getCategoriesBySection = (sectionNumber: number) => {
    return categories.filter(cat => cat.section_number === sectionNumber);
  };

  const getSections = () => {
    const sections = new Map<number, string>();
    categories.forEach(cat => {
      if (!sections.has(cat.section_number)) {
        sections.set(cat.section_number, cat.section_name);
      }
    });
    return Array.from(sections.entries()).map(([number, name]) => ({
      number,
      name
    }));
  };

  return {
    categories,
    loading,
    error,
    getCategoriesBySection,
    getSections,
    refetch: fetchCategories
  };
};