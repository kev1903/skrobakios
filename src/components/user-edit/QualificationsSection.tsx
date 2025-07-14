import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';

interface QualificationsSectionProps {
  qualifications: string[];
  licenses: string[];
  awards: string[];
  onQualificationChange: (index: number, value: string) => void;
  onLicenseChange: (index: number, value: string) => void;
  onAwardChange: (index: number, value: string) => void;
  onAddQualification: () => void;
  onAddLicense: () => void;
  onAddAward: () => void;
  onRemoveQualification: (index: number) => void;
  onRemoveLicense: (index: number) => void;
  onRemoveAward: (index: number) => void;
}

export const QualificationsSection = ({
  qualifications,
  licenses,
  awards,
  onQualificationChange,
  onLicenseChange,
  onAwardChange,
  onAddQualification,
  onAddLicense,
  onAddAward,
  onRemoveQualification,
  onRemoveLicense,
  onRemoveAward,
}: QualificationsSectionProps) => {
  return (
    <div className="space-y-8">
      {/* Qualifications */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-medium text-foreground">Qualifications</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddQualification}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Qualification
          </Button>
        </div>
        
        {qualifications.length === 0 ? (
          <p className="text-sm text-muted-foreground">No qualifications added yet.</p>
        ) : (
          <div className="space-y-3">
            {qualifications.map((qualification, index) => (
              <div key={index} className="flex items-center gap-3">
                <Input
                  value={qualification}
                  onChange={(e) => onQualificationChange(index, e.target.value)}
                  placeholder="Enter qualification"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveQualification(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Licenses */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-medium text-foreground">Licenses & Certifications</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddLicense}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add License
          </Button>
        </div>
        
        {licenses.length === 0 ? (
          <p className="text-sm text-muted-foreground">No licenses added yet.</p>
        ) : (
          <div className="space-y-3">
            {licenses.map((license, index) => (
              <div key={index} className="flex items-center gap-3">
                <Input
                  value={license}
                  onChange={(e) => onLicenseChange(index, e.target.value)}
                  placeholder="Enter license or certification"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveLicense(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Awards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-lg font-medium text-foreground">Awards & Recognition</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddAward}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Award
          </Button>
        </div>
        
        {awards.length === 0 ? (
          <p className="text-sm text-muted-foreground">No awards added yet.</p>
        ) : (
          <div className="space-y-3">
            {awards.map((award, index) => (
              <div key={index} className="flex items-center gap-3">
                <Input
                  value={award}
                  onChange={(e) => onAwardChange(index, e.target.value)}
                  placeholder="Enter award or recognition"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveAward(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};