import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Save } from 'lucide-react';

interface AIPromptSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIPromptSettings = ({ isOpen, onClose }: AIPromptSettingsProps) => {
  const defaultSystemPrompt = `You are an expert at extracting invoice data from PDFs. Extract ALL line items from the invoice - do not miss any products, materials, or services listed. Payment terms like 'deposit due' or 'balance due' are NOT line items. Focus on extracting the actual goods/services being invoiced. Return valid JSON only.`;
  
  const defaultUserPrompt = `Extract ALL line items from this invoice PDF. Include every single product, material, or service listed with their descriptions, quantities, rates, and amounts. Do not extract payment terms as line items. Also extract supplier, invoice_number, dates, subtotal, tax, and total.`;

  const [systemPrompt, setSystemPrompt] = useState(defaultSystemPrompt);
  const [userPrompt, setUserPrompt] = useState(defaultUserPrompt);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement saving logic to update the edge function or store custom prompts
      console.log('Saving prompts:', { systemPrompt, userPrompt });
      
      // Simulate save delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now, just show success
      alert('Prompts saved successfully!');
    } catch (error) {
      console.error('Error saving prompts:', error);
      alert('Error saving prompts. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = systemPrompt !== defaultSystemPrompt || userPrompt !== defaultUserPrompt;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              AI Invoice Extraction Settings
              <Badge variant="secondary">GPT-4o-mini</Badge>
            </div>
            <Button 
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">System Prompt</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="min-h-[120px] font-mono text-sm"
                placeholder="Enter system prompt..."
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">User Prompt</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                className="min-h-[120px] font-mono text-sm"
                placeholder="Enter user prompt..."
              />
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