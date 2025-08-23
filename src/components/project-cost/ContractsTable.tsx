import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FileText, MoreHorizontal, Eye, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface Contract {
  id: string;
  name: string;
  file_url: string;
  file_path: string;
  created_at: string;
  file_size: number;
  status: string;
  confidence: number;
  contract_data: any;
  contract_amount: number;
}

interface ContractsTableProps {
  projectId: string;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
}

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'active':
      return 'default';
    case 'draft':
      return 'secondary';
    case 'expired':
      return 'destructive';
    default:
      return 'outline';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'active':
      return 'Active';
    case 'draft':
      return 'Draft';
    case 'expired':
      return 'Expired';
    default:
      return status;
  }
};

export const ContractsTable = ({ projectId, formatCurrency, formatDate }: ContractsTableProps) => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  const loadContracts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('project_contracts')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading contracts:', error);
        return;
      }

      setContracts(data || []);
    } catch (error) {
      console.error('Error loading contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseContractAmount = (contractData: any, contractAmount?: number) => {
    // Use stored contract_amount if available
    if (contractAmount && contractAmount > 0) {
      return contractAmount;
    }

    // Fallback to parsing from contract_data
    if (!contractData?.contract_value) return 0;
    
    const contractValue = contractData.contract_value;
    const numericValue = contractValue
      .replace(/[$,£€¥₹\s]/g, '') // Remove common currency symbols and spaces
      .replace(/[^\d.-]/g, ''); // Keep only digits, dots, and hyphens
    
    const parsed = parseFloat(numericValue);
    return isNaN(parsed) ? 0 : parsed;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const totalContractAmount = contracts.reduce((sum, contract) => {
    return sum + parseContractAmount(contract.contract_data, contract.contract_amount);
  }, 0);

  useEffect(() => {
    loadContracts();
  }, [projectId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {contracts.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Contracts Found</h3>
          <p className="text-muted-foreground">
            No contracts have been uploaded for this project yet.
          </p>
        </div>
      ) : (
        /* Contracts Table */
        <div className="bg-card border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 border-b">
                <th className="text-left px-4 py-2 text-sm font-medium text-muted-foreground">Contract Name</th>
                <th className="text-right px-4 py-2 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="text-left px-4 py-2 text-sm font-medium text-muted-foreground">Start Date</th>
                <th className="text-left px-4 py-2 text-sm font-medium text-muted-foreground">End Date</th>
                <th className="text-center px-4 py-2 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-center px-4 py-2 text-sm font-medium text-muted-foreground">Attachment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {contracts.map((contract) => (
                <tr key={contract.id} className="hover:bg-muted/20">
                  <td className="px-4 py-2 text-sm text-foreground truncate max-w-0" title={contract.name}>
                    {contract.name}
                  </td>
                  <td className="px-4 py-2 text-sm text-right font-semibold text-foreground">
                    {formatCurrency(parseContractAmount(contract.contract_data, contract.contract_amount))}
                  </td>
                  <td className="px-4 py-2 text-sm text-muted-foreground">
                    {contract.contract_data?.start_date ? formatDate(contract.contract_data.start_date) : '-'}
                  </td>
                  <td className="px-4 py-2 text-sm text-muted-foreground">
                    {contract.contract_data?.end_date ? formatDate(contract.contract_data.end_date) : '-'}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <Badge variant={getStatusBadgeVariant(contract.status)} className="text-xs">
                      {getStatusText(contract.status)}
                    </Badge>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(contract.file_url, '_blank')}
                      className="h-6 w-6 p-0 hover:bg-accent"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};