import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { PageShell } from '@/components/layout/PageShell';
import { StepTimeline } from '@/components/ui/step-timeline';
import { useMultiplePDFUpload } from '../hooks/useMultiplePDFUpload';
import { useEstimate } from '../hooks/useEstimate';
import { useTakeoffMeasurements } from '../hooks/useTakeoffMeasurements';
import { DrawingSidebar } from '../components/DrawingSidebar';
import { PDFRenderer } from '../components/PDFRenderer';
import { AiChatSidebar } from '@/components/AiChatSidebar';

interface TakeOffPageProps {
  onBack?: () => void;
  estimateId?: string;
}

export const TakeOffPage = ({ onBack, estimateId }: TakeOffPageProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [estimateTitle, setEstimateTitle] = useState('');
  const [projectType, setProjectType] = useState('');
  const [currentTool, setCurrentTool] = useState<'pointer' | 'area' | 'linear' | 'count'>('pointer');
  const [isChatCollapsed, setIsChatCollapsed] = useState(true);
  const navigate = useNavigate();
  const { estimateId: estimateIdParam } = useParams<{ estimateId: string }>();
  const currentId = (estimateId || estimateIdParam) ?? '';

  const { fileInputRef, drawings, activeDrawingId, activeDrawing, handleFileUpload, addFiles, removeDrawing, setActiveDrawing, setDrawingsData } = useMultiplePDFUpload();
  const { saveEstimate, updateEstimate, loadEstimate, isSaving } = useEstimate();
  const { takeoffs, createTakeoff, deleteTakeoff } = useTakeoffMeasurements();

  useEffect(() => {
    if (!estimateId) return;
    (async () => {
      try {
        const { estimate, drawings: loadedDrawings } = await loadEstimate(estimateId);
        setEstimateTitle(estimate.estimate_name);
        setProjectType(estimate.notes || '');
        if (typeof (setDrawingsData as any) === 'function') {
          // @ts-ignore
          setDrawingsData(loadedDrawings || []);
        }
      } catch (_) {}
    })();
  }, [estimateId]);

  const steps = [
    { id: 1, title: 'Step 1: Input Data' },
    { id: 2, title: 'Step 2: Take-Off' },
    { id: 3, title: 'Step 3: Cost Database' },
    { id: 4, title: 'Step 4: Estimation Process' },
    { id: 5, title: 'Step 5: Output & Integration' },
  ];
  const handleStepChange = (s: number) => {
    const id = currentId;
    if (!id) return;
    switch (s) {
      case 1:
        navigate(`/estimates/edit/${id}`);
        break;
      case 2:
        navigate(`/estimates/edit/${id}/take-off`);
        break;
      case 3:
        navigate(`/estimates/edit/${id}/cost-db`);
        break;
      case 4:
        navigate(`/estimates/edit/${id}/estimation`);
        break;
      case 5:
        navigate(`/estimates/edit/${id}/output`);
        break;
    }
  };

  return (
    <PageShell withPattern>
      {/* Hidden input for uploads */}
      <input ref={fileInputRef} type="file" accept=".pdf" multiple style={{ display: 'none' }} onChange={handleFileUpload} />

      {/* Header */}
      <div className="p-4 border-b border-border bg-background">
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => (onBack ? onBack() : navigate(-1))} className="shrink-0">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          <div className="flex-1">
            <Input value={estimateTitle} onChange={(e) => setEstimateTitle(e.target.value)} placeholder="Estimate title" className="text-lg font-semibold" />
          </div>
          <div className="w-64">
            <Select value={projectType} onValueChange={setProjectType}>
              <SelectTrigger>
                <SelectValue placeholder="Select project type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="industrial">Industrial</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="default" size="sm" disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Steps */}
      <StepTimeline steps={steps} current={2} onChange={handleStepChange} />

      {/* Layout */}
      <div className="h-[calc(100vh-var(--header-height)-200px)] grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4 p-4">
        {/* Left: Sidebar */}
        <DrawingSidebar
          fileInputRef={fileInputRef}
          handleFileUpload={handleFileUpload}
          drawings={drawings}
          activeDrawingId={activeDrawingId}
          onSetActiveDrawing={setActiveDrawing}
          onRemoveDrawing={removeDrawing}
          takeoffs={takeoffs}
          onCreateTakeoff={createTakeoff}
          onDeleteTakeoff={deleteTakeoff}
        />

        {/* Right: PDF with overlay */}
        <div className="border rounded-lg overflow-hidden min-h-[60vh]">
          {activeDrawing?.url ? (
            <PDFRenderer
              pdfUrl={activeDrawing.url}
              canvasRef={canvasRef}
              currentTool={currentTool}
              measurements={[]}
            />
          ) : (
            <div className="h-full grid place-items-center text-sm text-muted-foreground p-6">
              Upload a PDF to start the take-off.
            </div>
          )}
        </div>
      </div>
      <AiChatSidebar isCollapsed={isChatCollapsed} onToggleCollapse={() => setIsChatCollapsed(!isChatCollapsed)} />
    </PageShell>
  );
};
