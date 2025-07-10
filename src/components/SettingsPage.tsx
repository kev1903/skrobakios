import React, { useState } from 'react';
import { ArrowLeft, Settings, Shield, User, Bell, Palette, Globe, Users, Plug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { AdminPanel } from './admin/AdminPanel';
import { RoleManagement } from './admin/RoleManagement';
import { useTheme } from '@/hooks/useTheme';
import { IntegrationsTab } from './integrations/IntegrationsTab';
interface SettingsPageProps {
  onNavigate: (page: string) => void;
}
export const SettingsPage = ({
  onNavigate
}: SettingsPageProps) => {
  const {
    user,
    userRole,
    isSuperAdmin,
    isAdmin
  } = useAuth();
  const {
    theme,
    setTheme
  } = useTheme();
  const [activeTab, setActiveTab] = useState('general');
  return <div className="h-full flex flex-col">
      {/* Header */}
      <div className="relative backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border-b border-white/20 dark:border-slate-700/20 shadow-sm">
        <div className="px-4 md:px-6 lg:px-8 py-4 md:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 md:space-x-6">
              <Button variant="ghost" size="sm" onClick={() => onNavigate('dashboard')} className="flex items-center space-x-1 md:space-x-2 text-slate-600 hover:text-blue-600 hover:bg-white/40 backdrop-blur-sm transition-all duration-200">
                <ArrowLeft className="w-4 h-4" />
                <span className="font-medium text-sm md:text-base">Back</span>
              </Button>
              <div>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">
                  Settings
                </h1>
                <p className="text-xs md:text-sm text-slate-500 mt-1">Manage your account and application preferences</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
            {/* Tab List - Optimized for iPad */}
            <div className="w-full overflow-x-auto">
              <TabsList className="flex w-full min-w-fit grid-cols-2 md:grid md:grid-cols-4 lg:grid-cols-7 backdrop-blur-sm bg-white/60 p-1">
                <TabsTrigger value="general" className="flex items-center justify-center space-x-1 md:space-x-2 px-2 md:px-3 py-2 whitespace-nowrap">
                  <Settings className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs md:text-sm">General</span>
                </TabsTrigger>
                <TabsTrigger value="account" className="flex items-center justify-center space-x-1 md:space-x-2 px-2 md:px-3 py-2 whitespace-nowrap">
                  <User className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs md:text-sm">Account</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center justify-center space-x-1 md:space-x-2 px-2 md:px-3 py-2 whitespace-nowrap">
                  <Bell className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs md:text-sm">Notifications</span>
                </TabsTrigger>
                <TabsTrigger value="appearance" className="flex items-center justify-center space-x-1 md:space-x-2 px-2 md:px-3 py-2 whitespace-nowrap">
                  <Palette className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs md:text-sm">Appearance</span>
                </TabsTrigger>
                <TabsTrigger value="integrations" className="flex items-center justify-center space-x-1 md:space-x-2 px-2 md:px-3 py-2 whitespace-nowrap">
                  <Plug className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs md:text-sm">Integrations</span>
                </TabsTrigger>
                {isSuperAdmin && <>
                    <TabsTrigger value="roles" className="flex items-center justify-center space-x-1 md:space-x-2 px-2 md:px-3 py-2 whitespace-nowrap">
                      <Users className="w-4 h-4 flex-shrink-0" />
                      <span className="text-xs md:text-sm">Roles</span>
                    </TabsTrigger>
                    <TabsTrigger value="admin" className="flex items-center justify-center space-x-1 md:space-x-2 px-2 md:px-3 py-2 whitespace-nowrap">
                      <Shield className="w-4 h-4 flex-shrink-0" />
                      <span className="text-xs md:text-sm">Users</span>
                    </TabsTrigger>
                  </>}
              </TabsList>
            </div>

            <TabsContent value="general" className="space-y-4 md:space-y-6">
              <Card className="backdrop-blur-sm bg-white/60 border-white/30">
                <CardHeader className="pb-4 md:pb-6">
                  <CardTitle className="text-lg md:text-xl">General Settings</CardTitle>
                  <CardDescription className="text-sm md:text-base">
                    Configure your general application preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 md:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div>
                      <h4 className="text-sm font-medium">Language</h4>
                      <p className="text-xs md:text-sm text-slate-500">Choose your preferred language</p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">English</Button>
                  </div>
                  <Separator />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div>
                      <h4 className="text-sm font-medium">Time Zone</h4>
                      <p className="text-xs md:text-sm text-slate-500">Set your local time zone</p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">UTC+0</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account" className="space-y-4 md:space-y-6">
              <Card className="backdrop-blur-sm bg-white/60 border-white/30">
                <CardHeader className="pb-4 md:pb-6">
                  <CardTitle className="text-lg md:text-xl">Account Information</CardTitle>
                  <CardDescription className="text-sm md:text-base">
                    View and manage your account details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 md:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div>
                      <h4 className="text-sm font-medium">Email</h4>
                      <p className="text-xs md:text-sm text-slate-500 break-all">{user?.email}</p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">Change</Button>
                  </div>
                  <Separator />
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-2 sm:space-y-0">
                    <div>
                      <h4 className="text-sm font-medium">Role</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={isSuperAdmin ? "destructive" : isAdmin ? "default" : "secondary"}>
                          {userRole}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div>
                      <h4 className="text-sm font-medium">Profile</h4>
                      <p className="text-xs md:text-sm text-slate-500">Update your personal information</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => onNavigate('user-edit')} className="w-full sm:w-auto">
                      Edit Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-4 md:space-y-6">
              <Card className="backdrop-blur-sm bg-white/60 border-white/30">
                <CardHeader className="pb-4 md:pb-6">
                  <CardTitle className="text-lg md:text-xl">Notification Preferences</CardTitle>
                  <CardDescription className="text-sm md:text-base">
                    Configure how you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 md:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div>
                      <h4 className="text-sm font-medium">Email Notifications</h4>
                      <p className="text-xs md:text-sm text-slate-500">Receive updates via email</p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">Enabled</Button>
                  </div>
                  <Separator />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div>
                      <h4 className="text-sm font-medium">Push Notifications</h4>
                      <p className="text-xs md:text-sm text-slate-500">Receive browser notifications</p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">Disabled</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-4 md:space-y-6">
              {/* Theme Settings */}
              <Card className="backdrop-blur-sm bg-white/60 dark:bg-slate-900/60 border-white/30 dark:border-slate-700/30">
                <CardHeader className="pb-4 md:pb-6">
                  <CardTitle className="text-lg md:text-xl">Theme Settings</CardTitle>
                  <CardDescription className="text-sm md:text-base">
                    Customize the visual appearance of the application
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 md:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div>
                      <h4 className="text-sm font-medium">Theme Mode</h4>
                      <p className="text-xs md:text-sm text-slate-500">Choose between light and dark mode</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-xs md:text-sm text-slate-600 dark:text-slate-400">Light</span>
                      <Switch checked={theme === 'dark'} onCheckedChange={checked => setTheme(checked ? 'dark' : 'light')} />
                      <span className="text-xs md:text-sm text-slate-600 dark:text-slate-400">Dark</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div>
                      <h4 className="text-sm font-medium">Compact Mode</h4>
                      <p className="text-xs md:text-sm text-slate-500">Use a more compact interface</p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">Disabled</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Design System Guide */}
              <Card className="backdrop-blur-sm bg-white/60 dark:bg-slate-900/60 border-white/30 dark:border-slate-700/30">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Palette className="w-5 h-5" />
                    <span>Design System Guide</span>
                  </CardTitle>
                  <CardDescription>
                    Complete design kit documentation for platform consistency
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  
                  {/* Typography */}
                  <div className="space-y-3 md:space-y-4">
                    <h3 className="text-base md:text-lg font-semibold text-foreground font-manrope">Typography</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
                      <div className="space-y-2 md:space-y-3">
                        <div>
                          <h4 className="text-xs md:text-sm font-medium text-muted-foreground mb-2">Primary Font - Manrope</h4>
                          <div className="p-2 md:p-3 border rounded-lg bg-muted/20">
                            <p className="font-manrope text-lg md:text-2xl font-bold">Headlines & Titles</p>
                            <p className="font-manrope text-base md:text-lg font-semibold">Subheadings</p>
                            <p className="font-manrope text-sm md:text-base font-medium">Navigation & UI Elements</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2 md:space-y-3">
                        <div>
                          <h4 className="text-xs md:text-sm font-medium text-muted-foreground mb-2">Body Font - Inter</h4>
                          <div className="p-2 md:p-3 border rounded-lg bg-muted/20">
                            <p className="font-inter text-sm md:text-base">Body text and paragraphs</p>
                            <p className="font-inter text-xs md:text-sm">Small text and descriptions</p>
                            <p className="font-inter text-xs">Captions and labels</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Color Palette */}
                  <div className="space-y-3 md:space-y-4">
                    <h3 className="text-base md:text-lg font-semibold text-foreground font-manrope">Color Palette</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      <div className="space-y-2 md:space-y-3">
                        <h4 className="text-xs md:text-sm font-medium text-muted-foreground">Primary Colors</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-primary border flex-shrink-0"></div>
                            <div>
                              <p className="text-xs md:text-sm font-medium">Primary</p>
                              <p className="text-xs text-muted-foreground">hsl(220 14.3% 25.9%)</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-primary-foreground border flex-shrink-0"></div>
                            <div>
                              <p className="text-xs md:text-sm font-medium">Primary Foreground</p>
                              <p className="text-xs text-muted-foreground">hsl(210 40% 98%)</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2 md:space-y-3">
                        <h4 className="text-xs md:text-sm font-medium text-muted-foreground">Background Colors</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-background border flex-shrink-0"></div>
                            <div>
                              <p className="text-xs md:text-sm font-medium">Background</p>
                              <p className="text-xs text-muted-foreground">hsl(240 10% 98%)</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-muted border flex-shrink-0"></div>
                            <div>
                              <p className="text-xs md:text-sm font-medium">Muted</p>
                              <p className="text-xs text-muted-foreground">hsl(210 40% 96.1%)</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2 md:space-y-3">
                        <h4 className="text-xs md:text-sm font-medium text-muted-foreground">Accent Colors</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-accent border flex-shrink-0"></div>
                            <div>
                              <p className="text-xs md:text-sm font-medium">Accent</p>
                              <p className="text-xs text-muted-foreground">hsl(210 40% 96.1%)</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-destructive border flex-shrink-0"></div>
                            <div>
                              <p className="text-xs md:text-sm font-medium">Destructive</p>
                              <p className="text-xs text-muted-foreground">hsl(0 84.2% 60.2%)</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Glassmorphism Effects */}
                  <div className="space-y-3 md:space-y-4">
                    <h3 className="text-base md:text-lg font-semibold text-foreground font-manrope">Glassmorphism Effects</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      <div className="space-y-2 md:space-y-3">
                        <h4 className="text-xs md:text-sm font-medium text-muted-foreground">Standard Glass</h4>
                        <div className="p-3 md:p-4 glass rounded-xl">
                          <p className="text-xs md:text-sm font-medium">Standard Glass Effect</p>
                          <p className="text-xs text-muted-foreground">25% opacity, 20px backdrop blur</p>
                        </div>
                      </div>
                      <div className="space-y-2 md:space-y-3">
                        <h4 className="text-xs md:text-sm font-medium text-muted-foreground">Hover Effect</h4>
                        <div className="p-3 md:p-4 glass glass-hover rounded-xl cursor-pointer">
                          <p className="text-xs md:text-sm font-medium">Interactive Hover State</p>
                          <p className="text-xs text-muted-foreground">Enhanced opacity on interaction</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Spacing & Layout */}
                  <div className="space-y-3 md:space-y-4">
                    <h3 className="text-base md:text-lg font-semibold text-foreground font-manrope">Spacing & Layout</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div className="space-y-2 md:space-y-3">
                        <h4 className="text-xs md:text-sm font-medium text-muted-foreground">Border Radius</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 md:w-12 h-6 md:h-8 bg-primary rounded-sm flex-shrink-0"></div>
                            <span className="text-xs md:text-sm">Small (sm): calc(0.75rem - 4px)</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 md:w-12 h-6 md:h-8 bg-primary rounded-md flex-shrink-0"></div>
                            <span className="text-xs md:text-sm">Medium (md): calc(0.75rem - 2px)</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 md:w-12 h-6 md:h-8 bg-primary rounded-lg flex-shrink-0"></div>
                            <span className="text-xs md:text-sm">Large (lg): 0.75rem</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2 md:space-y-3">
                        <h4 className="text-xs md:text-sm font-medium text-muted-foreground">Animations</h4>
                        <div className="space-y-2">
                          <div className="p-2 bg-muted rounded-md animate-fade-in">
                            <span className="text-xs md:text-sm">Fade In Animation</span>
                          </div>
                          <div className="p-2 bg-muted rounded-md animate-slide-in">
                            <span className="text-xs md:text-sm">Slide In Animation</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Components Showcase */}
                  <div className="space-y-3 md:space-y-4">
                    <h3 className="text-base md:text-lg font-semibold text-foreground font-manrope">Component Examples</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      <div className="space-y-2 md:space-y-3">
                        <h4 className="text-xs md:text-sm font-medium text-muted-foreground">Buttons</h4>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm">Primary</Button>
                          <Button variant="ghost" size="sm">Ghost</Button>
                        </div>
                      </div>
                      <div className="space-y-2 md:space-y-3">
                        <h4 className="text-xs md:text-sm font-medium text-muted-foreground">Badges</h4>
                        <div className="flex flex-wrap gap-2">
                          <Badge>Default</Badge>
                          <Badge variant="secondary">Secondary</Badge>
                          <Badge variant="outline">Outline</Badge>
                          <Badge variant="destructive">Destructive</Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Usage Guidelines */}
                  <div className="space-y-3 md:space-y-4">
                    <h3 className="text-base md:text-lg font-semibold text-foreground font-manrope">Usage Guidelines</h3>
                    <div className="p-3 md:p-4 border rounded-lg bg-muted/20 space-y-3">
                      <div>
                        <h4 className="text-xs md:text-sm font-medium text-foreground mb-2">Typography Hierarchy</h4>
                        <ul className="text-xs md:text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Use Manrope for all headings, titles, and navigation elements</li>
                          <li>Use Inter for body text, descriptions, and UI content</li>
                          <li>Maintain consistent font weights: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)</li>
                          <li>Ensure clear hierarchy with size and weight variations</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-xs md:text-sm font-medium text-foreground mb-2">Button Usage</h4>
                        <ul className="text-xs md:text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Use Primary buttons for main call-to-action elements</li>
                          <li>Use Ghost buttons for secondary actions and subtle interactions</li>
                          <li>Maintain consistent sizing and spacing across the platform</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-xs md:text-sm font-medium text-foreground mb-2">Glassmorphism Best Practices</h4>
                        <ul className="text-xs md:text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Use standard glass effects for overlay components and modals</li>
                          <li>Apply glass-hover for interactive elements to enhance user feedback</li>
                          <li>Combine with subtle animations for enhanced user experience</li>
                          <li>Ensure readability with appropriate backdrop blur levels</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-xs md:text-sm font-medium text-foreground mb-2">Color System</h4>
                        <ul className="text-xs md:text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Always use HSL semantic tokens instead of direct color values</li>
                          <li>Primary colors for call-to-action buttons and important elements</li>
                          <li>Muted colors for secondary information and backgrounds</li>
                          <li>Ensure proper contrast ratios for accessibility compliance</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-4 md:space-y-6">
              <IntegrationsTab />
            </TabsContent>

            {isSuperAdmin && <>
                <TabsContent value="roles" className="space-y-4 md:space-y-6">
                  <RoleManagement onNavigate={onNavigate} />
                </TabsContent>
                
                <TabsContent value="admin" className="space-y-4 md:space-y-6">
                  <AdminPanel onNavigate={onNavigate} />
                </TabsContent>
              </>}
          </Tabs>
        </div>
      </div>
    </div>;
};