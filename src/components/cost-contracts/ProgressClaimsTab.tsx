import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Upload, CalendarIcon, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ProgressClaimsTabProps {
  onNavigate?: (page: string) => void;
}

interface ProgressClaim {
  id: string;
  claimNo: string;
  dateSubmitted: Date;
  stageScope: string;
  amountClaimed: number;
  percentContract: number;
  status: 'Draft' | 'Submitted' | 'Paid';
  paymentDueDate: Date;
  notes: string;
  attachments: string[];
}

export const ProgressClaimsTab = ({ onNavigate }: ProgressClaimsTabProps) => {
  const [claims, setClaims] = useState<ProgressClaim[]>([
    {
      id: '1',
      claimNo: 'PC001',
      dateSubmitted: new Date('2024-01-15'),
      stageScope: 'Site preparation and excavation',
      amountClaimed: 45000,
      percentContract: 10,
      status: 'Paid',
      paymentDueDate: new Date('2024-02-15'),
      notes: 'Initial site works completed',
      attachments: ['claim-001.pdf']
    },
    {
      id: '2',
      claimNo: 'PC002',
      dateSubmitted: new Date('2024-02-20'),
      stageScope: 'Foundation and concrete works',
      amountClaimed: 78000,
      percentContract: 27.3,
      status: 'Submitted',
      paymentDueDate: new Date('2024-03-20'),
      notes: 'Foundation works 95% complete',
      attachments: ['claim-002.pdf']
    }
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const getStatusColor = (status: ProgressClaim['status']) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'Submitted':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Draft':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
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

  const totalClaimed = claims.reduce((sum, claim) => sum + claim.amountClaimed, 0);
  const paidAmount = claims.filter(c => c.status === 'Paid').reduce((sum, claim) => sum + claim.amountClaimed, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white font-playfair">Progress Claims</h2>
          <p className="text-white/70 font-helvetica">Track project progress claims and payments</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-500/80 hover:bg-blue-600/80 text-white backdrop-blur-sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Claim
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white/10 backdrop-blur-xl border-white/20 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-playfair">Add New Progress Claim</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <p className="text-white/70">Progress claim form functionality coming soon...</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-helvetica">Total Claims</p>
                <p className="text-2xl font-bold text-white font-inter">{claims.length}</p>
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
                <p className="text-white/70 text-sm font-helvetica">Total Claimed</p>
                <p className="text-2xl font-bold text-white font-inter">{formatCurrency(totalClaimed)}</p>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <span className="text-orange-400 text-lg">📋</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-helvetica">Paid Amount</p>
                <p className="text-2xl font-bold text-white font-inter">{formatCurrency(paidAmount)}</p>
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
                <p className="text-white/70 text-sm font-helvetica">Outstanding</p>
                <p className="text-2xl font-bold text-white font-inter">{formatCurrency(totalClaimed - paidAmount)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <span className="text-purple-400 text-lg">⏳</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Claims Table */}
      <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white font-playfair">Claims Register</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-white/5">
                  <TableHead className="text-white/90 font-helvetica">Claim No.</TableHead>
                  <TableHead className="text-white/90 font-helvetica">Date Submitted</TableHead>
                  <TableHead className="text-white/90 font-helvetica">Stage/Scope</TableHead>
                  <TableHead className="text-white/90 font-helvetica">Amount Claimed</TableHead>
                  <TableHead className="text-white/90 font-helvetica">% Contract</TableHead>
                  <TableHead className="text-white/90 font-helvetica">Status</TableHead>
                  <TableHead className="text-white/90 font-helvetica">Due Date</TableHead>
                  <TableHead className="text-white/90 font-helvetica">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {claims.map((claim) => (
                  <TableRow key={claim.id} className="border-white/10 hover:bg-white/5">
                    <TableCell>
                      <span className="text-white/90 font-mono font-medium">{claim.claimNo}</span>
                    </TableCell>
                     <TableCell>
                       <span className="text-white/90 font-helvetica">{format(claim.dateSubmitted, 'dd/MM/yyyy')}</span>
                     </TableCell>
                     <TableCell>
                       <span className="text-white/90 font-helvetica">{claim.stageScope}</span>
                     </TableCell>
                     <TableCell>
                       <span className="text-white/90 font-medium font-helvetica">{formatCurrency(claim.amountClaimed)}</span>
                     </TableCell>
                     <TableCell>
                       <span className="text-white/90 font-helvetica">{claim.percentContract}%</span>
                     </TableCell>
                     <TableCell>
                       <Badge variant="outline" className={getStatusColor(claim.status)}>
                         {claim.status}
                       </Badge>
                     </TableCell>
                     <TableCell>
                       <span className="text-white/70 font-helvetica">{format(claim.paymentDueDate, 'dd/MM/yyyy')}</span>
                     </TableCell>
                     <TableCell>
                       <span className="text-white/70 text-sm font-helvetica max-w-xs truncate">{claim.notes}</span>
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