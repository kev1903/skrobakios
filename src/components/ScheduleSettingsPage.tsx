import React, { useState } from "react";
import { ArrowLeft, Save, Calendar, Clock, Users, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Project } from "@/hooks/useProjects";

interface ScheduleSettingsPageProps {
  project: Project;
  onNavigate: (page: string) => void;
}

export const ScheduleSettingsPage = ({ project, onNavigate }: ScheduleSettingsPageProps) => {
  const [settings, setSettings] = useState({
    workingDays: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
    },
    workingHours: {
      start: "08:00",
      end: "17:00",
    },
    defaultDuration: "1",
    autoCalculateDuration: true,
    showWeekends: true,
    showNonWorkingDays: true,
    dateFormat: "DD/MM/YY",
    timeZone: "UTC",
    criticalPath: true,
    autoSchedule: false,
    resourceLeveling: false,
    notifications: {
      deadlineReminders: true,
      taskUpdates: true,
      milestoneAlerts: true,
    },
  });

  const handleSettingChange = (category: string, key: string, value: any) => {
    setSettings(prev => {
      if (category in prev) {
        return {
          ...prev,
          [category]: {
            ...(prev[category as keyof typeof prev] as any),
            [key]: value
          }
        };
      }
      return prev;
    });
  };

  const handleSave = () => {
    // Save settings logic here
    console.log("Settings saved:", settings);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="glass-card border-b border-border px-4 md:px-6 py-3 md:py-4 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('project-schedule')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Schedule</span>
            </Button>
            <div>
              <h1 className="text-xl md:text-2xl font-poppins font-bold text-foreground heading-modern">
                Schedule Settings
              </h1>
              <p className="text-sm text-muted-foreground body-modern">
                {project.name} - Configure schedule preferences
              </p>
            </div>
          </div>
          <Button
            onClick={handleSave}
            className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="working-time">Working Time</TabsTrigger>
              <TabsTrigger value="display">Display</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>General Schedule Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="defaultDuration">Default Task Duration (days)</Label>
                      <Input
                        id="defaultDuration"
                        type="number"
                        value={settings.defaultDuration}
                        onChange={(e) => setSettings(prev => ({ ...prev, defaultDuration: e.target.value }))}
                        className="input-glass"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateFormat">Date Format</Label>
                      <Select
                        value={settings.dateFormat}
                        onValueChange={(value) => setSettings(prev => ({ ...prev, dateFormat: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DD/MM/YY">DD/MM/YY</SelectItem>
                          <SelectItem value="MM/DD/YY">MM/DD/YY</SelectItem>
                          <SelectItem value="YY/MM/DD">YY/MM/DD</SelectItem>
                          <SelectItem value="DD-MM-YYYY">DD-MM-YYYY</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Auto-calculate Duration</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically calculate task duration based on start and end dates
                        </p>
                      </div>
                      <Switch
                        checked={settings.autoCalculateDuration}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoCalculateDuration: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Show Critical Path</Label>
                        <p className="text-sm text-muted-foreground">
                          Highlight the critical path in the schedule
                        </p>
                      </div>
                      <Switch
                        checked={settings.criticalPath}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, criticalPath: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Auto-schedule Tasks</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically reschedule dependent tasks when dates change
                        </p>
                      </div>
                      <Switch
                        checked={settings.autoSchedule}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoSchedule: checked }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="working-time" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5" />
                    <span>Working Time Configuration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-medium">Working Days</Label>
                      <p className="text-sm text-muted-foreground mb-3">
                        Select which days are considered working days for duration calculations
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Object.entries(settings.workingDays).map(([day, isWorking]) => (
                          <div key={day} className="flex items-center space-x-2">
                            <Switch
                              checked={isWorking}
                              onCheckedChange={(checked) => handleSettingChange('workingDays', day, checked)}
                            />
                            <Label className="capitalize">{day}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <Label className="text-base font-medium">Working Hours</Label>
                      <p className="text-sm text-muted-foreground mb-3">
                        Set the standard working hours for your project
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="startTime">Start Time</Label>
                          <Input
                            id="startTime"
                            type="time"
                            value={settings.workingHours.start}
                            onChange={(e) => handleSettingChange('workingHours', 'start', e.target.value)}
                            className="input-glass"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="endTime">End Time</Label>
                          <Input
                            id="endTime"
                            type="time"
                            value={settings.workingHours.end}
                            onChange={(e) => handleSettingChange('workingHours', 'end', e.target.value)}
                            className="input-glass"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="display" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Display Options</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Show Weekends</Label>
                        <p className="text-sm text-muted-foreground">
                          Display weekend columns in the timeline view
                        </p>
                      </div>
                      <Switch
                        checked={settings.showWeekends}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showWeekends: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Show Non-working Days</Label>
                        <p className="text-sm text-muted-foreground">
                          Highlight non-working days in the schedule
                        </p>
                      </div>
                      <Switch
                        checked={settings.showNonWorkingDays}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showNonWorkingDays: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Resource Leveling</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically adjust task scheduling based on resource availability
                        </p>
                      </div>
                      <Switch
                        checked={settings.resourceLeveling}
                        onCheckedChange={(checked) => setSettings(prev => ({ ...prev, resourceLeveling: checked }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5" />
                    <span>Notification Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Deadline Reminders</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified when task deadlines are approaching
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.deadlineReminders}
                        onCheckedChange={(checked) => handleSettingChange('notifications', 'deadlineReminders', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Task Updates</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications when tasks are updated by team members
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.taskUpdates}
                        onCheckedChange={(checked) => handleSettingChange('notifications', 'taskUpdates', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Milestone Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Get alerts when project milestones are reached
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications.milestoneAlerts}
                        onCheckedChange={(checked) => handleSettingChange('notifications', 'milestoneAlerts', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};