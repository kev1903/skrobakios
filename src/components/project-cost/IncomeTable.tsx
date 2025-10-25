import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Trash2, ChevronRight, ChevronDown, FileText, Edit, Send, Paperclip, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Invoice {
  id: string;
  number: string;
  client_name: string;
  issue_date: string;
  due_date: string;
  status: string;
  total: number;
  paid_to_date: number;
  contract_id?: string;
  contract_name?: string;
  milestone_sequence?: number;
  milestone_stage?: string;
  notes?: string;
  created_at: string;
}

interface IncomeTableProps {
  projectId: string;
  statusFilter: string;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
  refreshTrigger: number;
}

const getPaymentStatusBadge = (paidAmount: number, totalAmount: number, status: string) => {
  if (paidAmount >= totalAmount && status === 'paid') {
    return { label: '🟢 Paid', variant: 'default' as const, className: 'bg-green-100 text-green-800 border-green-300' };
  } else if (paidAmount > 0 && paidAmount < totalAmount) {
    return { label: '🟡 Pending', variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
  } else if (status === 'overdue') {
    return { label: '🔴 Overdue', variant: 'destructive' as const, className: 'bg-red-100 text-red-800 border-red-300' };
  } else {
    return { label: '⚪ Unpaid', variant: 'outline' as const, className: 'bg-gray-100 text-gray-800 border-gray-300' };
  }
};

const getStatusBadgeVariant = (status: string) => {
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

const getStatusText = (status: string) => {
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

export const IncomeTable = ({ 
  projectId, 
  statusFilter, 
  formatCurrency, 
  formatDate,
  refreshTrigger 
}: IncomeTableProps) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Calculate totals
  const totals = useMemo(() => {
    const totalBilled = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalPaid = invoices.reduce((sum, inv) => sum + inv.paid_to_date, 0);
    const outstanding = totalBilled - totalPaid;
    return { totalBilled, totalPaid, outstanding };
  }, [invoices]);

  // Group invoices by milestone
  const groupedInvoices = useMemo(() => {
    const groups = new Map<string, Invoice[]>();
    
    invoices.forEach(invoice => {
      const milestoneKey = invoice.milestone_stage 
        ? `${invoice.milestone_sequence || 0}-${invoice.milestone_stage}`
        : 'no-milestone';
      
      if (!groups.has(milestoneKey)) {
        groups.set(milestoneKey, []);
      }
      groups.get(milestoneKey)!.push(invoice);
    });

    return Array.from(groups.entries()).map(([key, invs]) => ({
      key,
      milestone: invs[0].milestone_stage || 'No Milestone',
      sequence: invs[0].milestone_sequence || 0,
      invoices: invs,
      total: invs.reduce((sum, inv) => sum + inv.total, 0),
      paid: invs.reduce((sum, inv) => sum + inv.paid_to_date, 0),
    })).sort((a, b) => b.sequence - a.sequence);
  }, [invoices]);

  const toggleMilestone = (key: string) => {
    setExpandedMilestones(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'paid') return false;
    const due = new Date(dueDate);
    const today = new Date();
    return due < today;
  };

  const getDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const loadInvoices = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('invoices')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter as any);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading invoices:', error);
        return;
      }

      // Fetch contract names for invoices that have contract_id
      const invoicesWithContracts = await Promise.all(
        (data || []).map(async (invoice) => {
          if (invoice.contract_id) {
            const { data: contract } = await supabase
              .from('project_contracts')
              .select('name')
              .eq('id', invoice.contract_id)
              .maybeSingle();
            
            return {
              ...invoice,
              contract_name: contract?.name || 'Unknown Contract'
            };
          }
          return invoice;
        })
      );

      setInvoices(invoicesWithContracts);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (invoiceId: string, total: number, currentStatus: string) => {
    try {
      // Toggle between paid and draft status
      const newStatus = currentStatus === 'paid' ? 'draft' : 'paid';
      const newPaidAmount = newStatus === 'paid' ? total : 0;
      
      const { error } = await supabase
        .from('invoices')
        .update({ 
          status: newStatus, 
          paid_to_date: newPaidAmount 
        })
        .eq('id', invoiceId);

      if (error) {
        console.error('Error updating invoice status:', error);
        toast({
          title: "Error",
          description: "Failed to update invoice status. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: newStatus === 'paid' 
          ? "Invoice marked as paid successfully." 
          : "Invoice status updated to unpaid.",
      });
      
      loadInvoices();
    } catch (error) {
      console.error('Error updating invoice status:', error);
      toast({
        title: "Error",
        description: "Failed to update invoice status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      return;
    }

    try {
      // Use RPC function to delete invoice with proper permissions
      const { data, error } = await supabase.rpc('delete_invoice_with_items', {
        invoice_id_param: invoiceId
      });

      if (error) {
        console.error('Error deleting invoice:', error);
        toast({
          title: "Error",
          description: `Failed to delete invoice: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      // Check the response
      const response = data as { success: boolean; error?: string; message?: string } | null;
      
      if (response && !response.success) {
        toast({
          title: "Error",
          description: response.error || "Failed to delete invoice.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Invoice deleted successfully.",
      });
      
      loadInvoices();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast({
        title: "Error",
        description: "Failed to delete invoice. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [projectId, statusFilter, refreshTrigger]);

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

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <Eye className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Invoices Found</h3>
        <p className="text-muted-foreground">
          {statusFilter === 'all' 
            ? 'No invoices have been created for this project yet.'
            : `No invoices with "${getStatusText(statusFilter)}" status found.`
          }
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Totals Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="border rounded-lg p-4 bg-card">
            <div className="text-sm text-muted-foreground mb-1">Total Billed</div>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(totals.totalBilled)}</div>
          </div>
          <div className="border rounded-lg p-4 bg-card">
            <div className="text-sm text-muted-foreground mb-1">Total Paid</div>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totals.totalPaid)}</div>
          </div>
          <div className="border rounded-lg p-4 bg-card">
            <div className="text-sm text-muted-foreground mb-1">Outstanding</div>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(totals.outstanding)}</div>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12"></TableHead>
                <TableHead className="text-foreground font-medium">Invoice #</TableHead>
                <TableHead className="text-foreground font-medium">Issue Date</TableHead>
                <TableHead className="text-foreground font-medium">Due Date</TableHead>
                <TableHead className="text-foreground font-medium text-right">Amount Billed</TableHead>
                <TableHead className="text-foreground font-medium text-right">Amount Paid</TableHead>
                <TableHead className="text-foreground font-medium">Payment Status</TableHead>
                <TableHead className="text-foreground font-medium">Progress</TableHead>
                <TableHead className="text-foreground font-medium">Contract</TableHead>
                <TableHead className="text-foreground font-medium text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupedInvoices.map((group) => (
                <React.Fragment key={group.key}>
                  {/* Milestone Group Header */}
                  <TableRow className="bg-muted/70 hover:bg-muted/80 cursor-pointer" onClick={() => toggleMilestone(group.key)}>
                    <TableCell colSpan={10}>
                      <div className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-3">
                          {expandedMilestones.has(group.key) ? (
                            <ChevronDown className="h-5 w-5 text-foreground" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-foreground" />
                          )}
                          <span className="font-semibold text-foreground text-base">
                            {group.sequence > 0 ? `Stage ${group.sequence} – ` : ''}{group.milestone}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {group.invoices.length} invoice{group.invoices.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm text-muted-foreground">
                            Billed: <span className="font-medium text-foreground">{formatCurrency(group.total)}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Paid: <span className="font-medium text-green-600">{formatCurrency(group.paid)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={(group.paid / group.total) * 100} className="w-24 h-2" />
                            <span className="text-xs font-medium text-muted-foreground min-w-[40px]">
                              {Math.round((group.paid / group.total) * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Invoice Rows */}
                  {expandedMilestones.has(group.key) && group.invoices.map((invoice) => {
                    const paymentStatus = getPaymentStatusBadge(invoice.paid_to_date, invoice.total, invoice.status);
                    const overdue = isOverdue(invoice.due_date, invoice.status);
                    const daysOverdue = overdue ? getDaysOverdue(invoice.due_date) : 0;
                    
                    return (
                      <TableRow key={invoice.id} className="hover:bg-muted/30 group">
                        <TableCell></TableCell>
                        <TableCell className="font-medium text-foreground">
                          {invoice.number}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(invoice.issue_date)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {overdue && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <AlertCircle className="h-4 w-4 text-red-500" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{daysOverdue} day{daysOverdue !== 1 ? 's' : ''} overdue</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                            <span className={overdue ? 'text-red-600 font-medium' : 'text-muted-foreground'}>
                              {formatDate(invoice.due_date)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium text-foreground">
                          {formatCurrency(invoice.total)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          <span className={invoice.paid_to_date > 0 ? 'text-green-600' : 'text-muted-foreground'}>
                            {formatCurrency(invoice.paid_to_date)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={paymentStatus.variant}
                            className={`text-xs font-medium ${paymentStatus.className}`}
                          >
                            {paymentStatus.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={(invoice.paid_to_date / invoice.total) * 100} 
                              className="w-16 h-2" 
                            />
                            <span className="text-xs text-muted-foreground">
                              {Math.round((invoice.paid_to_date / invoice.total) * 100)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {invoice.contract_name ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-auto p-1 hover:bg-muted">
                                  <FileText className="h-4 w-4 mr-1 text-blue-600" />
                                  <span className="text-sm text-foreground">{invoice.contract_name}</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Open Contract</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-blue-50"
                                >
                                  <Eye className="h-4 w-4 text-blue-600" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View Invoice</p>
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-green-50"
                                >
                                  <Edit className="h-4 w-4 text-green-600" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Edit Invoice</p>
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-purple-50"
                                >
                                  <Send className="h-4 w-4 text-purple-600" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Send to Client</p>
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-orange-50"
                                >
                                  <Paperclip className="h-4 w-4 text-orange-600" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Attach Receipt</p>
                              </TooltipContent>
                            </Tooltip>

                            <Button
                              variant={invoice.status === 'paid' ? 'default' : 'outline'}
                              size="sm"
                              className="h-8 px-3 text-xs whitespace-nowrap ml-1"
                              onClick={() => handleMarkAsPaid(invoice.id, invoice.total, invoice.status)}
                            >
                              {invoice.status === 'paid' ? '✓ Paid' : 'Mark Paid'}
                            </Button>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-destructive/10"
                                  onClick={() => handleDeleteInvoice(invoice.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Delete Invoice</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </TooltipProvider>
  );
};