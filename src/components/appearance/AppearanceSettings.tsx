import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Palette, Type, Square, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AppearanceSettingsProps {
  onNavigate?: (page: string) => void;
}

interface DesignSettings {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      heading: string;
      body: string;
      caption: string;
    };
  };
  components: {
    buttonRadius: string;
    cardRadius: string;
    shadows: boolean;
    hoverEffects: boolean;
  };
}

const defaultSettings: DesignSettings = {
  colors: {
    primary: '#265DFF',
    secondary: '#FF9D00',
    accent: '#FFE399',
    background: 'linear-gradient(180deg, #EAF2FF 0%, #D6E5FF 100%)',
  },
  typography: {
    fontFamily: 'playfair',
    fontSize: {
      heading: '1.75rem',
      body: '1rem',
      caption: '0.75rem',
    },
  },
  components: {
    buttonRadius: '12px',
    cardRadius: '12px',
    shadows: true,
    hoverEffects: true,
  },
};

export const AppearanceSettings = ({ onNavigate }: AppearanceSettingsProps) => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<DesignSettings>(defaultSettings);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('skrobaki-appearance-settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading appearance settings:', error);
      }
    }
  }, []);

  const updateSettings = (newSettings: Partial<DesignSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    
    if (previewMode) {
      applySettings(updatedSettings);
    }
  };

  const applySettings = (settingsToApply: DesignSettings) => {
    const root = document.documentElement;
    
    // Update CSS custom properties
    root.style.setProperty('--primary-custom', settingsToApply.colors.primary);
    root.style.setProperty('--secondary-custom', settingsToApply.colors.secondary);
    root.style.setProperty('--accent-custom', settingsToApply.colors.accent);
    root.style.setProperty('--heading-font', settingsToApply.typography.fontFamily);
    root.style.setProperty('--heading-size', settingsToApply.typography.fontSize.heading);
    root.style.setProperty('--body-size', settingsToApply.typography.fontSize.body);
    root.style.setProperty('--caption-size', settingsToApply.typography.fontSize.caption);
    root.style.setProperty('--button-radius', settingsToApply.components.buttonRadius);
    root.style.setProperty('--card-radius', settingsToApply.components.cardRadius);
    
    // Apply background gradient
    if (settingsToApply.colors.background.includes('gradient')) {
      document.body.style.background = settingsToApply.colors.background;
    } else {
      document.body.style.background = settingsToApply.colors.background;
    }
  };

  const handleSave = () => {
    localStorage.setItem('skrobaki-appearance-settings', JSON.stringify(settings));
    applySettings(settings);
    
    toast({
      title: "Appearance Settings Saved",
      description: "Your design preferences have been applied successfully.",
    });
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    applySettings(defaultSettings);
    localStorage.removeItem('skrobaki-appearance-settings');
    
    toast({
      title: "Settings Reset",
      description: "Appearance settings have been reset to default.",
    });
  };

  const togglePreview = () => {
    setPreviewMode(!previewMode);
    if (!previewMode) {
      applySettings(settings);
      toast({
        title: "Preview Mode Enabled",
        description: "Changes will be applied in real-time.",
      });
    } else {
      toast({
        title: "Preview Mode Disabled",
        description: "Click Save to apply changes permanently.",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-heading font-semibold text-neutral-900">Appearance Settings</h2>
          <p className="text-neutral-600 mt-1">Customize the look and feel of your Skrobaki CRM</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Label htmlFor="preview-mode" className="text-sm">Live Preview</Label>
            <Switch
              id="preview-mode"
              checked={previewMode}
              onCheckedChange={togglePreview}
            />
          </div>
          <Button variant="outline" onClick={handleReset} className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Reset</span>
          </Button>
        </div>
      </div>

      {/* Color Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="w-5 h-5" />
            <span>Colors & Theme</span>
          </CardTitle>
          <CardDescription>
            Customize the color palette for your CRM interface
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary-color">Primary Color</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="primary-color"
                  type="color"
                  value={settings.colors.primary}
                  onChange={(e) => updateSettings({
                    colors: { ...settings.colors, primary: e.target.value }
                  })}
                  className="w-16 h-10 p-1 border-2"
                />
                <Input
                  value={settings.colors.primary}
                  onChange={(e) => updateSettings({
                    colors: { ...settings.colors, primary: e.target.value }
                  })}
                  placeholder="#265DFF"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondary-color">Secondary Color</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="secondary-color"
                  type="color"
                  value={settings.colors.secondary}
                  onChange={(e) => updateSettings({
                    colors: { ...settings.colors, secondary: e.target.value }
                  })}
                  className="w-16 h-10 p-1 border-2"
                />
                <Input
                  value={settings.colors.secondary}
                  onChange={(e) => updateSettings({
                    colors: { ...settings.colors, secondary: e.target.value }
                  })}
                  placeholder="#FF9D00"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accent-color">Accent Color</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="accent-color"
                  type="color"
                  value={settings.colors.accent}
                  onChange={(e) => updateSettings({
                    colors: { ...settings.colors, accent: e.target.value }
                  })}
                  className="w-16 h-10 p-1 border-2"
                />
                <Input
                  value={settings.colors.accent}
                  onChange={(e) => updateSettings({
                    colors: { ...settings.colors, accent: e.target.value }
                  })}
                  placeholder="#FFE399"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="background">Background</Label>
              <Select
                value={settings.colors.background}
                onValueChange={(value) => updateSettings({
                  colors: { ...settings.colors, background: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select background" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linear-gradient(180deg, #EAF2FF 0%, #D6E5FF 100%)">Blue Gradient (Default)</SelectItem>
                  <SelectItem value="linear-gradient(180deg, #F0F9FF 0%, #E0F2FE 100%)">Light Blue</SelectItem>
                  <SelectItem value="linear-gradient(180deg, #FEFCE8 0%, #FEF3C7 100%)">Warm Yellow</SelectItem>
                  <SelectItem value="#FFFFFF">Pure White</SelectItem>
                  <SelectItem value="linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)">Cool Gray</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typography Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Type className="w-5 h-5" />
            <span>Typography</span>
          </CardTitle>
          <CardDescription>
            Configure fonts and text sizes across the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Font Family</Label>
              <Select
                value={settings.typography.fontFamily}
                onValueChange={(value) => updateSettings({
                  typography: { ...settings.typography, fontFamily: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="playfair">Playfair Display (Default)</SelectItem>
                  <SelectItem value="inter">Inter</SelectItem>
                  <SelectItem value="poppins">Poppins</SelectItem>
                  <SelectItem value="roboto">Roboto</SelectItem>
                  <SelectItem value="open-sans">Open Sans</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Heading Size</Label>
              <Select
                value={settings.typography.fontSize.heading}
                onValueChange={(value) => updateSettings({
                  typography: { 
                    ...settings.typography, 
                    fontSize: { ...settings.typography.fontSize, heading: value }
                  }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1.5rem">24px (Small)</SelectItem>
                  <SelectItem value="1.75rem">28px (Default)</SelectItem>
                  <SelectItem value="2rem">32px (Large)</SelectItem>
                  <SelectItem value="2.25rem">36px (Extra Large)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Body Text Size</Label>
              <Select
                value={settings.typography.fontSize.body}
                onValueChange={(value) => updateSettings({
                  typography: { 
                    ...settings.typography, 
                    fontSize: { ...settings.typography.fontSize, body: value }
                  }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.875rem">14px (Small)</SelectItem>
                  <SelectItem value="1rem">16px (Default)</SelectItem>
                  <SelectItem value="1.125rem">18px (Large)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Caption Size</Label>
              <Select
                value={settings.typography.fontSize.caption}
                onValueChange={(value) => updateSettings({
                  typography: { 
                    ...settings.typography, 
                    fontSize: { ...settings.typography.fontSize, caption: value }
                  }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.625rem">10px (Tiny)</SelectItem>
                  <SelectItem value="0.75rem">12px (Default)</SelectItem>
                  <SelectItem value="0.875rem">14px (Large)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Component Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Square className="w-5 h-5" />
            <span>Components</span>
          </CardTitle>
          <CardDescription>
            Customize the appearance of UI components
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Button Border Radius</Label>
              <Select
                value={settings.components.buttonRadius}
                onValueChange={(value) => updateSettings({
                  components: { ...settings.components, buttonRadius: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0px">Square (0px)</SelectItem>
                  <SelectItem value="6px">Slight (6px)</SelectItem>
                  <SelectItem value="12px">Rounded (12px) - Default</SelectItem>
                  <SelectItem value="24px">Very Rounded (24px)</SelectItem>
                  <SelectItem value="9999px">Pill Shape</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Card Border Radius</Label>
              <Select
                value={settings.components.cardRadius}
                onValueChange={(value) => updateSettings({
                  components: { ...settings.components, cardRadius: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0px">Square (0px)</SelectItem>
                  <SelectItem value="8px">Slight (8px)</SelectItem>
                  <SelectItem value="12px">Rounded (12px) - Default</SelectItem>
                  <SelectItem value="16px">More Rounded (16px)</SelectItem>
                  <SelectItem value="24px">Very Rounded (24px)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Drop Shadows</Label>
                <p className="text-sm text-neutral-600">Enable subtle shadows on cards and buttons</p>
              </div>
              <Switch
                checked={settings.components.shadows}
                onCheckedChange={(checked) => updateSettings({
                  components: { ...settings.components, shadows: checked }
                })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Hover Effects</Label>
                <p className="text-sm text-neutral-600">Enable smooth hover animations</p>
              </div>
              <Switch
                checked={settings.components.hoverEffects}
                onCheckedChange={(checked) => updateSettings({
                  components: { ...settings.components, hoverEffects: checked }
                })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Actions */}
      <div className="flex items-center justify-end space-x-3">
        <Button variant="outline" onClick={() => onNavigate?.('settings')}>
          Cancel
        </Button>
        <Button onClick={handleSave} className="bg-primary-500 hover:bg-primary-600">
          Save Changes
        </Button>
      </div>
    </div>
  );
};