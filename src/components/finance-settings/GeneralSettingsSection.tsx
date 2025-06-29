
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface GeneralSettingsSectionProps {
  settings: {
    baseCurrency: string;
    fiscalYearStart: string;
    taxRate: string;
    defaultPaymentTerms: string;
  };
  onInputChange: (field: string, value: string) => void;
}

export const GeneralSettingsSection = ({ settings, onInputChange }: GeneralSettingsSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">General Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="baseCurrency">Base Currency</Label>
          <Select
            value={settings.baseCurrency}
            onValueChange={(value) => onInputChange('baseCurrency', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
              <SelectItem value="USD">USD - US Dollar</SelectItem>
              <SelectItem value="EUR">EUR - Euro</SelectItem>
              <SelectItem value="GBP">GBP - British Pound</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fiscalYearStart">Fiscal Year Start</Label>
          <Select
            value={settings.fiscalYearStart}
            onValueChange={(value) => onInputChange('fiscalYearStart', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="January">January</SelectItem>
              <SelectItem value="July">July</SelectItem>
              <SelectItem value="April">April</SelectItem>
              <SelectItem value="October">October</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="taxRate">Default Tax Rate (%)</Label>
          <Input
            id="taxRate"
            type="number"
            value={settings.taxRate}
            onChange={(e) => onInputChange('taxRate', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="defaultPaymentTerms">Default Payment Terms (days)</Label>
          <Input
            id="defaultPaymentTerms"
            type="number"
            value={settings.defaultPaymentTerms}
            onChange={(e) => onInputChange('defaultPaymentTerms', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
