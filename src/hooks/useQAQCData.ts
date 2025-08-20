import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Hook for fetching checklists
export const useChecklists = (projectId: string) => {
  return useQuery({
    queryKey: ['checklists', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('qaqc_checklists')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });
};

// Hook for fetching RFIs
export const useRFIs = (projectId: string) => {
  return useQuery({
    queryKey: ['rfis', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rfis')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });
};

// Hook for fetching Issues/NCRs
export const useIssues = (projectId: string) => {
  return useQuery({
    queryKey: ['issues', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });
};

// Hook for fetching a single issue by ID
export const useIssue = (issueId: string) => {
  return useQuery({
    queryKey: ['issue', issueId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('id', issueId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!issueId,
  });
};

// Hook for fetching Defects
export const useDefects = (projectId: string) => {
  return useQuery({
    queryKey: ['defects', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('defects')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });
};

// Hook for fetching Quality Inspections
export const useQualityInspections = (projectId: string) => {
  return useQuery({
    queryKey: ['quality_inspections', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quality_inspections')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });
};

// Hook for fetching Quality Plans
export const useQualityPlans = (projectId: string) => {
  return useQuery({
    queryKey: ['quality_plans', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quality_plans')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });
};

// NEW: Hook for fetching Issue Reports (parent containers of Issues)
export const useIssueReports = (projectId: string) => {
  return useQuery({
    queryKey: ['issue_reports', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('issue_reports')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });
};

// NEW: Hook for fetching a single Issue Report by ID
export const useIssueReport = (reportId: string) => {
  return useQuery({
    queryKey: ['issue_report', reportId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('issue_reports')
        .select('*')
        .eq('id', reportId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!reportId,
  });
};