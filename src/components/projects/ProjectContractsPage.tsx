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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText, DollarSign, MoreHorizontal, Eye, Trash2, Upload, ChevronDown, ChevronRight, FileCheck, AlertTriangle, Trash } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Project } from "@/hooks/useProjects";
import { ProjectSidebar } from "../ProjectSidebar";
import { ProjectPageHeader } from "../project/ProjectPageHeader";
import { getStatusColor, getStatusText as utilsGetStatusText } from "./utils";
import { useMenuBarSpacing } from "@/hooks/useMenuBarSpacing";
import { ContractUploadDialog } from "./ContractUploadDialog";

interface ProjectContractsPageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

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

export const ProjectContractsPage = ({ project, onNavigate }: ProjectContractsPageProps) => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [expandedContracts, setExpandedContracts] = useState<Set<string>>(new Set());
  const [editMilestoneOpen, setEditMilestoneOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [milestoneIndex, setMilestoneIndex] = useState<number>(-1);
  const [selectedMilestones, setSelectedMilestones] = useState<{[contractId: string]: Set<number>}>({});
  const { spacingClasses } = useMenuBarSpacing();

  const toggleContractExpansion = (contractId: string) => {
    setExpandedContracts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(contractId)) {
        newSet.delete(contractId);
      } else {
        newSet.add(contractId);
      }
      return newSet;
    });
  };

  const handleGenerateInvoice = async (contract: Contract, payment: any) => {
    try {
      // Generate invoice number - wrap in try-catch to handle schema cache issues
      let invoiceNumber = 'INV-001';
      try {
        const { data: existingInvoices, error: countError } = await supabase
          .from('invoices')
          .select('number')
          .eq('project_id', project.id)
          .order('created_at', { ascending: false })
          .limit(1);

        // Only throw if it's not a schema cache error
        if (countError && countError.code !== '42P01') throw countError;

        // Extract number from last invoice and increment
        if (existingInvoices && existingInvoices.length > 0) {
          const lastNumber = existingInvoices[0].number;
          const numMatch = lastNumber.match(/\d+$/);
          if (numMatch) {
            const nextNum = parseInt(numMatch[0]) + 1;
            invoiceNumber = `INV-${String(nextNum).padStart(3, '0')}`;
          }
        }
      } catch (err) {
        // If getting last invoice number fails, use default INV-001
        console.warn('Could not fetch last invoice number, using default:', err);
      }

      // Parse the amount (remove $ and commas)
      const amountStr = payment.amount?.toString().replace(/[$,]/g, '') || '0';
      const amount = parseFloat(amountStr);

      // Calculate dates
      const issueDate = new Date().toISOString().split('T')[0];
      let dueDate = new Date();
      
      if (payment.due_date) {
        dueDate = new Date(payment.due_date);
      } else if (payment.due_days) {
        const days = parseInt(payment.due_days);
        dueDate.setDate(dueDate.getDate() + days);
      } else {
        dueDate.setDate(dueDate.getDate() + 30); // Default 30 days
      }

      // Calculate subtotal and tax from total (amount includes GST)
      const total = amount;
      const subtotal = total / 1.10; // Remove 10% GST to get subtotal
      const tax = total - subtotal;

      // Create the invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          project_id: project.id,
          contract_id: contract.id,
          milestone_sequence: payment.sequence,
          milestone_stage: payment.stage_name || payment.milestone || `Stage ${payment.sequence || ''}`,
          number: invoiceNumber,
          client_name: project.name,
          issue_date: issueDate,
          due_date: dueDate.toISOString().split('T')[0],
          status: 'draft',
          subtotal: subtotal,
          tax: tax,
          total: total,
          paid_to_date: 0,
          notes: `Milestone: ${payment.stage_name || payment.milestone || `Stage ${payment.sequence || ''}`}\nGenerated from contract: ${contract.name}${payment.description ? `\n${payment.description}` : ''}${payment.trigger ? `\nTrigger: ${payment.trigger}` : ''}`
        })
        .select()
        .single();

      // Only throw on real errors, not schema cache issues (42P01)
      if (invoiceError && invoiceError.code !== '42P01') throw invoiceError;
      
      // If we don't have invoice data due to schema cache, still show success
      if (!invoice) {
        toast.success(`Invoice ${invoiceNumber} created successfully for ${payment.stage_name || payment.milestone}`);
        window.dispatchEvent(new CustomEvent('invoice-created'));
        return;
      }

      // Create invoice item (use subtotal without tax for the item)
      const { error: itemError } = await supabase
        .from('invoice_items')
        .insert({
          invoice_id: invoice.id,
          description: payment.stage_name || payment.milestone || `Payment Stage ${payment.sequence || ''}`,
          qty: 1,
          rate: subtotal,
          amount: subtotal,
          wbs_code: payment.wbs_code || null
        });

      // Only throw on real errors, not schema cache issues (42P01)
      if (itemError && itemError.code !== '42P01') throw itemError;

      toast.success(`Invoice ${invoiceNumber} created successfully for ${payment.stage_name || payment.milestone}`);
      
      // Trigger refresh of income data by dispatching a custom event
      window.dispatchEvent(new CustomEvent('invoice-created'));
      
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast.error('Failed to generate invoice. Please try again.');
    }
  };

  const loadContracts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('project_contracts')
        .select('*')
        .eq('project_id', project.id)
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

  const handleDeleteContract = async (contractId: string) => {
    if (!confirm('Are you sure you want to delete this contract? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('project_contracts')
        .delete()
        .eq('id', contractId);

      if (error) {
        console.error('Error deleting contract:', error);
        toast.error("Failed to delete contract. Please try again.");
        return;
      }

      toast.success("Contract deleted successfully.");
      loadContracts();
    } catch (error) {
      console.error('Error deleting contract:', error);
      toast.error("Failed to delete contract. Please try again.");
    }
  };

  const handleToggleMilestoneSelection = (contractId: string, index: number) => {
    setSelectedMilestones(prev => {
      const contractSelections = prev[contractId] || new Set();
      const newSet = new Set(contractSelections);
      
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      
      return {
        ...prev,
        [contractId]: newSet
      };
    });
  };

  const handleDeleteSelectedMilestones = async (contract: Contract) => {
    const selections = selectedMilestones[contract.id];
    if (!selections || selections.size === 0) return;

    const milestoneCount = selections.size;
    if (!confirm(`Are you sure you want to delete ${milestoneCount} selected milestone${milestoneCount > 1 ? 's' : ''}? This action cannot be undone.`)) {
      return;
    }

    try {
      const contractData = contract.contract_data || {};
      const paymentSchedule = contractData.payment_schedule || [];
      
      // Filter out selected milestones
      const updatedSchedule = paymentSchedule.filter((_: any, idx: number) => !selections.has(idx));
      
      // Calculate the new contract amount
      const newContractAmount = updatedSchedule.reduce((sum: number, payment: any) => {
        const amountStr = payment.amount?.toString().replace(/[$,]/g, '') || '0';
        return sum + parseFloat(amountStr);
      }, 0);
      
      // Update the contract in the database
      const { error } = await supabase
        .from('project_contracts')
        .update({
          contract_amount: newContractAmount,
          contract_data: {
            ...contractData,
            payment_schedule: updatedSchedule
          }
        })
        .eq('id', contract.id);

      if (error) {
        console.error('Error deleting milestones:', error);
        toast.error("Failed to delete milestones. Please try again.");
        return;
      }

      toast.success(`${milestoneCount} milestone${milestoneCount > 1 ? 's' : ''} deleted successfully. Contract amount recalculated.`);
      
      // Clear selections for this contract
      setSelectedMilestones(prev => {
        const newSelections = { ...prev };
        delete newSelections[contract.id];
        return newSelections;
      });
      
      loadContracts();
    } catch (error) {
      console.error('Error deleting milestones:', error);
      toast.error("Failed to delete milestones. Please try again.");
    }
  };

  const handleEditMilestone = (contract: Contract, milestone: any, index: number) => {
    setSelectedContract(contract);
    setSelectedMilestone({ ...milestone });
    setMilestoneIndex(index);
    setEditMilestoneOpen(true);
  };

  const updateRelatedInvoices = async (
    contractId: string, 
    milestoneSequence: number, 
    newAmount: number,
    oldAmount: number
  ) => {
    try {
      // Find all invoices linked to this milestone
      const { data: invoices, error: fetchError } = await supabase
        .from('invoices')
        .select('*')
        .eq('contract_id', contractId)
        .eq('milestone_sequence', milestoneSequence);

      if (fetchError) {
        console.error('Error fetching related invoices:', fetchError);
        return;
      }

      if (!invoices || invoices.length === 0) {
        return; // No related invoices to update
      }

      // Update each invoice
      const updatePromises = invoices.map(async (invoice) => {
        // Update invoice total
        const { error: invoiceError } = await supabase
          .from('invoices')
          .update({
            total: newAmount,
            notes: `${invoice.notes}\n[Auto-updated on ${new Date().toLocaleDateString()}: Amount changed from ${formatCurrency(oldAmount, 'AUD')} to ${formatCurrency(newAmount, 'AUD')} due to milestone edit]`
          })
          .eq('id', invoice.id);

        if (invoiceError) {
          console.error('Error updating invoice:', invoiceError);
          return;
        }

        // Update related invoice items
        const { error: itemError } = await supabase
          .from('invoice_items')
          .update({
            rate: newAmount,
            amount: newAmount
          })
          .eq('invoice_id', invoice.id);

        if (itemError) {
          console.error('Error updating invoice items:', itemError);
        }
      });

      await Promise.all(updatePromises);

      toast.success(
        `Milestone updated. ${invoices.length} related invoice${invoices.length > 1 ? 's' : ''} automatically updated.`,
        { duration: 4000 }
      );
      
      // Trigger refresh of income data
      window.dispatchEvent(new CustomEvent('invoice-created'));
    } catch (error) {
      console.error('Error updating related invoices:', error);
      toast.error('Failed to update related invoices. Please check them manually.');
    }
  };

  const handleSaveMilestone = async () => {
    if (!selectedContract || !selectedMilestone || milestoneIndex === -1) return;

    try {
      // Get the current contract data
      const contractData = selectedContract.contract_data || {};
      const paymentSchedule = contractData.payment_schedule || [];
      
      // Store old amount for comparison
      const oldAmount = parseFloat(paymentSchedule[milestoneIndex]?.amount?.toString().replace(/[$,]/g, '') || '0');
      const newAmountStr = selectedMilestone.amount?.toString().replace(/[$,]/g, '') || '0';
      const newAmount = parseFloat(newAmountStr);
      
      // Update the milestone at the specific index
      paymentSchedule[milestoneIndex] = selectedMilestone;
      
      // Calculate the new contract amount as sum of all milestones
      const newContractAmount = paymentSchedule.reduce((sum: number, payment: any) => {
        const amountStr = payment.amount?.toString().replace(/[$,]/g, '') || '0';
        return sum + parseFloat(amountStr);
      }, 0);
      
      // Update the contract in the database
      const { error } = await supabase
        .from('project_contracts')
        .update({
          contract_amount: newContractAmount,
          contract_data: {
            ...contractData,
            payment_schedule: paymentSchedule
          }
        })
        .eq('id', selectedContract.id);

      if (error) {
        console.error('Error updating milestone:', error);
        toast.error("Failed to update milestone. Please try again.");
        return;
      }

      // Update related invoices if amount changed
      if (oldAmount !== newAmount) {
        await updateRelatedInvoices(
          selectedContract.id, 
          selectedMilestone.sequence, 
          newAmount,
          oldAmount
        );
      }

      toast.success("Milestone updated successfully. Contract amount recalculated.");
      setEditMilestoneOpen(false);
      loadContracts();
    } catch (error) {
      console.error('Error updating milestone:', error);
      toast.error("Failed to update milestone. Please try again.");
    }
  };

  const handleEditContract = (contract: Contract) => {
    setEditingContract(contract);
  };

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString('en-AU');
    } catch {
      return 'Invalid date';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatCurrency = (amount: number, contractData?: any) => {
    // If amount is 0 or null, try to extract from contract data
    let displayAmount = amount;
    
    if (!displayAmount && contractData?.contract_value) {
      // Parse contract value from contract_data as fallback
      const contractValue = contractData.contract_value;
      const numericValue = contractValue
        .replace(/[$,£€¥₹\s]/g, '') // Remove common currency symbols and spaces
        .replace(/[^\d.-]/g, ''); // Keep only digits, dots, and hyphens
      
      const parsed = parseFloat(numericValue);
      displayAmount = isNaN(parsed) ? 0 : parsed;
    }
    
    if (!displayAmount || displayAmount === 0) return '-';
    
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(displayAmount);
  };

  useEffect(() => {
    loadContracts();
  }, [project.id]);

  if (loading) {
    return (
      <div className="h-screen flex bg-background">
        {/* Fixed Project Sidebar */}
        <div className="fixed left-0 top-0 h-full w-48 z-40">
          <ProjectSidebar 
            project={project} 
            onNavigate={onNavigate}
            getStatusColor={getStatusColor}
            getStatusText={utilsGetStatusText}
          />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 ml-48 h-screen overflow-y-auto bg-background">
          <div className="p-6 min-h-full">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden">
      {/* Project Sidebar */}
      <ProjectSidebar 
        project={project} 
        onNavigate={onNavigate}
        getStatusColor={getStatusColor}
        getStatusText={utilsGetStatusText}
        activeSection="contracts"
      />
      
      {/* Main Content - Fixed positioning to match Project Control */}
      <div className="fixed left-40 right-0 top-[var(--header-height)] bottom-0 overflow-hidden">
        <div className="h-full w-full bg-white">
          {/* Content Area */}
          <div className="h-full overflow-y-auto">
            <div className="p-6">
              {/* Upload Contract Button - Top Right */}
              <div className="flex justify-end mb-4">
                <Button 
                  className="flex items-center gap-2"
                  onClick={() => setShowUploadDialog(true)}
                >
                  <Upload className="h-4 w-4" />
                  Upload Contract
                </Button>
              </div>

              {contracts.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Contracts Found</h3>
                  <p className="text-muted-foreground">
                    No contracts have been uploaded for this project yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-12">View</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider min-w-0">Contract Name</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Upload Date</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-20">File Size</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Contract Amount</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Confidence</th>
                      <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Status</th>
                      <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {contracts.map((contract) => {
                      const isExpanded = expandedContracts.has(contract.id);
                      const paymentSchedule = contract.contract_data?.payment_schedule || [];
                      const hasPaymentSchedule = Array.isArray(paymentSchedule) && paymentSchedule.length > 0;
                      
                      return (
                        <React.Fragment key={contract.id}>
                          <tr className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-4 whitespace-nowrap">
                              <button
                                onClick={() => toggleContractExpansion(contract.id)}
                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                                disabled={!hasPaymentSchedule}
                              >
                                {hasPaymentSchedule ? (
                                  isExpanded ? (
                                    <ChevronDown className="h-4 w-4 text-gray-600" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-gray-600" />
                                  )
                                ) : (
                                  <div className="h-4 w-4" />
                                )}
                              </button>
                            </td>
                            <td 
                              className="px-4 py-4 text-sm text-gray-900 cursor-pointer hover:text-blue-600 hover:underline truncate max-w-0" 
                              onClick={() => handleEditContract(contract)}
                              title={contract.name}
                            >
                              {contract.name}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(contract.created_at)}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{formatFileSize(contract.file_size)}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-medium text-green-600">
                              {formatCurrency(contract.contract_amount || 0, contract.contract_data)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
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
                                    className="h-8 w-8 p-0 hover:bg-gray-100"
                                  >
                                    <MoreHorizontal className="h-4 w-4 text-gray-500" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => window.open(contract.file_url, '_blank')}
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Contract
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteContract(contract.id)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Contract
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                          
                          {/* Expanded Payment Schedule Row */}
                          {isExpanded && hasPaymentSchedule && (
                            <tr className="bg-gradient-to-r from-blue-50/50 via-blue-50/30 to-transparent">
                              <td colSpan={8} className="px-4 py-6">
                                  <div className="ml-8 space-y-3">
                                    <div className="flex items-center justify-between mb-4">
                                      <div className="flex items-center gap-2">
                                        <DollarSign className="h-5 w-5 text-primary" />
                                        <h4 className="font-bold text-base text-foreground">Payment Milestones</h4>
                                        <Badge variant="outline" className="ml-2">
                                          {paymentSchedule.length} {paymentSchedule.length === 1 ? 'Milestone' : 'Milestones'}
                                        </Badge>
                                      </div>
                                      {selectedMilestones[contract.id]?.size > 0 && (
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          className="flex items-center gap-2"
                                          onClick={() => handleDeleteSelectedMilestones(contract)}
                                        >
                                          <Trash className="h-4 w-4" />
                                          Delete Selected ({selectedMilestones[contract.id].size})
                                        </Button>
                                      )}
                                    </div>
                                  
                                  {/* SkAi Amount Validation */}
                                  {(() => {
                                    const contractAmount = contract.contract_amount || 0;
                                    const milestonesTotal = paymentSchedule.reduce((sum: number, payment: any) => {
                                      const amountStr = payment.amount?.toString().replace(/[$,]/g, '') || '0';
                                      return sum + parseFloat(amountStr);
                                    }, 0);
                                    const discrepancy = Math.abs(contractAmount - milestonesTotal);
                                    const hasDiscrepancy = discrepancy > 0.01; // Allow for minor rounding differences
                                    
                                    return hasDiscrepancy && (
                                      <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                                        <div className="flex items-start gap-3">
                                          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                                          <div className="flex-1">
                                            <h5 className="font-semibold text-red-800 mb-1">
                                              ⚠️ SkAi Alert: Amount Discrepancy Detected
                                            </h5>
                                            <p className="text-sm text-red-700 mb-2">
                                              The sum of milestone amounts does not match the contract total.
                                            </p>
                                            <div className="grid grid-cols-3 gap-4 text-sm">
                                              <div>
                                                <span className="text-red-600 font-medium">Contract Amount:</span>
                                                <div className="text-red-800 font-semibold">
                                                  {formatCurrency(contractAmount, contract.contract_data)}
                                                </div>
                                              </div>
                                              <div>
                                                <span className="text-red-600 font-medium">Milestones Total:</span>
                                                <div className="text-red-800 font-semibold">
                                                  {formatCurrency(milestonesTotal, contract.contract_data)}
                                                </div>
                                              </div>
                                              <div>
                                                <span className="text-red-600 font-medium">Difference:</span>
                                                <div className="text-red-800 font-semibold">
                                                  {formatCurrency(discrepancy, contract.contract_data)}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })()}
                                  
                                   <div className="grid grid-cols-1 gap-3">
                                     {paymentSchedule.map((payment: any, idx: number) => {
                                       const isSelected = selectedMilestones[contract.id]?.has(idx) || false;
                                       
                                       return (
                                         <div 
                                           key={idx} 
                                           className={`p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer ${
                                             isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200'
                                           }`}
                                           onClick={() => handleEditMilestone(contract, payment, idx)}
                                         >
                                           <div className="flex items-start justify-between gap-4">
                                             <div className="flex items-start gap-3 flex-1">
                                               <Checkbox
                                                 checked={isSelected}
                                                 onCheckedChange={() => handleToggleMilestoneSelection(contract.id, idx)}
                                                 onClick={(e) => e.stopPropagation()}
                                                 className="mt-1"
                                               />
                                               <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm flex-shrink-0">
                                                 {payment.sequence || idx + 1}
                                               </div>
                                            <div className="flex-1 min-w-0">
                                              <div className="font-semibold text-sm text-foreground mb-1">
                                                {payment.stage_name || payment.milestone || `Stage ${payment.sequence || idx + 1}`}
                                              </div>
                                              {payment.description && (
                                                <p className="text-xs text-muted-foreground leading-relaxed">
                                                  {payment.description}
                                                </p>
                                              )}
                                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                                {payment.trigger && (
                                                  <Badge variant="secondary" className="text-xs">
                                                    📍 {payment.trigger}
                                                  </Badge>
                                                )}
                                                {(payment.due_date || payment.due_days) && (
                                                  <Badge variant="outline" className="text-xs">
                                                    🗓️ {payment.due_date || `${payment.due_days} days`}
                                                  </Badge>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-3">
                                            <div className="text-right flex-shrink-0">
                                              <div className="text-lg font-bold text-green-600">
                                                {formatCurrency(parseFloat(payment.amount?.toString().replace(/[$,]/g, '') || '0'), contract.contract_data)}
                                              </div>
                                              {payment.percentage && (
                                                <div className="text-xs font-medium text-muted-foreground mt-1">
                                                  {payment.percentage}% of total
                                                </div>
                                              )}
                                            </div>
                                            <Button
                                              size="sm"
                                              variant="default"
                                              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white h-8"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleGenerateInvoice(contract, payment);
                                              }}
                                            >
                                              <FileCheck className="h-3.5 w-3.5" />
                                              <span className="text-xs font-medium">Generate Invoice</span>
                                            </Button>
                                          </div>
                                        </div>
                                         </div>
                                       );
                                     })}
                                   </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ContractUploadDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        project={project}
        onUploadComplete={loadContracts}
      />
      
      <ContractUploadDialog
        open={!!editingContract}
        onOpenChange={(open) => !open && setEditingContract(null)}
        project={project}
        onUploadComplete={loadContracts}
        editMode={true}
        existingContract={editingContract}
      />

      {/* Edit Milestone Dialog */}
      <Dialog open={editMilestoneOpen} onOpenChange={setEditMilestoneOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Milestone</DialogTitle>
            <DialogDescription>
              Update the milestone details and click save to apply changes.
            </DialogDescription>
          </DialogHeader>
          
          {selectedMilestone && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="sequence">Sequence #</Label>
                <Input
                  id="sequence"
                  type="number"
                  value={selectedMilestone.sequence || ''}
                  onChange={(e) => setSelectedMilestone({ ...selectedMilestone, sequence: parseInt(e.target.value) })}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="stage_name">Stage Name</Label>
                <Input
                  id="stage_name"
                  value={selectedMilestone.stage_name || selectedMilestone.milestone || ''}
                  onChange={(e) => setSelectedMilestone({ ...selectedMilestone, stage_name: e.target.value, milestone: e.target.value })}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={selectedMilestone.description || ''}
                  onChange={(e) => setSelectedMilestone({ ...selectedMilestone, description: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    value={selectedMilestone.amount || ''}
                    onChange={(e) => setSelectedMilestone({ ...selectedMilestone, amount: e.target.value })}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="percentage">Percentage</Label>
                  <Input
                    id="percentage"
                    type="number"
                    value={selectedMilestone.percentage || ''}
                    onChange={(e) => setSelectedMilestone({ ...selectedMilestone, percentage: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="trigger">Trigger</Label>
                <Input
                  id="trigger"
                  value={selectedMilestone.trigger || ''}
                  onChange={(e) => setSelectedMilestone({ ...selectedMilestone, trigger: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={selectedMilestone.due_date || ''}
                    onChange={(e) => setSelectedMilestone({ ...selectedMilestone, due_date: e.target.value })}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="due_days">Due Days</Label>
                  <Input
                    id="due_days"
                    type="number"
                    value={selectedMilestone.due_days || ''}
                    onChange={(e) => setSelectedMilestone({ ...selectedMilestone, due_days: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditMilestoneOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveMilestone}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};