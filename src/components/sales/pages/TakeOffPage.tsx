import React, { useState, useRef, useEffect } from 'react';
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
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border bg-background">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => (onBack ? onBack() : navigate(-1))} className="shrink-0">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="flex-1">
              <div className="text-lg font-semibold text-foreground">{estimateTitle || 'Estimate title'}</div>
            </div>
            <Button variant="default" size="sm" disabled={isSaving} onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        {/* Progressive Step Timeline */}
        <StepTimeline steps={steps} current={2} onChange={handleStepChange} />

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full p-6 pt-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="attributes">
                  Project Attributes
                </TabsTrigger>
                <TabsTrigger value="wbs">
                  WBS & Element Mapping
                </TabsTrigger>
                <TabsTrigger value="takeoff">
                  Auto-Take-Off + Manual
                </TabsTrigger>
              </TabsList>

              <TabsContent value="attributes" className="flex-1 overflow-auto">
                <ProjectAttributesTab 
                  onDataChange={(data) => handleTabDataChange('projectAttributes', data)}
                  uploadedPDFs={drawings}
                  estimateId={currentId}
                />
              </TabsContent>

              <TabsContent value="wbs" className="flex-1 overflow-auto">
                <WBSElementMappingTab 
                  onDataChange={(data) => handleTabDataChange('wbsMapping', data)}
                />
              </TabsContent>

              <TabsContent value="takeoff" className="flex-1 overflow-auto">
                <AutoTakeOffTab 
                  onDataChange={(data) => handleTabDataChange('takeOffQuantities', data)}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </PageShell>
  );
};