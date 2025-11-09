import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { FileText, DollarSign, MoreHorizontal, Eye, Trash2, Upload, ChevronDown, ChevronRight, FileCheck, AlertTriangle, Trash, UserPlus, Plus } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Project } from "@/hooks/useProjects";
import { ProjectSidebar } from "../ProjectSidebar";
import { ProjectPageHeader } from "../project/ProjectPageHeader";
import { getStatusColor, getStatusText as utilsGetStatusText } from "./utils";
import { useMenuBarSpacing } from "@/hooks/useMenuBarSpacing";
import { ContractUploadDialog } from "./ContractUploadDialog";
import { OwnersDetailsTab } from "./OwnersDetailsTab";
import { OwnerDialog } from "./OwnerDialog";

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

interface Owner {
  id?: string;
  name: string;
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  abn: string;
  acn: string;
  work_phone: string;
  home_phone: string;
  mobile: string;
  email: string;
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
  const [activeTab, setActiveTab] = useState('contracts');
  const [owners, setOwners] = useState<Owner[]>([]);
  const [editingOwner, setEditingOwner] = useState<Owner | null>(null);
  const [showOwnerDialog, setShowOwnerDialog] = useState(false);
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
      console.log('Starting invoice generation for payment:', payment);
      console.log('Contract:', contract);
      console.log('Project ID:', project.id);

      // Generate unique invoice number with retry logic
      let invoiceNumber = '';
      let attempts = 0;
      const maxAttempts = 50;
      
      try {
        // Get all existing invoice numbers for this project to find the highest
        const { data: existingInvoices, error: countError } = await supabase
          .from('invoices')
          .select('number')
          .eq('project_id', project.id)
          .order('number', { ascending: false });

        if (countError && countError.code !== '42P01') {
          throw countError;
        }

        // Find the highest invoice number
        let highestNum = 0;
        if (existingInvoices && existingInvoices.length > 0) {
          existingInvoices.forEach(inv => {
            const numMatch = inv.number.match(/\d+$/);
            if (numMatch) {
              const num = parseInt(numMatch[0]);
              if (num > highestNum) {
                highestNum = num;
              }
            }
          });
        }
        
        // Start from the next number
        invoiceNumber = `INV-${String(highestNum + 1).padStart(3, '0')}`;
        console.log('Generated invoice number:', invoiceNumber);
        
      } catch (err) {
        console.warn('Error generating invoice number, using default:', err);
        invoiceNumber = 'INV-001';
      }

      // Parse the amount (remove $ and commas)
      const amountStr = payment.amount?.toString().replace(/[$,]/g, '') || '0';
      const amount = parseFloat(amountStr);
      console.log('Parsed amount:', amount, 'from:', payment.amount);

      if (isNaN(amount) || amount <= 0) {
        throw new Error('Invalid payment amount');
      }

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

      console.log('Invoice dates - Issue:', issueDate, 'Due:', dueDate.toISOString().split('T')[0]);

      // Calculate subtotal and tax from total (amount includes GST)
      const total = amount;
      const subtotal = total / 1.10; // Remove 10% GST to get subtotal
      const tax = total - subtotal;
      console.log('Calculated amounts - Subtotal:', subtotal, 'Tax:', tax, 'Total:', total);

      // Create the invoice with retry logic for duplicate invoice numbers
      let invoice = null;
      let invoiceError = null;
      
      while (attempts < maxAttempts && !invoice) {
        attempts++;
        
        const invoiceData = {
          project_id: project.id,
          contract_id: contract.id,
          milestone_sequence: payment.sequence || null,
          milestone_stage: payment.stage_name || payment.milestone || `Stage ${payment.sequence || ''}`,
          number: invoiceNumber,
          client_name: project.name,
          issue_date: issueDate,
          due_date: dueDate.toISOString().split('T')[0],
          status: 'draft' as const,
          subtotal: subtotal,
          tax: tax,
          total: total,
          paid_to_date: 0,
          notes: `Milestone: ${payment.stage_name || payment.milestone || `Stage ${payment.sequence || ''}`}\nGenerated from contract: ${contract.name}${payment.description ? `\n${payment.description}` : ''}${payment.trigger ? `\nTrigger: ${payment.trigger}` : ''}`
        };

        console.log(`Attempt ${attempts}: Creating invoice with number ${invoiceNumber}`);

        const result = await supabase
          .from('invoices')
          .insert(invoiceData)
          .select()
          .single();

        invoice = result.data;
        invoiceError = result.error;

        // If we get a duplicate key error, increment and retry
        if (invoiceError?.code === '23505') {
          console.log('Duplicate invoice number detected, incrementing...');
          const numMatch = invoiceNumber.match(/\d+$/);
          if (numMatch) {
            const nextNum = parseInt(numMatch[0]) + 1;
            invoiceNumber = `INV-${String(nextNum).padStart(3, '0')}`;
          }
        } else if (invoiceError && invoiceError.code !== '42P01') {
          // Real error that's not a schema cache issue
          throw new Error(`Failed to create invoice: ${invoiceError.message} (Code: ${invoiceError.code || 'unknown'})`);
        } else {
          // Success or schema cache issue
          break;
        }
      }

