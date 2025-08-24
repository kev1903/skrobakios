import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle, XCircle, Clock, FileText, User, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

interface RFQ {
  id: string;
  rfq_number: string;
  work_package: string;
  trade_category: string;
  status: string;
}

interface Approval {
  id: string;
  rfq_id: string;
  recommended_quote_id: string;
  justification_notes?: string;
  approval_status: string;
  approved_value?: number;
  approval_date?: string;
  created_at: string;
  quote?: {
    id: string;
    quote_amount_inc_gst?: number;
    vendor?: {
      name: string;
    };
  };
  rfq?: {
    rfq_number: string;
    work_package: string;
    trade_category: string;
  };
}

interface ApprovalQueueProps {
  projectId: string;
  rfqs: RFQ[];
}

export const ApprovalQueue: React.FC<ApprovalQueueProps> = ({ projectId, rfqs }) => {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);
  const [justificationNotes, setJustificationNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (rfqs.length > 0) {
      fetchApprovals();
    }
  }, [rfqs]);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('procurement_approvals')
        .select(`
          *,
          quote:quotes(
            id,
            quote_amount_inc_gst,
            vendor:vendors(name)
          ),
          rfq:rfqs(rfq_number, work_package, trade_category)
        `)
        .in('rfq_id', rfqs.map(rfq => rfq.id))
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching approvals:', error);
        toast.error('Failed to load approvals');
        return;
      }

      setApprovals(data || []);
    } catch (error) {
      console.error('Error fetching approvals:', error);
      toast.error('Failed to load approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (approvalId: string, status: 'Approved' | 'Rejected') => {
    try {
      setSubmitting(true);
      
      const updateData: any = {
        approval_status: status,
        approval_date: new Date().toISOString().split('T')[0]
      };

      if (justificationNotes) {
        updateData.justification_notes = justificationNotes;
      }

      if (status === 'Approved' && selectedApproval?.quote?.quote_amount_inc_gst) {
        updateData.approved_value = selectedApproval.quote.quote_amount_inc_gst;
      }

      const { error } = await supabase
        .from('procurement_approvals')
        .update(updateData)
        .eq('id', approvalId);

      if (error) {
        console.error('Error updating approval:', error);
        toast.error('Failed to update approval');
        return;
      }

      // Update RFQ status
      if (selectedApproval) {
        const newRFQStatus = status === 'Approved' ? 'Approved' : 'Under Evaluation';
        
        const { error: rfqError } = await supabase
          .from('rfqs')
          .update({ status: newRFQStatus })
          .eq('id', selectedApproval.rfq_id);

        if (rfqError) {
          console.error('Error updating RFQ status:', rfqError);
        }
      }

      toast.success(`Quote ${status.toLowerCase()} successfully`);
      setSelectedApproval(null);
      setJustificationNotes('');
      fetchApprovals();
    } catch (error) {
      console.error('Error updating approval:', error);
      toast.error('Failed to update approval');
    } finally {
      setSubmitting(false);
    }
  };

  const createApproval = async (rfqId: string, quoteId: string) => {
    try {
      const { error } = await supabase
        .from('procurement_approvals')
        .insert({
          rfq_id: rfqId,
          recommended_quote_id: quoteId,
          approval_status: 'Pending'
        });

      if (error) {
        console.error('Error creating approval:', error);
        toast.error('Failed to create approval');
        return;
      }

      toast.success('Quote sent for approval');
      fetchApprovals();
    } catch (error) {
      console.error('Error creating approval:', error);
      toast.error('Failed to create approval');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Clock className="w-4 h-4" />;
      case 'Approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'Rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const pendingApprovals = approvals.filter(approval => approval.approval_status === 'Pending');
  const completedApprovals = approvals.filter(approval => approval.approval_status !== 'Pending');

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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Approval Queue</h2>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            {pendingApprovals.length} Pending
          </Badge>
          <Badge variant="outline">
            {completedApprovals.length} Completed
          </Badge>
        </div>
      </div>

      {/* Pending Approvals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            Pending Approvals ({pendingApprovals.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingApprovals.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2 text-muted-foreground">No Pending Approvals</h3>
              <p className="text-muted-foreground">All quotes have been processed.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>RFQ</TableHead>
                    <TableHead>Work Package</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead className="text-right">Recommended Value</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingApprovals.map((approval) => (
                    <TableRow key={approval.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{approval.rfq?.rfq_number}</div>
                          <Badge variant="secondary" className="mt-1">
                            {approval.rfq?.trade_category}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{approval.rfq?.work_package}</TableCell>
                      <TableCell className="font-medium">
                        {approval.quote?.vendor?.name}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {approval.quote?.quote_amount_inc_gst ? 
                          formatCurrency(approval.quote.quote_amount_inc_gst) : 
                          'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {new Date(approval.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              onClick={() => setSelectedApproval(approval)}
                            >
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Quote Approval Review</DialogTitle>
                            </DialogHeader>
                            {selectedApproval && (
                              <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">RFQ</label>
                                    <p className="font-medium">{selectedApproval.rfq?.rfq_number}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Work Package</label>
                                    <p>{selectedApproval.rfq?.work_package}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Vendor</label>
                                    <p className="font-medium">{selectedApproval.quote?.vendor?.name}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">Quote Value</label>
                                    <p className="font-bold text-lg">
                                      {selectedApproval.quote?.quote_amount_inc_gst ? 
                                        formatCurrency(selectedApproval.quote.quote_amount_inc_gst) : 
                                        'N/A'
                                      }
                                    </p>
                                  </div>
                                </div>

                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">
                                    Justification Notes
                                  </label>
                                  <Textarea
                                    placeholder="Enter approval or rejection justification..."
                                    value={justificationNotes}
                                    onChange={(e) => setJustificationNotes(e.target.value)}
                                    className="mt-1"
                                    rows={3}
                                  />
                                </div>

                                <div className="flex gap-3 pt-4">
                                  <Button
                                    onClick={() => handleApproval(selectedApproval.id, 'Approved')}
                                    disabled={submitting}
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Approve Quote
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleApproval(selectedApproval.id, 'Rejected')}
                                    disabled={submitting}
                                    className="flex-1"
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Reject Quote
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Approvals */}
      {completedApprovals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Approval Decisions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>RFQ</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead>Decision</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedApprovals.slice(0, 10).map((approval) => (
                    <TableRow key={approval.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{approval.rfq?.rfq_number}</div>
                          <div className="text-sm text-muted-foreground">
                            {approval.rfq?.work_package}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {approval.quote?.vendor?.name}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {approval.approved_value ? 
                          formatCurrency(approval.approved_value) : 
                          approval.quote?.quote_amount_inc_gst ? 
                            formatCurrency(approval.quote.quote_amount_inc_gst) : 
                            'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(approval.approval_status)}>
                          {getStatusIcon(approval.approval_status)}
                          <span className="ml-1">{approval.approval_status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {approval.approval_date ? 
                          new Date(approval.approval_date).toLocaleDateString() : 
                          'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={approval.justification_notes || ''}>
                          {approval.justification_notes || 'No notes'}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};