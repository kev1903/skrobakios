import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Package, FileText, Building2, CheckCircle2, Download, Hammer, Calendar, FileCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { invokeEdge } from "@/lib/invokeEdge";
import ReactMarkdown from 'react-markdown';

interface ScopeGenerationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  companyId: string;
  documents: any[];
}

export const ScopeGenerationDialog = ({ 
  open, 
  onOpenChange, 
  projectId, 
  companyId,
  documents 
}: ScopeGenerationDialogProps) => {
  const { toast } = useToast();
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generatedScope, setGeneratedScope] = useState<any>(null);

  // Filter documents that have structured data
  const analyzedDocs = documents.filter(doc => 
    doc.processing_status === 'completed' && doc.metadata
  );

  const handleGenerateScope = async () => {
    if (selectedDocs.length === 0) {
      toast({
        title: "No Documents Selected",
        description: "Please select at least one analyzed document",
        variant: "destructive"
      });
      return;
    }

    setGenerating(true);

    try {
      const result = await invokeEdge('generate-project-scope', {
        projectId,
        companyId,
        documentIds: selectedDocs
      });

      if (result.error) {
        throw new Error(result.error);
      }

      setGeneratedScope(result.scope);
      
      toast({
        title: "Scope Generated Successfully",
        description: `Analyzed ${result.documents_analyzed} documents with ${result.total_scope_items} scope items`,
      });
    } catch (error) {
      console.error('Error generating scope:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate scope",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedDocs.length === analyzedDocs.length) {
      setSelectedDocs([]);
    } else {
      setSelectedDocs(analyzedDocs.map(d => d.id));
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    // Simple CSV export
    const headers = Object.keys(data[0] || {});
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Generate Project Scope from Drawings
          </DialogTitle>
          <DialogDescription>
            Select analyzed drawings to automatically generate a comprehensive project scope, including Bill of Quantities and work breakdown
          </DialogDescription>
        </DialogHeader>

        {!generatedScope ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedDocs.length === analyzedDocs.length && analyzedDocs.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm font-medium">
                  Select All ({selectedDocs.length} of {analyzedDocs.length} selected)
                </span>
              </div>
              <Button
                onClick={handleGenerateScope}
                disabled={generating || selectedDocs.length === 0}
                className="gap-2"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Hammer className="h-4 w-4" />
                    Generate Scope
                  </>
                )}
              </Button>
            </div>

            <ScrollArea className="h-[500px] border rounded-md p-4">
              {analyzedDocs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No analyzed drawings found</p>
                  <p className="text-sm mt-1">Upload and analyze construction drawings first</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {analyzedDocs.map((doc) => (
                    <Card
                      key={doc.id}
                      className={`p-3 cursor-pointer transition-colors ${
                        selectedDocs.includes(doc.id) ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => {
                        setSelectedDocs(prev =>
                          prev.includes(doc.id)
                            ? prev.filter(id => id !== doc.id)
                            : [...prev, doc.id]
                        );
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedDocs.includes(doc.id)}
                          onCheckedChange={(checked) => {
                            setSelectedDocs(prev =>
                              checked
                                ? [...prev, doc.id]
                                : prev.filter(id => id !== doc.id)
                            );
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="font-medium truncate">{doc.name}</span>
                          </div>
                          {doc.metadata?.drawing_info && (
                            <div className="flex gap-2 flex-wrap text-xs">
                              <Badge variant="outline">{doc.metadata.drawing_info.type}</Badge>
                              {doc.metadata.construction_scope && (
                                <Badge variant="secondary">
                                  {doc.metadata.construction_scope.length} scope items
                                </Badge>
                              )}
                              {doc.metadata.spaces && (
                                <Badge variant="secondary">
                                  {doc.metadata.spaces.length} spaces
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        {selectedDocs.includes(doc.id) && (
                          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        ) : (
          <Tabs defaultValue="summary" className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="summary">
                <FileText className="h-4 w-4 mr-2" />
                Summary
              </TabsTrigger>
              <TabsTrigger value="boq">
                <Package className="h-4 w-4 mr-2" />
                Bill of Quantities
              </TabsTrigger>
              <TabsTrigger value="wbs">
                <Calendar className="h-4 w-4 mr-2" />
                Work Breakdown
              </TabsTrigger>
              <TabsTrigger value="schedules">
                <FileCheck className="h-4 w-4 mr-2" />
                Schedules
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 mt-4">
              <TabsContent value="summary" className="mt-0">
                <Card className="p-6">
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{generatedScope.scope_summary}</ReactMarkdown>
                  </div>

                  {generatedScope.spaces_summary && (
                    <div className="mt-6 grid grid-cols-3 gap-4">
                      <Card className="p-4 border-l-4 border-l-primary">
                        <div className="text-2xl font-bold">{generatedScope.spaces_summary.total_spaces}</div>
                        <div className="text-sm text-muted-foreground">Total Spaces</div>
                      </Card>
                      <Card className="p-4 border-l-4 border-l-primary">
                        <div className="text-2xl font-bold">{generatedScope.spaces_summary.total_area.toFixed(0)}m²</div>
                        <div className="text-sm text-muted-foreground">Total Floor Area</div>
                      </Card>
                      <Card className="p-4 border-l-4 border-l-primary">
                        <div className="text-2xl font-bold">{generatedScope.bill_of_quantities.length}</div>
                        <div className="text-sm text-muted-foreground">Construction Categories</div>
                      </Card>
                    </div>
                  )}

                  {generatedScope.compliance_summary && generatedScope.compliance_summary.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-semibold mb-3">Compliance Requirements</h3>
                      <div className="space-y-2">
                        {generatedScope.compliance_summary.map((comp: any, idx: number) => (
                          <Card key={idx} className="p-3">
                            <div className="font-medium">{comp.standard}</div>
                            <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                              {comp.requirements.map((req: string, ridx: number) => (
                                <li key={ridx}>• {req}</li>
                              ))}
                            </ul>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="boq" className="mt-0">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Bill of Quantities by Category</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const allItems = generatedScope.bill_of_quantities.flatMap((cat: any) =>
                          cat.items.map((item: any) => ({
                            category: cat.category,
                            ...item
                          }))
                        );
                        exportToCSV(allItems, 'bill-of-quantities.csv');
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>

                  {generatedScope.bill_of_quantities.map((category: any, idx: number) => (
                    <Card key={idx} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-lg">{category.category}</h4>
                        <Badge>{category.total_items} items</Badge>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Description</th>
                              <th className="text-left p-2">Material</th>
                              <th className="text-right p-2">Quantity</th>
                              <th className="text-left p-2">Unit</th>
                              <th className="text-left p-2">Specifications</th>
                            </tr>
                          </thead>
                          <tbody>
                            {category.items.map((item: any, itemIdx: number) => (
                              <tr key={itemIdx} className="border-b hover:bg-muted/50">
                                <td className="p-2 font-medium">{item.description}</td>
                                <td className="p-2">{item.material}</td>
                                <td className="p-2 text-right">{item.quantity.toFixed(2)}</td>
                                <td className="p-2">{item.unit}</td>
                                <td className="p-2 text-xs">{item.specifications || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="wbs" className="mt-0">
                <div className="space-y-4">
                  <h3 className="font-semibold">Construction Phases & Work Packages</h3>
                  {generatedScope.work_breakdown.map((phase: any, idx: number) => (
                    <Card key={idx} className="p-4">
                      <div className="flex items-start gap-3">
                        <Badge className="mt-1">{idx + 1}</Badge>
                        <div className="flex-1">
                          <h4 className="font-semibold mb-2">{phase.phase}</h4>
                          <div className="space-y-2">
                            <div>
                              <div className="text-sm text-muted-foreground mb-1">Required Trades:</div>
                              <div className="flex gap-1 flex-wrap">
                                {phase.trades.map((trade: string, tidx: number) => (
                                  <Badge key={tidx} variant="secondary">{trade}</Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground mb-1">Elements:</div>
                              <div className="text-sm">{phase.elements.slice(0, 5).join(', ')}
                                {phase.elements.length > 5 && ` +${phase.elements.length - 5} more`}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="schedules" className="mt-0">
                <div className="space-y-4">
                  {generatedScope.material_schedules.doors.length > 0 && (
                    <Card className="p-4">
                      <h4 className="font-semibold mb-3">Door Schedule ({generatedScope.material_schedules.doors.length})</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Type</th>
                              <th className="text-left p-2">Size</th>
                              <th className="text-left p-2">Material</th>
                              <th className="text-right p-2">Quantity</th>
                              <th className="text-left p-2">Location</th>
                            </tr>
                          </thead>
                          <tbody>
                            {generatedScope.material_schedules.doors.map((door: any, idx: number) => (
                              <tr key={idx} className="border-b hover:bg-muted/50">
                                <td className="p-2">{door.type}</td>
                                <td className="p-2">
                                  {door.dimensions?.width && door.dimensions?.height
                                    ? `${door.dimensions.width} × ${door.dimensions.height}mm`
                                    : '-'}
                                </td>
                                <td className="p-2">{door.material || '-'}</td>
                                <td className="p-2 text-right">{door.quantity || 1}</td>
                                <td className="p-2">{door.location || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  )}

                  {generatedScope.material_schedules.windows.length > 0 && (
                    <Card className="p-4">
                      <h4 className="font-semibold mb-3">Window Schedule ({generatedScope.material_schedules.windows.length})</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Type</th>
                              <th className="text-left p-2">Size</th>
                              <th className="text-left p-2">Material</th>
                              <th className="text-right p-2">Quantity</th>
                              <th className="text-left p-2">Location</th>
                            </tr>
                          </thead>
                          <tbody>
                            {generatedScope.material_schedules.windows.map((window: any, idx: number) => (
                              <tr key={idx} className="border-b hover:bg-muted/50">
                                <td className="p-2">{window.type}</td>
                                <td className="p-2">
                                  {window.dimensions?.width && window.dimensions?.height
                                    ? `${window.dimensions.width} × ${window.dimensions.height}mm`
                                    : '-'}
                                </td>
                                <td className="p-2">{window.material || '-'}</td>
                                <td className="p-2 text-right">{window.quantity || 1}</td>
                                <td className="p-2">{window.location || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </ScrollArea>

            <div className="flex justify-between items-center pt-4 border-t mt-4">
              <Button
                variant="outline"
                onClick={() => setGeneratedScope(null)}
              >
                Back to Document Selection
              </Button>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Full Scope
                </Button>
                <Button onClick={() => onOpenChange(false)}>
                  Done
                </Button>
              </div>
            </div>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};
