
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
import { toast } from 'sonner';
import { 
  Plus,
  Trash2,
  FileText,
  Send,
  Upload,
  Calculator,
  Square,
  Circle,
  Ruler,
  Hash,
  Save,
  Eye,
  Download,
  MousePointer,
  Move3D,
  RotateCcw
} from 'lucide-react';

export const EstimationPage = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Project and estimate state
  const [selectedProject, setSelectedProject] = useState('');
  const [estimateName, setEstimateName] = useState('');
  const [activeTab, setActiveTab] = useState('drawings');
  
  // PDF and drawing state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [currentTool, setCurrentTool] = useState<'pointer' | 'area' | 'linear' | 'count'>('pointer');
  const [scale, setScale] = useState(1);
  
  // Measurements and trades
  const [trades, setTrades] = useState([
    {
      id: '1',
      name: 'Concrete Works',
      measurements: [
        { id: '1', type: 'M3', description: 'Foundation concrete', quantity: 45.5, rate: 350, amount: 15925 },
        { id: '2', type: 'M2', description: 'Floor slab', quantity: 120, rate: 85, amount: 10200 }
      ]
    },
    {
      id: '2', 
      name: 'Framing',
      measurements: [
        { id: '3', type: 'linear', description: 'Wall framing', quantity: 180, rate: 25, amount: 4500 },
        { id: '4', type: 'number', description: 'Doors', quantity: 8, rate: 450, amount: 3600 }
      ]
    }
  ]);
  
  const [markupPercentage, setMarkupPercentage] = useState(15);
  const [taxPercentage, setTaxPercentage] = useState(10);

  const projects = [
    { id: '1', name: 'Smith House Extension', client: 'John Smith' },
    { id: '2', name: 'Office Fitout', client: 'TechCorp Ltd' },
    { id: '3', name: 'Kitchen Renovation', client: 'Emma Davis' }
  ];

  // Calculate totals
  const tradesTotal = trades.reduce((sum, trade) => 
    sum + trade.measurements.reduce((tradeSum, measurement) => 
      tradeSum + measurement.amount, 0), 0);
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
    setTrades(trades.map(trade => 
      trade.id === tradeId 
        ? { ...trade, measurements: [...trade.measurements, newMeasurement] }
        : trade
    ));
  };

  // Update measurement
  const updateMeasurement = (tradeId: string, measurementId: string, field: string, value: any) => {
    setTrades(trades.map(trade => 
      trade.id === tradeId 
        ? {
            ...trade,
            measurements: trade.measurements.map(measurement => 
              measurement.id === measurementId 
                ? {
                    ...measurement,
                    [field]: value,
                    amount: field === 'quantity' || field === 'rate' 
                      ? (field === 'quantity' ? value : measurement.quantity) * 
                        (field === 'rate' ? value : measurement.rate)
                      : measurement.amount
                  }
                : measurement
            )
          }
        : trade
    ));
  };

  // Remove measurement
  const removeMeasurement = (tradeId: string, measurementId: string) => {
    setTrades(trades.map(trade => 
      trade.id === tradeId 
        ? { ...trade, measurements: trade.measurements.filter(m => m.id !== measurementId) }
        : trade
    ));
  };

  // Update trade name
  const updateTradeName = (tradeId: string, name: string) => {
    setTrades(trades.map(trade => 
      trade.id === tradeId ? { ...trade, name } : trade
    ));
  };

  // Tool selection
  const selectTool = (tool: typeof currentTool) => {
    setCurrentTool(tool);
    if (canvasRef.current) {
      canvasRef.current.style.cursor = tool === 'pointer' ? 'default' : 'crosshair';
    }
  };

  const existingEstimates = [
    { id: '1', name: 'Kitchen Extension - Initial', project: 'Smith House', amount: '$85,000', status: 'Approved', date: '2024-01-15' },
    { id: '2', name: 'Office Renovation - Quote', project: 'TechCorp Office', amount: '$120,000', status: 'Sent', date: '2024-01-20' },
    { id: '3', name: 'Bathroom Upgrade - Draft', project: 'Davis Home', amount: '$35,000', status: 'Draft', date: '2024-01-22' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-700';
      case 'Sent': return 'bg-blue-100 text-blue-700';
      case 'Draft': return 'bg-gray-100 text-gray-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Construction Estimating</h2>
          <p className="text-muted-foreground">Create detailed estimates with graphical take-offs and cost analysis</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            <Save className="w-4 h-4 mr-2" />
            Save Estimate
          </Button>
        </div>
      </div>

      {/* Project Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>Set up your estimate basics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="project">Select Project</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name} - {project.client}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="estimate-name">Estimate Name</Label>
              <Input 
                id="estimate-name" 
                value={estimateName}
                onChange={(e) => setEstimateName(e.target.value)}
                placeholder="e.g., Initial Estimate v1.0" 
              />
            </div>
            <div>
              <Label htmlFor="date">Estimate Date</Label>
              <Input 
                id="date" 
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content - Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="drawings">Drawings & Take-offs</TabsTrigger>
          <TabsTrigger value="quantities">Quantities & Rates</TabsTrigger>
          <TabsTrigger value="summary">Summary & Totals</TabsTrigger>
        </TabsList>

        {/* Drawings and Take-offs Tab */}
        <TabsContent value="drawings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* PDF Upload and Viewer */}
            <div className="lg:col-span-3">
              <Card className="h-[600px]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Project Drawings</CardTitle>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept=".pdf"
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        size="sm"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload PDF
                      </Button>
                      {pdfUrl && (
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View Full
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="h-full">
                  {pdfUrl ? (
                    <div className="relative h-full border-2 border-dashed border-muted rounded-lg overflow-hidden">
                      <iframe
                        src={pdfUrl}
                        className="w-full h-full"
                        title="PDF Viewer"
                      />
                      <canvas
                        ref={canvasRef}
                        className="absolute inset-0 pointer-events-auto"
                        style={{ cursor: currentTool === 'pointer' ? 'default' : 'crosshair' }}
                      />
                    </div>
                  ) : (
                    <div className="h-full border-2 border-dashed border-muted rounded-lg flex items-center justify-center">
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
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Tools Panel */}
            <div className="space-y-6">
              {/* Measurement Tools */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Measurement Tools</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant={currentTool === 'pointer' ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => selectTool('pointer')}
                  >
                    <MousePointer className="w-4 h-4 mr-2" />
                    Select
                  </Button>
                  <Button
                    variant={currentTool === 'area' ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => selectTool('area')}
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Area (M²/M³)
                  </Button>
                  <Button
                    variant={currentTool === 'linear' ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => selectTool('linear')}
                  >
                    <Ruler className="w-4 h-4 mr-2" />
                    Linear (m)
                  </Button>
                  <Button
                    variant={currentTool === 'count' ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => selectTool('count')}
                  >
                    <Hash className="w-4 h-4 mr-2" />
                    Count (#)
                  </Button>
                  <Separator />
                  <Button variant="outline" className="w-full justify-start">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                </CardContent>
              </Card>

              {/* Scale Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Drawing Scale</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label htmlFor="scale">Scale Factor</Label>
                    <Input
                      id="scale"
                      type="number"
                      value={scale}
                      onChange={(e) => setScale(parseFloat(e.target.value) || 1)}
                      placeholder="1.0"
                      step="0.1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Set the scale to convert drawing measurements to real dimensions
                  </p>
                </CardContent>
              </Card>

              {/* Quick Add Measurement */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Quick Add</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={addTrade}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Trade
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Quantities and Rates Tab */}
        <TabsContent value="quantities" className="space-y-6">
          <div className="space-y-6">
            {trades.map((trade) => (
              <Card key={trade.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Input
                      value={trade.name}
                      onChange={(e) => updateTradeName(trade.id, e.target.value)}
                      className="text-lg font-semibold border-none p-0 h-auto bg-transparent"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => addMeasurement(trade.id)}
                    >
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
                      {trade.measurements.map((measurement) => (
                        <TableRow key={measurement.id}>
                          <TableCell>
                            <Select
                              value={measurement.type}
                              onValueChange={(value) => updateMeasurement(trade.id, measurement.id, 'type', value)}
                            >
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
                            <Input
                              value={measurement.description}
                              onChange={(e) => updateMeasurement(trade.id, measurement.id, 'description', e.target.value)}
                              placeholder="Item description"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={measurement.quantity}
                              onChange={(e) => updateMeasurement(trade.id, measurement.id, 'quantity', parseFloat(e.target.value) || 0)}
                              className="w-20"
                              step="0.1"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={measurement.rate}
                              onChange={(e) => updateMeasurement(trade.id, measurement.id, 'rate', parseFloat(e.target.value) || 0)}
                              className="w-20"
                              step="0.01"
                            />
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">
                              ${measurement.amount.toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMeasurement(trade.id, measurement.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {trade.measurements.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-end">
                        <div className="text-right">
                          <span className="text-sm text-muted-foreground">Trade Subtotal: </span>
                          <span className="font-semibold text-lg">
                            ${trade.measurements.reduce((sum, m) => sum + m.amount, 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Summary and Totals Tab */}
        <TabsContent value="summary" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cost Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Cost Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {trades.map((trade) => (
                    <div key={trade.id} className="flex justify-between">
                      <span>{trade.name}:</span>
                      <span className="font-medium">
                        ${trade.measurements.reduce((sum, m) => sum + m.amount, 0).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Trades Total:</span>
                    <span>${tradesTotal.toLocaleString()}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="markup">Markup (%)</Label>
                    <Input 
                      id="markup"
                      type="number" 
                      value={markupPercentage}
                      onChange={(e) => setMarkupPercentage(parseFloat(e.target.value) || 0)}
                    />
                    <div className="flex justify-between text-sm">
                      <span>Markup Amount:</span>
                      <span>${markup.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tax">Tax (%)</Label>
                    <Input 
                      id="tax"
                      type="number" 
                      value={taxPercentage}
                      onChange={(e) => setTaxPercentage(parseFloat(e.target.value) || 0)}
                    />
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
                  {existingEstimates.map((estimate) => (
                    <div key={estimate.id} className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{estimate.name}</h4>
                        <Badge className={getStatusColor(estimate.status)}>{estimate.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{estimate.project}</p>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-primary">{estimate.amount}</span>
                        <span className="text-xs text-muted-foreground">{estimate.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