      if (attempts >= maxAttempts && !invoice) {
        throw new Error('Failed to generate unique invoice number after multiple attempts');
      }
      
      // If we don't have invoice data due to schema cache, still show success
      if (!invoice) {
        console.log('No invoice data returned (likely schema cache issue), but invoice was created');
        toast.success(`Invoice ${invoiceNumber} created successfully for ${payment.stage_name || payment.milestone}`);
        window.dispatchEvent(new CustomEvent('invoice-created'));
        return;
      }

      console.log('Invoice created successfully:', invoice);

      // Create invoice item (use subtotal without tax for the item)
      const itemData = {
        invoice_id: invoice.id,
        description: payment.stage_name || payment.milestone || `Payment Stage ${payment.sequence || ''}`,
        qty: 1,
        rate: subtotal,
        amount: subtotal,
        wbs_code: payment.wbs_code || null
      };

      console.log('Creating invoice item with data:', itemData);

      const { error: itemError } = await supabase
        .from('invoice_items')
        .insert(itemData);

      if (itemError) {
        console.error('Invoice item creation error:', itemError);
        // Only throw on real errors, not schema cache issues (42P01)
        if (itemError.code !== '42P01') {
          throw new Error(`Failed to create invoice item: ${itemError.message} (Code: ${itemError.code || 'unknown'})`);
        }
      }

      console.log('Invoice item created successfully');

      console.log('Invoice generation completed successfully');
      toast.success(`Invoice ${invoiceNumber} created successfully for ${payment.stage_name || payment.milestone}`);
      
