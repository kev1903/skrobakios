import React, { useState, useRef, useEffect } from 'react';
import { AiChatSidebar } from '@/components/AiChatSidebar';
import { useNavigate, useParams } from 'react-router-dom';
import { PageShell } from '@/components/layout/PageShell';
import { StepTimeline } from '@/components/ui/step-timeline';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save } from 'lucide-react';
import { useEstimateContext } from '../context/EstimateContext';
import { ProjectAttributesTab } from '../components/structuring/ProjectAttributesTab';
import { WBSElementMappingTab } from '../components/structuring/WBSElementMappingTab';
import { AutoTakeOffTab } from '../components/structuring/AutoTakeOffTab';
import { toast } from 'sonner';

interface TakeOffPageProps {
  onBack?: () => void;
  estimateId?: string;
}

export const TakeOffPage = ({ onBack }: TakeOffPageProps) => {
  const navigate = useNavigate();
  const { estimateId: paramEstimateId } = useParams<{ estimateId: string }>();
  const currentId = paramEstimateId;
  const { estimateTitle, projectType, drawings } = useEstimateContext();
  const [isChatCollapsed, setIsChatCollapsed] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('attributes');
  const [structuringData, setStructuringData] = useState({
    projectAttributes: {},
    wbsMapping: {},
    takeOffQuantities: {}
  });

  const steps = [
    { id: 1, title: 'Step 1: Input Data' },
    { id: 2, title: 'Step 2: Structuring' },
    { id: 3, title: 'Step 3: Cost Database' },
    { id: 4, title: 'Step 4: Estimation Process' },
    { id: 5, title: 'Step 5: Output & Integration' },
  ];

  const handleStepChange = (s: number) => {
    const id = currentId;
    if (!id) return;
    switch (s) {
      case 1: navigate(`/estimates/edit/${id}`); break;
      case 2: navigate(`/estimates/edit/${id}/take-off`); break;
      case 3: navigate(`/estimates/edit/${id}/cost-db`); break;
      case 4: navigate(`/estimates/edit/${id}/estimation`); break;
      case 5: navigate(`/estimates/edit/${id}/output`); break;
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save structuring data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate save
      toast.success('Structuring data saved successfully');
    } catch (error) {
      toast.error('Failed to save structuring data');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTabDataChange = (tabName: string, data: any) => {
    setStructuringData(prev => ({
      ...prev,
      [tabName]: data
    }));
  };

  return (
    <PageShell withPattern>
      {/* Header */}
      <div className={`px-3 py-1.5 border-b border-border bg-background transition-[padding] ${isChatCollapsed ? 'pr-20' : 'pr-[25rem]'}`}>
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => (onBack ? onBack() : navigate(-1))} className="shrink-0 h-7 px-2">
              <ArrowLeft className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline text-xs">Back</span>
            </Button>
          <div className="flex-1">
            <div className="text-sm font-medium text-foreground">{estimateTitle || 'Estimate title'}</div>
          </div>
          <Button variant="default" size="sm" disabled={isSaving} onClick={handleSave} className="h-7 px-3 text-xs">
            <Save className="w-3 h-3 mr-1" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className={`py-2 transition-[padding] ${isChatCollapsed ? 'pr-20' : 'pr-[25rem]'}`}>
        <StepTimeline steps={steps} current={2} onChange={handleStepChange} />
      </div>

      {/* Tabbed Content */}
      <div className={`transition-[padding] ${isChatCollapsed ? 'pr-20' : 'pr-[25rem]'}`}>
        <div className="px-4 py-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4 h-8">
              <TabsTrigger value="attributes" className="text-xs px-2 py-1">
                Project Attributes
              </TabsTrigger>
              <TabsTrigger value="wbs" className="text-xs px-2 py-1">
                WBS & Element Mapping
              </TabsTrigger>
              <TabsTrigger value="takeoff" className="text-xs px-2 py-1">
                Auto-Take-Off + Manual
              </TabsTrigger>
            </TabsList>

            <TabsContent value="attributes" className="mt-0">
              <ProjectAttributesTab 
                onDataChange={(data) => handleTabDataChange('projectAttributes', data)}
                uploadedPDFs={drawings}
                estimateId={currentId}
              />
            </TabsContent>

            <TabsContent value="wbs" className="mt-0">
              <WBSElementMappingTab 
                onDataChange={(data) => handleTabDataChange('wbsMapping', data)}
              />
            </TabsContent>

            <TabsContent value="takeoff" className="mt-0">
              <AutoTakeOffTab 
                onDataChange={(data) => handleTabDataChange('takeOffQuantities', data)}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <AiChatSidebar isCollapsed={isChatCollapsed} onToggleCollapse={() => setIsChatCollapsed(!isChatCollapsed)} />
    </PageShell>
  );
};