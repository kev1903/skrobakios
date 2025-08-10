import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell';
import { StepTimeline } from '@/components/ui/step-timeline';

export const OutputIntegrationPage = () => {
  const steps = [
    { id: 1, title: 'Step 1: Input Data' },
    { id: 2, title: 'Step 2: Take-Off' },
    { id: 3, title: 'Step 3: Cost Database' },
    { id: 4, title: 'Step 4: Estimation Process' },
    { id: 5, title: 'Step 5: Output & Integration' },
  ];
  const navigate = useNavigate();
  const { estimateId } = useParams<{ estimateId: string }>();
  const handleStepChange = (s: number) => {
    const id = estimateId;
    if (!id) return;
    switch (s) {
      case 1: navigate(`/estimates/edit/${id}`); break;
      case 2: navigate(`/estimates/edit/${id}/take-off`); break;
      case 3: navigate(`/estimates/edit/${id}/cost-db`); break;
      case 4: navigate(`/estimates/edit/${id}/estimation`); break;
      case 5: navigate(`/estimates/edit/${id}/output`); break;
    }
  };
  return (
    <PageShell withPattern>
      <StepTimeline steps={steps} current={5} onChange={handleStepChange} />
      <div className="p-6 text-sm text-muted-foreground">Output & Integration page</div>
    </PageShell>
  );
};
