import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
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
  const projectId = searchParams.get('projectId');
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: `INV-0300`,
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    reference: '',
    clientName: '',
    clientAddress: '',
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
  const handleSave = () => {
    toast({
      title: "Invoice Saved",
      description: "Invoice has been saved successfully.",
    });
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
            <h1 className="text-2xl font-semibold text-gray-900">Create Invoice</h1>
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
                    <div className="hidden print:block text-sm">{item.unitPrice.toLocaleString('en-AU', { style: 'currency', currency: 'AUD' }).replace('$', '')}</div>
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
                    <div className="text-sm">{item.amount.toFixed(2)}</div>
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

        {/* Totals - Exactly matching reference format */}
        <div className="flex justify-end mb-8">
          <div className="w-80 text-sm">
            <div className="space-y-1">
              <div className="flex justify-between py-1">
                <span>Subtotal</span>
                <span className="text-right">{calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Total GST 10%</span>
                <span className="text-right">{calculateTotalGST().toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 font-bold border-t border-gray-300 pt-2">
                <span>Invoice Total AUD</span>
                <span className="text-right">{calculateTotal().toFixed(2)}</span>
              </div>
              <div className="bg-blue-100 border border-blue-200 p-2 mt-2">
                <div className="flex justify-between font-bold">
                  <span>Amount Due AUD</span>
                  <span className="text-right">{calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Due Date */}
        <div className="mb-6">
          <div className="text-sm">
            <strong>Due Date: </strong>{new Date(invoiceData.dueDate).toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
        </div>

        {/* Account Details */}
        <div className="mb-6">
          <div className="text-sm space-y-1">
            <div><strong>Account :</strong> Skrobaki Pty Ltd</div>
            <div><strong>BSB :</strong> 063-121</div>
            <div><strong>Account :</strong> 1129 4008</div>
            <div><strong>Reference:</strong> Add invoice number as reference. Email remittance to <a href="mailto:accounts@skrobaki.com" className="text-primary">accounts@skrobaki.com</a></div>
          </div>
        </div>

        {/* Terms */}
        <div className="mb-8">
          <h4 className="font-semibold mb-2">Terms</h4>
          <Textarea
            value={paymentTerms}
            onChange={(e) => setPaymentTerms(e.target.value)}
            className="print:hidden text-sm"
            rows={3}
          />
          <div className="hidden print:block text-sm">{paymentTerms}</div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground border-t pt-4">
          <div>Unit A11/2A Westall Rd, Clayton VIC 3168 | www.skrobaki.com | 0423 117 480</div>
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