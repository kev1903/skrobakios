
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GeneralSettingsSection } from "./finance-settings/GeneralSettingsSection";
import { NotificationsSection } from "./finance-settings/NotificationsSection";
import { DataManagementSection } from "./finance-settings/DataManagementSection";
import { TransactionAccountsSection } from "./finance-settings/TransactionAccountsSection";

interface FinanceSettingsPageProps {
  onNavigate?: (page: string) => void;
}

interface Account {
  id: string;
  name: string;
  type: string;
  accountNumber: string;
  balance: string;
  status: string;
}

export const FinanceSettingsPage = ({ onNavigate }: FinanceSettingsPageProps) => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    baseCurrency: "AUD",
    fiscalYearStart: "July",
    taxRate: "10",
    defaultPaymentTerms: "30",
    enableNotifications: true,
    enableAutoSync: false,
    retentionPeriod: "7",
    backupFrequency: "daily"
  });

  const [accounts, setAccounts] = useState<Account[]>([
    {
      id: "1",
      name: "Business Checking",
      type: "Asset",
      accountNumber: "****1234",
      balance: "$125,450.00",
      status: "Active"
    },
    {
      id: "2",
      name: "Petty Cash",
      type: "Asset",
      accountNumber: "CASH-001",
      balance: "$500.00",
      status: "Active"
    },
    {
      id: "3",
      name: "Accounts Payable",
      type: "Liability",
      accountNumber: "AP-001",
      balance: "$15,230.00",
      status: "Active"
    },
    {
      id: "4",
      name: "Equipment Fund",
      type: "Asset",
      accountNumber: "****5678",
      balance: "$75,000.00",
      status: "Active"
    }
  ]);

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Finance settings have been updated successfully.",
    });
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => onNavigate?.("finance")}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Finance Settings</h1>
              <p className="text-gray-600">Configure your finance dashboard preferences</p>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-8">
          <GeneralSettingsSection 
            settings={settings}
            onInputChange={handleInputChange}
          />

          <Separator />

          <TransactionAccountsSection 
            accounts={accounts}
            setAccounts={setAccounts}
          />

          <Separator />

          <NotificationsSection 
            settings={settings}
            onInputChange={handleInputChange}
          />

          <Separator />

          <DataManagementSection 
            settings={settings}
            onInputChange={handleInputChange}
          />

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button onClick={handleSave}>
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
