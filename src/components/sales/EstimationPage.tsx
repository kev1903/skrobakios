import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { DrawingSidebar } from './components/DrawingSidebar';
import { MeasurementToolbar } from './components/MeasurementToolbar';
import { PDFViewer } from './components/PDFViewer';
import { QuantitiesTable } from './components/QuantitiesTable';
import { SummaryTab } from './components/SummaryTab';
import { useTrades } from './hooks/useTrades';
import { usePDFUpload } from './hooks/usePDFUpload';

interface EstimationPageProps {
  onBack?: () => void;
}

export const EstimationPage = ({ onBack }: EstimationPageProps) => {
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
    addMeasurement,
    updateMeasurement,
    removeMeasurement,
    updateTradeName
  } = useTrades();

  const {
    fileInputRef,
    uploadedFile,
    pdfUrl,
    handleFileUpload
  } = usePDFUpload();

  // Tool selection
  const selectTool = (tool: typeof currentTool) => {
    setCurrentTool(tool);
    if (canvasRef.current) {
      canvasRef.current.style.cursor = tool === 'pointer' ? 'default' : 'crosshair';
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar - Drawings Section */}
      <DrawingSidebar 
        onBack={onBack}
        fileInputRef={fileInputRef}
        handleFileUpload={handleFileUpload}
        uploadedFile={uploadedFile}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border bg-background">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input 
                id="estimateTitle" 
                value={estimateTitle} 
                onChange={e => setEstimateTitle(e.target.value)} 
                placeholder="Enter estimate title..." 
                className="text-lg font-semibold" 
              />
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
          </div>
        </div>

        {/* Measurement Tools Toolbar */}
        <MeasurementToolbar 
          currentTool={currentTool}
          onToolSelect={selectTool}
        />

        {/* Main Tabs Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <div className="px-6 pt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="drawings">PDF Viewer</TabsTrigger>
                <TabsTrigger value="quantities">Quantities & Rates</TabsTrigger>
                <TabsTrigger value="summary">Summary & Totals</TabsTrigger>
              </TabsList>
            </div>

            {/* PDF Viewer Tab */}
            <TabsContent value="drawings" className="flex-1 p-6">
              <PDFViewer 
                pdfUrl={pdfUrl}
                canvasRef={canvasRef}
                currentTool={currentTool}
                fileInputRef={fileInputRef}
              />
            </TabsContent>

            {/* Quantities and Rates Tab */}
            <TabsContent value="quantities" className="flex-1 p-6 overflow-auto">
              <QuantitiesTable 
                trades={trades}
                onAddTrade={addTrade}
                onAddMeasurement={addMeasurement}
                onUpdateMeasurement={updateMeasurement}
                onRemoveMeasurement={removeMeasurement}
                onUpdateTradeName={updateTradeName}
              />
            </TabsContent>

            {/* Summary and Totals Tab */}
            <TabsContent value="summary" className="flex-1 p-6 overflow-auto">
              <SummaryTab 
                trades={trades}
                markupPercentage={markupPercentage}
                taxPercentage={taxPercentage}
                onMarkupChange={setMarkupPercentage}
                onTaxChange={setTaxPercentage}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};