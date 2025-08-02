import React, { useState } from 'react';
import { Settings, Palette, Clock, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { TimeTrackingSettings as SettingsType, DEFAULT_CATEGORIES, DEFAULT_CATEGORY_COLORS } from '@/hooks/useTimeTracking';

interface TimeTrackingSettingsProps {
  settings: SettingsType | null;
  onUpdateSettings: (updates: Partial<SettingsType>) => void;
  onExportData: (format: 'csv' | 'pdf') => void;
}

export const TimeTrackingSettings = ({ 
  settings, 
  onUpdateSettings,
  onExportData 
}: TimeTrackingSettingsProps) => {
  const [localSettings, setLocalSettings] = useState<Partial<SettingsType>>({});
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && settings) {
      // Initialize local settings when opening
      setLocalSettings({
        productive_categories: [...settings.productive_categories],
        default_work_start: settings.default_work_start,
        default_work_end: settings.default_work_end,
        category_colors: { ...settings.category_colors }
      });
    }
  };

  const handleSave = () => {
    onUpdateSettings(localSettings);
    setIsOpen(false);
  };

  const handleProductiveCategoryChange = (category: string, checked: boolean) => {
    const currentCategories = localSettings.productive_categories || [];
    if (checked) {
      setLocalSettings({
        ...localSettings,
        productive_categories: [...currentCategories, category]
      });
    } else {
      setLocalSettings({
        ...localSettings,
        productive_categories: currentCategories.filter(c => c !== category)
      });
    }
  };

  const handleColorChange = (category: string, color: string) => {
    setLocalSettings({
      ...localSettings,
      category_colors: {
        ...localSettings.category_colors,
        [category]: color
      }
    });
  };

  const resetColors = () => {
    setLocalSettings({
      ...localSettings,
      category_colors: DEFAULT_CATEGORY_COLORS
    });
  };

  if (!settings) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </DialogTrigger>
      
      <DialogContent className="bg-black/90 border-white/20 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-playfair text-xl">Time Tracking Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Work Hours */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white font-helvetica flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5" />
                Default Work Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/90">Start Time</Label>
                  <Input
                    type="time"
                    value={localSettings.default_work_start || settings.default_work_start}
                    onChange={(e) => setLocalSettings({
                      ...localSettings,
                      default_work_start: e.target.value
                    })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white/90">End Time</Label>
                  <Input
                    type="time"
                    value={localSettings.default_work_end || settings.default_work_end}
                    onChange={(e) => setLocalSettings({
                      ...localSettings,
                      default_work_end: e.target.value
                    })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Productive Categories */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white font-helvetica text-lg">
                Productive Categories
              </CardTitle>
              <p className="text-white/70 text-sm">
                Select which categories count as "productive" time for your statistics.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {DEFAULT_CATEGORIES.map((category) => {
                  const isChecked = (localSettings.productive_categories || settings.productive_categories)
                    .includes(category);
                  
                  return (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={category}
                        checked={isChecked}
                        onCheckedChange={(checked) => 
                          handleProductiveCategoryChange(category, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={category}
                        className="text-white/90 cursor-pointer flex items-center gap-2"
                      >
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ 
                            backgroundColor: (localSettings.category_colors || settings.category_colors)[category] 
                          }}
                        />
                        {category}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Category Colors */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white font-helvetica flex items-center gap-2 text-lg">
                <Palette className="w-5 h-5" />
                Category Colors
              </CardTitle>
              <div className="flex justify-between items-center">
                <p className="text-white/70 text-sm">
                  Customize the colors for each category in your timeline.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetColors}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  Reset to Default
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DEFAULT_CATEGORIES.map((category) => (
                  <div key={category} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full border border-white/20" 
                        style={{ 
                          backgroundColor: (localSettings.category_colors || settings.category_colors)[category] 
                        }}
                      />
                      <span className="text-white/90 font-helvetica">{category}</span>
                    </div>
                    <Input
                      type="color"
                      value={(localSettings.category_colors || settings.category_colors)[category]}
                      onChange={(e) => handleColorChange(category, e.target.value)}
                      className="w-12 h-8 p-1 border-white/20 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Export Options */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white font-helvetica flex items-center gap-2 text-lg">
                <Download className="w-5 h-5" />
                Export Data
              </CardTitle>
              <p className="text-white/70 text-sm">
                Export your time tracking data for external analysis.
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={() => onExportData('csv')}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 flex-1"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Export as CSV
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onExportData('pdf')}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 flex-1"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Export as PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          <Separator className="bg-white/20" />

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};