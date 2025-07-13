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
  DollarSign,
  MapPin,
  ArrowLeft
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
  project_address?: string;
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

  const handleBackToSales = () => {
    if (onNavigate) {
      onNavigate('sales');
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
    <div className="space-y-8 p-6">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          {onNavigate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToSales}
              className="flex items-center gap-2 mt-1 hover:bg-muted"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sales
            </Button>
          )}
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Construction Estimates</h2>
            <p className="text-lg text-muted-foreground">Manage your project estimates and client quotes</p>
          </div>
        </div>
        <Button 
          onClick={handleNewEstimate}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Estimate</span>
        </Button>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500 rounded-xl shadow-sm">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Estimates</p>
                <p className="text-2xl font-bold text-foreground">{estimates.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500 rounded-xl shadow-sm">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Accepted</p>
                <p className="text-2xl font-bold text-foreground">{estimates.filter(e => e.status === 'accepted').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-yellow-100/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-500 rounded-xl shadow-sm">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-foreground">{estimates.filter(e => e.status === 'sent').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500 rounded-xl shadow-sm">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold text-foreground">
                  ${estimates.reduce((sum, e) => sum + (e.total_amount || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions Bar */}
      <div className="flex items-center justify-between gap-4 p-4 bg-muted/30 rounded-xl border">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search by estimate name, number, or client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-0 bg-background shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="bg-background shadow-sm">
            <FileText className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Estimates Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b bg-muted/30">
                <TableHead className="h-12 px-6 font-semibold">Estimate #</TableHead>
                <TableHead className="h-12 px-6 font-semibold">Estimate Name</TableHead>
                <TableHead className="h-12 px-6 font-semibold">Client</TableHead>
                <TableHead className="h-12 px-6 font-semibold">Project Address</TableHead>
                <TableHead className="h-12 px-6 font-semibold">Date</TableHead>
                <TableHead className="h-12 px-6 font-semibold">Expiry</TableHead>
                <TableHead className="h-12 px-6 font-semibold">Status</TableHead>
                <TableHead className="h-12 px-6 font-semibold text-right">Amount</TableHead>
                <TableHead className="h-12 px-6 font-semibold text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEstimates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 bg-muted/50 rounded-full">
                        <FileText className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-lg font-medium text-muted-foreground">No estimates found</p>
                        <p className="text-sm text-muted-foreground">Get started by creating your first estimate</p>
                      </div>
                      <Button 
                        onClick={handleNewEstimate}
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
                  <TableRow key={estimate.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="px-6 py-4">
                      <span className="font-mono font-medium text-primary">
                        {estimate.estimate_number}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <span className="font-medium">{estimate.estimate_name}</span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <span className="font-medium text-foreground">{estimate.client_name}</span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {estimate.project_address || 'Address not specified'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <span className="text-sm font-medium">
                        {format(new Date(estimate.estimate_date), 'MMM dd, yyyy')}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <span className="text-sm text-muted-foreground">
                        {estimate.expiry_date ? format(new Date(estimate.expiry_date), 'MMM dd, yyyy') : '-'}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge 
                        variant={getStatusBadgeVariant(estimate.status)}
                        className="font-medium capitalize"
                      >
                        {estimate.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <span className="font-bold text-lg text-foreground">
                        ${estimate.total_amount?.toLocaleString() || '0'}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-muted"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 z-50 bg-background border shadow-lg">
                          <DropdownMenuItem className="cursor-pointer">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Estimate
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
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