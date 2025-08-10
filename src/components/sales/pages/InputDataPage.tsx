import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell';
import { StepTimeline } from '@/components/ui/step-timeline';
import { toast } from 'sonner';
import { useEstimate } from '../hooks/useEstimate';

interface InputDataPageProps {
  onBack?: () => void;
  estimateId?: string;
}

export const InputDataPage: React.FC<InputDataPageProps> = ({ onBack, estimateId }) => {
  const navigate = useNavigate();

  // Header state
  const [estimateTitle, setEstimateTitle] = useState('');
  const [projectType, setProjectType] = useState('');
  const [estimateNumber, setEstimateNumber] = useState('');

  const { loadEstimate, updateEstimate, saveEstimate, isSaving, generateEstimateNumber } = useEstimate();

  // Load existing estimate
  useEffect(() => {
    if (!estimateId) return;
    (async () => {
      try {
        const { estimate } = await loadEstimate(estimateId);
        setEstimateTitle(estimate.estimate_name);
        setEstimateNumber(estimate.estimate_number);
        setProjectType(estimate.notes || '');
      } catch (e) {
        console.error('Failed to load estimate for Input Data:', e);
        toast.error('Failed to load estimate');
      }
    })();
  }, [estimateId, loadEstimate]);

  const handleSave = async () => {
    if (!estimateTitle) {
      toast.error('Please enter an estimate title');
      return;
    }
    try {
      const payload = {
        estimate_name: estimateTitle,
        estimate_number: estimateNumber || generateEstimateNumber(),
        project_type: projectType,
        notes: projectType,
        status: 'draft' as const,
        estimate_date: new Date().toISOString().split('T')[0]
      };
      if (estimateId) {
        await updateEstimate(estimateId, payload, [], []);
        toast.success('Estimate updated');
      } else {
        const created = await saveEstimate(payload, [], []);
        setEstimateNumber(created.estimate_number);
        toast.success('Estimate created');
      }
    } catch (e) {
      console.error('Save error:', e);
      toast.error('Failed to save estimate');
    }
  };

  const steps = [
    { id: 1, title: 'Step 1: Input Data' },
    { id: 2, title: 'Step 2: Take-Off' },
    { id: 3, title: 'Step 3: Cost Database' },
    { id: 4, title: 'Step 4: Estimation Process' },
    { id: 5, title: 'Step 5: Output & Integration' },
  ];
  const handleStepChange = (s: number) => {
    if (!estimateId) return;
    if (s === 1) navigate(`/estimates/edit/${estimateId}/input-data`);
    if (s === 2) navigate(`/estimates/edit/${estimateId}/take-off`);
  };

  return (
    <PageShell withPattern>
      {/* Header */}
      <div className="p-4 border-b border-border bg-background">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack} className="shrink-0">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          )}
          <div className="flex-1">
            <Input id="estimateTitle" value={estimateTitle} onChange={(e) => setEstimateTitle(e.target.value)} placeholder="Enter estimate title..." className="text-lg font-semibold" />
          </div>
          <div className="w-64">
            <Select value={projectType} onValueChange={setProjectType}>
              <SelectTrigger id="projectType">
                <SelectValue placeholder="Select project type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="industrial">Industrial</SelectItem>
                <SelectItem value="renovation">Renovation</SelectItem>
                <SelectItem value="new-construction">New Construction</SelectItem>
                <SelectItem value="extension">Extension</SelectItem>
                <SelectItem value="fitout">Fitout</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isSaving} variant="default" size="sm">
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
            {estimateNumber && (
              <span className="text-sm text-muted-foreground self-center">#{estimateNumber}</span>
            )}
          </div>
        </div>
      </div>

      {/* Stepper */}
      <StepTimeline steps={steps} current={1} onChange={handleStepChange} />

      {/* Content */}
      <main className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="rounded-lg border bg-card p-4">
          <h3 className="text-sm font-medium mb-4">Project Information</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="estimateTitle" className="text-xs text-muted-foreground">Estimate Title</label>
              <Input id="estimateTitle-form" value={estimateTitle} onChange={(e) => setEstimateTitle(e.target.value)} placeholder="e.g., SK_QU25021 - 64 Armadale St..." />
            </div>
            <div>
              <label htmlFor="projectType-form" className="text-xs text-muted-foreground">Project Type</label>
              <Select value={projectType} onValueChange={setProjectType}>
                <SelectTrigger id="projectType-form">
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                  <SelectItem value="renovation">Renovation</SelectItem>
                  <SelectItem value="new-construction">New Construction</SelectItem>
                  <SelectItem value="extension">Extension</SelectItem>
                  <SelectItem value="fitout">Fitout</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>
        <section className="rounded-lg border bg-card p-4">
          <h3 className="text-sm font-medium mb-4">Next Steps</h3>
          <p className="text-sm text-muted-foreground mb-4">Proceed to Take-Off to manage drawings and quantities.</p>
          <Button onClick={() => estimateId && navigate(`/estimates/edit/${estimateId}/take-off`)} size="sm" variant="outline">Go to Take-Off</Button>
        </section>
      </main>
    </PageShell>
  );
};
