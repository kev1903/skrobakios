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
import { FileText, MoreHorizontal, Eye, DollarSign, ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
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
  invoices?: Invoice[];
}

interface Invoice {
  id: string;
  number: string;
  client_name: string;
  issue_date: string;
  due_date: string;
  status: string;
  total: number;
  paid_to_date: number;
  created_at: string;
  contract_id?: string;
  progress_percentage?: number;
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
  const [expandedContracts, setExpandedContracts] = useState<Set<string>>(new Set());

  const loadContracts = async () => {
    try {
      setLoading(true);
      // Load contracts
      const { data: contractsData, error: contractsError } = await supabase
        .from('project_contracts')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (contractsError) {
        console.error('Error loading contracts:', contractsError);
        return;
      }

      // Load invoices for all contracts
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (invoicesError) {
        console.error('Error loading invoices:', invoicesError);
        return;
      }

      // Group invoices by contract
      const contractsWithInvoices = (contractsData || []).map(contract => ({
        ...contract,
        invoices: (invoicesData || []).filter(invoice => invoice.contract_id === contract.id)
      }));

      setContracts(contractsWithInvoices);
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

  const toggleContract = (contractId: string) => {
    const newExpanded = new Set(expandedContracts);
    if (newExpanded.has(contractId)) {
      newExpanded.delete(contractId);
    } else {
      newExpanded.add(contractId);
    }
    setExpandedContracts(newExpanded);
  };

  const getInvoiceStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'sent':
        return 'secondary';
      case 'draft':
        return 'outline';
      case 'overdue':
        return 'destructive';
      case 'part_paid':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getInvoiceStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Paid';
      case 'sent':
        return 'Sent';
      case 'draft':
        return 'Draft';
      case 'overdue':
        return 'Overdue';
      case 'part_paid':
        return 'Part Paid';
      default:
        return status;
    }
  };

