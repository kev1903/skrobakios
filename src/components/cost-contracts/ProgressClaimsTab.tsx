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
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Submitted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
          <h2 className="text-2xl font-bold text-gray-900">Progress Claims</h2>
          <p className="text-gray-600">Track project progress claims and payments</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Claim
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border border-gray-200 text-gray-900 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">Add New Progress Claim</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <p className="text-gray-600">Progress claim form functionality coming soon...</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Claims</h3>
            <div className="w-12 h-8 bg-blue-50 rounded flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{claims.length}</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Claimed</h3>
            <div className="w-12 h-8 bg-blue-50 rounded flex items-center justify-center">
              <div className="w-6 h-4 bg-blue-200 rounded-sm"></div>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalClaimed)}</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Paid Amount</h3>
            <div className="w-12 h-8 bg-blue-50 rounded flex items-center justify-center">
              <div className="w-6 h-4 bg-blue-200 rounded-sm"></div>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(paidAmount)}</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Outstanding</h3>
            <div className="w-12 h-8 bg-blue-50 rounded flex items-center justify-center">
              <div className="w-6 h-4 bg-blue-200 rounded-sm"></div>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalClaimed - paidAmount)}</p>
        </div>
      </div>
      
      {/* Claims Table */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Claims Register</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200 hover:bg-gray-50">
                  <TableHead className="text-gray-700 font-medium">Claim No.</TableHead>
                  <TableHead className="text-gray-700 font-medium">Date Submitted</TableHead>
                  <TableHead className="text-gray-700 font-medium">Stage/Scope</TableHead>
                  <TableHead className="text-gray-700 font-medium">Amount Claimed</TableHead>
                  <TableHead className="text-gray-700 font-medium">% Contract</TableHead>
                  <TableHead className="text-gray-700 font-medium">Status</TableHead>
                  <TableHead className="text-gray-700 font-medium">Due Date</TableHead>
                  <TableHead className="text-gray-700 font-medium">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {claims.map((claim) => (
                  <TableRow key={claim.id} className="border-gray-200 hover:bg-gray-50">
                    <TableCell>
                      <span className="text-gray-900 font-mono font-medium">{claim.claimNo}</span>
                    </TableCell>
                     <TableCell>
                       <span className="text-gray-600">{format(claim.dateSubmitted, 'dd/MM/yyyy')}</span>
                     </TableCell>
                     <TableCell>
                       <span className="text-gray-600">{claim.stageScope}</span>
                     </TableCell>
                     <TableCell>
                       <span className="text-gray-900 font-medium">{formatCurrency(claim.amountClaimed)}</span>
                     </TableCell>
                     <TableCell>
                       <span className="text-gray-600">{claim.percentContract}%</span>
                     </TableCell>
                     <TableCell>
                       <Badge variant="outline" className={getStatusColor(claim.status)}>
                         {claim.status}
                       </Badge>
                     </TableCell>
                     <TableCell>
                       <span className="text-gray-600">{format(claim.paymentDueDate, 'dd/MM/yyyy')}</span>
                     </TableCell>
                     <TableCell>
                       <span className="text-gray-500 text-sm max-w-xs truncate">{claim.notes}</span>
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