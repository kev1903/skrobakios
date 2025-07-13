import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  RotateCcw,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Copy,
  Undo,
  Redo,
  Home,
  Grid3X3,
  Type,
  Palette,
  Settings,
  FolderOpen,
  Sheet,
  BookOpen,
  Calculator as CalcIcon
} from 'lucide-react';

export const EstimationPage = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Project and estimate state
  const [selectedProject, setSelectedProject] = useState('');
  const [estimateName, setEstimateName] = useState('Project Estimate 21/04/25');
  const [selectedSheet, setSelectedSheet] = useState('Presentation');
  
  // PDF and drawing state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [currentTool, setCurrentTool] = useState<'pointer' | 'area' | 'linear' | 'count'>('pointer');
  const [scale, setScale] = useState(1);
  
  // Measurement data (Excel-like structure)
  const [measurements, setMeasurements] = useState([
    { id: '1', code: 'A', description: 'STAGE 4 - DESIGN', category: '', quantity: '', unit: '', rate: '', subtotal: '', factor: '', total: '', user1: '', user2: '', kuser3: '', luser4: '', muser5: '', nuser6: '', ouser7: '', puser8: '', quser9: '', ruser10: '', suser11: '' },
    { id: '2', code: '', description: 'SITE INFORMATION', category: '', quantity: '', unit: '', rate: '', subtotal: '', factor: '', total: '', user1: '', user2: '', kuser3: '', luser4: '', muser5: '', nuser6: '', ouser7: '', puser8: '', quser9: '', ruser10: '', suser11: '' },
    { id: '3', code: '', description: 'Plan of sub-division', category: '', quantity: '', unit: '', rate: '', subtotal: '', factor: '', total: '', user1: '', user2: '', kuser3: '', luser4: '', muser5: '', nuser6: '', ouser7: '', puser8: '', quser9: '', ruser10: '', suser11: '' },
    { id: '4', code: '', description: 'Restrictive covenants', category: '', quantity: '', unit: '', rate: '', subtotal: '', factor: '', total: '', user1: '', user2: '', kuser3: '', luser4: '', muser5: '', nuser6: '', ouser7: '', puser8: '', quser9: '', ruser10: '', suser11: '' },
    { id: '5', code: '', description: 'Section 173 agreements', category: '', quantity: '', unit: '', rate: '', subtotal: '', factor: '', total: '', user1: '', user2: '', kuser3: '', luser4: '', muser5: '', nuser6: '', ouser7: '', puser8: '', quser9: '', ruser10: '', suser11: '' },
    { id: '6', code: '', description: '', category: '', quantity: '', unit: '', rate: '', subtotal: '', factor: '', total: '', user1: '', user2: '', kuser3: '', luser4: '', muser5: '', nuser6: '', ouser7: '', puser8: '', quser9: '', ruser10: '', suser11: '' },
    { id: '7', code: '', description: 'PROJECT DOCUMENTATION', category: '', quantity: '', unit: '', rate: '', subtotal: '', factor: '', total: '', user1: '', user2: '', kuser3: '', luser4: '', muser5: '', nuser6: '', ouser7: '', puser8: '', quser9: '', ruser10: '', suser11: '' },
    { id: '8', code: '', description: 'Site Feature Survey', category: '', quantity: '', unit: '', rate: '', subtotal: '', factor: 'N/A', total: '', user1: '', user2: '', kuser3: '', luser4: '', muser5: '', nuser6: '', ouser7: '', puser8: '', quser9: '', ruser10: '', suser11: '' },
    { id: '9', code: '', description: 'Soil Report', category: '', quantity: '800.00', unit: '', rate: '', subtotal: '', factor: '800.00', total: '', user1: '', user2: '', kuser3: '', luser4: '', muser5: '', nuser6: '', ouser7: '', puser8: '', quser9: '', ruser10: '', suser11: '' },
    { id: '10', code: '', description: 'Town Planning', category: '', quantity: '', unit: '', rate: '', subtotal: '', factor: 'N/A', total: '', user1: '', user2: '', kuser3: '', luser4: '', muser5: '', nuser6: '', ouser7: '', puser8: '', quser9: '', ruser10: '', suser11: '' }
  ]);
  
  // Workbooks/Sheets data
  const [workbooks] = useState([
    { name: 'Presentation', total: 643118, expanded: true },
    { name: 'Project Estimate 21/04/25', total: 843388, expanded: false },
    { name: 'Stage 1', total: 617904, expanded: false }
  ]);

  const projects = [
    { id: '1', name: 'Smith House Extension', client: 'John Smith' },
    { id: '2', name: 'Office Fitout', client: 'TechCorp Ltd' },
    { id: '3', name: 'Kitchen Renovation', client: 'Emma Davis' }
  ];

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

  // Tool selection
  const selectTool = (tool: typeof currentTool) => {
    setCurrentTool(tool);
    if (canvasRef.current) {
      canvasRef.current.style.cursor = tool === 'pointer' ? 'default' : 'crosshair';
    }
  };

  // Add new row
  const addMeasurementRow = () => {
    const newRow = {
      id: Date.now().toString(),
      code: '',
      description: '',
      category: '',
      quantity: '',
      unit: '',
      rate: '',
      subtotal: '',
      factor: '',
      total: '',
      user1: '',
      user2: '',
      kuser3: '',
      luser4: '',
      muser5: '',
      nuser6: '',
      ouser7: '',
      puser8: '',
      quser9: '',
      ruser10: '',
      suser11: ''
    };
    setMeasurements([...measurements, newRow]);
  };

  // Update measurement field
  const updateMeasurementField = (id: string, field: string, value: string) => {
    setMeasurements(measurements.map(measurement =>
      measurement.id === id ? { ...measurement, [field]: value } : measurement
    ));
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Excel-like Toolbar */}
      <div className="border-b bg-card">
        {/* File Menu Bar */}
        <div className="flex items-center px-4 py-1 text-sm border-b">
          <span className="font-medium mr-4">P5027_5 Thanet Street - BUILDING ISSUE...</span>
          <div className="flex items-center space-x-4 text-muted-foreground">
            <span>Presentation ×</span>
            <span>Project Estimate 21/04/25 ×</span>
          </div>
        </div>

        {/* Main Toolbar */}
        <div className="flex items-center px-4 py-2 space-x-4 border-b">
          {/* File Operations */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Upload className="w-4 h-4 mr-1" />
              Add
            </Button>
            <Button variant="ghost" size="sm">
              <FolderOpen className="w-4 h-4 mr-1" />
              Workbook
            </Button>
            <Button variant="ghost" size="sm">
              <Sheet className="w-4 h-4 mr-1" />
              Generate
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Drawing Tools */}
          <div className="flex items-center space-x-2">
            <Button 
              variant={currentTool === 'pointer' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => selectTool('pointer')}
            >
              <MousePointer className="w-4 h-4 mr-1" />
              Reports
            </Button>
            <Button 
              variant={currentTool === 'area' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => selectTool('area')}
            >
              <Square className="w-4 h-4 mr-1" />
              Upload
            </Button>
            <Button 
              variant={currentTool === 'linear' ? 'default' : 'ghost'} 
              size="sm"
              onClick={() => selectTool('linear')}
            >
              <Ruler className="w-4 h-4 mr-1" />
              Download
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Editing Tools */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Copy className="w-4 h-4 mr-1" />
              Copy
            </Button>
            <Button variant="ghost" size="sm">
              <Undo className="w-4 h-4 mr-1" />
              Undo
            </Button>
            <Button variant="ghost" size="sm">
              <Redo className="w-4 h-4 mr-1" />
              Redo
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* View Tools */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <ZoomIn className="w-4 h-4 mr-1" />
              Find & Replace
            </Button>
            <Button variant="ghost" size="sm">
              <Grid3X3 className="w-4 h-4 mr-1" />
              Rows
            </Button>
            <Button variant="ghost" size="sm">
              <Type className="w-4 h-4 mr-1" />
              Columns
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Format Tools */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Palette className="w-4 h-4 mr-1" />
              Function
            </Button>
            <Button variant="ghost" size="sm">
              <CalcIcon className="w-4 h-4 mr-1" />
              AutoSum
            </Button>
          </div>
        </div>

        {/* Secondary Toolbar */}
        <div className="flex items-center px-4 py-1 text-xs bg-muted/30">
          <span className="mr-4">Editing</span>
          <div className="flex items-center space-x-4">
            <span>Workbook Tools</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Workbooks/Sheets */}
        <div className="w-64 border-r bg-card flex flex-col">
          <div className="p-3 border-b">
            <h3 className="font-medium text-sm">Workbooks</h3>
          </div>
          <div className="flex-1 p-2 space-y-1">
            {workbooks.map((workbook, index) => (
              <div key={index} className={`p-2 rounded cursor-pointer text-sm ${selectedSheet === workbook.name ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-2" />
                    <span>{workbook.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{workbook.total.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Filter Panel */}
          <div className="border-t p-3">
            <h4 className="text-xs font-medium mb-2">Click to Filter</h4>
            <div className="text-xs text-muted-foreground">
              <div className="mb-1">Name: <span className="italic">&lt;Filter is Empty&gt;</span></div>
              <div className="flex items-center">
                <input type="radio" className="mr-1" />
                <span>Standard</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel - Drawings */}
        <div className="w-80 border-r bg-card flex flex-col">
          <div className="p-3 border-b">
            <h3 className="font-medium text-sm">Project Drawings</h3>
          </div>
          <div className="flex-1 p-4">
            {pdfUrl ? (
              <div className="h-full border-2 border-dashed border-muted rounded-lg overflow-hidden">
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
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">Upload Project Drawings</p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf"
                    className="hidden"
                  />
                  <Button size="sm" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-4 h-4 mr-2" />
                    Choose PDF
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Main Spreadsheet */}
        <div className="flex-1 flex flex-col">
          {/* Spreadsheet Header */}
          <div className="border-b p-2 bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Cell = </span>
                <span className="text-sm">Total = 843,588</span>
              </div>
              <Button size="sm" onClick={addMeasurementRow}>
                <Plus className="w-4 h-4 mr-1" />
                Add Row
              </Button>
            </div>
          </div>

          {/* Spreadsheet Content */}
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow className="border-b-2">
                  <TableHead className="w-12 text-center border-r">A</TableHead>
                  <TableHead className="w-64 border-r">Description</TableHead>
                  <TableHead className="w-24 text-center border-r">Quantity</TableHead>
                  <TableHead className="w-20 text-center border-r">Unit</TableHead>
                  <TableHead className="w-24 text-center border-r">Rate</TableHead>
                  <TableHead className="w-24 text-center border-r">Subtotal</TableHead>
                  <TableHead className="w-20 text-center border-r">Factor</TableHead>
                  <TableHead className="w-24 text-center border-r">Total</TableHead>
                  <TableHead className="w-20 text-center border-r">User1</TableHead>
                  <TableHead className="w-20 text-center border-r">User2</TableHead>
                  <TableHead className="w-20 text-center border-r">KUser3</TableHead>
                  <TableHead className="w-20 text-center border-r">LUser4</TableHead>
                  <TableHead className="w-20 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {measurements.map((measurement, index) => (
                  <TableRow key={measurement.id} className={`hover:bg-muted/50 ${measurement.description.includes('STAGE') ? 'bg-yellow-50' : ''}`}>
                    <TableCell className="border-r text-center font-mono text-sm">
                      <Input
                        value={measurement.code}
                        onChange={(e) => updateMeasurementField(measurement.id, 'code', e.target.value)}
                        className="w-8 h-6 text-xs border-none bg-transparent p-0 text-center"
                      />
                    </TableCell>
                    <TableCell className="border-r">
                      <Input
                        value={measurement.description}
                        onChange={(e) => updateMeasurementField(measurement.id, 'description', e.target.value)}
                        className="h-6 text-xs border-none bg-transparent p-1"
                        placeholder="Item description"
                      />
                    </TableCell>
                    <TableCell className="border-r">
                      <Input
                        value={measurement.quantity}
                        onChange={(e) => updateMeasurementField(measurement.id, 'quantity', e.target.value)}
                        className="h-6 text-xs border-none bg-transparent p-1 text-right"
                        type="number"
                        step="0.01"
                      />
                    </TableCell>
                    <TableCell className="border-r">
                      <Input
                        value={measurement.unit}
                        onChange={(e) => updateMeasurementField(measurement.id, 'unit', e.target.value)}
                        className="h-6 text-xs border-none bg-transparent p-1 text-center"
                      />
                    </TableCell>
                    <TableCell className="border-r">
                      <Input
                        value={measurement.rate}
                        onChange={(e) => updateMeasurementField(measurement.id, 'rate', e.target.value)}
                        className="h-6 text-xs border-none bg-transparent p-1 text-right"
                        type="number"
                        step="0.01"
                      />
                    </TableCell>
                    <TableCell className="border-r">
                      <Input
                        value={measurement.subtotal}
                        onChange={(e) => updateMeasurementField(measurement.id, 'subtotal', e.target.value)}
                        className="h-6 text-xs border-none bg-transparent p-1 text-right"
                        type="number"
                        step="0.01"
                      />
                    </TableCell>
                    <TableCell className="border-r">
                      <Input
                        value={measurement.factor}
                        onChange={(e) => updateMeasurementField(measurement.id, 'factor', e.target.value)}
                        className="h-6 text-xs border-none bg-transparent p-1 text-right"
                      />
                    </TableCell>
                    <TableCell className="border-r">
                      <Input
                        value={measurement.total}
                        onChange={(e) => updateMeasurementField(measurement.id, 'total', e.target.value)}
                        className="h-6 text-xs border-none bg-transparent p-1 text-right"
                        type="number"
                        step="0.01"
                      />
                    </TableCell>
                    <TableCell className="border-r">
                      <Input
                        value={measurement.user1}
                        onChange={(e) => updateMeasurementField(measurement.id, 'user1', e.target.value)}
                        className="h-6 text-xs border-none bg-transparent p-1"
                      />
                    </TableCell>
                    <TableCell className="border-r">
                      <Input
                        value={measurement.user2}
                        onChange={(e) => updateMeasurementField(measurement.id, 'user2', e.target.value)}
                        className="h-6 text-xs border-none bg-transparent p-1"
                      />
                    </TableCell>
                    <TableCell className="border-r">
                      <Input
                        value={measurement.kuser3}
                        onChange={(e) => updateMeasurementField(measurement.id, 'kuser3', e.target.value)}
                        className="h-6 text-xs border-none bg-transparent p-1"
                      />
                    </TableCell>
                    <TableCell className="border-r">
                      <Input
                        value={measurement.luser4}
                        onChange={(e) => updateMeasurementField(measurement.id, 'luser4', e.target.value)}
                        className="h-6 text-xs border-none bg-transparent p-1"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMeasurements(measurements.filter(m => m.id !== measurement.id))}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Bottom Status Bar */}
          <div className="border-t p-2 bg-muted/30 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span>GFA = 0.00 m2</span>
              <span>0.0000</span>
              <span>General</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Settings className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};