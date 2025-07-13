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
  Search, 
  Plus, 
  Eye,
  Edit,
  MoreVertical,
  Calculator,
  FileText,
  DollarSign
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

interface EstimatesListPageProps {
  onNavigate?: (page: string) => void;
  onCreateEstimate?: () => void;
}

export const EstimatesListPage = ({ onNavigate, onCreateEstimate }: EstimatesListPageProps) => {
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

  const handleNewEstimate = () => {
    if (onCreateEstimate) {
      onCreateEstimate();
    } else {
      window.location.href = '/estimates/new';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading estimates...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Construction Estimates</h2>
          <p className="text-muted-foreground">Manage your project estimates and quotes</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            onClick={handleNewEstimate}
            className="flex items-center space-x-2 bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            <span>New Estimate</span>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Estimates</p>
                <p className="text-xl font-bold">{estimates.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calculator className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Accepted</p>
                <p className="text-xl font-bold">{estimates.filter(e => e.status === 'accepted').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-xl font-bold">{estimates.filter(e => e.status === 'sent').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-xl font-bold">
                  ${estimates.reduce((sum, e) => sum + (e.total_amount || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search estimates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            Export PDF
          </Button>
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
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center space-y-2">
                      <FileText className="w-8 h-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No estimates found</p>
                      <Button 
                        onClick={handleNewEstimate}
                        size="sm"
                        className="mt-2"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create your first estimate
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredEstimates.map((estimate) => (
                  <TableRow key={estimate.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {estimate.estimate_number}
                    </TableCell>
                    <TableCell>{estimate.estimate_name}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{estimate.client_name}</p>
                        <p className="text-sm text-muted-foreground">{estimate.client_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(estimate.estimate_date), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>
                      {estimate.expiry_date ? format(new Date(estimate.expiry_date), 'dd/MM/yyyy') : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(estimate.status)}>
                        {estimate.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${estimate.total_amount?.toLocaleString() || '0'}
                    </TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="z-50 bg-background border shadow-lg">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Estimate
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="w-4 h-4 mr-2" />
                            Generate PDF
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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