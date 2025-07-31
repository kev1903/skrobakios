import React, { useState } from 'react';
import { ArrowLeft, Clock, Calendar, Eye, Grid3X3, Palette, Bell, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CalendarSettingsPageProps {
  onBack: () => void;
}

export const CalendarSettingsPage: React.FC<CalendarSettingsPageProps> = ({ onBack }) => {
  const [settings, setSettings] = useState({
    timeFormat: '24h',
    startTime: '06:00',
    endTime: '22:00',
    timeSlotDuration: '30',
    showWeekends: true,
    showTaskDuration: true,
    highlightCurrentTime: true,
    autoScheduleBreaks: false,
    defaultTaskDuration: '60',
    enableNotifications: true,
    theme: 'light',
    compactView: false,
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // Save settings to localStorage or backend
    localStorage.setItem('calendarSettings', JSON.stringify(settings));
    console.log('Calendar settings saved:', settings);
    onBack();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-sm">Back to Calendar</span>
          </button>
          
          <h1 className="text-2xl font-bold text-gray-900">Calendar Settings</h1>
          
          <Button onClick={handleSave} className="inline-flex items-center gap-2">
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>

        {/* Settings Content */}
        <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-gray-200/50 shadow-sm">
          <div className="p-6 space-y-8">
            
            {/* Time Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-gray-900">Time Settings</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timeFormat">Time Format</Label>
                  <Select value={settings.timeFormat} onValueChange={(value) => handleSettingChange('timeFormat', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24h">24 Hour (14:30)</SelectItem>
                      <SelectItem value="12h">12 Hour (2:30 PM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timeSlotDuration">Time Slot Duration</Label>
                  <Select value={settings.timeSlotDuration} onValueChange={(value) => handleSettingChange('timeSlotDuration', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="startTime">Calendar Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={settings.startTime}
                    onChange={(e) => handleSettingChange('startTime', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endTime">Calendar End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={settings.endTime}
                    onChange={(e) => handleSettingChange('endTime', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Display Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-gray-900">Display Settings</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Weekends</Label>
                    <p className="text-sm text-muted-foreground">Display Saturday and Sunday in week view</p>
                  </div>
                  <Switch
                    checked={settings.showWeekends}
                    onCheckedChange={(checked) => handleSettingChange('showWeekends', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Task Duration</Label>
                    <p className="text-sm text-muted-foreground">Display duration badges on tasks</p>
                  </div>
                  <Switch
                    checked={settings.showTaskDuration}
                    onCheckedChange={(checked) => handleSettingChange('showTaskDuration', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Highlight Current Time</Label>
                    <p className="text-sm text-muted-foreground">Show current time indicator on timeline</p>
                  </div>
                  <Switch
                    checked={settings.highlightCurrentTime}
                    onCheckedChange={(checked) => handleSettingChange('highlightCurrentTime', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Compact View</Label>
                    <p className="text-sm text-muted-foreground">Reduce spacing between time slots</p>
                  </div>
                  <Switch
                    checked={settings.compactView}
                    onCheckedChange={(checked) => handleSettingChange('compactView', checked)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Task Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-gray-900">Task Settings</h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultTaskDuration">Default Task Duration (minutes)</Label>
                  <Input
                    id="defaultTaskDuration"
                    type="number"
                    min="15"
                    max="480"
                    step="15"
                    value={settings.defaultTaskDuration}
                    onChange={(e) => handleSettingChange('defaultTaskDuration', e.target.value)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-schedule Breaks</Label>
                    <p className="text-sm text-muted-foreground">Automatically add breaks between tasks</p>
                  </div>
                  <Switch
                    checked={settings.autoScheduleBreaks}
                    onCheckedChange={(checked) => handleSettingChange('autoScheduleBreaks', checked)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Notifications */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get notified about upcoming tasks</p>
                </div>
                <Switch
                  checked={settings.enableNotifications}
                  onCheckedChange={(checked) => handleSettingChange('enableNotifications', checked)}
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};