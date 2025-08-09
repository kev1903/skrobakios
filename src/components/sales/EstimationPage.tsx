import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, FileDown } from 'lucide-react';
import { DrawingSidebar } from './components/DrawingSidebar';
import { MeasurementToolbar } from './components/MeasurementToolbar';
import { PDFViewer } from './components/PDFViewer';
import { QuantitiesTable } from './components/QuantitiesTable';
import { SummaryTab } from './components/SummaryTab';
import { StepTimeline } from '@/components/ui/step-timeline';
import { useTrades } from './hooks/useTrades';
import { useMultiplePDFUpload } from './hooks/useMultiplePDFUpload';
import { useEstimate } from './hooks/useEstimate';
import { useTakeoffMeasurements } from './hooks/useTakeoffMeasurements';
import { toast } from 'sonner';
interface EstimationPageProps {
  onBack?: () => void;
}
export const EstimationPage = ({
  onBack
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
    updateTradeName
  } = useTrades();
  const {
    fileInputRef,
    drawings,
    activeDrawingId,
    activeDrawing,
    handleFileUpload,
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
    takeoffs,
    measurements,
    addMeasurement,
    updateMeasurement: updateTakeoffMeasurement,
    deleteMeasurement,
    createTakeoff,
    updateTakeoff,
    deleteTakeoff,
    addMeasurementToTakeoff
  } = useTakeoffMeasurements();

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
    { id: 2, title: 'Step 2: Data Extraction' },
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

  const handleStepChange = (s: number) => {
    setCurrentStep(s);
    // Optionally navigate key tabs for better UX
    if (s <= 2) setActiveTab('drawings');
    else if (s <= 4) setActiveTab('quantities');
    else setActiveTab('summary');
  };

  return <div className="flex h-full bg-background">
      {/* Hidden file input for PDF upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />
      
      {/* Left Sidebar - Drawings Section */}
      <DrawingSidebar 
        onBack={onBack} 
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border bg-background">
          <div className="flex items-center gap-4">
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

        {/* Measurement Tools Toolbar */}
        <MeasurementToolbar 
          currentTool={currentTool} 
          onToolSelect={selectTool}
          onUploadClick={() => fileInputRef.current?.click()}
        />

        {/* Main Tabs Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="px-6 pt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="drawings">Drawings</TabsTrigger>
                <TabsTrigger value="quantities">Quantities & Rates</TabsTrigger>
                <TabsTrigger value="summary">Summary & Totals</TabsTrigger>
              </TabsList>
            </div>

            {/* PDF Viewer Tab */}
            <TabsContent value="drawings" className="flex-1 p-6 overflow-hidden">
              <PDFViewer 
                pdfUrl={activeDrawing?.url || null} 
                canvasRef={canvasRef} 
                currentTool={currentTool} 
                fileInputRef={fileInputRef}
                onMeasurementAdd={addMeasurement}
                onMeasurementUpdate={updateTakeoffMeasurement}
                onMeasurementDelete={deleteMeasurement}
                measurements={measurements}
              />
            </TabsContent>

            {/* Quantities and Rates Tab */}
            <TabsContent value="quantities" className="flex-1 p-6 overflow-auto">
              <QuantitiesTable trades={trades} onAddTrade={addTrade} onAddMeasurement={addTradeMeasurement} onUpdateMeasurement={updateMeasurement} onRemoveMeasurement={removeMeasurement} onUpdateTradeName={updateTradeName} />
            </TabsContent>

            {/* Summary and Totals Tab */}
            <TabsContent value="summary" className="flex-1 p-6 overflow-auto">
              <SummaryTab trades={trades} markupPercentage={markupPercentage} taxPercentage={taxPercentage} onMarkupChange={setMarkupPercentage} onTaxChange={setTaxPercentage} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>;
};