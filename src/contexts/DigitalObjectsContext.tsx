import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCompany } from '@/contexts/CompanyContext';

export interface DigitalObject {
  id: string;
  name: string;
  object_type: string;
  description: string | null;
  status: string;
  stage: string;
  level: number;
  parent_id: string | null;
  expanded?: boolean;
  project_id?: string | null;
}

interface DigitalObjectsContextType {
  digitalObjects: DigitalObject[];
  loading: boolean;
  refreshDigitalObjects: () => Promise<void>;
  getDigitalObjectsByProject: (projectId: string) => DigitalObject[];
}

const DigitalObjectsContext = createContext<DigitalObjectsContextType | undefined>(undefined);

export const useDigitalObjectsContext = () => {
  const context = useContext(DigitalObjectsContext);
  if (!context) {
    throw new Error('useDigitalObjectsContext must be used within a DigitalObjectsProvider');
  }
  return context;
};

interface DigitalObjectsProviderProps {
  children: ReactNode;
}

export const DigitalObjectsProvider = ({ children }: DigitalObjectsProviderProps) => {
  const [digitalObjects, setDigitalObjects] = useState<DigitalObject[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { currentCompany } = useCompany();

  const loadDigitalObjects = async () => {
    if (!currentCompany) {
      setDigitalObjects([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('digital_objects')
        .select('*')
        .eq('company_id', currentCompany.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading digital objects:', error);
        toast({
          title: "Error",
          description: "Failed to load digital objects",
          variant: "destructive",
        });
        return;
      }

      const mappedData: DigitalObject[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        object_type: item.object_type,
        description: item.description,
        status: item.status,
        stage: item.stage,
        level: item.level,
        parent_id: item.parent_id,
        expanded: item.expanded ?? true,
        project_id: item.project_id
      }));

      setDigitalObjects(mappedData);
    } catch (error) {
      console.error('Error loading digital objects:', error);
      toast({
        title: "Error",
        description: "Failed to load digital objects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshDigitalObjects = async () => {
    await loadDigitalObjects();
  };

  const getDigitalObjectsByProject = (projectId: string) => {
    return digitalObjects.filter(obj => obj.project_id === projectId);
  };

  // Set up real-time subscription
  useEffect(() => {
    loadDigitalObjects();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('digital-objects-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'digital_objects'
        },
        (payload) => {
          console.log('Digital objects change detected:', payload);
          // Refresh data when changes occur
          loadDigitalObjects();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentCompany]);

  const value = {
    digitalObjects,
    loading,
    refreshDigitalObjects,
    getDigitalObjectsByProject
  };

  return (
    <DigitalObjectsContext.Provider value={value}>
      {children}
    </DigitalObjectsContext.Provider>
  );
};