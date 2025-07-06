import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Upload, Filter, FileText, Calendar, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';

interface VariationsRegisterTabProps {
  onNavigate?: (page: string) => void;
}

interface Variation {
  id: string;
  variationNo: string;
  title: string;
  type: 'Client-Initiated' | 'Builder-Initiated';
  status: 'Pending' | 'Submitted' | 'Approved' | 'Rejected';
  value: number;
  approvedDate: Date | null;
  notes: string;
  attachments: string[];
}

export const VariationsRegisterTab = ({ onNavigate }: VariationsRegisterTabProps) => {
  const [variations, setVariations] = useState<Variation[]>([
    {
      id: '1',
      variationNo: 'VO01',
      title: 'Additional electrical outlets',
      type: 'Client-Initiated',
      status: 'Approved',
      value: 2500,
      approvedDate: new Date('2024-01-15'),
      notes: 'Client requested 4 additional power points in kitchen',
      attachments: ['electrical-plan-v2.pdf']
    },
    {
      id: '2',
      variationNo: 'VO02',
      title: 'Upgrade bathroom fixtures',
      type: 'Client-Initiated',
      status: 'Pending',
      value: 8500,
      approvedDate: null,
      notes: 'Premium fixture upgrade request',
      attachments: ['fixture-specifications.pdf']
    }
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [sortField, setSortField] = useState<keyof Variation>('variationNo');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const getStatusColor = (status: Variation['status']) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'Pending':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'Submitted':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Rejected':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  const generateVariationNumber = () => {
    const maxNumber = variations.reduce((max, variation) => {
      const num = parseInt(variation.variationNo.replace('VO', ''));
      return num > max ? num : max;
    }, 0);
    return `VO${String(maxNumber + 1).padStart(2, '0')}`;
  };

  const addNewVariation = (newVariation: Omit<Variation, 'id' | 'variationNo'>) => {
    const variation: Variation = {
      id: Date.now().toString(),
      variationNo: generateVariationNumber(),
      ...newVariation
    };
    setVariations([...variations, variation]);
    setIsAddDialogOpen(false);
  };

  const sortedAndFilteredVariations = variations
    .filter(variation => {
      if (filterStatus !== 'all' && variation.status !== filterStatus) return false;
      if (filterType !== 'all' && variation.type !== filterType) return false;
      return true;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });

  const totalValue = variations
    .filter(v => v.status === 'Approved')
    .reduce((sum, v) => sum + v.value, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Variations Register</h2>
          <p className="text-gray-600">Track project variations and change orders</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-500/80 hover:bg-blue-600/80 text-white backdrop-blur-sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Variation
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white/10 backdrop-blur-xl border-white/20 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-playfair">Add New Variation</DialogTitle>
              </DialogHeader>
              <AddVariationForm onAdd={addNewVariation} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-helvetica">Total Variations</p>
                <p className="text-2xl font-bold text-white">{variations.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-helvetica">Approved Value</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(totalValue)}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <span className="text-green-400 text-lg">✅</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-helvetica">Pending</p>
                <p className="text-2xl font-bold text-white">
                  {variations.filter(v => v.status === 'Pending').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <span className="text-yellow-400 text-lg">⏳</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-helvetica">Avg. Value</p>
                <p className="text-2xl font-bold text-white">
                  {variations.length > 0 ? formatCurrency(variations.reduce((sum, v) => sum + v.value, 0) / variations.length) : '$0'}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <span className="text-purple-400 text-lg">📊</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-xl">
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label className="text-white/90 font-helvetica">Filter by Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white/90 backdrop-blur-xl border-white/30">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Submitted">Submitted</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label className="text-white/90 font-helvetica">Filter by Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white/90 backdrop-blur-xl border-white/30">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Client-Initiated">Client-Initiated</SelectItem>
                  <SelectItem value="Builder-Initiated">Builder-Initiated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Variations Table */}
      <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white font-playfair">Variations Register</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-white/5">
                  <TableHead className="text-white/90 font-helvetica cursor-pointer" onClick={() => setSortField('variationNo')}>
                    Variation No. <ArrowUpDown className="w-4 h-4 inline ml-1" />
                  </TableHead>
                  <TableHead className="text-white/90 font-helvetica">Title</TableHead>
                  <TableHead className="text-white/90 font-helvetica">Type</TableHead>
                  <TableHead className="text-white/90 font-helvetica">Status</TableHead>
                  <TableHead className="text-white/90 font-helvetica cursor-pointer" onClick={() => setSortField('value')}>
                    Value <ArrowUpDown className="w-4 h-4 inline ml-1" />
                  </TableHead>
                  <TableHead className="text-white/90 font-helvetica">Approved Date</TableHead>
                  <TableHead className="text-white/90 font-helvetica">Notes</TableHead>
                  <TableHead className="text-white/90 font-helvetica">Attachments</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAndFilteredVariations.map((variation) => (
                  <TableRow key={variation.id} className="border-white/10 hover:bg-white/5">
                    <TableCell>
                      <span className="text-white/90 font-mono font-medium">{variation.variationNo}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-white/90">{variation.title}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                        {variation.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(variation.status)}>
                        {variation.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-white/90 font-medium">{formatCurrency(variation.value)}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-white/70">
                        {variation.approvedDate ? format(variation.approvedDate, 'dd/MM/yyyy') : '-'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-white/70 text-sm max-w-xs truncate">{variation.notes}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {variation.attachments.map((file, index) => (
                          <Badge key={index} variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                            <FileText className="w-3 h-3 mr-1" />
                            {variation.attachments.length}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const AddVariationForm = ({ onAdd }: { onAdd: (variation: Omit<Variation, 'id' | 'variationNo'>) => void }) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'Client-Initiated' as Variation['type'],
    status: 'Pending' as Variation['status'],
    value: 0,
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      approvedDate: null,
      attachments: []
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-white/90">Title</Label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="bg-white/10 border-white/20 text-white"
            required
          />
        </div>
        <div className="space-y-2">
          <Label className="text-white/90">Type</Label>
          <Select value={formData.type} onValueChange={(value: Variation['type']) => setFormData({...formData, type: value})}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white/90 backdrop-blur-xl border-white/30">
              <SelectItem value="Client-Initiated">Client-Initiated</SelectItem>
              <SelectItem value="Builder-Initiated">Builder-Initiated</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-white/90">Status</Label>
          <Select value={formData.status} onValueChange={(value: Variation['status']) => setFormData({...formData, status: value})}>
            <SelectTrigger className="bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white/90 backdrop-blur-xl border-white/30">
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Submitted">Submitted</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-white/90">Value ($)</Label>
          <Input
            type="number"
            value={formData.value}
            onChange={(e) => setFormData({...formData, value: parseFloat(e.target.value) || 0})}
            className="bg-white/10 border-white/20 text-white"
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label className="text-white/90">Notes</Label>
        <Textarea
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          className="bg-white/10 border-white/20 text-white"
          rows={3}
        />
      </div>
      <div className="flex justify-end gap-3">
        <Button type="submit" className="bg-blue-500/80 hover:bg-blue-600/80 text-white">
          Add Variation
        </Button>
      </div>
    </form>
  );
};