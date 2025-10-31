import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight, Plus, Clock, Download, FileText, Eye, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { CreateRFQModal } from './CreateRFQModal';

interface Vendor {
  id: string;
  name: string;
}

interface RFQInvitation {
  id: string;
  vendor_id: string;
  status: 'invited' | 'viewed' | 'received';
  invited_at: string;
  viewed_at?: string;
  received_at?: string;
  quote_files?: string[];
  vendor?: Vendor;
}

interface RFQ {
  id: string;
  rfq_number: string;
  wbs_id?: string;
  work_package: string;
  due_date?: string;
  status: string;
  created_at: string;
  invitations?: any[];
}

interface RFQDashboardProps {
  projectId: string;
}

const getStatusConfig = (status: string) => {
  const configs: Record<string, { bg: string; text: string; border: string }> = {
    'draft': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' },
    'issued': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
    'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
    'received': { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
    'evaluated': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
    'closed': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' },
  };
  return configs[status.toLowerCase()] || configs['draft'];
};

export const RFQDashboard: React.FC<RFQDashboardProps> = ({ projectId }) => {
  const [rfqs, setRFQs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending'>('all');

  useEffect(() => {
    fetchRFQs();
  }, [projectId, filterStatus]);

  const fetchRFQs = async () => {
    try {
      setLoading(true);
      
      // Fetch RFQs (without invitations for now as the table doesn't exist yet)
      let query = supabase
        .from('rfqs')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      // Filter by pending responses if needed
      if (filterStatus === 'pending') {
        query = query.in('status', ['issued', 'pending']);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching RFQs:', error);
        toast.error('Failed to load RFQs');
        return;
      }

      // Map data to include empty invitations array
      const rfqsWithInvitations = (data || []).map(rfq => ({
        ...rfq,
        invitations: []
      }));

      setRFQs(rfqsWithInvitations);
    } catch (error) {
      console.error('Error fetching RFQs:', error);
      toast.error('Failed to load RFQs');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (rfqId: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rfqId)) {
        newSet.delete(rfqId);
      } else {
        newSet.add(rfqId);
      }
      return newSet;
    });
  };

  const handleDownloadSummary = () => {
    toast.info('Download functionality coming soon');
  };

  const getInvitationStatusIcon = (status: string) => {
    switch (status) {
      case 'invited':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'viewed':
        return <Eye className="w-4 h-4 text-amber-600" />;
      case 'received':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-muted rounded w-full"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 bg-white/80 backdrop-blur-xl border border-border/30 rounded-2xl p-4 shadow-glass">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-luxury-gold text-white hover:bg-luxury-gold/90 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4 mr-2" />
            New RFQ
          </Button>
          
          <Button
            variant={filterStatus === 'pending' ? 'default' : 'outline'}
            onClick={() => setFilterStatus(filterStatus === 'all' ? 'pending' : 'all')}
            className={filterStatus === 'pending' ? 'bg-amber-500 text-white hover:bg-amber-600' : ''}
          >
            <Clock className="w-4 h-4 mr-2" />
            Pending Responses ({rfqs.filter(r => ['issued', 'pending'].includes(r.status)).length})
          </Button>
        </div>

        <Button
          variant="outline"
          onClick={handleDownloadSummary}
          className="border-border/30 hover:bg-accent/50"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Summary
        </Button>
      </div>

      {/* RFQ Table */}
      <div className="bg-white/80 backdrop-blur-xl border border-border/30 rounded-2xl overflow-hidden shadow-glass hover:shadow-glass-hover transition-all duration-300">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 border-b border-border/30 hover:bg-muted/30 h-11">
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-6 py-4 w-12"></TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-6 py-4 w-32">RFQ #</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-6 py-4 min-w-[300px]">WBS / Activity</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-6 py-4 w-40 text-center">Suppliers Invited</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-6 py-4 w-36">Due Date</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-6 py-4 w-40 text-center">Responses Received</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-6 py-4 w-40">Status</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-6 py-4 w-32 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rfqs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="w-12 h-12 text-muted-foreground/30" />
                      <p className="text-sm">No RFQs found. Create your first RFQ to get started.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                rfqs.map((rfq) => {
                  const isExpanded = expandedIds.has(rfq.id);
                  const invitations = rfq.invitations || [];
                  const invitedCount = invitations.length;
                  const receivedCount = invitations.filter(inv => inv.status === 'received').length;
                  const statusConfig = getStatusConfig(rfq.status);

                  return (
                    <React.Fragment key={rfq.id}>
                      {/* Main RFQ Row */}
                      <TableRow className="h-14 hover:bg-accent/30 transition-all duration-200 border-b border-border/30">
                        <TableCell className="px-6 py-4 align-middle">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpanded(rfq.id)}
                            className="h-6 w-6 p-0 rounded-full hover:bg-accent/50 transition-all duration-200"
                            disabled={invitations.length === 0}
                          >
                            {invitations.length > 0 && (
                              isExpanded ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="px-6 py-4 align-middle">
                          <span className="text-sm font-mono font-semibold text-luxury-gold">
                            {rfq.rfq_number}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4 align-middle">
                          <div className="flex flex-col gap-1">
                            {rfq.wbs_id && (
                              <span className="text-xs font-mono text-muted-foreground">
                                {rfq.wbs_id}
                              </span>
                            )}
                            <span className="text-sm font-medium text-foreground">
                              {rfq.work_package}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 align-middle text-center">
                          <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 font-semibold">
                            {invitedCount}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-6 py-4 align-middle">
                          {rfq.due_date ? (
                            <span className="text-sm text-foreground">
                              {format(new Date(rfq.due_date), 'MMM dd, yyyy')}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="px-6 py-4 align-middle text-center">
                          <Badge 
                            variant="outline" 
                            className={`font-semibold ${
                              receivedCount === invitedCount && invitedCount > 0
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                : receivedCount > 0
                                ? 'border-amber-200 bg-amber-50 text-amber-700'
                                : 'border-gray-200 bg-gray-50 text-gray-700'
                            }`}
                          >
                            {receivedCount} / {invitedCount}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-6 py-4 align-middle">
                          <Badge 
                            className={`${statusConfig.bg} ${statusConfig.text} border-2 ${statusConfig.border} font-medium rounded-full px-3 py-1`}
                          >
                            {rfq.status.charAt(0).toUpperCase() + rfq.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-6 py-4 align-middle text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-luxury-gold hover:text-white hover:bg-luxury-gold transition-all duration-200"
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>

                      {/* Expanded Supplier Invitation Details */}
                      {isExpanded && invitations.length > 0 && (
                        <TableRow className="bg-accent/10 border-b border-border/20">
                          <TableCell colSpan={8} className="px-6 py-4">
                            <div className="ml-12 space-y-3">
                              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                                Supplier Invitation Status
                              </h4>
                              <div className="space-y-2">
                                {invitations.map((invitation) => (
                                  <div
                                    key={invitation.id}
                                    className="flex items-center justify-between bg-white/80 backdrop-blur-md border border-border/30 rounded-lg p-4 hover:shadow-md transition-all duration-200"
                                  >
                                    <div className="flex items-center gap-4 flex-1">
                                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/20">
                                        {getInvitationStatusIcon(invitation.status)}
                                      </div>
                                      <div className="flex flex-col gap-1">
                                        <span className="text-sm font-semibold text-foreground">
                                          {invitation.vendor?.name || 'Unknown Vendor'}
                                        </span>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                          <span>
                                            Invited: {format(new Date(invitation.invited_at), 'MMM dd, HH:mm')}
                                          </span>
                                          {invitation.viewed_at && (
                                            <span>
                                              Viewed: {format(new Date(invitation.viewed_at), 'MMM dd, HH:mm')}
                                            </span>
                                          )}
                                          {invitation.received_at && (
                                            <span className="text-emerald-600 font-medium">
                                              Received: {format(new Date(invitation.received_at), 'MMM dd, HH:mm')}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                      {invitation.quote_files && invitation.quote_files.length > 0 && (
                                        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                                          {invitation.quote_files.length} file(s)
                                        </Badge>
                                      )}
                                      <Badge
                                        variant="outline"
                                        className={`rounded-full px-3 py-1 font-medium ${
                                          invitation.status === 'received'
                                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                            : invitation.status === 'viewed'
                                            ? 'border-amber-200 bg-amber-50 text-amber-700'
                                            : 'border-blue-200 bg-blue-50 text-blue-700'
                                        }`}
                                      >
                                        {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Create RFQ Modal */}
      <CreateRFQModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        projectId={projectId}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          fetchRFQs();
        }}
      />
    </div>
  );
};
