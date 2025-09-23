import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProjectLink {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  url: string;
  category: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectLinkData {
  project_id: string;
  title: string;
  description?: string;
  url: string;
  category: string;
}

export interface UpdateProjectLinkData {
  title?: string;
  description?: string;
  url?: string;
  category?: string;
}

export const useProjectLinks = (projectId?: string) => {
  const [links, setLinks] = useState<ProjectLink[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchLinks = async () => {
    if (!projectId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('project_links')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLinks(data || []);
    } catch (error) {
      console.error('Error fetching project links:', error);
      toast({
        title: "Error",
        description: "Failed to fetch project links",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createLink = async (linkData: CreateProjectLinkData) => {
    try {
      const { data, error } = await supabase
        .from('project_links')
        .insert([linkData])
        .select()
        .single();

      if (error) throw error;

      setLinks(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Link added successfully",
      });
      
      return data;
    } catch (error) {
      console.error('Error creating project link:', error);
      toast({
        title: "Error",
        description: "Failed to add link",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateLink = async (linkId: string, updateData: UpdateProjectLinkData) => {
    try {
      const { data, error } = await supabase
        .from('project_links')
        .update(updateData)
        .eq('id', linkId)
        .select()
        .single();

      if (error) throw error;

      setLinks(prev => prev.map(link => 
        link.id === linkId ? data : link
      ));
      
      toast({
        title: "Success",
        description: "Link updated successfully",
      });
      
      return data;
    } catch (error) {
      console.error('Error updating project link:', error);
      toast({
        title: "Error",
        description: "Failed to update link",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteLink = async (linkId: string) => {
    try {
      const { error } = await supabase
        .from('project_links')
        .delete()
        .eq('id', linkId);

      if (error) throw error;

      setLinks(prev => prev.filter(link => link.id !== linkId));
      toast({
        title: "Success",
        description: "Link deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting project link:', error);
      toast({
        title: "Error",
        description: "Failed to delete link",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchLinks();
  }, [projectId]);

  return {
    links,
    loading,
    createLink,
    updateLink,
    deleteLink,
    refetch: fetchLinks,
  };
};