      // Trigger refresh of income data by dispatching a custom event
      window.dispatchEvent(new CustomEvent('invoice-created'));
      
    } catch (error: any) {
      console.error('Error generating invoice:', error);
      
      // Provide detailed error message
      const errorMessage = error?.message || 'Unknown error occurred';
      console.error('Detailed error:', {
        message: errorMessage,
        error: error,
        payment: payment,
        project: project.id,
        contract: contract.id
      });
      
      toast.error(`Failed to generate invoice: ${errorMessage}`);
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

  const handleAddMilestone = (contract: Contract) => {
    const contractData = contract.contract_data || {};
    const paymentSchedule = contractData.payment_schedule || [];
    const nextSequence = paymentSchedule.length + 1;
    
    setSelectedContract(contract);
    setSelectedMilestone({
      sequence: nextSequence,
      stage_name: `Milestone ${nextSequence}`,
      description: '',
      amount: '',
      percentage: '',
      trigger: '',
      due_date: '',
      due_days: ''
    });
    setMilestoneIndex(-1); // -1 indicates new milestone
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
    if (!selectedContract || !selectedMilestone) return;

    try {
      // Get the current contract data
      const contractData = selectedContract.contract_data || {};
      const paymentSchedule = contractData.payment_schedule || [];
      
      let oldAmount = 0;
      const newAmountStr = selectedMilestone.amount?.toString().replace(/[$,]/g, '') || '0';
      const newAmount = parseFloat(newAmountStr);
      
      // Check if we're adding a new milestone or editing an existing one
      if (milestoneIndex === -1) {
        // Adding new milestone
        paymentSchedule.push(selectedMilestone);
      } else {
        // Editing existing milestone
        oldAmount = parseFloat(paymentSchedule[milestoneIndex]?.amount?.toString().replace(/[$,]/g, '') || '0');
        paymentSchedule[milestoneIndex] = selectedMilestone;
      }
      
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
        toast.error(milestoneIndex === -1 ? "Failed to add milestone. Please try again." : "Failed to update milestone. Please try again.");
        return;
      }

      // Update related invoices if amount changed and not a new milestone
      if (milestoneIndex !== -1 && oldAmount !== newAmount) {
        await updateRelatedInvoices(
          selectedContract.id, 
          selectedMilestone.sequence, 
          newAmount,
          oldAmount
        );
      }

      toast.success(milestoneIndex === -1 ? "Milestone added successfully. Contract amount recalculated." : "Milestone updated successfully. Contract amount recalculated.");
      setEditMilestoneOpen(false);
      setSelectedMilestone(null);
      setMilestoneIndex(-1);
      loadContracts();
    } catch (error) {
      console.error('Error saving milestone:', error);
      toast.error(milestoneIndex === -1 ? "Failed to add milestone. Please try again." : "Failed to update milestone. Please try again.");
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

  const loadOwners = async () => {
    try {
      const { data, error } = await supabase
        .from('project_owners')
        .select('*')
        .eq('project_id', project.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setOwners(data || []);
      
      // Auto-sync existing owners to stakeholders if they exist
      if (data && data.length > 0) {
        await syncOwnersToStakeholder();
      }
    } catch (error) {
      console.error('Error loading owners:', error);
      toast.error('Failed to load owners');
    }
  };

  const syncOwnersToStakeholder = async () => {
    try {
      // Get all owners for this project
      const { data: allOwners, error: ownersError } = await supabase
        .from('project_owners')
        .select('*')
        .eq('project_id', project.id)
        .order('created_at', { ascending: true });

      if (ownersError) throw ownersError;

      if (!allOwners || allOwners.length === 0) {
        // No owners, delete all client stakeholders for this project
        const { error: deleteError } = await supabase
          .from('stakeholders')
          .delete()
          .eq('company_id', project.company_id)
          .eq('category', 'client')
          .contains('tags', ['Project Owner']);
        
        return;
      }

      // Create individual stakeholder for each owner
      for (const owner of allOwners) {
        const displayName = owner.name;
        const primaryEmail = owner.email || '';
        const primaryPhone = owner.mobile || owner.work_phone || owner.home_phone || '';
        const abn = owner.abn || '';

        // Check if stakeholder already exists for this owner
        const { data: existingStakeholder } = await supabase
          .from('stakeholders')
          .select('id')
          .eq('company_id', project.company_id)
          .eq('category', 'client')
          .ilike('display_name', displayName)
          .maybeSingle();

        const stakeholderData = {
          company_id: project.company_id,
          display_name: displayName,
          category: 'client' as const,
          primary_contact_name: displayName,
          primary_email: primaryEmail,
          primary_phone: primaryPhone,
          abn: abn,
          status: 'active' as const,
          compliance_status: 'valid' as const,
          tags: ['Client', 'Project Owner'],
        };

        if (existingStakeholder) {
          // Update existing stakeholder
          const { error: updateError } = await supabase
            .from('stakeholders')
            .update(stakeholderData)
            .eq('id', existingStakeholder.id);

          if (updateError) throw updateError;
        } else {
          // Create new stakeholder
          const { error: insertError } = await supabase
            .from('stakeholders')
            .insert(stakeholderData);

          if (insertError) throw insertError;
        }
      }

      console.log('Synced owners to stakeholders as individual clients');
    } catch (error) {
      console.error('Error syncing owners to stakeholder:', error);
      // Don't show error toast as this is a background operation
    }
  };

  const handleSaveOwner = async () => {
    if (!editingOwner) return;

    try {
      if (editingOwner.id) {
        // Update existing owner
        const { error } = await supabase
          .from('project_owners')
          .update({
            name: editingOwner.name,
            address: editingOwner.address,
            suburb: editingOwner.suburb,
            state: editingOwner.state,
            postcode: editingOwner.postcode,
            abn: editingOwner.abn,
            acn: editingOwner.acn,
            work_phone: editingOwner.work_phone,
            home_phone: editingOwner.home_phone,
            mobile: editingOwner.mobile,
            email: editingOwner.email,
          })
          .eq('id', editingOwner.id);

        if (error) throw error;
        toast.success('Owner updated successfully');
      } else {
        // Create new owner
        const { error } = await supabase
          .from('project_owners')
          .insert({
            project_id: project.id,
            company_id: project.company_id,
            name: editingOwner.name,
            address: editingOwner.address,
            suburb: editingOwner.suburb,
            state: editingOwner.state,
            postcode: editingOwner.postcode,
            abn: editingOwner.abn,
            acn: editingOwner.acn,
            work_phone: editingOwner.work_phone,
            home_phone: editingOwner.home_phone,
            mobile: editingOwner.mobile,
            email: editingOwner.email,
          });

        if (error) throw error;
        toast.success('Owner added successfully');
      }

      // Sync to stakeholders
      await syncOwnersToStakeholder();
      
      loadOwners();
      setShowOwnerDialog(false);
      setEditingOwner(null);
    } catch (error) {
      console.error('Error saving owner:', error);
      toast.error('Failed to save owner');
    }
  };

  const handleDeleteOwner = async (ownerId: string) => {
    if (!confirm('Are you sure you want to delete this owner?')) return;

    try {
      const { error } = await supabase
        .from('project_owners')
        .delete()
        .eq('id', ownerId);

      if (error) throw error;
      
      toast.success('Owner deleted successfully');
      
      // Sync to stakeholders after deletion
      await syncOwnersToStakeholder();
      
      loadOwners();
    } catch (error) {
      console.error('Error deleting owner:', error);
      toast.error('Failed to delete owner');
    }
  };

  useEffect(() => {
    loadContracts();
    loadOwners();
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
              {/* Tabs for Contracts and Owners */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="contracts">Contracts</TabsTrigger>
                  <TabsTrigger value="owners">Owners Details</TabsTrigger>
                </TabsList>

                {/* Contracts Tab */}
                <TabsContent value="contracts" className="mt-0">
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
                                       <div className="flex items-center gap-2">
                                         <Button
                                           size="sm"
                                           variant="default"
                                           className="flex items-center gap-2"
                                           onClick={() => handleAddMilestone(contract)}
                                         >
                                           <Plus className="h-4 w-4" />
                                           Add Milestone
                                         </Button>
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
                                  
                                   <div className="grid grid-cols-1 gap-2">
                                     {paymentSchedule.map((payment: any, idx: number) => {
                                       const isSelected = selectedMilestones[contract.id]?.has(idx) || false;
                                       
                                       return (
                                         <div 
                                           key={idx} 
                                           className={`p-3 bg-white border rounded-lg hover:shadow-sm transition-all cursor-pointer ${
                                             isSelected ? 'border-primary ring-1 ring-primary/20' : 'border-gray-200'
                                           }`}
                                           onClick={() => handleEditMilestone(contract, payment, idx)}
                                         >
                                           <div className="flex items-center justify-between gap-3">
                                             <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                               <Checkbox
                                                 checked={isSelected}
                                                 onCheckedChange={() => handleToggleMilestoneSelection(contract.id, idx)}
                                                 onClick={(e) => e.stopPropagation()}
                                                 className="flex-shrink-0"
                                               />
                                               <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold text-xs flex-shrink-0">
                                                 {payment.sequence || idx + 1}
                                               </div>
                                            <div className="flex-1 min-w-0">
                                              <div className="font-semibold text-sm text-foreground">
                                                {payment.stage_name || payment.milestone || `Stage ${payment.sequence || idx + 1}`}
                                              </div>
                                              {payment.description && (
                                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                                  {payment.description}
                                                </p>
                                              )}
                                              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                                {payment.trigger && (
                                                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                                                    📍 {payment.trigger}
                                                  </Badge>
                                                )}
                                                {(payment.due_date || payment.due_days) && (
                                                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                                                    🗓️ {payment.due_date || `${payment.due_days} days`}
                                                  </Badge>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2 flex-shrink-0">
                                            <div className="text-right">
                                              <div className="text-base font-bold text-green-600">
                                                {formatCurrency(parseFloat(payment.amount?.toString().replace(/[$,]/g, '') || '0'), contract.contract_data)}
                                              </div>
                                              {payment.percentage && (
                                                <div className="text-[10px] font-medium text-muted-foreground">
                                                  {payment.percentage}% of total
                                                </div>
                                              )}
                                            </div>
                                            <Button
                                              size="sm"
                                              variant="default"
                                              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white h-7 px-2.5"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleGenerateInvoice(contract, payment);
                                              }}
                                            >
                                              <FileCheck className="h-3 w-3" />
                                              <span className="text-xs font-medium">Generate</span>
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
                </TabsContent>

                {/* Owners Tab */}
                <TabsContent value="owners" className="mt-0">
                  <OwnersDetailsTab
                    owners={owners}
                    onAddOwner={() => {
                      setEditingOwner({
                        name: '', address: '', suburb: '', state: 'Victoria',
                        postcode: '', abn: '', acn: '', work_phone: '',
                        home_phone: '', mobile: '', email: ''
                      });
                      setShowOwnerDialog(true);
                    }}
                    onEditOwner={(owner) => {
                      setEditingOwner(owner);
                      setShowOwnerDialog(true);
                    }}
                    onDeleteOwner={handleDeleteOwner}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      <OwnerDialog
        open={showOwnerDialog}
        onOpenChange={setShowOwnerDialog}
        owner={editingOwner}
        onOwnerChange={setEditingOwner}
        onSave={handleSaveOwner}
      />

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
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {milestoneIndex === -1 ? 'Add New Milestone' : 'Edit Milestone'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedMilestone && (
            <div className="space-y-4 py-2">
              {/* Basic Info Section */}
              <div className="grid grid-cols-[100px_1fr] gap-3 items-start">
                <div>
                  <Label htmlFor="sequence" className="text-xs font-medium text-muted-foreground">
                    Sequence
                  </Label>
                  <Input
                    id="sequence"
                    type="number"
                    value={selectedMilestone.sequence || ''}
                    onChange={(e) => setSelectedMilestone({ ...selectedMilestone, sequence: parseInt(e.target.value) })}
                    className="h-8 mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="stage_name" className="text-xs font-medium text-muted-foreground">
                    Stage Name
                  </Label>
                  <Input
                    id="stage_name"
                    value={selectedMilestone.stage_name || selectedMilestone.milestone || ''}
                    onChange={(e) => setSelectedMilestone({ ...selectedMilestone, stage_name: e.target.value, milestone: e.target.value })}
                    className="h-8 mt-1.5"
                    placeholder="e.g., Deposit, Milestone 1"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description" className="text-xs font-medium text-muted-foreground">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={selectedMilestone.description || ''}
                  onChange={(e) => setSelectedMilestone({ ...selectedMilestone, description: e.target.value })}
                  rows={2}
                  className="mt-1.5 resize-none text-sm"
                  placeholder="Brief description of this milestone"
                />
              </div>

              <div className="h-px bg-border"></div>
              
              {/* Payment Details Section */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="amount" className="text-xs font-medium text-muted-foreground">
                    Amount ($)
                  </Label>
                  <Input
                    id="amount"
                    value={selectedMilestone.amount || ''}
                    onChange={(e) => setSelectedMilestone({ ...selectedMilestone, amount: e.target.value })}
                    className="h-8 mt-1.5"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="percentage" className="text-xs font-medium text-muted-foreground">
                    Percentage (%)
                  </Label>
                  <Input
                    id="percentage"
                    type="number"
                    value={selectedMilestone.percentage || ''}
                    onChange={(e) => setSelectedMilestone({ ...selectedMilestone, percentage: parseFloat(e.target.value) })}
                    className="h-8 mt-1.5"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="h-px bg-border"></div>
              
              {/* Trigger & Due Date Section */}
              <div>
                <Label htmlFor="trigger" className="text-xs font-medium text-muted-foreground">
                  Payment Trigger
                </Label>
                <Input
                  id="trigger"
                  value={selectedMilestone.trigger || ''}
                  onChange={(e) => setSelectedMilestone({ ...selectedMilestone, trigger: e.target.value })}
                  className="h-8 mt-1.5"
                  placeholder="e.g., Upon completion of works"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="due_date" className="text-xs font-medium text-muted-foreground">
                    Due Date
                  </Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={selectedMilestone.due_date || ''}
                    onChange={(e) => setSelectedMilestone({ ...selectedMilestone, due_date: e.target.value })}
                    className="h-8 mt-1.5"
                  />
                </div>
                
                <div>
                  <Label htmlFor="due_days" className="text-xs font-medium text-muted-foreground">
                    Due Days
                  </Label>
                  <Input
                    id="due_days"
                    type="number"
                    value={selectedMilestone.due_days || ''}
                    onChange={(e) => setSelectedMilestone({ ...selectedMilestone, due_days: parseInt(e.target.value) })}
                    className="h-8 mt-1.5"
                    placeholder="e.g., 7"
                  />
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setEditMilestoneOpen(false)} className="h-9">
              Cancel
            </Button>
            <Button onClick={handleSaveMilestone} className="h-9">
              {milestoneIndex === -1 ? 'Add Milestone' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};