import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowLeft, 
  Search, 
  Plus, 
  Eye,
  Edit,
  Settings,
  BookOpen,
  MoreVertical
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

interface EstimatesPageProps {
  onNavigate: (page: string) => void;
}

export const EstimatesPage = ({ onNavigate }: EstimatesPageProps) => {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

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
    window.location.href = '/estimates/new';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading estimates...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.15)_1px,transparent_0)] bg-[length:24px_24px] pointer-events-none" />
      
      <div className="relative z-10 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/?page=sales')}
              className="flex items-center space-x-2 hover:bg-white/20 backdrop-blur-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sales</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground font-poppins">Construction Estimating</h1>
              <p className="text-muted-foreground font-inter">Create detailed estimates with graphical take-offs and cost analysis</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="glass-light border-white/20">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-light border-white/20 backdrop-blur-xl">
                <DropdownMenuItem className="hover:bg-white/10">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Estimating Library
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-white/10">
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Libraries
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/estimates/library')}
              className="flex items-center space-x-2 glass-light border-white/20"
            >
              <BookOpen className="w-4 h-4" />
              <span>Library</span>
            </Button>
            <Button 
              onClick={handleNewEstimate}
              className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="w-4 h-4" />
              <span>New Estimate</span>
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center justify-between">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search estimates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 glass-light border-white/20 backdrop-blur-sm"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="glass-light border-white/20">
              Export PDF
            </Button>
          </div>
        </div>

        {/* Estimates Table */}
        <Card className="glass-light border-white/20 backdrop-blur-xl shadow-xl">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-white/5">
                  <TableHead className="text-foreground font-semibold">Estimate #</TableHead>
                  <TableHead className="text-foreground font-semibold">Estimate Name</TableHead>
                  <TableHead className="text-foreground font-semibold">Client</TableHead>
                  <TableHead className="text-foreground font-semibold">Date</TableHead>
                  <TableHead className="text-foreground font-semibold">Expiry</TableHead>
                  <TableHead className="text-foreground font-semibold">Status</TableHead>
                  <TableHead className="text-right text-foreground font-semibold">Amount</TableHead>
                  <TableHead className="text-center text-foreground font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEstimates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center">
                          <Plus className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">No estimates found</p>
                          <p className="text-sm">Create your first estimate to get started</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEstimates.map((estimate) => (
                    <TableRow key={estimate.id} className="hover:bg-white/5 transition-all duration-200 border-white/5">
                      <TableCell className="font-medium text-foreground">
                        {estimate.estimate_number}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-foreground">{estimate.estimate_name}</div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-foreground">{estimate.client_name}</div>
                          <div className="text-sm text-muted-foreground">{estimate.client_email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground">
                        {format(new Date(estimate.estimate_date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {estimate.expiry_date ? format(new Date(estimate.expiry_date), 'MMM dd, yyyy') : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={getStatusBadgeVariant(estimate.status)}
                          className="capitalize"
                        >
                          {estimate.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium text-foreground">
                        ${estimate.total_amount?.toLocaleString() || '0'}
                      </TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="hover:bg-white/10">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="glass-light border-white/20 backdrop-blur-xl">
                            <DropdownMenuItem className="hover:bg-white/10">
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem className="hover:bg-white/10">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
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
    </div>
  );
};