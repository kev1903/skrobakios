import React, { useState } from 'react';
import { ArrowLeft, Settings, Shield, User, Bell, Palette, Globe, Users } from 'lucide-react';
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

interface SettingsPageProps {
  onNavigate: (page: string) => void;
}

export const SettingsPage = ({ onNavigate }: SettingsPageProps) => {
  const { user, userRole, isSuperAdmin, isAdmin } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="relative backdrop-blur-xl bg-white/60 dark:bg-slate-900/60 border-b border-white/20 dark:border-slate-700/20 shadow-sm">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('dashboard')}
                className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 hover:bg-white/40 backdrop-blur-sm transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-medium">Back</span>
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">
                  Settings
                </h1>
                <p className="text-sm text-slate-500 mt-1">Manage your account and application preferences</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 backdrop-blur-sm bg-white/60">
              <TabsTrigger value="general" className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">General</span>
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Account</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center space-x-2">
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center space-x-2">
                <Palette className="w-4 h-4" />
                <span className="hidden sm:inline">Appearance</span>
              </TabsTrigger>
              {isSuperAdmin && (
                <>
                  <TabsTrigger value="roles" className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span className="hidden sm:inline">Roles</span>
                  </TabsTrigger>
                  <TabsTrigger value="admin" className="flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span className="hidden sm:inline">Admin</span>
                  </TabsTrigger>
                </>
              )}
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <Card className="backdrop-blur-sm bg-white/60 border-white/30">
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>
                    Configure your general application preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Language</h4>
                      <p className="text-sm text-slate-500">Choose your preferred language</p>
                    </div>
                    <Button variant="outline" size="sm">English</Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Time Zone</h4>
                      <p className="text-sm text-slate-500">Set your local time zone</p>
                    </div>
                    <Button variant="outline" size="sm">UTC+0</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account" className="space-y-6">
              <Card className="backdrop-blur-sm bg-white/60 border-white/30">
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    View and manage your account details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Email</h4>
                      <p className="text-sm text-slate-500">{user?.email}</p>
                    </div>
                    <Button variant="outline" size="sm">Change</Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
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
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Profile</h4>
                      <p className="text-sm text-slate-500">Update your personal information</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => onNavigate('user-edit')}>
                      Edit Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card className="backdrop-blur-sm bg-white/60 border-white/30">
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Configure how you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Email Notifications</h4>
                      <p className="text-sm text-slate-500">Receive updates via email</p>
                    </div>
                    <Button variant="outline" size="sm">Enabled</Button>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Push Notifications</h4>
                      <p className="text-sm text-slate-500">Receive browser notifications</p>
                    </div>
                    <Button variant="outline" size="sm">Disabled</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-6">
              {/* Theme Settings */}
              <Card className="backdrop-blur-sm bg-white/60 dark:bg-slate-900/60 border-white/30 dark:border-slate-700/30">
                <CardHeader>
                  <CardTitle>Theme Settings</CardTitle>
                  <CardDescription>
                    Customize the visual appearance of the application
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Theme Mode</h4>
                      <p className="text-sm text-slate-500">Choose between light and dark mode</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Light</span>
                      <Switch
                        checked={theme === 'dark'}
                        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                      />
                      <span className="text-sm text-slate-600 dark:text-slate-400">Dark</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Compact Mode</h4>
                      <p className="text-sm text-slate-500">Use a more compact interface</p>
                    </div>
                    <Button variant="outline" size="sm">Disabled</Button>
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
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground font-poppins">Typography</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">Primary Font - Poppins</h4>
                          <div className="p-3 border rounded-lg bg-muted/20">
                            <p className="font-poppins text-2xl font-bold">Headlines & Titles</p>
                            <p className="font-poppins text-lg font-semibold">Subheadings</p>
                            <p className="font-poppins text-base font-medium">Navigation</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">Body Font - Inter</h4>
                          <div className="p-3 border rounded-lg bg-muted/20">
                            <p className="font-inter text-base">Body text and paragraphs</p>
                            <p className="font-inter text-sm">Small text and descriptions</p>
                            <p className="font-inter text-xs">Captions and labels</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">Accent Font - Playfair</h4>
                          <div className="p-3 border rounded-lg bg-muted/20">
                            <p className="font-playfair text-2xl font-bold">Elegant Headings</p>
                            <p className="font-playfair text-lg">Special Occasions</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">System Font - Helvetica</h4>
                          <div className="p-3 border rounded-lg bg-muted/20">
                            <p className="font-helvetica text-base">System messages</p>
                            <p className="font-helvetica text-sm">Technical content</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Color Palette */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground font-poppins">Color Palette</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-muted-foreground">Primary Colors</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-primary border"></div>
                            <div>
                              <p className="text-sm font-medium">Primary</p>
                              <p className="text-xs text-muted-foreground">hsl(220 14.3% 25.9%)</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-primary-foreground border"></div>
                            <div>
                              <p className="text-sm font-medium">Primary Foreground</p>
                              <p className="text-xs text-muted-foreground">hsl(210 40% 98%)</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-muted-foreground">Background Colors</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-background border"></div>
                            <div>
                              <p className="text-sm font-medium">Background</p>
                              <p className="text-xs text-muted-foreground">hsl(240 10% 98%)</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-muted border"></div>
                            <div>
                              <p className="text-sm font-medium">Muted</p>
                              <p className="text-xs text-muted-foreground">hsl(210 40% 96.1%)</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-muted-foreground">Accent Colors</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-accent border"></div>
                            <div>
                              <p className="text-sm font-medium">Accent</p>
                              <p className="text-xs text-muted-foreground">hsl(210 40% 96.1%)</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-destructive border"></div>
                            <div>
                              <p className="text-sm font-medium">Destructive</p>
                              <p className="text-xs text-muted-foreground">hsl(0 84.2% 60.2%)</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Glassmorphism Effects */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground font-poppins">Glassmorphism Effects</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-muted-foreground">Glass Variants</h4>
                        <div className="space-y-3">
                          <div className="p-4 glass rounded-xl">
                            <p className="text-sm font-medium">Standard Glass</p>
                            <p className="text-xs text-muted-foreground">25% opacity, 20px blur</p>
                          </div>
                          <div className="p-4 glass-light rounded-xl">
                            <p className="text-sm font-medium">Light Glass</p>
                            <p className="text-xs text-muted-foreground">40% opacity, enhanced visibility</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-muted-foreground">Interactive States</h4>
                        <div className="space-y-3">
                          <div className="p-4 glass glass-hover rounded-xl cursor-pointer">
                            <p className="text-sm font-medium">Hover Effect</p>
                            <p className="text-xs text-muted-foreground">Enhances opacity on interaction</p>
                          </div>
                          <div className="p-4 glass-card">
                            <p className="text-sm font-medium">Card Component</p>
                            <p className="text-xs text-muted-foreground">Pre-styled with rounded corners</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Spacing & Layout */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground font-poppins">Spacing & Layout</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-muted-foreground">Border Radius</h4>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-8 bg-primary rounded-sm"></div>
                            <span className="text-sm">Small (sm): calc(0.75rem - 4px)</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-8 bg-primary rounded-md"></div>
                            <span className="text-sm">Medium (md): calc(0.75rem - 2px)</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-8 bg-primary rounded-lg"></div>
                            <span className="text-sm">Large (lg): 0.75rem</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-muted-foreground">Animations</h4>
                        <div className="space-y-2">
                          <div className="p-2 bg-muted rounded-md animate-fade-in">
                            <span className="text-sm">Fade In Animation</span>
                          </div>
                          <div className="p-2 bg-muted rounded-md animate-slide-in">
                            <span className="text-sm">Slide In Animation</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Components Showcase */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground font-poppins">Component Examples</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-muted-foreground">Buttons</h4>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm">Primary</Button>
                          <Button variant="outline" size="sm">Outline</Button>
                          <Button variant="secondary" size="sm">Secondary</Button>
                          <Button variant="ghost" size="sm">Ghost</Button>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-muted-foreground">Badges</h4>
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
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-foreground font-poppins">Usage Guidelines</h3>
                    <div className="p-4 border rounded-lg bg-muted/20 space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-2">Typography Hierarchy</h4>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Use Poppins for all headings and navigation elements</li>
                          <li>Use Inter for body text, descriptions, and UI content</li>
                          <li>Use Playfair Display sparingly for elegant accent text</li>
                          <li>Maintain consistent font weights: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-2">Color Usage</h4>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Always use HSL semantic tokens instead of direct color values</li>
                          <li>Primary colors for call-to-action buttons and important elements</li>
                          <li>Muted colors for secondary information and backgrounds</li>
                          <li>Ensure proper contrast ratios for accessibility</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-2">Glassmorphism Best Practices</h4>
                        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                          <li>Use glass effects for overlay components and modals</li>
                          <li>Apply glass-hover for interactive elements</li>
                          <li>Combine with subtle animations for enhanced user experience</li>
                          <li>Ensure readability with appropriate backdrop blur levels</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                </CardContent>
              </Card>
            </TabsContent>

            {isSuperAdmin && (
              <>
                <TabsContent value="roles" className="space-y-6">
                  <RoleManagement onNavigate={onNavigate} />
                </TabsContent>
                
                <TabsContent value="admin" className="space-y-6">
                  <AdminPanel onNavigate={onNavigate} />
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
};
