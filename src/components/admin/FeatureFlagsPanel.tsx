import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Flag, Plus, Settings } from "lucide-react";
import { usePlatformSettings } from '@/hooks/usePlatformSettings';

export const FeatureFlagsPanel: React.FC = () => {
  const { featureFlags, loading, updateFeatureFlag } = usePlatformSettings();

  const handleToggleFlag = async (flagId: string, isEnabled: boolean) => {
    await updateFeatureFlag(flagId, { is_enabled: isEnabled });
  };

  const handleRolloutChange = async (flagId: string, percentage: number) => {
    await updateFeatureFlag(flagId, { rollout_percentage: percentage });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5" />
            Feature Flags
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading feature flags...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-panel">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-primary" />
            Feature Flags Management
          </CardTitle>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Flag
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {featureFlags.map((flag) => (
            <div key={flag.id} className="border border-border/40 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{flag.flag_name}</h3>
                    <Badge variant={flag.is_enabled ? "default" : "secondary"}>
                      {flag.is_enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{flag.description}</p>
                  <p className="text-xs text-muted-foreground">Key: {flag.flag_key}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">Status</p>
                    <Switch
                      checked={flag.is_enabled}
                      onCheckedChange={(checked) => handleToggleFlag(flag.id, checked)}
                    />
                  </div>
                </div>
              </div>

              {flag.is_enabled && (
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label className="text-sm font-medium">Rollout Percentage</Label>
                      <span className="text-sm text-muted-foreground">{flag.rollout_percentage}%</span>
                    </div>
                    <Progress value={flag.rollout_percentage} className="h-2" />
                  </div>

                  {(flag.target_users?.length > 0 || flag.target_companies?.length > 0) && (
                    <div className="grid grid-cols-2 gap-4">
                      {flag.target_users?.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium">Target Users</Label>
                          <p className="text-xs text-muted-foreground">{flag.target_users.length} users targeted</p>
                        </div>
                      )}
                      {flag.target_companies?.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium">Target Companies</Label>
                          <p className="text-xs text-muted-foreground">{flag.target_companies.length} companies targeted</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {featureFlags.length === 0 && (
            <div className="text-center py-8">
              <Flag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Feature Flags</h3>
              <p className="text-muted-foreground">Create your first feature flag to control platform features.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};