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
        return 'bg-green-100 text-green-700 border-green-300';
      case 'Submitted':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
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
          <h2 className="text-2xl font-bold text-gray-900 font-inter">Progress Claims</h2>
          <p className="text-gray-600 font-inter">Track project progress claims and payments</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Claim
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border border-gray-200 shadow-lg max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-inter text-gray-900">Add New Progress Claim</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <p className="text-gray-600">Progress claim form functionality coming soon...</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-inter">Total Claims</p>
                <p className="text-2xl font-bold text-gray-900 font-inter">{claims.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-inter">Total Claimed</p>
                <p className="text-2xl font-bold text-gray-900 font-inter">{formatCurrency(totalClaimed)}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <span className="text-orange-600 text-lg">📋</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-inter">Paid Amount</p>
                <p className="text-2xl font-bold text-gray-900 font-inter">{formatCurrency(paidAmount)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-green-600 text-lg">✅</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-inter">Outstanding</p>
                <p className="text-2xl font-bold text-gray-900 font-inter">{formatCurrency(totalClaimed - paidAmount)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-purple-600 text-lg">⏳</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Claims Table */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-gray-900 font-inter">Claims Register</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200">
                  <TableHead className="text-gray-700 font-inter">Claim No.</TableHead>
                  <TableHead className="text-gray-700 font-inter">Date Submitted</TableHead>
                  <TableHead className="text-gray-700 font-inter">Stage/Scope</TableHead>
                  <TableHead className="text-gray-700 font-inter">Amount Claimed</TableHead>
                  <TableHead className="text-gray-700 font-inter">% Contract</TableHead>
                  <TableHead className="text-gray-700 font-inter">Status</TableHead>
                  <TableHead className="text-gray-700 font-inter">Due Date</TableHead>
                  <TableHead className="text-gray-700 font-inter">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {claims.map((claim) => (
                  <TableRow key={claim.id} className="border-gray-200 hover:bg-gray-50">
                    <TableCell>
                      <span className="text-gray-900 font-mono font-medium">{claim.claimNo}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-700 font-inter">{format(claim.dateSubmitted, 'dd/MM/yyyy')}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-700 font-inter">{claim.stageScope}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-900 font-medium font-inter">{formatCurrency(claim.amountClaimed)}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-700 font-inter">{claim.percentContract}%</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(claim.status)}>
                        {claim.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-600 font-inter">{format(claim.paymentDueDate, 'dd/MM/yyyy')}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-600 text-sm font-inter max-w-xs truncate">{claim.notes}</span>
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