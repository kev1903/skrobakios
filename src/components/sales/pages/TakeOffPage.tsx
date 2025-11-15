import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell';
import { StepTimeline } from '@/components/ui/step-timeline';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { useEstimateContext } from '../context/EstimateContext';
import { AutoTakeOffTab } from '../components/structuring/AutoTakeOffTab';

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
      <div className="flex flex-col h-[calc(100vh-var(--header-height,64px))]">
        {/* Combined Toolbar: Back button + Steps + Action button */}
        <div className="shrink-0 px-6 py-3 border-b border-border/30 bg-white/80 backdrop-blur-xl">
          <div className="flex items-center gap-4 w-full">
            {/* Left: Back button */}
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="shrink-0">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {/* Center: Step Timeline */}
            <div className="flex-1 min-w-0">
              <StepTimeline steps={steps} current={2} onChange={handleStepChange} />
            </div>

            {/* Right: Action button */}
            <Button variant="default" size="sm" className="shrink-0">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 max-w-[1600px] mx-auto">
            <AutoTakeOffTab 
              onDataChange={(data) => console.log('Take-off data:', data)}
            />
          </div>
        </div>
      </div>
    </PageShell>
  );
};
