import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Building, FolderTree, Save, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface XeroInvoice {
  id: string;
  xero_invoice_id: string;
  invoice_number: string | null;
  contact_name: string | null;
  date: string | null;
  due_date: string | null;
  status: string | null;
  total: number | null;
  amount_due: number | null;
  currency_code: string | null;
  type: string | null;
  reference: string | null;
}

interface Project {
  id: string;
  name: string;
  project_id: string;
  description: string | null;
}

interface DigitalObject {
  id: string;
  name: string;
  object_type: string;
  stage: string;
  level: number;
}

interface XeroAccount {
  id: string;
  name: string;
  code: string | null;
  type: string | null;
}

export const InvoiceDetailsPage = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [invoice, setInvoice] = useState<XeroInvoice | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [digitalObjects, setDigitalObjects] = useState<DigitalObject[]>([]);
  const [accounts, setAccounts] = useState<XeroAccount[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Allocation states
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedDigitalObject, setSelectedDigitalObject] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (invoiceId) {
      fetchInvoiceData();
      fetchProjects();
      fetchAccounts();
    }
  }, [invoiceId]);

  useEffect(() => {
    if (selectedProject) {
      fetchDigitalObjects();
    } else {
      setDigitalObjects([]);
      setSelectedDigitalObject("");
    }
  }, [selectedProject]);

  const fetchInvoiceData = async () => {
    try {
      const { data, error } = await supabase
        .from('xero_invoices')
        .select('*')
        .eq('id', invoiceId)
        .single();

      if (error) throw error;
      setInvoice(data);
    } catch (error) {
      console.error('Error fetching invoice:', error);
      toast({
        title: "Error",
        description: "Failed to fetch invoice details",
        variant: "destructive",
      });
    }
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('name');

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchDigitalObjects = async () => {
    try {
      const { data, error } = await supabase
        .from('digital_objects')
        .select('*')
        .eq('project_id', selectedProject)
        .order('name');

      if (error) throw error;
      setDigitalObjects(data || []);
    } catch (error) {
      console.error('Error fetching digital objects:', error);
    }
  };

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('xero_accounts')
        .select('*')
        .order('name');

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAllocation = async () => {
    if (!selectedAccount) {
      toast({
        title: "Validation Error",
        description: "Please select an account",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Get current user ID
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // First check if allocation already exists
      const { data: existingAllocation, error: checkError } = await supabase
        .from('invoice_allocations')
        .select('*')
        .eq('invoice_id', invoiceId)
        .eq('user_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      const allocationData = {
        invoice_id: invoiceId,
        account_id: selectedAccount,
        project_id: selectedProject || null,
        digital_object_id: selectedDigitalObject || null,
        allocated_amount: invoice?.total || null,
        notes: notes || null,
        user_id: user.id
      };

      let result;
      if (existingAllocation) {
        // Update existing allocation
        result = await supabase
          .from('invoice_allocations')
          .update(allocationData)
          .eq('id', existingAllocation.id);
      } else {
        // Create new allocation
        result = await supabase
          .from('invoice_allocations')
          .insert([allocationData]);
      }

      if (result.error) {
        throw result.error;
      }

      toast({
        title: "Success",
        description: "Invoice allocation saved successfully",
      });
      
      // Navigate back to invoices page
      navigate('/invoices');
    } catch (error) {
      console.error('Error saving allocation:', error);
      toast({
        title: "Error",
        description: "Failed to save invoice allocation",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number | null, currency: string | null = 'USD') => {
    if (amount === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return null;
    
    const statusLower = status.toLowerCase();
    let className = "";

    switch (statusLower) {
      case 'paid':
        className = "bg-green-100 text-green-800 border-green-300";
        break;
      case 'draft':
        className = "bg-gray-100 text-gray-600 border-gray-300";
        break;
      case 'authorised':
      case 'sent':
        className = "bg-blue-100 text-blue-800 border-blue-300";
        break;
      case 'overdue':
        className = "bg-red-100 text-red-800 border-red-300";
        break;
      default:
        className = "bg-gray-100 text-gray-600 border-gray-300";
    }

    return (
      <Badge variant="outline" className={className}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading invoice details...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Invoice Not Found</h2>
            <p className="text-gray-600 mb-4">The requested invoice could not be found.</p>
            <Button onClick={() => navigate('/invoices')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Invoices
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/invoices')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Invoices</span>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invoice Details</h1>
            <p className="text-gray-600">Allocate invoice to accounts and projects</p>
          </div>
        </div>
        <Button onClick={handleSaveAllocation} disabled={isSaving} className="flex items-center space-x-2">
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Allocation'}</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invoice Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="w-5 h-5" />
              <span>Invoice Information</span>
            </CardTitle>
            <CardDescription>Details from Xero invoice</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Invoice Number</Label>
                <p className="text-lg font-semibold">{invoice.invoice_number || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Status</Label>
                <div className="mt-1">{getStatusBadge(invoice.status)}</div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Contact</Label>
                <p className="text-sm">{invoice.contact_name || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Reference</Label>
                <p className="text-sm">{invoice.reference || 'N/A'}</p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Invoice Date</Label>
                <p className="text-sm">{formatDate(invoice.date)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Due Date</Label>
                <p className="text-sm">{formatDate(invoice.due_date)}</p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Total Amount</Label>
                <p className="text-xl font-bold text-primary">
                  {formatCurrency(invoice.total, invoice.currency_code)}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Amount Due</Label>
                <p className="text-xl font-bold text-red-600">
                  {formatCurrency(invoice.amount_due, invoice.currency_code)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Allocation Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FolderTree className="w-5 h-5" />
              <span>Allocation</span>
            </CardTitle>
            <CardDescription>Assign this invoice to accounts and projects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Account Selection */}
            <div className="space-y-2">
              <Label htmlFor="account-select">
                Account <span className="text-red-500">*</span>
              </Label>
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger id="account-select">
                  <SelectValue placeholder="Select an account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{account.name}</span>
                        {account.code && (
                          <span className="text-xs text-gray-500">({account.code})</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {accounts.length === 0 && (
                <p className="text-xs text-gray-500">No accounts found. Sync with Xero to load accounts.</p>
              )}
            </div>

            {/* Project Selection */}
            <div className="space-y-2">
              <Label htmlFor="project-select">Project (Optional)</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger id="project-select">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="text-xs text-gray-500">{project.project_id}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Digital Object Selection */}
            {selectedProject && (
              <div className="space-y-2">
                <Label htmlFor="digital-object-select">Digital Object (Optional)</Label>
                <Select value={selectedDigitalObject} onValueChange={setSelectedDigitalObject}>
                  <SelectTrigger id="digital-object-select">
                    <SelectValue placeholder="Select a digital object" />
                  </SelectTrigger>
                  <SelectContent>
                    {digitalObjects.map((object) => (
                      <SelectItem key={object.id} value={object.id}>
                        <div>
                          <p className="font-medium">{object.name}</p>
                          <p className="text-xs text-gray-500">
                            {object.object_type} • {object.stage}
                          </p>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {digitalObjects.length === 0 && (
                  <p className="text-xs text-gray-500">No digital objects found in selected project.</p>
                )}
              </div>
            )}

            {/* Notes Section */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes about this allocation..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            {/* Allocation Summary */}
            {(selectedAccount || selectedProject || selectedDigitalObject) && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Allocation Summary</h4>
                <div className="space-y-1 text-sm text-blue-800">
                  {selectedAccount && (
                    <p>• Account: {accounts.find(a => a.id === selectedAccount)?.name}</p>
                  )}
                  {selectedProject && (
                    <p>• Project: {projects.find(p => p.id === selectedProject)?.name}</p>
                  )}
                  {selectedDigitalObject && (
                    <p>• Digital Object: {digitalObjects.find(o => o.id === selectedDigitalObject)?.name}</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};