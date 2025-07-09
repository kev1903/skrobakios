import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Search, 
  Plus, 
  FileText, 
  Calendar,
  DollarSign,
  Eye,
  Edit
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface Estimate {
  id: string;
  estimate_number: string;
  estimate_name: string;
  client_name: string;
  client_email: string;
  estimate_date: string;
  expiry_date: string;
  status: string;
  total_amount: number;
  created_at: string;
}

interface EstimatesPageProps {
  onNavigate: (page: string) => void;
}

export const EstimatesPage = ({ onNavigate }: EstimatesPageProps) => {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEstimates();
  }, []);

  const fetchEstimates = async () => {
    try {
      const { data, error } = await supabase
        .from('estimates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching estimates:', error);
      } else {
        setEstimates(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'sent': return 'outline';
      case 'accepted': return 'default';
      case 'rejected': return 'destructive';
      case 'expired': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'text-yellow-600';
      case 'sent': return 'text-blue-600';
      case 'accepted': return 'text-green-600';
      case 'rejected': return 'text-red-600';
      case 'expired': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const filteredEstimates = estimates.filter(estimate =>
    estimate.estimate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    estimate.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    estimate.estimate_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalEstimates = estimates.length;
  const totalValue = estimates.reduce((sum, estimate) => sum + (estimate.total_amount || 0), 0);
  const acceptedEstimates = estimates.filter(e => e.status === 'accepted').length;
  const pendingEstimates = estimates.filter(e => e.status === 'sent').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading estimates...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onNavigate('sales')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Sales</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Estimates</h1>
            <p className="text-muted-foreground">Manage your project estimates and proposals</p>
          </div>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>New Estimate</span>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Estimates</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEstimates}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{acceptedEstimates}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{pendingEstimates}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search estimates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Estimates Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estimate #</TableHead>
                <TableHead>Estimate Name</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEstimates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No estimates found
                  </TableCell>
                </TableRow>
              ) : (
                filteredEstimates.map((estimate) => (
                  <TableRow key={estimate.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {estimate.estimate_number}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{estimate.estimate_name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{estimate.client_name}</div>
                        <div className="text-sm text-muted-foreground">{estimate.client_email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(estimate.estimate_date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      {estimate.expiry_date ? format(new Date(estimate.expiry_date), 'MMM dd, yyyy') : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={getStatusBadgeVariant(estimate.status)}
                        className={`capitalize ${getStatusColor(estimate.status)}`}
                      >
                        {estimate.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${estimate.total_amount?.toLocaleString() || '0'}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};