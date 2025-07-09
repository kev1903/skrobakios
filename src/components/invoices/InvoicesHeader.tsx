import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
interface InvoicesHeaderProps {
  onNavigate?: (page: string) => void;
  onInvoicesSync?: () => void;
}
export const InvoicesHeader = ({
  onNavigate,
  onInvoicesSync
}: InvoicesHeaderProps) => {
  const navigate = useNavigate();
  const [isSyncing, setIsSyncing] = useState(false);
  const {
    toast
  } = useToast();
  const handleSyncInvoices = async () => {
    try {
      setIsSyncing(true);
      const {
        data,
        error
      } = await supabase.functions.invoke('xero-sync', {
        body: {
          action: 'sync'
        }
      });
      if (error) throw error;
      toast({
        title: "Success",
        description: "Invoices synced successfully from Xero"
      });

      // Notify parent to refresh the table
      onInvoicesSync?.();
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "Error",
        description: "Failed to sync invoices. Please ensure you're connected to Xero.",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };
  return <div className="mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => onNavigate ? onNavigate('finance') : navigate('/finance')} className="flex items-center space-x-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Invoices</h1>
            <p className="text-gray-600">Manage and track all your invoices synced from Xero</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button className="flex items-center space-x-2" onClick={handleSyncInvoices} disabled={isSyncing}>
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Invoices'}</span>
          </Button>
        </div>
      </div>
    </div>;
};