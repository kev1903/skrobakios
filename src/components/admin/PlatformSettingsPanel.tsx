import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Settings, Save, RotateCcw } from "lucide-react";
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

  const renderSettingInput = (setting: any) => {
    const currentValue = editingSettings[setting.setting_key] !== undefined 
      ? editingSettings[setting.setting_key] 
      : setting.setting_value;

    const isEditing = editingSettings[setting.setting_key] !== undefined;

    if (typeof currentValue === 'boolean') {
      return (
        <div className="flex items-center space-x-2">
          <Switch
            checked={currentValue}
            onCheckedChange={(checked) => handleSettingChange(setting.setting_key, checked)}
          />
          <Label>{currentValue ? 'Enabled' : 'Disabled'}</Label>
        </div>
      );
    }

    if (typeof currentValue === 'object') {
      return (
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
          placeholder="JSON configuration"
          className="font-mono text-sm"
          rows={4}
        />
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
        placeholder={`Enter ${setting.setting_key}`}
      />
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Platform Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading platform settings...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(settingsByType).map(([type, typeSettings]) => (
        <Card key={type}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 capitalize">
              <Settings className="h-5 w-5" />
              {type.replace('_', ' ')} Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {typeSettings.map((setting) => {
              const isEditing = editingSettings[setting.setting_key] !== undefined;
              return (
                <div key={setting.setting_key} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Label className="font-medium">{setting.setting_key}</Label>
                        {setting.is_sensitive && (
                          <Badge variant="destructive" className="text-xs">Sensitive</Badge>
                        )}
                        {setting.requires_restart && (
                          <Badge variant="outline" className="text-xs">Requires Restart</Badge>
                        )}
                      </div>
                      {setting.description && (
                        <p className="text-sm text-muted-foreground">{setting.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {isEditing && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResetSetting(setting.setting_key)}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSaveSetting(setting.setting_key)}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="max-w-md">
                    {renderSettingInput(setting)}
                  </div>
                  {typeSettings.indexOf(setting) < typeSettings.length - 1 && <Separator />}
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
