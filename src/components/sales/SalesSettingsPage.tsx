
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings,
  Bell,
  Mail,
  FileText,
  DollarSign,
  Users,
  Shield
} from 'lucide-react';

export const SalesSettingsPage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="w-8 h-8 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold">Sales CRM Settings</h2>
          <p className="text-gray-600">Configure your CRM system preferences</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>Basic company details for estimates and communications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input id="company-name" defaultValue="Construction Pro LLC" />
                </div>
                <div>
                  <Label htmlFor="company-address">Address</Label>
                  <Textarea 
                    id="company-address" 
                    rows={3}
                    defaultValue="123 Business Street&#10;Melbourne VIC 3000&#10;Australia"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company-phone">Phone</Label>
                    <Input id="company-phone" defaultValue="+61 3 9000 0000" />
                  </div>
                  <div>
                    <Label htmlFor="company-email">Email</Label>
                    <Input id="company-email" defaultValue="info@constructionpro.com.au" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="company-website">Website</Label>
                  <Input id="company-website" defaultValue="www.constructionpro.com.au" />
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>CRM Preferences</CardTitle>
                <CardDescription>Configure how the CRM system behaves</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="default-currency">Default Currency</Label>
                  <Select defaultValue="aud">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aud">AUD - Australian Dollar</SelectItem>
                      <SelectItem value="usd">USD - US Dollar</SelectItem>
                      <SelectItem value="eur">EUR - Euro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date-format">Date Format</Label>
                  <Select defaultValue="dd-mm-yyyy">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd-mm-yyyy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="mm-dd-yyyy">MM/DD/YYYY</SelectItem>
                      <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="australia-melbourne">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="australia-melbourne">Australia/Melbourne</SelectItem>
                      <SelectItem value="australia-sydney">Australia/Sydney</SelectItem>
                      <SelectItem value="australia-perth">Australia/Perth</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-save">Auto-save drafts</Label>
                    <p className="text-sm text-gray-600">Automatically save estimate drafts</p>
                  </div>
                  <Switch id="auto-save" defaultChecked />
                </div>
                <Button>Save Preferences</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>Configure when and how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Email Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>New Lead Notifications</Label>
                      <p className="text-sm text-gray-600">Get notified when new leads are added</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Estimate Approved</Label>
                      <p className="text-sm text-gray-600">Get notified when estimates are approved</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Submittal Responses</Label>
                      <p className="text-sm text-gray-600">Get notified when clients respond to submittals</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Overdue Reminders</Label>
                      <p className="text-sm text-gray-600">Get reminders for overdue submittals and tasks</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">System Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Browser Notifications</Label>
                      <p className="text-sm text-gray-600">Show notifications in your browser</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Mobile Push Notifications</Label>
                      <p className="text-sm text-gray-600">Send notifications to mobile devices</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>

              <Button>Save Notification Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Email Templates
                </CardTitle>
                <CardDescription>Customize email templates for client communications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="welcome-template">Welcome Email Template</Label>
                  <Textarea 
                    id="welcome-template"
                    rows={4}
                    defaultValue="Dear {client_name},&#10;&#10;Welcome to our construction project! We're excited to work with you on {project_name}.&#10;&#10;Best regards,&#10;{pm_name}"
                  />
                </div>
                <div>
                  <Label htmlFor="estimate-template">Estimate Email Template</Label>
                  <Textarea 
                    id="estimate-template"
                    rows={4}
                    defaultValue="Dear {client_name},&#10;&#10;Please find attached your estimate for {project_name}. The total amount is {total_amount}.&#10;&#10;Please review and let us know if you have any questions.&#10;&#10;Best regards,&#10;{pm_name}"
                  />
                </div>
                <Button>Save Templates</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Document Templates
                </CardTitle>
                <CardDescription>Configure templates for estimates and contracts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="estimate-header">Estimate Header</Label>
                  <Textarea 
                    id="estimate-header"
                    rows={3}
                    defaultValue="CONSTRUCTION ESTIMATE&#10;{company_name}&#10;{company_address}"
                  />
                </div>
                <div>
                  <Label htmlFor="estimate-footer">Estimate Footer</Label>
                  <Textarea 
                    id="estimate-footer"
                    rows={3}
                    defaultValue="This estimate is valid for 30 days.&#10;All prices include GST.&#10;Thank you for considering our services."
                  />
                </div>
                <div>
                  <Label htmlFor="terms-conditions">Terms & Conditions</Label>
                  <Textarea 
                    id="terms-conditions"
                    rows={4}
                    defaultValue="1. Payment terms: 50% deposit, 50% on completion&#10;2. All materials are subject to availability&#10;3. Changes to scope may affect pricing&#10;4. Permits and approvals are client responsibility"
                  />
                </div>
                <Button>Save Templates</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Pricing Configuration
              </CardTitle>
              <CardDescription>Set default pricing rules and markup rates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="default-markup">Default Markup (%)</Label>
                  <Input id="default-markup" type="number" defaultValue="15" />
                </div>
                <div>
                  <Label htmlFor="labour-rate">Default Labour Rate ($/hour)</Label>
                  <Input id="labour-rate" type="number" defaultValue="75" />
                </div>
                <div>
                  <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                  <Input id="tax-rate" type="number" defaultValue="10" />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Service Type Markups</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span>Residential Construction</span>
                    <div className="flex items-center gap-2">
                      <Input type="number" defaultValue="15" className="w-20" />
                      <span className="text-sm text-gray-600">%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span>Commercial Construction</span>
                    <div className="flex items-center gap-2">
                      <Input type="number" defaultValue="12" className="w-20" />
                      <span className="text-sm text-gray-600">%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span>Renovation Work</span>
                    <div className="flex items-center gap-2">
                      <Input type="number" defaultValue="18" className="w-20" />
                      <span className="text-sm text-gray-600">%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <span>Emergency Repairs</span>
                    <div className="flex items-center gap-2">
                      <Input type="number" defaultValue="25" className="w-20" />
                      <span className="text-sm text-gray-600">%</span>
                    </div>
                  </div>
                </div>
              </div>

              <Button>Save Pricing Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Management
              </CardTitle>
              <CardDescription>Manage team access and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Team Members</h3>
                  <Button>Add New User</Button>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">SW</span>
                      </div>
                      <div>
                        <p className="font-medium">Sarah Wilson</p>
                        <p className="text-sm text-gray-600">sarah@company.com</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Select defaultValue="admin">
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button size="sm" variant="outline">Edit</Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-medium">MJ</span>
                      </div>
                      <div>
                        <p className="font-medium">Mike Johnson</p>
                        <p className="text-sm text-gray-600">mike@company.com</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Select defaultValue="manager">
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button size="sm" variant="outline">Edit</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Configure security and backup options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Access Control</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require Two-Factor Authentication</Label>
                      <p className="text-sm text-gray-600">Require 2FA for all user accounts</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-logout after inactivity</Label>
                      <p className="text-sm text-gray-600">Automatically log out users after 30 minutes</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>IP Address Restrictions</Label>
                      <p className="text-sm text-gray-600">Restrict access to specific IP addresses</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Data Backup</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Automatic Daily Backups</Label>
                      <p className="text-sm text-gray-600">Create automatic backups every day</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div>
                    <Label htmlFor="backup-retention">Backup Retention (days)</Label>
                    <Input id="backup-retention" type="number" defaultValue="30" className="w-32" />
                  </div>
                </div>
              </div>

              <Button>Save Security Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
