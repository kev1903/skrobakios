
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus,
  Trash2,
  FileText,
  Send,
  Upload,
  Calculator
} from 'lucide-react';

export const EstimationPage = () => {
  const [selectedProject, setSelectedProject] = useState('');
  const [lineItems, setLineItems] = useState([
    { id: '1', category: 'Labour', description: 'General Construction Labour', quantity: 160, unit: 'hours', rate: 75, amount: 12000 },
    { id: '2', category: 'Materials', description: 'Framing Lumber', quantity: 50, unit: 'each', rate: 120, amount: 6000 },
    { id: '3', category: 'Materials', description: 'Electrical Supplies', quantity: 1, unit: 'lot', rate: 3500, amount: 3500 }
  ]);

  const [markupPercentage, setMarkupPercentage] = useState(15);
  const [taxPercentage, setTaxPercentage] = useState(10);

  const projects = [
    { id: '1', name: 'Smith House Extension', client: 'John Smith' },
    { id: '2', name: 'Office Fitout', client: 'TechCorp Ltd' },
    { id: '3', name: 'Kitchen Renovation', client: 'Emma Davis' }
  ];

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const markup = subtotal * (markupPercentage / 100);
  const subtotalWithMarkup = subtotal + markup;
  const tax = subtotalWithMarkup * (taxPercentage / 100);
  const total = subtotalWithMarkup + tax;

  const addLineItem = () => {
    const newItem = {
      id: Date.now().toString(),
      category: 'Labour',
      description: '',
      quantity: 1,
      unit: 'each',
      rate: 0,
      amount: 0
    };
    setLineItems([...lineItems, newItem]);
  };

  const updateLineItem = (id: string, field: string, value: any) => {
    setLineItems(items => items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          updated.amount = updated.quantity * updated.rate;
        }
        return updated;
      }
      return item;
    }));
  };

  const removeLineItem = (id: string) => {
    setLineItems(items => items.filter(item => item.id !== id));
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
          <h2 className="text-2xl font-bold">Estimation & Quotes</h2>
          <p className="text-gray-600">Create and manage project estimates</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Estimate
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Estimate Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Estimate</CardTitle>
              <CardDescription>Build a detailed estimate for your project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Project Selection */}
              <div className="grid grid-cols-2 gap-4">
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
                  <Input id="estimate-name" placeholder="e.g., Initial Estimate" />
                </div>
              </div>

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-base font-semibold">Line Items</Label>
                  <Button onClick={addLineItem} size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Select 
                            value={item.category} 
                            onValueChange={(value) => updateLineItem(item.id, 'category', value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Labour">Labour</SelectItem>
                              <SelectItem value="Materials">Materials</SelectItem>
                              <SelectItem value="Equipment">Equipment</SelectItem>
                              <SelectItem value="Subcontractor">Subcontractor</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input 
                            value={item.description}
                            onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                            placeholder="Description"
                          />
                        </TableCell>
                        <TableCell>
                          <Input 
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Select 
                            value={item.unit} 
                            onValueChange={(value) => updateLineItem(item.id, 'unit', value)}
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="each">each</SelectItem>
                              <SelectItem value="hours">hours</SelectItem>
                              <SelectItem value="sqft">sq ft</SelectItem>
                              <SelectItem value="lf">lin ft</SelectItem>
                              <SelectItem value="lot">lot</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input 
                            type="number"
                            value={item.rate}
                            onChange={(e) => updateLineItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                            className="w-24"
                            placeholder="0.00"
                          />
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">${item.amount.toLocaleString()}</span>
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => removeLineItem(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* File Attachments */}
              <div>
                <Label className="text-base font-semibold">Attachments</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <Button variant="outline">
                        Upload Plans or Sketches
                      </Button>
                      <p className="mt-2 text-sm text-gray-500">PDF, DWG, or image files</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Notes & Comments</Label>
                <Textarea 
                  id="notes" 
                  rows={4} 
                  placeholder="Add any additional notes or assumptions..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estimate Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="w-5 h-5 mr-2" />
                Estimate Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium">${subtotal.toLocaleString()}</span>
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

                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-green-600">${total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate PDF
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
                  <div key={estimate.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{estimate.name}</h4>
                      <Badge className={getStatusColor(estimate.status)}>{estimate.status}</Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{estimate.project}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-green-600">{estimate.amount}</span>
                      <span className="text-xs text-gray-500">{estimate.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