  const handleCreateInvoice = async (contractId: string) => {
    try {
      const contract = contracts.find(c => c.id === contractId);
      if (!contract) return;

      // Generate invoice number
      const invoiceCount = (contract.invoices?.length || 0) + 1;
      const invoiceNumber = `INV-${contract.name.substring(0, 3).toUpperCase()}-${String(invoiceCount).padStart(3, '0')}`;

      const { data, error } = await supabase
        .from('invoices')
        .insert({
          project_id: projectId,
          contract_id: contractId,
          number: invoiceNumber,
          client_name: contract.contract_data?.client_name || 'Client',
          issue_date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
          status: 'draft',
          total: 0,
          progress_percentage: 0
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating invoice:', error);
        toast.error('Failed to create invoice');
        return;
      }

      toast.success('Invoice created successfully');
      loadContracts(); // Reload to show new invoice
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error('Failed to create invoice');
    }
  };

  const handleDeleteContract = async (contractId: string, contractName: string) => {
    // Show confirmation dialog
    const isConfirmed = window.confirm(
      `Are you sure you want to delete the contract "${contractName}"?\n\nThis will permanently remove:\n• The contract document\n• All related invoices\n• All associated data\n\nThis action cannot be undone.`
    );

    if (!isConfirmed) return;

    try {
      // First, delete all related invoices and their items
      const contract = contracts.find(c => c.id === contractId);
      if (contract?.invoices && contract.invoices.length > 0) {
        // Delete invoice items for all invoices under this contract
        for (const invoice of contract.invoices) {
          const { error: itemsError } = await supabase
            .from('invoice_items')
            .delete()
            .eq('invoice_id', invoice.id);

          if (itemsError) {
            console.error('Error deleting invoice items:', itemsError);
          }
        }

        // Delete all invoices under this contract
        const { error: invoicesError } = await supabase
          .from('invoices')
          .delete()
          .eq('contract_id', contractId);

        if (invoicesError) {
          console.error('Error deleting invoices:', invoicesError);
          toast.error('Failed to delete related invoices');
          return;
        }
      }

      // Delete the contract itself
      const { error: contractError } = await supabase
        .from('project_contracts')
        .delete()
        .eq('id', contractId);

      if (contractError) {
        console.error('Error deleting contract:', contractError);
        toast.error('Failed to delete contract');
        return;
      }

      toast.success(`Contract "${contractName}" deleted successfully`);
      loadContracts(); // Reload contracts list
    } catch (error) {
      console.error('Error deleting contract:', error);
      toast.error('Failed to delete contract. Please try again.');
    }
  };

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
        /* Contracts and Invoices Hierarchy */
        <div className="bg-card border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 border-b">
                <th className="text-left px-4 py-2 text-sm font-medium text-muted-foreground w-8"></th>
                <th className="text-left px-4 py-2 text-sm font-medium text-muted-foreground">Contract / Invoice</th>
                <th className="text-right px-4 py-2 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="text-left px-4 py-2 text-sm font-medium text-muted-foreground">Start/Issue Date</th>
                <th className="text-left px-4 py-2 text-sm font-medium text-muted-foreground">End/Due Date</th>
                <th className="text-center px-4 py-2 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-center px-4 py-2 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {contracts.map((contract) => (
                <React.Fragment key={contract.id}>
                  {/* Contract Row */}
                  <tr className="hover:bg-muted/20">
                    <td className="px-4 py-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleContract(contract.id)}
                        className="h-6 w-6 p-0 hover:bg-accent"
                      >
                        {expandedContracts.has(contract.id) ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ChevronRight className="h-3 w-3" />
                        )}
                      </Button>
                    </td>
                    <td className="px-4 py-2 text-sm font-semibold text-foreground truncate max-w-0" title={contract.name}>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {contract.name}
                        <span className="text-xs text-muted-foreground">
                          ({contract.invoices?.length || 0} invoices)
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm text-right font-bold text-foreground">
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
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(contract.file_url, '_blank')}
                          className="h-6 w-6 p-0 hover:bg-accent"
                          title="View Contract"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCreateInvoice(contract.id)}
                          className="h-6 w-6 p-0 hover:bg-accent text-primary"
                          title="Create Invoice"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteContract(contract.id, contract.name)}
                          className="h-6 w-6 p-0 hover:bg-destructive/20 text-destructive hover:text-destructive"
                          title="Delete Contract"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>

                  {/* Invoice Rows (when expanded) */}
                  {expandedContracts.has(contract.id) && contract.invoices && contract.invoices.map((invoice) => (
                    <tr key={`invoice-${invoice.id}`} className="bg-muted/10 hover:bg-muted/30">
                      <td className="px-4 py-2"></td>
                      <td className="px-4 py-2 text-sm text-foreground pl-8">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">{invoice.number}</span>
                          <span className="text-muted-foreground">- {invoice.client_name}</span>
                          {invoice.progress_percentage && invoice.progress_percentage > 0 && (
                            <span className="text-xs bg-primary/10 text-primary px-1 rounded">
                              {invoice.progress_percentage}%
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-sm text-right font-medium text-foreground">
                        {formatCurrency(invoice.total)}
                      </td>
                      <td className="px-4 py-2 text-sm text-muted-foreground">
                        {formatDate(invoice.issue_date)}
                      </td>
                      <td className="px-4 py-2 text-sm text-muted-foreground">
                        {formatDate(invoice.due_date)}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <Badge variant={getInvoiceStatusBadgeVariant(invoice.status)} className="text-xs">
                          {getInvoiceStatusText(invoice.status)}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-accent"
                            >
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="mr-2 h-4 w-4" />
                              Edit Invoice
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}

                  {/* Show "No invoices" when contract is expanded but has no invoices */}
                  {expandedContracts.has(contract.id) && (!contract.invoices || contract.invoices.length === 0) && (
                    <tr className="bg-muted/10">
                      <td className="px-4 py-2"></td>
                      <td colSpan={6} className="px-4 py-4 text-sm text-muted-foreground text-center italic pl-8">
                        No invoices created yet. Click the + button to create the first invoice for this contract.
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};