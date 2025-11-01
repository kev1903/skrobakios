import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Plus, Download, Upload, Mail, Bell, ChevronDown, Repeat } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const { toast } = useToast();

  const handleSyncInvoices = async () => {
    try {
      setIsSyncing(true);
      const { data, error } = await supabase.functions.invoke('xero-sync', {
        body: { action: 'sync' }
      });
      if (error) throw error;
      toast({
        title: "Success",
        description: "Invoices synced successfully from Xero"
      });
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
  
  const handleBackClick = () => {
    if (onNavigate) {
      onNavigate('finance');
    } else {
      navigate('/finance');
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Title and Actions */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Invoices</h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                New Invoice
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 bg-popover">
              <DropdownMenuItem onClick={() => navigate('/invoice/create')}>
                New Invoice
              </DropdownMenuItem>
              <DropdownMenuItem>
                New Draft Invoice
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline">
            <Repeat className="w-4 h-4 mr-2" />
            New Repeating Invoice
          </Button>

          <Button variant="outline">
            New Credit Note
          </Button>

          <Button variant="outline">
            <Mail className="w-4 h-4 mr-2" />
            Send Statements
          </Button>

          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>

          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>

          <Button 
            variant="outline" 
            onClick={handleSyncInvoices} 
            disabled={isSyncing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync from Xero'}
          </Button>

          <Button variant="outline" className="ml-auto">
            <Bell className="w-4 h-4 mr-2" />
            Invoice Reminders: On
          </Button>
        </div>
      </div>
    </div>
  );
};