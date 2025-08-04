import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Calendar, Eye, Grid3X3, Palette, Bell, Save, Layers, Plus, Link, CheckCircle, Settings, ExternalLink } from 'lucide-react';
import { TimeBlockingCalendar } from '@/components/TimeBlockingCalendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { calendarIntegrationService, CalendarIntegration } from '@/services/calendarIntegrationService';
import { useToast } from '@/hooks/use-toast';
import { useMenuBarSpacing } from '@/hooks/useMenuBarSpacing';

interface CalendarSettingsPageProps {
  onBack: () => void;
}

export const CalendarSettingsPage: React.FC<CalendarSettingsPageProps> = ({ onBack }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isConnecting, setIsConnecting] = useState(false);
  const [integrations, setIntegrations] = useState<CalendarIntegration[]>([]);
  const { toast } = useToast();
  const { spacingClasses, minHeightClasses } = useMenuBarSpacing();
  
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

  // Load integrations on component mount
  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      const data = await calendarIntegrationService.getIntegrations();
      setIntegrations(data);
    } catch (error) {
      console.error('Failed to load integrations:', error);
      toast({
        title: "Error",
        description: "Failed to load calendar integrations",
        variant: "destructive",
      });
    }
  };

  const handleConnectOutlook = async () => {
    try {
      setIsConnecting(true);
      const { authUrl } = await calendarIntegrationService.connectOutlook();
      
      // Open OAuth window
      window.open(authUrl, 'outlook-auth', 'width=600,height=700,scrollbars=yes,resizable=yes');
      
      // Listen for auth completion
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'OUTLOOK_AUTH_SUCCESS') {
          toast({
            title: "Success!",
            description: "Outlook calendar connected successfully",
          });
          loadIntegrations();
          window.removeEventListener('message', handleMessage);
        } else if (event.data.type === 'OUTLOOK_AUTH_ERROR') {
          toast({
            title: "Error",
            description: event.data.error || "Failed to connect Outlook calendar",
            variant: "destructive",
          });
          window.removeEventListener('message', handleMessage);
        }
      };

      window.addEventListener('message', handleMessage);
      
      // Auto-reload integrations after a delay (fallback)
      setTimeout(() => {
        loadIntegrations();
        window.removeEventListener('message', handleMessage);
      }, 10000);
      
    } catch (error) {
      console.error('Error connecting to Outlook:', error);
      toast({
        title: "Error",
        description: "Failed to initiate Outlook connection",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

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
    <div className={`${minHeightClasses} ${spacingClasses} bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-6`}>
      <div className="max-w-7xl mx-auto">
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
          <Tabs defaultValue="general" className="p-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="display">Sync Calendar</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="timeblocking">Time Blocking</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6 mt-6">
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
            </TabsContent>

            <TabsContent value="display" className="space-y-6 mt-6">
              {/* Calendar Integrations */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Link className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-gray-900">Calendar Integrations</h3>
                </div>
                
                {/* Header Description */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    Connect your external calendars to sync events and appointments with your task calendar. 
                    Two-way sync keeps your schedules in perfect harmony.
                  </p>
                </div>

                {/* Connected Calendars */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Connected Calendars (0)
                  </h4>
                  
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">No calendars connected yet</p>
                    <p className="text-sm text-gray-500">Add your first calendar integration below</p>
                  </div>
                </div>

                {/* Available Calendar Providers */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-900 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-primary" />
                    Add Calendar Integration
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Google Calendar */}
                    <div className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer bg-white">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">Google Calendar</h5>
                          <p className="text-xs text-gray-500">Sync with Google Workspace</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Seamlessly sync your Google Calendar events with two-way integration.
                      </p>
                      <Button className="w-full" variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Connect Google Calendar
                      </Button>
                    </div>

                    {/* Outlook Calendar */}
                    <div className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer bg-white">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">Outlook Calendar</h5>
                          <p className="text-xs text-gray-500">Sync with Microsoft 365</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Connect your Outlook calendar for seamless Microsoft 365 integration.
                      </p>
                      <Button 
                        className="w-full" 
                        variant="outline" 
                        onClick={handleConnectOutlook}
                        disabled={isConnecting}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Connect Outlook Calendar
                      </Button>
                    </div>

                    {/* iCloud Calendar */}
                    <div className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer bg-white">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">iCloud Calendar</h5>
                          <p className="text-xs text-gray-500">Sync with Apple ecosystem</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Integrate your iCloud calendar for perfect Apple device synchronization.
                      </p>
                      <Button className="w-full" variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Connect iCloud Calendar
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Sync Settings */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Settings className="w-5 h-5 text-primary" />
                    <h4 className="text-md font-medium text-gray-900">Sync Settings</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Two-way Sync</Label>
                          <p className="text-sm text-muted-foreground">Changes sync both directions</p>
                        </div>
                        <Switch checked={true} onCheckedChange={() => {}} />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Auto Sync</Label>
                          <p className="text-sm text-muted-foreground">Automatically sync every 15 minutes</p>
                        </div>
                        <Switch checked={true} onCheckedChange={() => {}} />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Sync Past Events</Label>
                          <p className="text-sm text-muted-foreground">Include events from the past 30 days</p>
                        </div>
                        <Switch checked={false} onCheckedChange={() => {}} />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Sync Frequency</Label>
                        <Select value="15">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">Every 5 minutes</SelectItem>
                            <SelectItem value="15">Every 15 minutes</SelectItem>
                            <SelectItem value="30">Every 30 minutes</SelectItem>
                            <SelectItem value="60">Every hour</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Default Calendar for New Tasks</Label>
                        <Select value="local">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="local">Local Calendar</SelectItem>
                            <SelectItem value="google">Google Calendar</SelectItem>
                            <SelectItem value="outlook">Outlook Calendar</SelectItem>
                            <SelectItem value="icloud">iCloud Calendar</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Help Section */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <ExternalLink className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-gray-900 mb-1">Need Help?</h5>
                      <p className="text-sm text-gray-600 mb-3">
                        Setting up calendar integrations requires API access. Follow our setup guides for each provider:
                      </p>
                      <div className="space-y-1">
                        <a href="#" className="text-sm text-blue-600 hover:text-blue-800 block">
                          → Google Calendar Setup Guide
                        </a>
                        <a href="#" className="text-sm text-blue-600 hover:text-blue-800 block">
                          → Microsoft Outlook Setup Guide
                        </a>
                        <a href="#" className="text-sm text-blue-600 hover:text-blue-800 block">
                          → iCloud Calendar Setup Guide
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-6 mt-6">
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
            </TabsContent>

            <TabsContent value="timeblocking" className="space-y-6 mt-6">
              {/* Time Blocking Calendar */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold text-gray-900">Time Blocking Calendar</h3>
                </div>
                
                <div className="bg-white/50 backdrop-blur-sm rounded-lg border border-gray-200/50 p-4">
                  <TimeBlockingCalendar
                    currentDate={currentDate}
                    viewMode="week"
                    onMonthChange={setCurrentDate}
                  />
                </div>

                {/* Time Blocking Settings */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <h4 className="text-md font-medium text-gray-900">Settings</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Auto-fit Time Blocks</Label>
                        <p className="text-sm text-muted-foreground">Automatically adjust block size to fit available slots</p>
                      </div>
                      <Switch
                        checked={false}
                        onCheckedChange={() => {}}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Show Block Conflicts</Label>
                        <p className="text-sm text-muted-foreground">Highlight overlapping time blocks</p>
                      </div>
                      <Switch
                        checked={true}
                        onCheckedChange={() => {}}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="minBlockDuration">Minimum Block Duration (minutes)</Label>
                      <Select value="15">
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
                      <Label htmlFor="defaultBlockColor">Default Block Color</Label>
                      <Select value="blue">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="blue">Blue</SelectItem>
                          <SelectItem value="green">Green</SelectItem>
                          <SelectItem value="purple">Purple</SelectItem>
                          <SelectItem value="orange">Orange</SelectItem>
                          <SelectItem value="red">Red</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};