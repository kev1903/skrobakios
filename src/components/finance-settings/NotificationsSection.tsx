
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface NotificationsSectionProps {
  settings: {
    enableNotifications: boolean;
    enableAutoSync: boolean;
  };
  onInputChange: (field: string, value: boolean) => void;
}

export const NotificationsSection = ({ settings, onInputChange }: NotificationsSectionProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Notifications & Automation</h3>
      
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Enable Notifications</Label>
          <p className="text-sm text-gray-500">Receive alerts for overdue invoices, cash flow warnings, etc.</p>
        </div>
        <Switch
          checked={settings.enableNotifications}
          onCheckedChange={(checked) => onInputChange('enableNotifications', checked)}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Enable Auto-Sync</Label>
          <p className="text-sm text-gray-500">Automatically sync data with accounting software</p>
        </div>
        <Switch
          checked={settings.enableAutoSync}
          onCheckedChange={(checked) => onInputChange('enableAutoSync', checked)}
        />
      </div>
    </div>
  );
};
