import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell';
import { StepTimeline } from '@/components/ui/step-timeline';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { useEstimateContext } from '../context/EstimateContext';
import { EstimationWBSTable } from '../components/estimation/EstimationWBSTable';

export const EstimationProcessPage = () => {
  const steps = [
    { id: 1, title: 'Step 1: Upload & AI Analysis' },
    { id: 2, title: 'Step 2: Take-Off' },
    { id: 3, title: 'Step 3: Estimation Process' },
    { id: 4, title: 'Step 4: Output & Integration' },
  ];
  const navigate = useNavigate();
  const { estimateId } = useParams<{ estimateId: string }>();
  const { estimateTitle, projectType } = useEstimateContext();
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
        {/* Header */}
        <div className="shrink-0 h-[73px] px-6 border-b border-border/30 bg-white/80 backdrop-blur-xl flex items-center">
          <div className="flex items-center gap-4 w-full">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="shrink-0">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold text-foreground truncate">{estimateTitle || 'Estimate title'}</h1>
            </div>
            <Button variant="default" size="sm" className="shrink-0">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        {/* Progressive Step Timeline */}
        <div className="shrink-0">
          <StepTimeline steps={steps} current={3} onChange={handleStepChange} />
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <EstimationWBSTable 
            onDataChange={(data) => console.log('Estimation data:', data)}
          />
        </div>
      </div>
    </PageShell>
  );
};
