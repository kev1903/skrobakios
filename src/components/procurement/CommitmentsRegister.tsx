import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, FileText, Package, Truck, CheckSquare, Calendar, Building } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

interface Commitment {
  id: string;
  commitment_number: string;
  type: string;
  value_ex_gst?: number;
  gst?: number;
  value_inc_gst?: number;
  start_date?: string;
  end_date?: string;
  retention_percent?: number;
  commitment_status: string;
  created_at: string;
  vendor?: {
    id: string;
    name: string;
    trade_category: string;
  };
  rfq?: {
    rfq_number: string;
    work_package: string;
    trade_category: string;
  };
  quote?: {
    quote_ref?: string;
  };
}

interface CommitmentsRegisterProps {
  projectId: string;
}

const COMMITMENT_STATUSES = [
  { key: 'Draft', label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: FileText },
  { key: 'Issued', label: 'Issued', color: 'bg-blue-100 text-blue-800', icon: Package },
  { key: 'In Delivery', label: 'In Delivery', color: 'bg-yellow-100 text-yellow-800', icon: Truck },
  { key: 'Closed', label: 'Closed', color: 'bg-green-100 text-green-800', icon: CheckSquare },
];

export const CommitmentsRegister: React.FC<CommitmentsRegisterProps> = ({ projectId }) => {
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [filteredCommitments, setFilteredCommitments] = useState<Commitment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommitments();
  }, [projectId]);

  useEffect(() => {
    filterCommitments();
  }, [commitments, searchTerm, statusFilter, typeFilter]);

  const fetchCommitments = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('commitments')
        .select(`
          *,
          vendor:vendors(id, name, trade_category),
          rfq:rfqs(rfq_number, work_package, trade_category),
          quote:quotes(quote_ref)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching commitments:', error);
        toast.error('Failed to load commitments');
        return;
      }

      setCommitments(data || []);
    } catch (error) {
      console.error('Error fetching commitments:', error);
      toast.error('Failed to load commitments');
    } finally {
      setLoading(false);
    }
  };

  const filterCommitments = () => {
    let filtered = commitments;

    if (searchTerm) {
      filtered = filtered.filter(commitment =>
        commitment.commitment_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        commitment.vendor?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        commitment.rfq?.work_package.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(commitment => commitment.commitment_status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(commitment => commitment.type === typeFilter);
    }

    setFilteredCommitments(filtered);
  };

  const getStatusInfo = (status: string) => {
    return COMMITMENT_STATUSES.find(s => s.key === status) || COMMITMENT_STATUSES[0];
  };

  const getTotalCommittedValue = () => {
    return commitments
      .filter(c => c.commitment_status !== 'Draft')
      .reduce((sum, c) => sum + (c.value_inc_gst || 0), 0);
  };

  const getCommitmentsByStatus = (status: string) => {
    return commitments.filter(c => c.commitment_status === status).length;
  };

  const handleStatusUpdate = async (commitmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('commitments')
        .update({ commitment_status: newStatus })
        .eq('id', commitmentId);

      if (error) {
        console.error('Error updating commitment status:', error);
        toast.error('Failed to update status');
        return;
      }

      toast.success('Status updated successfully');
      fetchCommitments();
    } catch (error) {
      console.error('Error updating commitment status:', error);
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-48"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Commitments Register</h2>
        <div className="flex gap-2">
          <Badge variant="outline">
            {filteredCommitments.length} of {commitments.length} commitments
          </Badge>
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Total Value: {formatCurrency(getTotalCommittedValue())}
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {COMMITMENT_STATUSES.map((status) => {
          const count = getCommitmentsByStatus(status.key);
          const StatusIcon = status.icon;
          
          return (
            <Card key={status.key} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <StatusIcon className="w-4 h-4" />
                  <span className="text-2xl font-bold">{count}</span>
                </div>
                <p className="text-sm text-muted-foreground">{status.label}</p>
                <Badge variant="secondary" className={`${status.color} mt-2`}>
                  {status.key}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search commitments, vendors, or work packages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {COMMITMENT_STATUSES.map(status => (
                  <SelectItem key={status.key} value={status.key}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="PO">Purchase Orders</SelectItem>
                <SelectItem value="Subcontract">Subcontracts</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Commitments Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Commitments</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCommitments.length === 0 ? (
            <div className="text-center py-12">
              <Building className="w-12 h-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2 text-muted-foreground">No Commitments Found</h3>
              <p className="text-muted-foreground">
                {commitments.length === 0 
                  ? "No commitments have been created yet." 
                  : "No commitments match the current filters."
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Commitment #</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>RFQ / Work Package</TableHead>
                    <TableHead className="text-right">Value (Inc GST)</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCommitments.map((commitment) => {
                    const statusInfo = getStatusInfo(commitment.commitment_status);
                    
                    return (
                      <TableRow key={commitment.id}>
                        <TableCell>
                          <div>
                            <div className="font-mono font-medium">
                              {commitment.commitment_number}
                            </div>
                            {commitment.quote?.quote_ref && (
                              <div className="text-sm text-muted-foreground">
                                Ref: {commitment.quote.quote_ref}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {commitment.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{commitment.vendor?.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {commitment.vendor?.trade_category}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{commitment.rfq?.rfq_number}</div>
                            <div className="text-sm text-muted-foreground">
                              {commitment.rfq?.work_package}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-mono">
                            <div className="font-bold">
                              {commitment.value_inc_gst ? 
                                formatCurrency(commitment.value_inc_gst) : 
                                'N/A'
                              }
                            </div>
                            {commitment.retention_percent && (
                              <div className="text-sm text-muted-foreground">
                                Retention: {commitment.retention_percent}%
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <div>
                              {commitment.start_date ? 
                                new Date(commitment.start_date).toLocaleDateString() : 
                                'Not set'
                              }
                              {commitment.end_date && (
                                <div className="text-muted-foreground">
                                  to {new Date(commitment.end_date).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusInfo.color}>
                            <statusInfo.icon className="w-3 h-3 mr-1" />
                            {commitment.commitment_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(commitment.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-center">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                Manage
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Manage Commitment</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                      Commitment Number
                                    </label>
                                    <p className="font-mono font-medium">
                                      {commitment.commitment_number}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                      Current Status
                                    </label>
                                    <Badge variant="outline" className={statusInfo.color}>
                                      {commitment.commitment_status}
                                    </Badge>
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <label className="text-sm font-medium text-muted-foreground">
                                    Update Status
                                  </label>
                                  <div className="flex gap-2 flex-wrap">
                                    {COMMITMENT_STATUSES.map(status => (
                                      <Button
                                        key={status.key}
                                        size="sm"
                                        variant={commitment.commitment_status === status.key ? "default" : "outline"}
                                        onClick={() => handleStatusUpdate(commitment.id, status.key)}
                                        disabled={commitment.commitment_status === status.key}
                                      >
                                        <status.icon className="w-4 h-4 mr-1" />
                                        {status.label}
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};