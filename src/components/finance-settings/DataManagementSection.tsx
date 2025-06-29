
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DataManagementSectionProps {
  settings: {
    retentionPeriod: string;
    backupFrequency: string;
  };
  onInputChange: (field: string, value: string) => void;
}

export const DataManagementSection = ({ settings, onInputChange }: DataManagementSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Data Management</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="retentionPeriod">Data Retention (years)</Label>
          <Select
            value={settings.retentionPeriod}
            onValueChange={(value) => onInputChange('retentionPeriod', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Year</SelectItem>
              <SelectItem value="3">3 Years</SelectItem>
              <SelectItem value="5">5 Years</SelectItem>
              <SelectItem value="7">7 Years</SelectItem>
              <SelectItem value="10">10 Years</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="backupFrequency">Backup Frequency</Label>
          <Select
            value={settings.backupFrequency}
            onValueChange={(value) => onInputChange('backupFrequency', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
