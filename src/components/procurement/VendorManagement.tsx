import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, X, Search, Building, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface VendorManagementProps {
  companyId: string;
  onClose: () => void;
}

interface Vendor {
  id: string;
  name: string;
  trade_category: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  compliance_rating?: string;
  is_active: boolean;
  created_at: string;
}

const TRADE_CATEGORIES = [
  'Earthworks',
  'Concrete',
  'Structural Steel',
  'Mechanical',
  'Electrical',
  'Plumbing',
  'HVAC',
  'Roofing',
  'Cladding',
  'Flooring',
  'Painting',
  'Landscaping',
  'Security',
  'IT & Communications',
  'General Construction',
  'Other'
];

const COMPLIANCE_RATINGS = [
  'Excellent',
  'Good',
  'Satisfactory',
  'Poor',
  'Not Rated'
];

export const VendorManagement: React.FC<VendorManagementProps> = ({ 
  companyId, 
  onClose 
}) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tradeFilter, setTradeFilter] = useState('all');
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [activeTab, setActiveTab] = useState('list');
  
  const [formData, setFormData] = useState({
    name: '',
    trade_category: '',
    contact_person: '',
    email: '',
    phone: '',
    compliance_rating: 'Not Rated',
    is_active: true
  });

  useEffect(() => {
    fetchVendors();
  }, [companyId]);

  useEffect(() => {
    filterVendors();
  }, [vendors, searchTerm, tradeFilter]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('company_id', companyId)
        .order('name');

      if (error) {
        console.error('Error fetching vendors:', error);
        toast.error('Failed to load vendors');
        return;
      }

      setVendors(data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const filterVendors = () => {
    let filtered = vendors;

    if (searchTerm) {
      filtered = filtered.filter(vendor =>
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (tradeFilter !== 'all') {
      filtered = filtered.filter(vendor => vendor.trade_category === tradeFilter);
    }

    setFilteredVendors(filtered);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      trade_category: '',
      contact_person: '',
      email: '',
      phone: '',
      compliance_rating: 'Not Rated',
      is_active: true
    });
    setEditingVendor(null);
  };

  const handleEdit = (vendor: Vendor) => {
    setFormData({
      name: vendor.name,
      trade_category: vendor.trade_category,
      contact_person: vendor.contact_person || '',
      email: vendor.email || '',
      phone: vendor.phone || '',
      compliance_rating: vendor.compliance_rating || 'Not Rated',
      is_active: vendor.is_active
    });
    setEditingVendor(vendor);
    setActiveTab('form');
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.trade_category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);

      const vendorData = {
        company_id: companyId,
        name: formData.name.trim(),
        trade_category: formData.trade_category,
        contact_person: formData.contact_person.trim() || null,
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        compliance_rating: formData.compliance_rating,
        is_active: formData.is_active
      };

      if (editingVendor) {
        // Update existing vendor
        const { error } = await supabase
          .from('vendors')
          .update(vendorData)
          .eq('id', editingVendor.id);

        if (error) {
          console.error('Error updating vendor:', error);
          toast.error('Failed to update vendor');
          return;
        }

        toast.success('Vendor updated successfully');
      } else {
        // Create new vendor
        const { error } = await supabase
          .from('vendors')
          .insert(vendorData);

        if (error) {
          console.error('Error creating vendor:', error);
          toast.error('Failed to create vendor');
          return;
        }

        toast.success('Vendor created successfully');
      }

      resetForm();
      fetchVendors();
      setActiveTab('list');
    } catch (error) {
      console.error('Error submitting vendor:', error);
      toast.error('Failed to save vendor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (vendorId: string) => {
    if (!confirm('Are you sure you want to delete this vendor?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('vendors')
        .delete()
        .eq('id', vendorId);

      if (error) {
        console.error('Error deleting vendor:', error);
        toast.error('Failed to delete vendor');
        return;
      }

      toast.success('Vendor deleted successfully');
      fetchVendors();
    } catch (error) {
      console.error('Error deleting vendor:', error);
      toast.error('Failed to delete vendor');
    }
  };

  const getComplianceColor = (rating: string) => {
    switch (rating) {
      case 'Excellent':
        return 'bg-green-100 text-green-800';
      case 'Good':
        return 'bg-blue-100 text-blue-800';
      case 'Satisfactory':
        return 'bg-yellow-100 text-yellow-800';
      case 'Poor':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const uniqueTrades = Array.from(new Set(vendors.map(v => v.trade_category)));

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Vendor Management
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">Vendor List ({vendors.length})</TabsTrigger>
            <TabsTrigger value="form">
              {editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4 overflow-y-auto max-h-[600px]">
            {/* Filters */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search vendors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={tradeFilter} onValueChange={setTradeFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by trade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Trades</SelectItem>
                  {uniqueTrades.map(trade => (
                    <SelectItem key={trade} value={trade}>{trade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Vendors Table */}
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-muted rounded"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Trade Category</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Compliance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVendors.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="text-muted-foreground">
                            {vendors.length === 0 
                              ? "No vendors registered yet."
                              : "No vendors match the current filters."
                            }
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredVendors.map((vendor) => (
                        <TableRow key={vendor.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{vendor.name}</div>
                              <div className="text-sm text-muted-foreground">
                                Added {new Date(vendor.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {vendor.trade_category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {vendor.contact_person && (
                                <div>{vendor.contact_person}</div>
                              )}
                              {vendor.email && (
                                <div className="text-muted-foreground">{vendor.email}</div>
                              )}
                              {vendor.phone && (
                                <div className="text-muted-foreground">{vendor.phone}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={getComplianceColor(vendor.compliance_rating || 'Not Rated')}
                            >
                              {vendor.compliance_rating || 'Not Rated'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={vendor.is_active ? "default" : "secondary"}
                            >
                              {vendor.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2 justify-center">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEdit(vendor)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleDelete(vendor.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="form" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Vendor Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., ABC Construction Ltd"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trade_category">Trade Category *</Label>
                  <Select 
                    value={formData.trade_category} 
                    onValueChange={(value) => handleInputChange('trade_category', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select trade category" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRADE_CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_person">Contact Person</Label>
                  <Input
                    id="contact_person"
                    placeholder="John Smith"
                    value={formData.contact_person}
                    onChange={(e) => handleInputChange('contact_person', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contact@vendor.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="+61 123 456 789"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="compliance_rating">Compliance Rating</Label>
                  <Select 
                    value={formData.compliance_rating} 
                    onValueChange={(value) => handleInputChange('compliance_rating', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPLIANCE_RATINGS.map(rating => (
                        <SelectItem key={rating} value={rating}>
                          {rating}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setActiveTab('list');
                  }}
                  disabled={submitting}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {submitting ? 'Saving...' : editingVendor ? 'Update Vendor' : 'Add Vendor'}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};