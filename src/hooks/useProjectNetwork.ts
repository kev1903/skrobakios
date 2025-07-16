import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface NetworkNode {
  id: string;
  project_id: string;
  task_name: string;
  description?: string;
  duration_days: number;
  progress_percentage: number;
  status: string;
  position_x: number;
  position_y: number;
  position_z: number;
  node_type: string;
  color: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface NetworkDependency {
  id: string;
  project_id: string;
  predecessor_node_id: string;
  successor_node_id: string;
  dependency_type: string;
  lag_days: number;
  criticality: number;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface AIState {
  id: string;
  project_id: string;
  ai_suggestions: any;
  simulation_state: any;
  optimization_history: any;
  last_ai_update: string;
}

export const useProjectNetwork = (projectId: string) => {
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [dependencies, setDependencies] = useState<NetworkDependency[]>([]);
  const [aiState, setAiState] = useState<AIState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch network data
  const fetchNetworkData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch nodes
      const { data: nodesData, error: nodesError } = await supabase
        .from('project_network_nodes')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (nodesError) throw nodesError;

      // Fetch dependencies
      const { data: depsData, error: depsError } = await supabase
        .from('project_network_dependencies')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (depsError) throw depsError;

      // Fetch AI state
      const { data: aiData, error: aiError } = await supabase
        .from('project_network_ai_state')
        .select('*')
        .eq('project_id', projectId)
        .maybeSingle();

      if (aiError && aiError.code !== 'PGRST116') throw aiError;

      setNodes(nodesData || []);
      setDependencies(depsData || []);
      setAiState(aiData);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error loading network data",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    fetchNetworkData();

    // Subscribe to nodes changes
    const nodesChannel = supabase
      .channel('project_network_nodes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_network_nodes',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          console.log('Nodes change:', payload);
          fetchNetworkData();
        }
      )
      .subscribe();

    // Subscribe to dependencies changes
    const depsChannel = supabase
      .channel('project_network_deps_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_network_dependencies',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          console.log('Dependencies change:', payload);
          fetchNetworkData();
        }
      )
      .subscribe();

    // Subscribe to AI state changes
    const aiChannel = supabase
      .channel('project_network_ai_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_network_ai_state',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          console.log('AI state change:', payload);
          fetchNetworkData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(nodesChannel);
      supabase.removeChannel(depsChannel);
      supabase.removeChannel(aiChannel);
    };
  }, [projectId]);

  // Update node
  const updateNode = async (nodeId: string, updates: Partial<NetworkNode>) => {
    try {
      const { error } = await supabase
        .from('project_network_nodes')
        .update(updates)
        .eq('id', nodeId);

      if (error) throw error;

      toast({
        title: "Node updated successfully",
        description: "The network node has been updated.",
      });
    } catch (err: any) {
      toast({
        title: "Error updating node",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  // Create dependency
  const createDependency = async (dependency: Omit<NetworkDependency, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('project_network_dependencies')
        .insert(dependency);

      if (error) throw error;

      toast({
        title: "Dependency created",
        description: "New task dependency has been created.",
      });
    } catch (err: any) {
      toast({
        title: "Error creating dependency",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  // Delete dependency
  const deleteDependency = async (dependencyId: string) => {
    try {
      const { error } = await supabase
        .from('project_network_dependencies')
        .delete()
        .eq('id', dependencyId);

      if (error) throw error;

      toast({
        title: "Dependency deleted",
        description: "Task dependency has been removed.",
      });
    } catch (err: any) {
      toast({
        title: "Error deleting dependency",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  // AI orchestration functions
  const sendAICommand = async (action: string, data: any = {}) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Authentication required');

      const response = await fetch('/functions/v1/skai-network-orchestrator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action,
          projectId,
          nodes,
          dependencies,
          ...data,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI request failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'AI request failed');
      }

      toast({
        title: "AI command completed",
        description: "Skai AI has processed your request successfully.",
      });

      return result;
    } catch (err: any) {
      toast({
        title: "AI command failed",
        description: err.message,
        variant: "destructive",
      });
      throw err;
    }
  };

  return {
    nodes,
    dependencies,
    aiState,
    isLoading,
    error,
    updateNode,
    createDependency,
    deleteDependency,
    sendAICommand,
    refreshData: fetchNetworkData,
  };
};