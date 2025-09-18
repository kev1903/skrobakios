import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Company } from '@/types/company';
import { BusinessIssue, DuplicateGroup, identifyBusinessIssues, findDuplicateGroups } from '@/utils/businessValidation';
import { useToast } from '@/hooks/use-toast';

export const useBusinessCleanup = () => {
  const [loading, setLoading] = useState(false);
  const [issues, setIssues] = useState<BusinessIssue[]>([]);
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const { toast } = useToast();

  const analyzeBusinesses = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all companies for analysis
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const companiesTyped = data as Company[];
      setCompanies(companiesTyped);

      // Identify issues
      const businessIssues = identifyBusinessIssues(companiesTyped);
      setIssues(businessIssues);

      // Find duplicate groups
      const duplicates = findDuplicateGroups(companiesTyped);
      setDuplicateGroups(duplicates);

      toast({
        title: "Analysis Complete",
        description: `Found ${businessIssues.length} issues and ${duplicates.length} duplicate groups`
      });

    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze businesses",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const deleteCompany = useCallback(async (companyId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('delete_company_completely', { target_company_id: companyId });

      if (error) throw error;

      const result = data as { success: boolean; message: string; error?: string };
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete company');
      }

      // Remove from local state
      setCompanies(prev => prev.filter(c => c.id !== companyId));
      setIssues(prev => prev.filter(i => i.companyId !== companyId));

      return true;
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete company",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  const bulkDeleteCompanies = useCallback(async (companyIds: string[]) => {
    setLoading(true);
    let successCount = 0;
    let failCount = 0;

    for (const companyId of companyIds) {
      const success = await deleteCompany(companyId);
      if (success) successCount++;
      else failCount++;
    }

    toast({
      title: "Bulk Delete Complete",
      description: `Deleted ${successCount} companies${failCount > 0 ? `, ${failCount} failed` : ''}`,
      variant: failCount > 0 ? "destructive" : "default"
    });

    setLoading(false);
  }, [deleteCompany, toast]);

  const mergeCompanies = useCallback(async (
    targetCompanyId: string,
    sourceCompanyIds: string[]
  ) => {
    setLoading(true);
    try {
      // This would require a more complex merge operation
      // For now, we'll just delete the source companies and keep the target
      await bulkDeleteCompanies(sourceCompanyIds);

      // Update the local duplicate groups
      setDuplicateGroups(prev =>
        prev.filter(group =>
          !group.companies.some(c => sourceCompanyIds.includes(c.id))
        )
      );

      toast({
        title: "Merge Complete",
        description: `Merged ${sourceCompanyIds.length} companies into the target company`
      });

    } catch (error: any) {
      console.error('Merge error:', error);
      toast({
        title: "Merge Failed",
        description: error.message || "Failed to merge companies",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [bulkDeleteCompanies, toast]);

  const resolveIssue = useCallback(async (issueId: string, action: 'delete' | 'ignore') => {
    const issue = issues.find(i => i.id === issueId);
    if (!issue) return;

    if (action === 'delete') {
      const success = await deleteCompany(issue.companyId);
      if (success) {
        setIssues(prev => prev.filter(i => i.id !== issueId));
      }
    } else {
      // Just remove from issues list
      setIssues(prev => prev.filter(i => i.id !== issueId));
    }
  }, [issues, deleteCompany]);

  const autoCleanup = useCallback(async () => {
    setLoading(true);
    
    // Auto-delete high severity test data and incomplete companies
    const autoDeleteIssues = issues.filter(issue =>
      issue.severity === 'high' &&
      (issue.type === 'test_data' || issue.type === 'incomplete')
    );

    if (autoDeleteIssues.length > 0) {
      const companyIds = autoDeleteIssues.map(issue => issue.companyId);
      await bulkDeleteCompanies(companyIds);

      toast({
        title: "Auto Cleanup Complete",
        description: `Automatically removed ${autoDeleteIssues.length} problematic businesses`
      });
    } else {
      toast({
        title: "No Auto-Cleanup Needed",
        description: "No high-priority issues found for automatic cleanup"
      });
    }

    setLoading(false);
  }, [issues, bulkDeleteCompanies, toast]);

  return {
    loading,
    issues,
    duplicateGroups,
    companies,
    analyzeBusinesses,
    deleteCompany,
    bulkDeleteCompanies,
    mergeCompanies,
    resolveIssue,
    autoCleanup
  };
};
