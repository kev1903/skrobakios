import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell';
import { StepTimeline } from '@/components/ui/step-timeline';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { useEstimateContext } from '../context/EstimateContext';

export const TakeOffPage = () => {
  const steps = [
    { id: 1, title: 'Step 1: Upload & AI Analysis' },
    { id: 2, title: 'Step 2: Take-Off' },
    { id: 3, title: 'Step 3: Estimation Process' },
    { id: 4, title: 'Step 4: Output & Integration' },
  ];
  const navigate = useNavigate();
  const { estimateId } = useParams<{ estimateId: string }>();
  const { estimateTitle } = useEstimateContext();
  
  const handleStepChange = (s: number) => {
    const id = estimateId;
    if (!id) return;
    switch (s) {
      case 1: navigate(`/estimates/edit/${id}`); break;
      case 2: navigate(`/estimates/edit/${id}/take-off`); break;
      case 3: navigate(`/estimates/edit/${id}/estimation`); break;
      case 4: navigate(`/estimates/edit/${id}/output`); break;
    }
  };
  
  return (
    <PageShell withPattern>
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border bg-background">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="shrink-0">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="flex-1">
              <div className="text-lg font-semibold text-foreground">{estimateTitle || 'Estimate title'}</div>
            </div>
            <Button variant="default" size="sm">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        {/* Progressive Step Timeline */}
        <StepTimeline steps={steps} current={2} onChange={handleStepChange} />

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6 p-6">
            {/* Content area */}
            <div className="overflow-auto">
              <div className="rounded-lg border">
                <div className="p-6 text-sm text-muted-foreground">Take-Off content coming soon...</div>
              </div>
            </div>

            {/* Side panel */}
            <div>
              <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center">
                <p className="font-medium mb-2">Take-Off Tools</p>
                <p className="text-sm text-muted-foreground">Measurement and quantity tools will appear here</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
};
