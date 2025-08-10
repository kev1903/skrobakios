import React from 'react';
import { PageShell } from '@/components/layout/PageShell';
import { StepTimeline } from '@/components/ui/step-timeline';

export const CostDatabasePage = () => {
  const steps = [
    { id: 1, title: 'Step 1: Input Data' },
    { id: 2, title: 'Step 2: Take-Off' },
    { id: 3, title: 'Step 3: Cost Database' },
    { id: 4, title: 'Step 4: Estimation Process' },
    { id: 5, title: 'Step 5: Output & Integration' },
  ];
  return (
    <PageShell withPattern>
      <StepTimeline steps={steps} current={3} onChange={() => {}} />
      <div className="p-6 text-sm text-muted-foreground">Cost Database page</div>
    </PageShell>
  );
};
