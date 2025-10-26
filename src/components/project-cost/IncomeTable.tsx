import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
    return { label: 'Paid', variant: 'default' as const, className: 'bg-green-500/10 text-green-700 border-green-500/20 font-medium' };
  } else if (paidAmount > 0 && paidAmount < totalAmount) {
    return { label: 'Partial', variant: 'secondary' as const, className: 'bg-amber-500/10 text-amber-700 border-amber-500/20 font-medium' };
  } else if (status === 'overdue') {
    return { label: 'Overdue', variant: 'destructive' as const, className: 'bg-red-500/10 text-red-700 border-red-500/20 font-medium' };
  } else {
    return { label: 'Unpaid', variant: 'outline' as const, className: 'bg-slate-500/10 text-slate-700 border-slate-500/20 font-medium' };
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
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(new Set());
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [editingMilestone, setEditingMilestone] = useState<string | null>(null);
  const [editMilestoneValue, setEditMilestoneValue] = useState('');
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

  // Auto-expand all milestone groups when data changes
  React.useEffect(() => {
    if (groupedInvoices.length > 0) {
      const allKeys = new Set(groupedInvoices.map(g => g.key));
      setExpandedMilestones(allKeys);
    }
  }, [groupedInvoices]);

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

  const handleEditMilestone = (groupKey: string, currentName: string) => {
    setEditingMilestone(groupKey);
    setEditMilestoneValue(currentName);
  };

  const handleSaveMilestone = async (groupKey: string, invoiceIds: string[]) => {
    if (!editMilestoneValue.trim()) {
      toast({
        title: "Error",
        description: "Milestone name cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Update all invoices in this milestone group
      const { error } = await supabase
        .from('invoices')
        .update({ milestone_stage: editMilestoneValue.trim() })
        .in('id', invoiceIds);

      if (error) {
        console.error('Error updating milestone:', error);
        toast({
          title: "Error",
          description: "Failed to update milestone name.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Milestone name updated successfully.",
      });

      setEditingMilestone(null);
      setEditMilestoneValue('');
      loadInvoices();
    } catch (error) {
      console.error('Error updating milestone:', error);
      toast({
        title: "Error",
        description: "Failed to update milestone name.",
        variant: "destructive",
      });
    }
  };

  const handleCancelEditMilestone = () => {
    setEditingMilestone(null);
    setEditMilestoneValue('');
  };

  useEffect(() => {
    loadInvoices();
  }, [projectId, statusFilter, refreshTrigger]);

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        <div className="animate-pulse">
          <div className="h-3 bg-muted/50 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted/50 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="h-14 w-14 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
          <Eye className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-1">No Invoices Found</h3>
        <p className="text-sm text-muted-foreground">
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
      <div className="space-y-0">
        <div className="border border-border/60 rounded-xl overflow-hidden bg-card/50 backdrop-blur-sm shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 border-b border-border/60 hover:bg-muted/40">
                <TableHead className="w-8 h-9 py-2 px-2"></TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-muted-foreground/80 tracking-wider h-9 py-2 px-4">Invoice #</TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-muted-foreground/80 tracking-wider h-9 py-2 px-4">Issue Date</TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-muted-foreground/80 tracking-wider h-9 py-2 px-4">Due Date</TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-muted-foreground/80 tracking-wider text-right h-9 py-2 px-4">Amount Billed</TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-muted-foreground/80 tracking-wider text-right h-9 py-2 px-4">Amount Paid</TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-muted-foreground/80 tracking-wider h-9 py-2 px-4">Status</TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-muted-foreground/80 tracking-wider h-9 py-2 px-4">Progress</TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-muted-foreground/80 tracking-wider h-9 py-2 px-4">Contract</TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-muted-foreground/80 tracking-wider text-center h-9 py-2 px-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupedInvoices.map((group) => (
                <React.Fragment key={group.key}>
                  {/* Milestone Group Header */}
                  <TableRow className="bg-gradient-to-r from-muted/60 to-muted/40 hover:from-muted/70 hover:to-muted/50 border-y border-border/50 cursor-pointer transition-all duration-200">
                    <TableCell colSpan={10} className="py-3.5 px-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div onClick={() => toggleMilestone(group.key)} className="flex items-center hover:bg-muted/50 rounded p-1 transition-colors">
                            {expandedMilestones.has(group.key) ? (
                              <ChevronDown className="h-4 w-4 text-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-foreground" />
                            )}
                          </div>
                          {editingMilestone === group.key ? (
                            <input
                              type="text"
                              value={editMilestoneValue}
                              onChange={(e) => setEditMilestoneValue(e.target.value)}
                              onBlur={() => handleSaveMilestone(group.key, group.invoices.map(inv => inv.id))}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleSaveMilestone(group.key, group.invoices.map(inv => inv.id));
                                } else if (e.key === 'Escape') {
                                  handleCancelEditMilestone();
                                }
                              }}
                              onClick={(e) => e.stopPropagation()}
                              autoFocus
                              className="font-semibold text-foreground text-sm bg-background border-2 border-primary rounded-md px-3 py-1.5 min-w-[250px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                          ) : (
                            <span 
                              className="font-bold text-foreground text-sm hover:text-primary cursor-text transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditMilestone(group.key, group.milestone);
                              }}
                            >
                              {group.sequence > 0 ? `${group.sequence}` : ''} {group.milestone}
                            </span>
                          )}
                          <Badge variant="secondary" className="text-xs font-medium bg-background/80 border border-border/50 text-muted-foreground">
                            {group.invoices.length} invoice{group.invoices.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-xs text-muted-foreground/80">
                            Billed: <span className="font-bold text-foreground ml-1.5">{formatCurrency(group.total)}</span>
                          </div>
                          <div className="text-xs text-muted-foreground/80">
                            Paid: <span className="font-bold text-green-600 ml-1.5">{formatCurrency(group.paid)}</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <Progress value={(group.paid / group.total) * 100} className="w-28 h-2.5" />
                            <span className="text-xs font-bold text-foreground min-w-[45px]">
                              {Math.round((group.paid / group.total) * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Invoice Rows */}
                  {expandedMilestones.has(group.key) && group.invoices.map((invoice, idx) => {
                    const paymentStatus = getPaymentStatusBadge(invoice.paid_to_date, invoice.total, invoice.status);
                    const overdue = isOverdue(invoice.due_date, invoice.status);
                    const daysOverdue = overdue ? getDaysOverdue(invoice.due_date) : 0;
                    
                    return (
                      <TableRow key={invoice.id} className="hover:bg-accent/50 transition-all duration-150 group border-b border-border/30 last:border-b-0">
                        <TableCell className="py-3.5 px-2"></TableCell>
                        <TableCell className="font-semibold text-sm text-foreground py-3.5 px-4">
                          {invoice.number}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground/90 py-3.5 px-4">
                          {formatDate(invoice.issue_date)}
                        </TableCell>
                        <TableCell className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            {overdue && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                                </TooltipTrigger>
                                <TooltipContent className="bg-popover border-border">
                                  <p>{daysOverdue} day{daysOverdue !== 1 ? 's' : ''} overdue</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                            <span className={overdue ? 'text-sm text-red-600 font-semibold' : 'text-sm text-muted-foreground/90'}>
                              {formatDate(invoice.due_date)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-sm font-bold text-foreground py-3.5 px-4">
                          {formatCurrency(invoice.total)}
                        </TableCell>
                        <TableCell className="text-right text-sm font-bold py-3.5 px-4">
                          <span className={invoice.paid_to_date > 0 ? 'text-green-600' : 'text-muted-foreground/70'}>
                            {formatCurrency(invoice.paid_to_date)}
                          </span>
                        </TableCell>
                        <TableCell className="py-3.5 px-4">
                          <Badge 
                            variant={paymentStatus.variant}
                            className={`text-[11px] px-2.5 py-0.5 ${paymentStatus.className} border`}
                          >
                            {paymentStatus.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <Progress 
                              value={(invoice.paid_to_date / invoice.total) * 100} 
                              className="w-24 h-2.5" 
                            />
                            <span className="text-xs font-bold text-foreground min-w-[38px]">
                              {Math.round((invoice.paid_to_date / invoice.total) * 100)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3.5 px-4">
                          {invoice.contract_name ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-7 px-2 hover:bg-blue-500/10 hover:text-blue-600 text-xs rounded-md">
                                  <FileText className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
                                  <span className="text-sm text-foreground/90 truncate max-w-[120px] font-medium">{invoice.contract_name}</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="bg-popover border-border">
                                <p>Open Contract</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="text-sm text-muted-foreground/60">-</span>
                          )}
                        </TableCell>
                        <TableCell className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 hover:bg-blue-50 hover:text-blue-600"
                                  onClick={() => setViewingInvoice(invoice)}
                                >
                                  <Eye className="h-3.5 w-3.5" />
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
                                  className="h-7 w-7 p-0 hover:bg-green-50 hover:text-green-600"
                                  onClick={() => navigate(`/invoice/edit/${invoice.id}`)}
                                >
                                  <Edit className="h-3.5 w-3.5" />
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
                                  className="h-7 w-7 p-0 hover:bg-purple-50 hover:text-purple-600"
                                >
                                  <Send className="h-3.5 w-3.5" />
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
                                  className="h-7 w-7 p-0 hover:bg-orange-50 hover:text-orange-600"
                                >
                                  <Paperclip className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Attach Receipt</p>
                              </TooltipContent>
                            </Tooltip>

                            <Button
                              variant={invoice.status === 'paid' ? 'default' : 'outline'}
                              size="sm"
                              className="h-7 px-2 text-xs whitespace-nowrap ml-1"
                              onClick={() => handleMarkAsPaid(invoice.id, invoice.total, invoice.status)}
                            >
                              {invoice.status === 'paid' ? '✓ Paid' : 'Mark Paid'}
                            </Button>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600"
                                  onClick={() => handleDeleteInvoice(invoice.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
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

      {/* View Invoice Dialog */}
      <Dialog open={!!viewingInvoice} onOpenChange={(open) => !open && setViewingInvoice(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          {viewingInvoice && (
            <div className="space-y-6 p-6">
              {/* Professional Invoice Header - TAX INVOICE Format */}
              <div className="border-b border-gray-200 pb-6">
                <div className="grid grid-cols-3 gap-8 items-start">
                  {/* Left Column - TAX INVOICE and Billing To */}
                  <div className="space-y-4">
                    <div>
                      <h1 className="text-3xl font-bold text-black tracking-wide mb-1">TAX INVOICE</h1>
                      <div className="h-0.5 w-20 bg-blue-600"></div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Bill To</h3>
                      <div className="text-sm text-black space-y-1">
                        <div className="font-semibold">{viewingInvoice.client_name || "Client Name"}</div>
                        <div className="text-gray-700 text-xs leading-relaxed">
                          {viewingInvoice.notes && viewingInvoice.notes.includes('\n') 
                            ? viewingInvoice.notes.split('\n')[0] 
                            : "Client Address"}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Middle Column - Company Logo and Details */}
                  <div className="text-center space-y-3">
                    <div>
                      <img 
                        src="/lovable-uploads/356fa289-0bf1-4952-820e-c823e9acf316.png" 
                        alt="SKROBAKI" 
                        className="h-12 mx-auto mb-2"
                      />
                      <div className="text-sm text-black">
                        <div className="font-bold mb-1">SKROBAKI Pty Ltd</div>
                        <div className="text-xs text-gray-600 leading-tight">
                          Unit A11/2A Westall Rd<br />
                          Clayton VIC 3168<br />
                          Australia
                        </div>
                      </div>
                    </div>
                     
                    <div className="text-xs text-gray-600">
                      <div className="font-semibold">ABN: 49 032 355 809</div>
                    </div>
                  </div>
                  
                  {/* Right Column - Invoice Details */}
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded border">
                      <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Invoice Details</h3>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-700">Invoice Number:</span>
                          <span className="font-bold text-black">{viewingInvoice.number}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-700">Invoice Date:</span>
                          <span className="font-semibold text-black">{formatDate(viewingInvoice.issue_date)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-700">Due Date:</span>
                          <span className="font-semibold text-black">{formatDate(viewingInvoice.due_date)}</span>
                        </div>
                        
                        {(viewingInvoice.milestone_stage || viewingInvoice.notes) && (
                          <div className="pt-2 border-t border-gray-200">
                            <div className="font-medium text-gray-700 mb-1">Reference:</div>
                            <div className="text-xs text-gray-600 break-words">
                              {viewingInvoice.milestone_sequence && viewingInvoice.milestone_sequence > 0 
                                ? `Stage ${viewingInvoice.milestone_sequence} – ` 
                                : ''}{viewingInvoice.milestone_stage || viewingInvoice.notes}
                            </div>
                          </div>
                        )}

                        <div className="pt-2 border-t border-gray-200 mt-3">
                          <div className="font-medium text-gray-700 mb-1">Payment Status:</div>
                          <Badge 
                            variant={getPaymentStatusBadge(viewingInvoice.paid_to_date, viewingInvoice.total, viewingInvoice.status).variant}
                            className={`${getPaymentStatusBadge(viewingInvoice.paid_to_date, viewingInvoice.total, viewingInvoice.status).className} text-xs`}
                          >
                            {getPaymentStatusBadge(viewingInvoice.paid_to_date, viewingInvoice.total, viewingInvoice.status).label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Summary Section */}
              <div className="bg-gray-50 rounded-lg border p-6">
                <h3 className="text-lg font-semibold text-black mb-4">Financial Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-700 font-medium">Total Amount Billed</span>
                    <span className="font-bold text-2xl text-black">{formatCurrency(viewingInvoice.total)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-700 font-medium">Amount Paid</span>
                    <span className="font-bold text-2xl text-green-600">{formatCurrency(viewingInvoice.paid_to_date)}</span>
                  </div>
                  <div className="border-t-2 border-gray-300 pt-3 flex justify-between items-center">
                    <span className="font-bold text-gray-900 text-lg">Outstanding Balance</span>
                    <span className="font-bold text-3xl text-orange-600">
                      {formatCurrency(viewingInvoice.total - viewingInvoice.paid_to_date)}
                    </span>
                  </div>
                  
                  {/* Payment Progress Bar */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span className="font-medium">Payment Progress</span>
                      <span className="font-semibold">{Math.round((viewingInvoice.paid_to_date / viewingInvoice.total) * 100)}% Complete</span>
                    </div>
                    <Progress value={(viewingInvoice.paid_to_date / viewingInvoice.total) * 100} className="h-3" />
                  </div>
                </div>
              </div>

              {/* Contract Details */}
              {viewingInvoice.contract_name && (
                <div className="border rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Contract Details</h3>
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-black">{viewingInvoice.contract_name}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t-2 border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setViewingInvoice(null)}
                  className="px-6"
                >
                  Close
                </Button>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => window.print()}
                    className="flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Print Invoice
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => {
                      navigate(`/invoice/edit/${viewingInvoice.id}`);
                      setViewingInvoice(null);
                    }}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Invoice
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};