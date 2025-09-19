import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Settings, Save, RotateCcw, Server, Shield, File, Zap, Users, Lock } from "lucide-react";
import { usePlatformSettings } from '@/hooks/usePlatformSettings';

export const PlatformSettingsPanel: React.FC = () => {
  const { settings, loading, updatePlatformSetting } = usePlatformSettings();
  const [editingSettings, setEditingSettings] = useState<{ [key: string]: any }>({});

  const settingsByType = settings.reduce((acc, setting) => {
    if (!acc[setting.setting_type]) {
      acc[setting.setting_type] = [];
    }
    acc[setting.setting_type].push(setting);
    return acc;
  }, {} as { [key: string]: typeof settings });

  const handleSettingChange = (settingKey: string, value: any) => {
    setEditingSettings(prev => ({
      ...prev,
      [settingKey]: value
    }));
  };

  const handleSaveSetting = async (settingKey: string) => {
    if (editingSettings[settingKey] !== undefined) {
      await updatePlatformSetting(settingKey, editingSettings[settingKey]);
      setEditingSettings(prev => {
        const newState = { ...prev };
        delete newState[settingKey];
        return newState;
      });
    }
  };

  const handleResetSetting = (settingKey: string) => {
    setEditingSettings(prev => {
      const newState = { ...prev };
      delete newState[settingKey];
      return newState;
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'api': return Server;
      case 'auth': return Shield;
      case 'files': return File;
      case 'limits': return Zap;
      case 'security': return Lock;
      case 'users': return Users;
      default: return Settings;
    }
  };

  const renderCompactInput = (setting: any, isEditing: boolean) => {
    const currentValue = editingSettings[setting.setting_key] !== undefined 
      ? editingSettings[setting.setting_key] 
      : setting.setting_value;

    if (typeof currentValue === 'boolean') {
      return (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{currentValue ? 'Enabled' : 'Disabled'}</span>
          <Switch
            checked={currentValue}
            onCheckedChange={(checked) => handleSettingChange(setting.setting_key, checked)}
          />
        </div>
      );
    }

    if (typeof currentValue === 'object') {
      return (
        <div className="space-y-2">
          <div className="p-2 bg-muted rounded border text-xs font-mono max-h-20 overflow-y-auto">
            {JSON.stringify(currentValue, null, 1)}
          </div>
          {isEditing && (
            <Textarea
              value={JSON.stringify(currentValue, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  handleSettingChange(setting.setting_key, parsed);
                } catch {
                  // Invalid JSON, keep as string for now
                }
              }}
              className="font-mono text-xs"
              rows={4}
            />
          )}
        </div>
      );
    }

    return (
      <Input
        value={String(currentValue)}
        onChange={(e) => {
          const value = setting.setting_type === 'limits' ? parseInt(e.target.value) || 0 : e.target.value;
          handleSettingChange(setting.setting_key, value);
        }}
        type={setting.setting_type === 'limits' ? 'number' : 'text'}
        className="h-8 text-sm"
      />
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5" />
            Platform Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-sm text-muted-foreground">Loading platform settings...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(settingsByType).map(([type, typeSettings]) => {
        const IconComponent = getTypeIcon(type);
        return (
          <Card key={type} className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg capitalize">
                <IconComponent className="h-5 w-5" />
                {type.replace('_', ' ')} Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                {typeSettings.map((setting, index) => {
                  const isEditing = editingSettings[setting.setting_key] !== undefined;
                  return (
                    <div key={setting.setting_key} className="grid grid-cols-1 lg:grid-cols-3 gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                      {/* Setting Info */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Label className="font-medium text-sm">{setting.setting_key.replace(/_/g, ' ')}</Label>
                          {setting.is_sensitive && (
                            <Badge variant="destructive" className="text-xs px-1 py-0">Sensitive</Badge>
                          )}
                          {setting.requires_restart && (
                            <Badge variant="outline" className="text-xs px-1 py-0">Restart Required</Badge>
                          )}
                        </div>
                        {setting.description && (
                          <p className="text-xs text-muted-foreground leading-tight">{setting.description}</p>
                        )}
                      </div>
                      
                      {/* Setting Input */}
                      <div className="flex items-center">
                        {renderCompactInput(setting, isEditing)}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center justify-end gap-1">
                        {isEditing ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResetSetting(setting.setting_key)}
                              className="h-7 px-2"
                            >
                              <RotateCcw className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleSaveSetting(setting.setting_key)}
                              className="h-7 px-2 bg-primary hover:bg-primary/90"
                            >
                              <Save className="h-3 w-3" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSettingChange(setting.setting_key, setting.setting_value)}
                            className="h-7 px-2 text-xs"
                          >
                            Edit
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
