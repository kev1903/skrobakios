import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, User, FileText, Edit, Trash2, Check, RefreshCw, Upload, DollarSign } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  metadata: any;
  created_at: string;
  user_email?: string;
  user_name?: string;
}

interface BillAuditTrailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  billId: string;
  billNumber: string;
}

export const BillAuditTrailDialog = ({ isOpen, onClose, billId, billNumber }: BillAuditTrailDialogProps) => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && billId) {
      loadAuditTrail();
    }
  }, [isOpen, billId]);

  const loadAuditTrail = async () => {
    setLoading(true);
    try {
      // Fetch the bill to get creation info
      const { data: bill } = await supabase
        .from('bills')
        .select('created_at, created_by')
        .eq('id', billId)
        .single();

      // Fetch audit logs for this bill
      const { data: logs, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('resource_type', 'bill')
        .eq('resource_id', billId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      let allLogs = logs || [];

      // If there's no "created" audit log but we have the bill's creation timestamp, add it
      const hasCreatedLog = allLogs.some(log => log.action === 'created' || log.action === 'upload');
      if (!hasCreatedLog && bill) {
        const createdLog = {
          id: 'bill-creation',
          user_id: bill.created_by || '',
          action: 'created',
          resource_type: 'bill',
          resource_id: billId,
          metadata: {},
          created_at: bill.created_at
        };
        allLogs = [...allLogs, createdLog];
      }

      // Fetch user information for each log
      if (allLogs.length > 0) {
        const userIds = [...new Set(allLogs.map(log => log.user_id).filter(Boolean))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, email, first_name, last_name')
          .in('id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

        const enrichedLogs = allLogs.map(log => {
          const profile = profileMap.get(log.user_id);
          const userName = profile?.first_name && profile?.last_name 
            ? `${profile.first_name} ${profile.last_name}`
            : profile?.first_name || profile?.last_name || 'Unknown User';
          
          return {
            ...log,
            user_email: profile?.email || 'Unknown',
            user_name: userName
          };
        });

        // Sort by created_at descending
        enrichedLogs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setAuditLogs(enrichedLogs);
      } else {
        setAuditLogs([]);
      }
    } catch (error) {
      console.error('Error loading audit trail:', error);
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
      case 'upload':
        return <Upload className="w-4 h-4 text-blue-500" />;
      case 'updated':
      case 'edit':
        return <Edit className="w-4 h-4 text-amber-500" />;
      case 'deleted':
        return <Trash2 className="w-4 h-4 text-red-500" />;
      case 'approved':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'status_changed':
        return <RefreshCw className="w-4 h-4 text-purple-500" />;
      case 'payment':
        return <DollarSign className="w-4 h-4 text-emerald-500" />;
      default:
        return <FileText className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getActionLabel = (action: string, metadata?: any) => {
    switch (action) {
      case 'created':
        return 'Created bill';
      case 'upload':
        return 'Uploaded bill';
      case 'updated':
        return 'Updated bill details';
      case 'edit':
        return 'Edited bill';
      case 'deleted':
        return 'Deleted bill';
      case 'approved':
        return 'Approved bill';
      case 'status_changed':
        return metadata?.new_status 
          ? `Changed status to ${metadata.new_status}`
          : 'Changed bill status';
      case 'payment':
        return 'Processed payment';
      case 'extraction':
        return 'Re-ran AI extraction';
      default:
        return action;
    }
  };

  const getMetadataDetails = (metadata: any) => {
    if (!metadata) return null;
    
    const details = [];
    if (metadata.amount_changed) {
      details.push(`Amount: ${metadata.old_amount} → ${metadata.new_amount}`);
    }
    if (metadata.stakeholder_changed) {
      details.push(`Stakeholder: ${metadata.old_stakeholder} → ${metadata.new_stakeholder}`);
    }
    if (metadata.activity_changed) {
      details.push(`Activity: ${metadata.old_activity} → ${metadata.new_activity}`);
    }
    if (metadata.notes) {
      details.push(`Note: ${metadata.notes}`);
    }
    
    return details.length > 0 ? details : null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] bg-white/95 backdrop-blur-xl border border-border/30 shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold font-inter">
            Audit Trail - Bill {billNumber}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Clock className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground text-sm">No audit history available for this bill</p>
              <p className="text-xs text-muted-foreground mt-2">
                Future actions on this bill will be tracked here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {auditLogs.map((log, index) => (
                <div key={log.id} className="relative">
                  {/* Timeline connector */}
                  {index < auditLogs.length - 1 && (
                    <div className="absolute left-5 top-10 bottom-0 w-px bg-border/50" />
                  )}
                  
                  <div className="flex gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center border border-border/30">
                      {getActionIcon(log.action)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-6">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {getActionLabel(log.action, log.metadata)}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <User className="w-3 h-3" />
                            <span>{log.user_name || log.user_email}</span>
                            <span className="text-border">•</span>
                            <Clock className="w-3 h-3" />
                            <span>{format(new Date(log.created_at), 'PPp')}</span>
                          </div>
                        </div>
                      </div>

                      {/* Metadata details */}
                      {log.metadata && getMetadataDetails(log.metadata) && (
                        <div className="mt-2 space-y-1">
                          {getMetadataDetails(log.metadata)?.map((detail, i) => (
                            <p key={i} className="text-xs text-muted-foreground bg-muted/20 px-2 py-1 rounded">
                              {detail}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
