import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Save, ArrowLeft } from 'lucide-react';

import { StepTimeline } from '@/components/ui/step-timeline';
import { useTrades } from './hooks/useTrades';
import { useMultiplePDFUpload } from './hooks/useMultiplePDFUpload';
import { useEstimate } from './hooks/useEstimate';
import { useTakeoffMeasurements } from './hooks/useTakeoffMeasurements';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageShell } from '@/components/layout/PageShell';
 
import { toast } from 'sonner';
interface EstimationPageProps {
  onBack?: () => void;
  estimateId?: string;
}
export const EstimationPage = ({
  onBack,
  estimateId
}: EstimationPageProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Project and estimate state
  const [estimateTitle, setEstimateTitle] = useState('');
  const [projectType, setProjectType] = useState('');
  const [activeTab, setActiveTab] = useState('drawings');

  // Drawing and measurement state
  const [currentTool, setCurrentTool] = useState<'pointer' | 'area' | 'linear' | 'count'>('pointer');
  const [scale, setScale] = useState(1);

  // Pricing state
  const [markupPercentage, setMarkupPercentage] = useState(15);
  const [taxPercentage, setTaxPercentage] = useState(10);

  // Custom hooks
  const {
    trades,
    addTrade,
    addMeasurement: addTradeMeasurement,
    updateMeasurement,
    removeMeasurement,
    updateTradeName,
    setTradesData
  } = useTrades(); // includes setTradesData for loading existing
const {
  fileInputRef,
  drawings,
  activeDrawingId,
  activeDrawing,
  handleFileUpload,
  addFiles,
  removeDrawing,
  setActiveDrawing
} = useMultiplePDFUpload();
  const {
    saveEstimate,
    updateEstimate,
    loadEstimate,
    isSaving,
    isLoading,
    generateEstimateNumber
  } = useEstimate();

  // Takeoff measurements system
const {
  measurements,
  addMeasurement,
  updateMeasurement: updateTakeoffMeasurement,
  deleteMeasurement
} = useTakeoffMeasurements();

  // Document type state for drawings
  const [docTypes, setDocTypes] = useState<Record<string, string>>({});
  const documentTypeOptions = [
    'Architectural',
    'Structural',
    'Civil',
    'Electrical',
    'HVAC',
    'Plumbing',
    'Landscaping',
    'FF&E',
    'Colour Selection',
    'Finishes',
    'Interior Design',
    'Energy Report',
    'Soil Report',
  ];

  // Estimate state
  const [currentEstimateId, setCurrentEstimateId] = useState<string | null>(null);
  const [estimateNumber, setEstimateNumber] = useState('');

  // Tool selection
  const selectTool = (tool: typeof currentTool) => {
    setCurrentTool(tool);
    if (canvasRef.current) {
      canvasRef.current.style.cursor = tool === 'pointer' ? 'default' : 'crosshair';
    }
  };

  // Debug logging
  console.log('Active drawing:', activeDrawing);

  // Save/Load functions
  const handleSaveEstimate = async () => {
    if (!estimateTitle) {
      toast.error('Please enter an estimate title');
      return;
    }

    try {
      const estimateData = {
        estimate_name: estimateTitle,
        estimate_number: estimateNumber || generateEstimateNumber(),
        project_type: projectType,
        status: 'draft' as const,
        estimate_date: new Date().toISOString().split('T')[0]
      };

      if (currentEstimateId) {
        await updateEstimate(currentEstimateId, estimateData, trades);
        toast.success('Estimate updated successfully');
      } else {
        const savedEstimate = await saveEstimate(estimateData, trades);
        setCurrentEstimateId(savedEstimate.id);
        setEstimateNumber(savedEstimate.estimate_number);
        toast.success('Estimate saved successfully');
      }
    } catch (error) {
      toast.error('Failed to save estimate');
      console.error('Save error:', error);
    }
  };

  const handleLoadEstimate = async (estimateId: string) => {
    try {
      const { estimate, trades: loadedTrades } = await loadEstimate(estimateId);
      setCurrentEstimateId(estimate.id);
      setEstimateTitle(estimate.estimate_name);
      setEstimateNumber(estimate.estimate_number);
      setProjectType(estimate.notes || '');
      // Note: integrate with trades hook to set the loaded trades
      toast.success('Estimate loaded successfully');
    } catch (error) {
      toast.error('Failed to load estimate');
      console.error('Load error:', error);
    }
  };
  // Progressive steps definition
  const steps = [
    { id: 1, title: 'Step 1: Input Data' },
    { id: 2, title: 'Step 2: Take-Off' },
    { id: 3, title: 'Step 3: Cost Database' },
    { id: 4, title: 'Step 4: Estimation Process' },
    { id: 5, title: 'Step 5: Output & Integration' },
  ];
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Sync step with tabs roughly
  useEffect(() => {
    // Map tab to a step index for visual context only
    if (activeTab === 'drawings') setCurrentStep((prev) => (prev < 3 ? prev : 1));
    if (activeTab === 'quantities') setCurrentStep((prev) => (prev < 5 && prev >= 3 ? prev : 4));
    if (activeTab === 'summary') setCurrentStep(5);
  }, [activeTab]);

  // Auto-load estimate when estimateId prop is provided
  useEffect(() => {
    if (!estimateId) return;
    (async () => {
      try {
        const { estimate, trades: loadedTrades } = await loadEstimate(estimateId);
        setCurrentEstimateId(estimate.id);
        setEstimateTitle(estimate.estimate_name);
        setEstimateNumber(estimate.estimate_number);
        setProjectType(estimate.notes || '');
        // @ts-ignore: setTradesData is exposed by useTrades
        if (typeof (setTradesData as any) === 'function') {
          // @ts-ignore
          setTradesData(loadedTrades);
        }
      } catch (e) {
        console.error('Auto-load estimate failed:', e);
      }
    })();
  }, [estimateId]);

  const handleStepChange = (s: number) => {
    setCurrentStep(s);
    // Optionally navigate key tabs for better UX
    if (s <= 2) setActiveTab('drawings');
    else if (s <= 4) setActiveTab('quantities');
    else setActiveTab('summary');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type === 'application/pdf');
    if (files.length) addFiles(files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return <PageShell withPattern>
      {/* Hidden file input for PDF upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />
      

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
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
              <Input id="estimateTitle" value={estimateTitle} onChange={e => setEstimateTitle(e.target.value)} placeholder="Enter estimate title..." className="text-lg font-semibold" />
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
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                Upload PDF
              </Button>
              <Button 
                onClick={handleSaveEstimate} 
                disabled={isSaving}
                variant="default"
                size="sm"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
              {estimateNumber && (
                <span className="text-sm text-muted-foreground self-center">
                  #{estimateNumber}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Progressive Step Timeline */}
        <StepTimeline steps={steps} current={currentStep} onChange={handleStepChange} />


        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6 p-6 pt-4">
            {/* Red section: Uploaded PDFs table */}
            <div className="overflow-auto">
              <div className="rounded-lg border">
                {drawings.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="h-8">
                        <TableHead className="text-xs font-medium">Name</TableHead>
                        <TableHead className="w-48 text-xs font-medium">Type</TableHead>
                        <TableHead className="w-20 text-xs font-medium">Pages</TableHead>
                        <TableHead className="w-56 text-xs font-medium">Uploaded</TableHead>
                        <TableHead className="w-40 text-right text-xs font-medium">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {drawings.map((d) => (
                        <TableRow key={d.id} className={(d.id === activeDrawingId ? 'bg-muted/40 ' : '') + 'h-8'}>
                          <TableCell className="font-medium py-1">
                            {d.name}
                            {d.id === activeDrawingId ? ' (Active)' : ''}
                          </TableCell>
                          <TableCell className="py-1">
                            <Select
                              defaultValue={docTypes[d.id]}
                              onValueChange={(val) => setDocTypes((prev) => ({ ...prev, [d.id]: val }))}
                            >
                              <SelectTrigger id={`doc-type-${d.id}`} className="h-8 text-xs">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent className="z-50 bg-popover">
                                {documentTypeOptions.map((opt) => (
                                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="py-1">{d.pages}</TableCell>
                          <TableCell className="py-1">{new Date(d.uploadedAt).toLocaleString()}</TableCell>
                          <TableCell className="text-right space-x-2 py-1">
                            <Button variant="outline" size="sm" onClick={() => setActiveDrawing(d.id)} disabled={d.id === activeDrawingId}>
                              View
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => removeDrawing(d.id)}>
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="p-6 text-sm text-muted-foreground">No drawings uploaded yet.</div>
                )}
              </div>
            </div>

            {/* Blue section: Drag & drop uploader */}
            <div>
              <div
                className="rounded-lg border border-dashed bg-muted/30 p-6 text-center"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <p className="font-medium mb-2">Drag & Drop PDFs here</p>
                <p className="text-sm text-muted-foreground mb-4">or</p>
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>Browse files</Button>
              </div>

              {drawings.length > 0 && (
                <div className="mt-4 text-left">
                  <p className="text-sm text-muted-foreground mb-2">Uploaded files</p>
                  <ul className="text-sm space-y-1">
                    {drawings.map((d) => (
                      <li key={d.id} className="flex items-center justify-between">
                        <span className="truncate mr-2">{d.name}</span>
                        <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => removeDrawing(d.id)}>Remove</Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageShell>;
};