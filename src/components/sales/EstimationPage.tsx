import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { Plus, Trash2, FileText, Send, Upload, Calculator, Square, Circle, Ruler, Hash, Save, Eye, Download, MousePointer, Move3D, RotateCcw, ArrowLeft } from 'lucide-react';
interface EstimationPageProps {
  onBack?: () => void;
}
export const EstimationPage = ({
  onBack
}: EstimationPageProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Project and estimate state
  const [selectedProject, setSelectedProject] = useState('');
  const [estimateName, setEstimateName] = useState('');
  const [estimateTitle, setEstimateTitle] = useState('');
  const [projectType, setProjectType] = useState('');
  const [activeTab, setActiveTab] = useState('drawings');

  // PDF and drawing state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [currentTool, setCurrentTool] = useState<'pointer' | 'area' | 'linear' | 'count'>('pointer');
  const [scale, setScale] = useState(1);

  // Measurements and trades
  const [trades, setTrades] = useState([{
    id: '1',
    name: 'Concrete Works',
    measurements: [{
      id: '1',
      type: 'M3',
      description: 'Foundation concrete',
      quantity: 45.5,
      rate: 350,
      amount: 15925
    }, {
      id: '2',
      type: 'M2',
      description: 'Floor slab',
      quantity: 120,
      rate: 85,
      amount: 10200
    }]
  }, {
    id: '2',
    name: 'Framing',
    measurements: [{
      id: '3',
      type: 'linear',
      description: 'Wall framing',
      quantity: 180,
      rate: 25,
      amount: 4500
    }, {
      id: '4',
      type: 'number',
      description: 'Doors',
      quantity: 8,
      rate: 450,
      amount: 3600
    }]
  }]);
  const [markupPercentage, setMarkupPercentage] = useState(15);
  const [taxPercentage, setTaxPercentage] = useState(10);
  const projects = [{
    id: '1',
    name: 'Smith House Extension',
    client: 'John Smith'
  }, {
    id: '2',
    name: 'Office Fitout',
    client: 'TechCorp Ltd'
  }, {
    id: '3',
    name: 'Kitchen Renovation',
    client: 'Emma Davis'
  }];

  // Calculate totals
  const tradesTotal = trades.reduce((sum, trade) => sum + trade.measurements.reduce((tradeSum, measurement) => tradeSum + measurement.amount, 0), 0);
  const markup = tradesTotal * (markupPercentage / 100);
  const subtotalWithMarkup = tradesTotal + markup;
  const tax = subtotalWithMarkup * (taxPercentage / 100);
  const total = subtotalWithMarkup + tax;

  // File upload handler
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      toast.success('PDF drawing uploaded successfully');
    } else {
      toast.error('Please upload a PDF file');
    }
  };

  // Add new trade
  const addTrade = () => {
    const newTrade = {
      id: Date.now().toString(),
      name: 'New Trade',
      measurements: []
    };
    setTrades([...trades, newTrade]);
  };

  // Add measurement to trade
  const addMeasurement = (tradeId: string) => {
    const newMeasurement = {
      id: Date.now().toString(),
      type: 'M2',
      description: '',
      quantity: 0,
      rate: 0,
      amount: 0
    };
    setTrades(trades.map(trade => trade.id === tradeId ? {
      ...trade,
      measurements: [...trade.measurements, newMeasurement]
    } : trade));
  };

  // Update measurement
  const updateMeasurement = (tradeId: string, measurementId: string, field: string, value: any) => {
    setTrades(trades.map(trade => trade.id === tradeId ? {
      ...trade,
      measurements: trade.measurements.map(measurement => measurement.id === measurementId ? {
        ...measurement,
        [field]: value,
        amount: field === 'quantity' || field === 'rate' ? (field === 'quantity' ? value : measurement.quantity) * (field === 'rate' ? value : measurement.rate) : measurement.amount
      } : measurement)
    } : trade));
  };

  // Remove measurement
  const removeMeasurement = (tradeId: string, measurementId: string) => {
    setTrades(trades.map(trade => trade.id === tradeId ? {
      ...trade,
      measurements: trade.measurements.filter(m => m.id !== measurementId)
    } : trade));
  };

  // Update trade name
  const updateTradeName = (tradeId: string, name: string) => {
    setTrades(trades.map(trade => trade.id === tradeId ? {
      ...trade,
      name
    } : trade));
  };

  // Tool selection
  const selectTool = (tool: typeof currentTool) => {
    setCurrentTool(tool);
    if (canvasRef.current) {
      canvasRef.current.style.cursor = tool === 'pointer' ? 'default' : 'crosshair';
    }
  };
  const existingEstimates = [{
    id: '1',
    name: 'Kitchen Extension - Initial',
    project: 'Smith House',
    amount: '$85,000',
    status: 'Approved',
    date: '2024-01-15'
  }, {
    id: '2',
    name: 'Office Renovation - Quote',
    project: 'TechCorp Office',
    amount: '$120,000',
    status: 'Sent',
    date: '2024-01-20'
  }, {
    id: '3',
    name: 'Bathroom Upgrade - Draft',
    project: 'Davis Home',
    amount: '$35,000',
    status: 'Draft',
    date: '2024-01-22'
  }];
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-700';
      case 'Sent':
        return 'bg-blue-100 text-blue-700';
      case 'Draft':
        return 'bg-gray-100 text-gray-700';
      case 'Rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };
  return <div className="flex h-screen bg-background">
      {/* Left Sidebar - Drawings Section */}
      <div className="w-80 flex flex-col border-r border-border bg-background">
        {/* Header with Back Button */}
        <div className="p-4 border-b border-border">
          {onBack && <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center gap-2 mb-3 w-full justify-start hover:bg-muted">
              <ArrowLeft className="w-4 h-4" />
              Back to Estimates
            </Button>}
          <h3 className="font-semibold text-lg">Drawings</h3>
          <p className="text-sm text-muted-foreground">Upload and configure project drawings</p>
        </div>

        {/* Upload Section */}
        <div className="p-4 border-b border-border">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf" className="hidden" />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full">
            <Upload className="w-4 h-4 mr-2" />
            Upload PDF Drawing
          </Button>
          {uploadedFile && <div className="mt-2 p-2 bg-muted rounded text-sm">
              <FileText className="w-4 h-4 inline mr-2" />
              {uploadedFile.name}
            </div>}
        </div>
      </div>

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
          </div>
        </div>

        {/* Measurement Tools Toolbar */}
        <TooltipProvider>
          <div className="p-4 border-b border-border bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground mr-4">Measurement Tools:</span>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant={currentTool === 'pointer' ? 'default' : 'outline'} size="sm" onClick={() => selectTool('pointer')}>
                      <MousePointer className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Select Tool</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant={currentTool === 'area' ? 'default' : 'outline'} size="sm" onClick={() => selectTool('area')}>
                      <Square className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Area Tool (M²/M³)</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant={currentTool === 'linear' ? 'default' : 'outline'} size="sm" onClick={() => selectTool('linear')}>
                      <Ruler className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Linear Tool (m)</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant={currentTool === 'count' ? 'default' : 'outline'} size="sm" onClick={() => selectTool('count')}>
                      <Hash className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Count Tool (#)</p>
                  </TooltipContent>
                </Tooltip>

                <Separator orientation="vertical" className="h-6 mx-2" />
                <span className="text-sm font-medium text-muted-foreground mr-2">Scale:</span>
                <div className="flex items-center gap-2">
                  <Input type="number" value={scale} onChange={e => setScale(parseFloat(e.target.value) || 1)} placeholder="1.0" step="0.1" className="w-20" />
                  <span className="text-sm text-muted-foreground">:1</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
                <Button className="bg-primary hover:bg-primary/90" size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  Save Estimate
                </Button>
              </div>
            </div>
          </div>
        </TooltipProvider>

        {/* Project Details */}
        

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
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Project Drawing Viewer</CardTitle>
                </CardHeader>
                <CardContent className="h-full">
                  {pdfUrl ? <div className="relative h-full border-2 border-dashed border-muted rounded-lg overflow-hidden">
                      <iframe src={pdfUrl} className="w-full h-full" title="PDF Viewer" />
                      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-auto" style={{
                    cursor: currentTool === 'pointer' ? 'default' : 'crosshair'
                  }} />
                    </div> : <div className="h-full border-2 border-dashed border-muted rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">Upload Project Drawings</h3>
                        <p className="text-muted-foreground mb-4">
                          Upload PDF drawings to start taking measurements
                        </p>
                        <Button onClick={() => fileInputRef.current?.click()}>
                          <Upload className="w-4 h-4 mr-2" />
                          Choose PDF File
                        </Button>
                      </div>
                    </div>}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Quantities and Rates Tab */}
            <TabsContent value="quantities" className="flex-1 p-6 overflow-auto">
              <div className="space-y-6">
                {trades.map(trade => <Card key={trade.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Input value={trade.name} onChange={e => updateTradeName(trade.id, e.target.value)} className="text-lg font-semibold border-none p-0 h-auto bg-transparent" />
                        <Button variant="outline" size="sm" onClick={() => addMeasurement(trade.id)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Item
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-20">Type</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="w-24">Qty</TableHead>
                            <TableHead className="w-24">Rate</TableHead>
                            <TableHead className="w-28">Amount</TableHead>
                            <TableHead className="w-12"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {trade.measurements.map(measurement => <TableRow key={measurement.id}>
                              <TableCell>
                                <Select value={measurement.type} onValueChange={value => updateMeasurement(trade.id, measurement.id, 'type', value)}>
                                  <SelectTrigger className="w-16">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="M2">M²</SelectItem>
                                    <SelectItem value="M3">M³</SelectItem>
                                    <SelectItem value="linear">LM</SelectItem>
                                    <SelectItem value="number">#</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Input value={measurement.description} onChange={e => updateMeasurement(trade.id, measurement.id, 'description', e.target.value)} placeholder="Item description" />
                              </TableCell>
                              <TableCell>
                                <Input type="number" value={measurement.quantity} onChange={e => updateMeasurement(trade.id, measurement.id, 'quantity', parseFloat(e.target.value) || 0)} className="w-20" step="0.1" />
                              </TableCell>
                              <TableCell>
                                <Input type="number" value={measurement.rate} onChange={e => updateMeasurement(trade.id, measurement.id, 'rate', parseFloat(e.target.value) || 0)} className="w-20" step="0.01" />
                              </TableCell>
                              <TableCell>
                                <span className="font-medium">
                                  ${measurement.amount.toLocaleString()}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm" onClick={() => removeMeasurement(trade.id, measurement.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>)}
                        </TableBody>
                      </Table>
                      {trade.measurements.length > 0 && <div className="mt-4 pt-4 border-t">
                          <div className="flex justify-end">
                            <div className="text-right">
                              <span className="text-sm text-muted-foreground">Trade Subtotal: </span>
                              <span className="font-semibold text-lg">
                                ${trade.measurements.reduce((sum, m) => sum + m.amount, 0).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>}
                    </CardContent>
                  </Card>)}
              </div>
            </TabsContent>

            {/* Summary and Totals Tab */}
            <TabsContent value="summary" className="flex-1 p-6 overflow-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Cost Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Cost Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {trades.map(trade => <div key={trade.id} className="flex justify-between">
                          <span>{trade.name}:</span>
                          <span className="font-medium">
                            ${trade.measurements.reduce((sum, m) => sum + m.amount, 0).toLocaleString()}
                          </span>
                        </div>)}
                      <Separator />
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Trades Total:</span>
                        <span>${tradesTotal.toLocaleString()}</span>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="markup">Markup (%)</Label>
                        <Input id="markup" type="number" value={markupPercentage} onChange={e => setMarkupPercentage(parseFloat(e.target.value) || 0)} />
                        <div className="flex justify-between text-sm">
                          <span>Markup Amount:</span>
                          <span>${markup.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tax">Tax (%)</Label>
                        <Input id="tax" type="number" value={taxPercentage} onChange={e => setTaxPercentage(parseFloat(e.target.value) || 0)} />
                        <div className="flex justify-between text-sm">
                          <span>Tax Amount:</span>
                          <span>${tax.toLocaleString()}</span>
                        </div>
                      </div>

                      <Separator />
                      <div className="flex justify-between text-xl font-bold text-primary">
                        <span>Total:</span>
                        <span>${total.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-4">
                      <Button className="w-full">
                        <FileText className="w-4 h-4 mr-2" />
                        Generate PDF Quote
                      </Button>
                      <Button variant="outline" className="w-full">
                        <Send className="w-4 h-4 mr-2" />
                        Send to Client
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Estimates */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Estimates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {existingEstimates.map(estimate => <div key={estimate.id} className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-sm">{estimate.name}</h4>
                            <Badge className={getStatusColor(estimate.status)}>{estimate.status}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">{estimate.project}</p>
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-primary">{estimate.amount}</span>
                            <span className="text-xs text-muted-foreground">{estimate.date}</span>
                          </div>
                        </div>)}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>;
};