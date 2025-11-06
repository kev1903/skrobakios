import { supabase } from "@/integrations/supabase/client";

export interface AuditLogMetadata {
  old_status?: string;
  new_status?: string;
  old_amount?: number;
  new_amount?: number;
  old_stakeholder?: string;
  new_stakeholder?: string;
  old_activity?: string;
  new_activity?: string;
  notes?: string;
  [key: string]: any;
}

export const logBillAudit = async (
  action: string,
  billId: string,
  metadata?: AuditLogMetadata
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('No user found for audit logging');
      return;
    }

    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action,
      resource_type: 'bill',
      resource_id: billId,
      metadata: metadata || {},
    });
  } catch (error) {
    console.error('Error logging audit trail:', error);
    // Don't throw - audit logging should not break the main operation
  }
};
