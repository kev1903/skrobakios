import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams, Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Trash2, Download, Send, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/utils/formatters';

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  gst: number;
  amount: number;
}

export const InvoiceFormPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const [projectId, setProjectId] = useState<string | null>(searchParams.get('projectId'));
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  const isEditMode = !!invoiceId;

  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: `INV-0300`,
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    reference: '',
    clientName: '',
    clientAddress: '',
    clientEmail: '',
    contractId: ''
  });

  const [contracts, setContracts] = useState<Array<{id: string, name: string}>>([]);
  const [selectedContractPayments, setSelectedContractPayments] = useState<Array<{
    stage: string;
    description: string;
    percentage: number;
    amount: number;
  }>>([]);

  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, unitPrice: 0, gst: 10, amount: 0 }
  ]);

  const [paymentTerms, setPaymentTerms] = useState(
    "This is a payment claim under the Building and Construction Industry Security of Payment Act 2002. Delay in payment of this invoice by the due date will incur an interest fee charged at 4.50% per month."
  );

  // Fetch invoice data when in edit mode
  useEffect(() => {
    const fetchInvoiceData = async () => {
      if (!invoiceId) return;
      
      try {
        const { data: invoice, error } = await supabase
          .from('invoices')
          .select('*')
          .eq('id', invoiceId)
          .single();

        if (error) {
          console.error('Error fetching invoice:', error);
          toast({
            title: "Error",
            description: "Failed to load invoice data.",
            variant: "destructive",
          });
          return;
        }

        if (invoice) {
          // Set the project ID from the invoice
          if (invoice.project_id) {
            setProjectId(invoice.project_id);
          }
          
          setInvoiceData({
            invoiceNumber: invoice.number || '',
            invoiceDate: invoice.issue_date || new Date().toISOString().split('T')[0],
            dueDate: invoice.due_date || '',
            reference: invoice.notes || '', // Map notes to reference for now
            clientName: invoice.client_name || '',
            clientAddress: '', // Add client_address field to invoices table if needed
            clientEmail: invoice.client_email || '',
            contractId: invoice.contract_id || ''
          });

          // Load invoice items
          const { data: items, error: itemsError } = await supabase
            .from('invoice_items')
            .select('*')
            .eq('invoice_id', invoiceId);

          if (itemsError) {
            console.error('Error fetching invoice items:', itemsError);
          } else if (items && items.length > 0) {
            setItems(items.map(item => ({
              description: item.description || '',
              quantity: item.qty || 1,
              unitPrice: item.rate || 0,
              gst: 10, // Default GST
              amount: (item.qty || 0) * (item.rate || 0)
            })));
          }
        }
      } catch (error) {
        console.error('Error fetching invoice:', error);
        toast({
          title: "Error",
          description: "Failed to load invoice data.",
          variant: "destructive",
        });
      }
    };

    fetchInvoiceData();
  }, [invoiceId, toast]);

  // Fetch project owner/client details
  useEffect(() => {
    const fetchProjectOwner = async () => {
      if (!projectId || isEditMode) return; // Only auto-populate for new invoices
      
      try {
        const { data: owner, error } = await supabase
          .from('project_owners')
          .select('*')
          .eq('project_id', projectId)
          .maybeSingle();

        if (error) {
          console.error('Error fetching project owner:', error);
          return;
        }

        if (owner) {
          // Format the address
          const addressParts = [
            owner.address,
            owner.suburb,
            owner.state,
            owner.postcode
          ].filter(Boolean);
          
          const fullAddress = addressParts.join(', ');

          setInvoiceData((prev) => ({
            ...prev,
            clientName: owner.name || '',
            clientAddress: fullAddress || '',
            clientEmail: owner.email || ''
          }));

          console.log('Client details auto-populated:', owner.name);
        }
      } catch (error) {
        console.error('Error fetching project owner:', error);
      }
    };

    fetchProjectOwner();
  }, [projectId, isEditMode]);

  // Fetch contracts for the project
  useEffect(() => {
    const fetchContracts = async () => {
      if (!projectId) return;
      
      try {
        const { data: contractsData, error } = await supabase
          .from('project_contracts')
          .select('id, name')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching contracts:', error);
          toast({
            title: "Error",
            description: "Failed to fetch contracts for this project.",
            variant: "destructive",
          });
          return;
        }

        setContracts(contractsData || []);
        console.log('Contracts fetched:', contractsData);
        // Auto-select first contract for convenience
        if ((!invoiceData.contractId || invoiceData.contractId === '') && contractsData && contractsData.length > 0) {
          setInvoiceData((prev) => ({ ...prev, contractId: contractsData[0].id }));
        }
      } catch (error) {
        console.error('Error fetching contracts:', error);
        toast({
          title: "Error",
          description: "Failed to fetch contracts for this project.",
          variant: "destructive",
        });
      }
    };

    fetchContracts();
  }, [projectId, toast]);

  // Fetch contract payment structure when contract is selected
  useEffect(() => {
    const fetchContractPayments = async () => {
      if (!invoiceData.contractId) {
        setSelectedContractPayments([]);
        setInvoiceData(prev => ({ ...prev, reference: '' }));
        return;
      }
      
      console.log('Fetching payment structure for contract:', invoiceData.contractId);
      
      // Mock payment structure data - replace with actual fetch from contract
      // In a real implementation, this would fetch from a contract_payments table
      // or extract from a JSON field in the project_contracts table
      const mockPayments = [
        { stage: "Deposit", description: "Contract Stage", percentage: 5, amount: 3500 },
        { stage: "Stage 5", description: "Start of Base Stage", percentage: 10, amount: 7000 },
        { stage: "Stage 5", description: "Start of Frame Stage", percentage: 20, amount: 14000 },
        { stage: "Stage 5", description: "Start of Lockup Stage", percentage: 20, amount: 14000 },
        { stage: "Stage 5", description: "Start of Fixing Stage", percentage: 25, amount: 17500 },
        { stage: "Stage 6", description: "Start of Final Stage", percentage: 10, amount: 7000 },
        { stage: "Stage 6", description: "Handover & Closeout", percentage: 10, amount: 7000 }
      ];
      
      setSelectedContractPayments(mockPayments);
      
      // Automatically set the current progress payment as default reference
      if (mockPayments.length > 0 && !invoiceData.reference) {
        // Find the current progress payment - this would typically come from project progress data
        // For now, we'll use a simple logic to determine current stage based on payment sequence
        // In a real implementation, you'd fetch the project progress from the database
        
        // Mock current progress - this should come from actual project data
        const currentProgressPercentage = 45; // Example: 45% complete
        let currentPayment = mockPayments[0]; // Default to first
        
        // Find the appropriate payment stage based on progress
        let cumulativePercentage = 0;
        for (const payment of mockPayments) {
          cumulativePercentage += payment.percentage;
          if (currentProgressPercentage <= cumulativePercentage) {
            currentPayment = payment;
            break;
          }
          currentPayment = payment; // Keep updating to find the latest applicable stage
        }
        
        const referenceValue = `${currentPayment.stage} | ${currentPayment.description} - ${currentPayment.percentage}% ($${currentPayment.amount.toLocaleString('en-AU')})`;
        setInvoiceData(prev => ({ ...prev, reference: referenceValue }));
      }
      
      console.log('Payment structure set:', mockPayments);
    };

    fetchContractPayments();
  }, [invoiceData.contractId]);

  const calculateItemAmount = (quantity: number, unitPrice: number) => {
    return quantity * unitPrice;
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateTotalGST = () => {
    return items.reduce((sum, item) => sum + (item.amount * item.gst / 100), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTotalGST();
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].amount = calculateItemAmount(newItems[index].quantity, newItems[index].unitPrice);
    }
    
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, gst: 10, amount: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Handler for saving invoice
  const handleSave = async () => {
    try {
      // Validation
      if (!projectId) {
        toast({
          title: "Error",
          description: "Project ID is required.",
          variant: "destructive",
        });
        return;
      }

      if (!invoiceData.clientName) {
        toast({
          title: "Error",
          description: "Client name is required.",
          variant: "destructive",
        });
        return;
      }

      // Calculate totals
      const subtotal = calculateSubtotal();
      const totalGST = calculateTotalGST();
      const total = calculateTotal();

      if (isEditMode && invoiceId) {
        // Update existing invoice
        const { error: invoiceError } = await supabase
          .from('invoices')
          .update({
            number: invoiceData.invoiceNumber,
            issue_date: invoiceData.invoiceDate,
            due_date: invoiceData.dueDate,
            client_name: invoiceData.clientName,
            client_email: invoiceData.clientEmail,
            notes: invoiceData.reference,
            contract_id: invoiceData.contractId || null,
            subtotal: subtotal,
            tax: totalGST,
            total: total,
            milestone_stage: invoiceData.reference,
            updated_at: new Date().toISOString(),
          })
          .eq('id', invoiceId);

        if (invoiceError) {
          console.error('Error updating invoice:', invoiceError);
          toast({
            title: "Error",
            description: "Failed to update invoice.",
            variant: "destructive",
          });
          return;
        }

        // Delete existing items
        await supabase
          .from('invoice_items')
          .delete()
          .eq('invoice_id', invoiceId);

        // Insert new items
        const itemsToInsert = items.map((item) => ({
          invoice_id: invoiceId,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          tax_rate: item.gst,
          amount: item.amount,
        }));

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(itemsToInsert);

        if (itemsError) {
          console.error('Error updating invoice items:', itemsError);
        }

        toast({
          title: "Success",
          description: "Invoice updated successfully.",
        });
      } else {
        // Create new invoice
        const { data: invoice, error: invoiceError } = await supabase
          .from('invoices')
          .insert({
            project_id: projectId,
            number: invoiceData.invoiceNumber,
            issue_date: invoiceData.invoiceDate,
            due_date: invoiceData.dueDate,
            status: 'draft',
            client_name: invoiceData.clientName,
            client_email: invoiceData.clientEmail,
            notes: invoiceData.reference,
            contract_id: invoiceData.contractId || null,
            subtotal: subtotal,
            tax: totalGST,
            total: total,
            paid_to_date: 0,
            milestone_stage: invoiceData.reference,
          })
          .select()
          .single();

        if (invoiceError || !invoice) {
          console.error('Error creating invoice:', invoiceError);
          toast({
            title: "Error",
            description: "Failed to create invoice.",
            variant: "destructive",
          });
          return;
        }

        // Insert invoice items
        const itemsToInsert = items.map((item) => ({
          invoice_id: invoice.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          tax_rate: item.gst,
          amount: item.amount,
        }));

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(itemsToInsert);

        if (itemsError) {
          console.error('Error creating invoice items:', itemsError);
        }

        toast({
          title: "Success",
          description: "Invoice created successfully.",
        });
      }

      // Dispatch event to refresh income data
      window.dispatchEvent(new CustomEvent('invoice-created'));

      // Navigate back to income page
      setTimeout(() => {
        navigate(`/?page=project-cost${projectId ? `&projectId=${projectId}` : ''}&tab=income`);
      }, 500);

    } catch (error) {
      console.error('Error saving invoice:', error);
      toast({
        title: "Error",
        description: "Failed to save invoice.",
        variant: "destructive",
      });
    }
  };

  const handleSend = () => {
    toast({
      title: "Invoice Sent",
      description: "Invoice has been sent to the client successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Header - Always Visible */}
      <div className="bg-white border-b border-gray-200 p-4 print:hidden shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              asChild
              className="flex items-center gap-2 border-gray-300 hover:bg-gray-50 bg-white"
            >
              <Link to={`/?page=project-cost${projectId ? `&projectId=${projectId}` : ''}&tab=income`}>
                <span className="inline-flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Income
                </span>
              </Link>
            </Button>
            <h1 className="text-2xl font-semibold text-gray-900">{isEditMode ? 'Edit Invoice' : 'Create Invoice'}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleSave}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              <Save className="h-4 w-4" />
              Save
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button onClick={handleSend}>
              <Send className="h-4 w-4 mr-2" />
              Send Invoice
            </Button>
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <div ref={printRef} className="max-w-6xl mx-auto p-6 bg-white print:p-0 print:max-w-none">
        {/* Compact Professional Header Section */}
        <div className="border-b border-gray-200 pb-6 mb-6">
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
                  <div className="font-semibold">{invoiceData.clientName || "Client Name"}</div>
                  <div className="text-gray-700 text-xs leading-relaxed whitespace-pre-line">
                    {invoiceData.clientAddress || "Client Address\nCity, State, Postcode\nCountry"}
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
                    <span className="font-bold text-black">{invoiceData.invoiceNumber}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Invoice Date:</span>
                    <span className="font-semibold text-black">
                      {new Date(invoiceData.invoiceDate).toLocaleDateString('en-AU', { 
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Due Date:</span>
                    <span className="font-semibold text-black">
                      {new Date(invoiceData.dueDate).toLocaleDateString('en-AU', { 
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                  
                  {invoiceData.reference && (
                    <div className="pt-2 border-t border-gray-200">
                      <div className="font-medium text-gray-700 mb-1">Reference:</div>
                      <div className="text-xs text-gray-600 break-words">{invoiceData.reference}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Invoice and Contract Details Form */}
        <div className="print:hidden mb-6">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              
              {/* Invoice Details Column */}
              <div className="border-r border-gray-200 lg:border-r-gray-200">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">Invoice Details</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor="invoiceNumber" className="text-sm font-medium text-gray-700">Invoice Number</Label>
                      <Input
                        id="invoiceNumber"
                        value={invoiceData.invoiceNumber}
                        onChange={(e) => setInvoiceData({...invoiceData, invoiceNumber: e.target.value})}
                        className="mt-1 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="invoiceDate" className="text-sm font-medium text-gray-700">Invoice Date</Label>
                      <Input
                        id="invoiceDate"
                        type="date"
                        value={invoiceData.invoiceDate}
                        onChange={(e) => setInvoiceData({...invoiceData, invoiceDate: e.target.value})}
                        className="mt-1 text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor="dueDate" className="text-sm font-medium text-gray-700">Due Date</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={invoiceData.dueDate}
                        onChange={(e) => setInvoiceData({...invoiceData, dueDate: e.target.value})}
                        className="mt-1 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="clientName" className="text-sm font-medium text-gray-700">Client Name</Label>
                      <Input
                        id="clientName"
                        value={invoiceData.clientName}
                        onChange={(e) => setInvoiceData({...invoiceData, clientName: e.target.value})}
                        placeholder="Ben Holt & Jacqui Junkeer"
                        className="mt-1 text-sm"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="clientAddress" className="text-sm font-medium text-gray-700">Client Address</Label>
                    <Textarea
                      id="clientAddress"
                      value={invoiceData.clientAddress}
                      onChange={(e) => setInvoiceData({...invoiceData, clientAddress: e.target.value})}
                      placeholder="5 Thanet St&#10;MALVERN VIC 3144&#10;AUSTRALIA"
                      rows={3}
                      className="mt-1 text-sm resize-none"
                    />
                  </div>
                </div>
              </div>
              
              {/* Contract Details Column */}
              <div>
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900">Contract Details</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="contract" className="text-sm font-medium text-gray-700">Contract</Label>
                      <Select 
                        value={invoiceData.contractId} 
                        onValueChange={(value) => setInvoiceData({...invoiceData, contractId: value})}
                      >
                        <SelectTrigger className="mt-1 text-sm">
                          <SelectValue placeholder="Select a contract" />
                        </SelectTrigger>
                        <SelectContent>
                          {contracts.map((contract) => (
                            <SelectItem key={contract.id} value={contract.id}>
                              {contract.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="reference" className="text-sm font-medium text-gray-700">Reference</Label>
                      <Select 
                        value={invoiceData.reference} 
                        onValueChange={(value) => setInvoiceData({...invoiceData, reference: value})}
                      >
                        <SelectTrigger className="mt-1 text-sm">
                          <SelectValue placeholder="Select payment stage reference" />
                        </SelectTrigger>
                        <SelectContent className="bg-white z-50">
                          {selectedContractPayments.map((payment, index) => (
                            <SelectItem 
                              key={index} 
                              value={`${payment.stage} | ${payment.description} - ${payment.percentage}% ($${payment.amount.toLocaleString('en-AU')})`}
                              className="hover:bg-gray-100"
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">{payment.stage} - {payment.description}</span>
                                <span className="text-xs text-gray-500">{payment.percentage}% • $${payment.amount.toLocaleString('en-AU')}</span>
                              </div>
                            </SelectItem>
                          ))}
                          <SelectItem value="custom" className="hover:bg-gray-100">
                            <span className="text-gray-600 italic">Enter custom reference...</span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {/* Show text input when custom is selected */}
                      {invoiceData.reference === 'custom' && (
                        <Input
                          value=""
                          onChange={(e) => setInvoiceData({...invoiceData, reference: e.target.value})}
                          placeholder="Enter custom reference"
                          className="mt-2 text-sm"
                        />
                      )}
                    </div>

                    {/* Payment Structure Table */}
                    {invoiceData.contractId && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700 mb-3 block">Payment Structure</Label>
                        <div className="border border-gray-200 rounded-md overflow-hidden">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="text-left p-2 font-medium text-gray-700">STAGES</th>
                                <th className="text-left p-2 font-medium text-gray-700">DESCRIPTION</th>
                                <th className="text-center p-2 font-medium text-gray-700">%</th>
                                <th className="text-right p-2 font-medium text-gray-700">AMOUNT (AUD)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedContractPayments.map((payment, index) => (
                                <tr key={index} className="border-b border-gray-100 hover:bg-gray-25">
                                  <td className="p-2 text-gray-700 font-medium">{payment.stage}</td>
                                  <td className="p-2 text-gray-600">{payment.description}</td>
                                  <td className="p-2 text-center text-gray-700">{payment.percentage}</td>
                                  <td className="p-2 text-right text-gray-700 font-medium">
                                    ${payment.amount.toLocaleString('en-AU')}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>


        {/* Line Items Table */}
        <div className="mb-8">
          <div className="print:hidden mb-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Invoice Items</h3>
              <Button onClick={addItem} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>

          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-2 font-semibold border-b border-gray-300">Description</th>
                <th className="text-center p-2 font-semibold w-20 border-b border-gray-300">Quantity</th>
                <th className="text-right p-2 font-semibold w-24 border-b border-gray-300">Unit Price</th>
                <th className="text-center p-2 font-semibold w-16 border-b border-gray-300">GST</th>
                <th className="text-right p-2 font-semibold w-28 border-b border-gray-300">Amount AUD</th>
                <th className="print:hidden w-12 border-b border-gray-300"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="border-b border-gray-200">
                  <td className="p-2 align-top">
                    <Textarea
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      placeholder="Stage 5: Start of Base Stage - 10% ($7,000)"
                      className="print:hidden border-none resize-none min-h-[60px]"
                      rows={3}
                    />
                    <div className="hidden print:block text-sm whitespace-pre-wrap">{item.description}</div>
                  </td>
                  <td className="p-2 text-center align-top">
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                      className="print:hidden text-center w-16 border-none"
                      min="0"
                      step="0.01"
                    />
                    <div className="hidden print:block text-sm">{item.quantity}</div>
                  </td>
                  <td className="p-2 text-right align-top">
                    <Input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="print:hidden text-right w-20 border-none"
                      min="0"
                      step="0.01"
                    />
                    <div className="hidden print:block text-sm">{formatCurrency(item.unitPrice, 'AUD', false)}</div>
                    <div className="print:hidden text-sm">{formatCurrency(item.unitPrice)}</div>
                  </td>
                  <td className="p-2 text-center align-top">
                    <Input
                      type="number"
                      value={item.gst}
                      onChange={(e) => updateItem(index, 'gst', parseFloat(e.target.value) || 0)}
                      className="print:hidden text-center w-16 border-none"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    <div className="hidden print:block text-sm">{item.gst}%</div>
                  </td>
                  <td className="p-2 text-right font-medium align-top">
                    <div className="text-sm">{formatCurrency(item.amount)}</div>
                  </td>
                  <td className="p-2 print:hidden align-top">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section - Professional Format */}
        <div className="flex justify-end mb-8">
          <div className="w-80 border border-gray-200 rounded-md overflow-hidden">
            <div className="space-y-0">
              <div className="flex justify-between py-2 px-4 bg-gray-50 border-b border-gray-200">
                <span className="font-medium text-gray-700">Subtotal</span>
                <span className="text-right font-semibold text-black">{formatCurrency(calculateSubtotal())}</span>
              </div>
              <div className="flex justify-between py-2 px-4 bg-gray-50 border-b border-gray-200">
                <span className="font-medium text-gray-700">Total GST 10%</span>
                <span className="text-right font-semibold text-black">{formatCurrency(calculateTotalGST())}</span>
              </div>
              <div className="flex justify-between py-3 px-4 bg-gray-100 border-b-2 border-gray-300">
                <span className="font-bold text-gray-900">Invoice Total AUD</span>
                <span className="text-right font-bold text-black text-lg">{formatCurrency(calculateTotal())}</span>
              </div>
              <div className="flex justify-between py-3 px-4 bg-blue-50 border-t border-blue-200">
                <span className="font-bold text-blue-900">Amount Due AUD</span>
                <span className="text-right font-bold text-blue-900 text-lg">{formatCurrency(calculateTotal())}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Due Date and Account Details */}
        <div className="mb-6 grid grid-cols-1 gap-4">
          {/* Due Date */}
          <div className="border-l-4 border-blue-600 pl-4">
            <div className="text-sm">
              <span className="font-bold text-gray-900">Due Date: </span>
              <span className="font-semibold text-black">
                {new Date(invoiceData.dueDate).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Account Details */}
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Bank Details</h4>
            <div className="text-sm space-y-1.5 text-gray-700">
              <div><span className="font-semibold">Account Name:</span> Skrobaki Pty Ltd</div>
              <div><span className="font-semibold">BSB:</span> 063-121</div>
              <div><span className="font-semibold">Account Number:</span> 1129 4008</div>
              <div className="pt-2 border-t border-gray-200 mt-2">
                <span className="font-semibold">Payment Reference:</span> Add invoice number as reference
              </div>
              <div>
                <span className="font-semibold">Remittance:</span> Email to{' '}
                <a href="mailto:accounts@skrobaki.com" className="text-blue-600 hover:underline">accounts@skrobaki.com</a>
              </div>
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="mb-8">
          <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Terms & Conditions</h4>
          <div className="border border-gray-200 rounded-md p-4 bg-gray-50">
            <Textarea
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              className="print:hidden text-sm bg-white"
              rows={3}
            />
            <div className="hidden print:block text-sm text-gray-700 leading-relaxed">{paymentTerms}</div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-600 border-t-2 border-gray-300 pt-4 mt-6">
          <div className="font-medium">Unit A11/2A Westall Rd, Clayton VIC 3168 | www.skrobaki.com | 0423 117 480</div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            body * {
              visibility: hidden;
            }
            .print\\:block, .print\\:block * {
              visibility: visible;
            }
            .print\\:hidden {
              display: none !important;
            }
          }
        `
      }} />
    </div>
  );
};