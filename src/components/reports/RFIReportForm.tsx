import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useRFIReports } from '@/hooks/useRFIReports';

interface RFIReportFormProps {
  projectId: string;
  projectName?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const RFIReportForm = ({ projectId, projectName, onSuccess, onCancel }: RFIReportFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const { createReport } = useRFIReports(projectId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createReport({ title: formData.title, description: formData.description });
      onSuccess();
    } catch (e) {
      // Toast already handled in hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle>Create New RFI Report</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {projectName && (
          <div className="space-y-2">
            <Label htmlFor="project">Project</Label>
            <Input id="project" value={projectName} disabled className="bg-muted" />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="title">Report Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter report title"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the scope of this report (optional)"
            rows={4}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !formData.title}>
            {loading ? 'Creating...' : 'Create Report'}
          </Button>
        </div>
      </form>
    </div>
  );
};
