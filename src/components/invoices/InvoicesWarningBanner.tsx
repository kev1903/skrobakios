
import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const InvoicesWarningBanner = () => {
  const [overdueCount, setOverdueCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverdueCount();
  }, []);

  const fetchOverdueCount = async () => {
    try {
      const { data: invoices, error } = await supabase
        .from('xero_invoices')
        .select('due_date, status');

      if (error) {
        console.error('Error fetching overdue invoices:', error);
        setLoading(false);
        return;
      }

      if (!invoices) {
        setLoading(false);
        return;
      }

      const now = new Date();
      const overdue = invoices.filter(inv => {
        if (inv.status === 'PAID') return false;
        if (!inv.due_date) return false;
        return new Date(inv.due_date) < now;
      });

      setOverdueCount(overdue.length);
    } catch (error) {
      console.error('Error calculating overdue count:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || overdueCount === 0) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm text-yellow-800">
          <span className="font-medium">You have {overdueCount} invoice{overdueCount > 1 ? 's' : ''} with expected dates in the past.</span>{" "}
          These invoices are overdue and need your attention.{" "}
          <span className="font-medium">Update their expected dates or follow up with customers.</span>
        </p>
      </div>
    </div>
  );
};
