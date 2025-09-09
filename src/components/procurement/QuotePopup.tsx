import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface QuotePopupProps {
  isOpen: boolean;
  onClose: () => void;
  wbsItem?: {
    wbsId: string;
    title: string;
  };
  contractor?: {
    contractorId: string;
    contractorName: string;
  };
  projectId: string;
}

export const QuotePopup: React.FC<QuotePopupProps> = ({
  isOpen,
  onClose,
  wbsItem,
  contractor,
  projectId
}) => {
  const [quoteData, setQuoteData] = useState({
    amount: '',
    description: '',
    leadTime: '',
    validUntil: '',
    notes: ''
  });

  const handleSave = () => {
    // TODO: Save quote data to database
    console.log('Saving quote:', { ...quoteData, wbsItem, contractor, projectId });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="p-6 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-foreground">
                {wbsItem?.wbsId} - {wbsItem?.title}
              </DialogTitle>
              <p className="text-muted-foreground mt-1">
                {wbsItem?.wbsId} - {wbsItem?.title}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Content with Tabs */}
        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="rfq" className="h-full">
            <TabsList className="w-full justify-start px-6 py-0 h-12 bg-muted/30 border-b rounded-none">
              <TabsTrigger value="rfq" className="px-6 py-3">RFQ</TabsTrigger>
              <TabsTrigger value="quote" className="px-6 py-3">Quote</TabsTrigger>
              <TabsTrigger value="review" className="px-6 py-3">Review</TabsTrigger>
            </TabsList>

            {/* RFQ Tab */}
            <TabsContent value="rfq" className="p-6 space-y-6 mt-0">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>WBS Code</Label>
                    <Input 
                      value={wbsItem?.wbsId || ''} 
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contractor</Label>
                    <Input 
                      value={contractor?.contractorName || ''} 
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>RFQ Requirements</Label>
                  <Textarea
                    placeholder="Define the scope and requirements for this RFQ..."
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Additional Requirements</Label>
                  <Textarea
                    placeholder="Any special requirements, certifications, or conditions..."
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Quote Tab */}
            <TabsContent value="quote" className="p-6 space-y-6 mt-0">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Quote Amount (Inc GST) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={quoteData.amount}
                      onChange={(e) => setQuoteData(prev => ({ ...prev, amount: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="leadTime">Lead Time (Days)</Label>
                    <Input
                      id="leadTime"
                      type="number"
                      placeholder="Enter lead time"
                      value={quoteData.leadTime}
                      onChange={(e) => setQuoteData(prev => ({ ...prev, leadTime: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="validUntil">Valid Until</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={quoteData.validUntil}
                    onChange={(e) => setQuoteData(prev => ({ ...prev, validUntil: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Scope Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the scope of work covered by this quote..."
                    rows={4}
                    value={quoteData.description}
                    onChange={(e) => setQuoteData(prev => ({ ...prev, description: e.target.value }))}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional notes or conditions..."
                    rows={3}
                    value={quoteData.notes}
                    onChange={(e) => setQuoteData(prev => ({ ...prev, notes: e.target.value }))}
                    className="resize-none"
                  />
                </div>

                {/* Quote Summary */}
                {quoteData.amount && (
                  <div className="bg-muted/30 p-4 rounded-lg border">
                    <h3 className="font-semibold mb-2">Quote Summary</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Amount (Inc GST): </span>
                        <span className="font-medium">{formatCurrency(Number(quoteData.amount))}</span>
                      </div>
                      {quoteData.leadTime && (
                        <div>
                          <span className="text-muted-foreground">Lead Time: </span>
                          <span className="font-medium">{quoteData.leadTime} days</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Review Tab */}
            <TabsContent value="review" className="p-6 space-y-6 mt-0">
              <div className="space-y-6">
                <div className="bg-muted/30 p-4 rounded-lg border">
                  <h3 className="font-semibold mb-4">Quote Review Summary</h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">WBS Code</Label>
                        <p className="text-sm text-muted-foreground">{wbsItem?.wbsId}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Contractor</Label>
                        <p className="text-sm text-muted-foreground">{contractor?.contractorName}</p>
                      </div>
                    </div>
                    
                    {quoteData.amount && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Quote Amount</Label>
                          <p className="text-lg font-semibold text-primary">{formatCurrency(Number(quoteData.amount))}</p>
                        </div>
                        {quoteData.leadTime && (
                          <div>
                            <Label className="text-sm font-medium">Lead Time</Label>
                            <p className="text-sm text-muted-foreground">{quoteData.leadTime} days</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {quoteData.validUntil && (
                      <div>
                        <Label className="text-sm font-medium">Valid Until</Label>
                        <p className="text-sm text-muted-foreground">{quoteData.validUntil}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Evaluation Notes</Label>
                  <Textarea
                    placeholder="Add evaluation notes, recommendations, or concerns..."
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Compliance Status</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compliant">Compliant</SelectItem>
                        <SelectItem value="non-compliant">Non-Compliant</SelectItem>
                        <SelectItem value="pending">Pending Review</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Recommendation</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select recommendation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="approve">Approve</SelectItem>
                        <SelectItem value="reject">Reject</SelectItem>
                        <SelectItem value="negotiate">Negotiate</SelectItem>
                        <SelectItem value="clarify">Request Clarification</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-muted/30 flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!quoteData.amount}
          >
            Save Quote
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};