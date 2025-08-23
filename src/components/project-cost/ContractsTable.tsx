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
      {/* Summary Table */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50 border-b">
              <th className="text-left px-4 py-2 text-sm font-medium text-muted-foreground">Metric</th>
              <th className="text-right px-4 py-2 text-sm font-medium text-muted-foreground">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <tr className="hover:bg-muted/20">
              <td className="px-4 py-2 text-sm text-foreground">Total Contracts</td>
              <td className="px-4 py-2 text-sm text-right font-semibold text-foreground">{contracts.length}</td>
            </tr>
            <tr className="hover:bg-muted/20">
              <td className="px-4 py-2 text-sm text-foreground">Total Contract Value</td>
              <td className="px-4 py-2 text-sm text-right font-semibold text-foreground">{formatCurrency(totalContractAmount)}</td>
            </tr>
            <tr className="hover:bg-muted/20">
              <td className="px-4 py-2 text-sm text-foreground">Active Contracts</td>
              <td className="px-4 py-2 text-sm text-right font-semibold text-foreground">{contracts.filter(c => c.status === 'active').length}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Contracts Table */}
      {contracts.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Contracts Found</h3>
          <p className="text-muted-foreground">
            No contracts have been uploaded for this project yet.
          </p>
        </div>
      ) : (
        <div className="bg-card border rounded-lg overflow-hidden">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-muted/50 border-b">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider w-12">View</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider min-w-0">Contract Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider w-28">Upload Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider w-20">File Size</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider w-32">Contract Amount</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider w-24">Confidence</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider w-20">Status</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider w-16">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {contracts.map((contract) => (
                <tr key={contract.id} className="hover:bg-muted/30 transition-colors">
                   <td className="px-4 py-4 whitespace-nowrap">
                     <input type="checkbox" className="rounded border-border" />
                   </td>
                   <td 
                     className="px-4 py-4 text-sm text-foreground cursor-pointer hover:text-primary hover:underline truncate max-w-0" 
                     title={contract.name}
                   >
                     {contract.name}
                   </td>
                   <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">{formatDate(contract.created_at)}</td>
                   <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground">{formatFileSize(contract.file_size)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-medium text-foreground">
                      {formatCurrency(parseContractAmount(contract.contract_data, contract.contract_amount))}
                    </td>
                   <td className="px-4 py-4 whitespace-nowrap text-sm text-muted-foreground text-right font-medium">
                     {Math.round((contract.confidence || 0) * 100)}%
                   </td>
                   <td className="px-4 py-4 whitespace-nowrap text-center">
                     <Badge variant={getStatusBadgeVariant(contract.status)} className="text-xs">
                       {getStatusText(contract.status)}
                     </Badge>
                   </td>
                   <td className="px-4 py-4 whitespace-nowrap text-center">
                     <DropdownMenu>
                       <DropdownMenuTrigger asChild>
                         <Button
                           variant="ghost"
                           size="sm"
                           className="h-8 w-8 p-0 hover:bg-accent"
                         >
                           <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                         </Button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align="end" className="bg-background border-border z-50">
                         <DropdownMenuItem
                           onClick={() => window.open(contract.file_url, '_blank')}
                         >
                           <Eye className="mr-2 h-4 w-4" />
                           View Contract
                         </DropdownMenuItem>
                       </DropdownMenuContent>
                     </DropdownMenu>
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