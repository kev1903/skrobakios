import React, { useState } from 'react';
import { AiChatSidebar } from '@/components/AiChatSidebar';
import { useNavigate, useParams } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell';
import { StepTimeline } from '@/components/ui/step-timeline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { useEstimateContext } from '../context/EstimateContext';

export const OutputIntegrationPage = () => {
  const steps = [
    { id: 1, title: 'Step 1: Input Data' },
    { id: 2, title: 'Step 2: Structuring' },
    { id: 3, title: 'Step 3: Cost Database' },
    { id: 4, title: 'Step 4: Estimation Process' },
    { id: 5, title: 'Step 5: Output & Integration' },
  ];
  const navigate = useNavigate();
  const { estimateId } = useParams<{ estimateId: string }>();
  const [isChatCollapsed, setIsChatCollapsed] = useState(true);
  const { estimateTitle, projectType } = useEstimateContext();
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
      {/* Header */}
      <div className={`px-4 py-2 border-b border-border bg-background transition-[padding] ${isChatCollapsed ? 'pr-0' : 'pr-[26rem]'}`}>
        <div className="flex items-center gap-3">
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

      {/* Steps */}
      <div className={`transition-[padding] ${isChatCollapsed ? 'pr-0' : 'pr-[26rem]'}`}>
        <StepTimeline steps={steps} current={5} onChange={handleStepChange} />
      </div>

      {/* Body */}
      <div className={`p-6 text-sm text-muted-foreground transition-[padding] ${isChatCollapsed ? 'pr-0' : 'pr-[26rem]'}`}>Output & Integration page</div>

      <AiChatSidebar isCollapsed={isChatCollapsed} onToggleCollapse={() => setIsChatCollapsed(!isChatCollapsed)} />
    </PageShell>
  );
};
