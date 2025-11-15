import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus, Eye, Edit, MoreVertical, Calculator, FileText, DollarSign, MapPin, ArrowLeft, BookOpen, Trash } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
  onBackToDashboard?: () => void;
}
export const EstimatesListPage = ({
  onNavigate,
  onCreateEstimate,
  onBackToDashboard
}: EstimatesListPageProps) => {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    console.log('EstimatesListPage: useEffect triggered, fetching estimates...');
    fetchEstimates();
  }, []);
  
  const fetchEstimates = async () => {
    console.log('EstimatesListPage: fetchEstimates called');
    try {
      console.log('EstimatesListPage: Starting Supabase query...');
      const { data, error } = await supabase
        .from('estimates')
        .select('*')
        .order('created_at', { ascending: false });
      
      console.log('EstimatesListPage: Query result:', { data, error });
      
      if (error) {
        console.error('Error fetching estimates:', error);
      } else {
        console.log('EstimatesListPage: Setting estimates data:', data);
        setEstimates(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      console.log('EstimatesListPage: Setting loading to false');
      setLoading(false);
    }
  };

  const deleteEstimate = async (id: string) => {
    if (!confirm('Delete this estimate? This cannot be undone.')) return;
    const { error } = await supabase.from('estimates').delete().eq('id', id);
    if (error) {
      console.error('Error deleting estimate:', error);
      return;
    }
    setEstimates(prev => prev.filter(e => e.id !== id));
  };
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'draft':
        return 'secondary';
      case 'sent':
        return 'outline';
      case 'accepted':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'expired':
        return 'secondary';
      default:
        return 'secondary';
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'text-yellow-600';
      case 'sent':
        return 'text-blue-600';
      case 'accepted':
        return 'text-green-600';
      case 'rejected':
        return 'text-red-600';
      case 'expired':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };
  const filteredEstimates = estimates.filter(estimate => estimate.estimate_name.toLowerCase().includes(searchTerm.toLowerCase()) || estimate.client_name.toLowerCase().includes(searchTerm.toLowerCase()) || estimate.estimate_number.toLowerCase().includes(searchTerm.toLowerCase()));
  const handleNewEstimate = () => {
    if (onCreateEstimate) {
      onCreateEstimate();
    } else {
      window.location.href = '/estimates/new';
    }
  };
  const handleBackToSales = () => {
    if (onBackToDashboard) {
      onBackToDashboard();
    } else {
      navigate('/?page=sales');
    }
  };
  if (loading) {
    return (
      <div className="h-full bg-white">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full bg-white overflow-y-auto">
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBackToSales} 
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sales
            </Button>
            <div className="h-6 w-px bg-border" />
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Estimates</h2>
              <p className="text-sm text-muted-foreground">Manage your project estimates and client quotes</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-white shadow-sm border-border"
              onClick={() => navigate('/estimates/library')}
            >
              <BookOpen className="w-4 h-4" />
              <span>Library</span>
            </Button>
            <Button 
              onClick={handleNewEstimate} 
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>New Estimate</span>
            </Button>
          </div>
        </div>

      {/* Quick Stats Cards - Match Sales Dashboard styling */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="group relative bg-white rounded-2xl p-4 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-all duration-300 border border-border">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground mb-1 tracking-wide">Total Estimates</p>
              <p className="text-2xl font-semibold text-foreground">{estimates.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="group relative bg-white rounded-2xl p-4 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-all duration-300 border border-border">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground mb-1 tracking-wide">Accepted</p>
              <p className="text-2xl font-semibold text-foreground">{estimates.filter(e => e.status === 'accepted').length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Calculator className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="group relative bg-white rounded-2xl p-4 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-all duration-300 border border-border">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground mb-1 tracking-wide">Pending</p>
              <p className="text-2xl font-semibold text-foreground">{estimates.filter(e => e.status === 'sent').length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Eye className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="group relative bg-white rounded-2xl p-4 shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-all duration-300 border border-border">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground mb-1 tracking-wide">Total Value</p>
              <p className="text-2xl font-semibold text-foreground">
                ${estimates.reduce((sum, e) => sum + (e.total_amount || 0), 0).toLocaleString()}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Actions Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-[0_2px_16px_rgba(0,0,0,0.04)] border border-border">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Search by estimate name, number, or client..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              className="pl-10 bg-muted/30 border-0" 
            />
          </div>
          <Button variant="outline" size="sm" className="bg-white shadow-sm border-border">
            <FileText className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Estimates Table */}
      <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.04)] border border-border overflow-hidden">
        <div className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b bg-muted/30 hover:bg-muted/30">
                <TableHead className="h-11 px-6 text-[11px] uppercase font-semibold tracking-wider text-muted-foreground">Estimate #</TableHead>
                <TableHead className="h-11 px-6 text-[11px] uppercase font-semibold tracking-wider text-muted-foreground">Estimate Name</TableHead>
                <TableHead className="h-11 px-6 text-[11px] uppercase font-semibold tracking-wider text-muted-foreground">Client</TableHead>
                <TableHead className="h-11 px-6 text-[11px] uppercase font-semibold tracking-wider text-muted-foreground">Project Address</TableHead>
                <TableHead className="h-11 px-6 text-[11px] uppercase font-semibold tracking-wider text-muted-foreground">Date</TableHead>
                <TableHead className="h-11 px-6 text-[11px] uppercase font-semibold tracking-wider text-muted-foreground">Expiry</TableHead>
                <TableHead className="h-11 px-6 text-[11px] uppercase font-semibold tracking-wider text-muted-foreground">Status</TableHead>
                <TableHead className="h-11 px-6 text-[11px] uppercase font-semibold tracking-wider text-muted-foreground text-right">Amount</TableHead>
                <TableHead className="h-11 px-6 text-[11px] uppercase font-semibold tracking-wider text-muted-foreground text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEstimates.length === 0 ? <TableRow>
                  <TableCell colSpan={9} className="text-center py-12">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 bg-muted/50 rounded-full">
                        <FileText className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-lg font-medium text-muted-foreground">No estimates found</p>
                        <p className="text-sm text-muted-foreground">Get started by creating your first estimate</p>
                      </div>
                      <Button onClick={handleNewEstimate} className="mt-2">
                        <Plus className="w-4 h-4 mr-2" />
                        Create your first estimate
                      </Button>
                    </div>
                  </TableCell>
                </TableRow> : filteredEstimates.map(estimate => <TableRow key={estimate.id} className="h-14 border-b border-border/30 hover:bg-accent/30 transition-colors">
                    <TableCell className="px-6 py-4">
                      <span className="font-mono font-medium text-primary">
                        {estimate.estimate_number}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <button onClick={() => navigate(`/estimates/edit/${estimate.id}`)} className="font-medium text-primary hover:underline">
                        {estimate.estimate_name}
                      </button>
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
                      <Badge variant={getStatusBadgeVariant(estimate.status)} className="font-medium capitalize">
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
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 z-50 bg-background border shadow-lg">
                          <DropdownMenuItem className="cursor-pointer" onClick={() => navigate(`/estimates/edit/${estimate.id}`)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer" onClick={() => navigate(`/estimates/edit/${estimate.id}`)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Estimate
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer text-destructive" onClick={() => deleteEstimate(estimate.id)}>
                            <Trash className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>)}
            </TableBody>
          </Table>
        </div>
      </div>
      </div>
    </div>
  );
};