import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface AIPromptSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIPromptSettings = ({ isOpen, onClose }: AIPromptSettingsProps) => {
  const systemPrompt = `You are an expert at extracting invoice data from PDFs. Extract ALL line items from the invoice - do not miss any products, materials, or services listed. Payment terms like 'deposit due' or 'balance due' are NOT line items. Focus on extracting the actual goods/services being invoiced. Return valid JSON only.`;
  
  const userPrompt = `Extract ALL line items from this invoice PDF. Include every single product, material, or service listed with their descriptions, quantities, rates, and amounts. Do not extract payment terms as line items. Also extract supplier, invoice_number, dates, subtotal, tax, and total.`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            AI Invoice Extraction Settings
            <Badge variant="secondary">GPT-4o-mini</Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">System Prompt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap border">
                {systemPrompt}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">User Prompt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap border">
                {userPrompt}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Model</div>
                  <div className="text-sm">gpt-4o-mini</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Temperature</div>
                  <div className="text-sm">0.1</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Response Format</div>
                  <div className="text-sm">JSON Schema (Structured Output)</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Purpose</div>
                  <div className="text-sm">Invoice Data Extraction</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Extracted Fields</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Badge variant="outline">supplier</Badge>
                <Badge variant="outline">invoice_number</Badge>
                <Badge variant="outline">invoice_date</Badge>
                <Badge variant="outline">due_date</Badge>
                <Badge variant="outline">subtotal</Badge>
                <Badge variant="outline">tax</Badge>
                <Badge variant="outline">total</Badge>
                <Badge variant="outline">line_items[]</Badge>
                <Badge variant="outline">ai_summary</Badge>
                <Badge variant="outline">ai_confidence</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};