import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface CategoryAIConfigDialogProps {
  category: {
    id: string;
    name: string;
    ai_prompt?: string | null;
    ai_instructions?: string | null;
    ai_guardrails?: string | null;
    ai_framework?: string | null;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

export const CategoryAIConfigDialog: React.FC<CategoryAIConfigDialogProps> = ({
  category,
  open,
  onOpenChange,
  onSave
}) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [prompt, setPrompt] = useState(category?.ai_prompt || '');
  const [instructions, setInstructions] = useState(category?.ai_instructions || '');
  const [guardrails, setGuardrails] = useState(category?.ai_guardrails || '');
  const [framework, setFramework] = useState(category?.ai_framework || '');

  React.useEffect(() => {
    if (category) {
      setPrompt(category.ai_prompt || '');
      setInstructions(category.ai_instructions || '');
      setGuardrails(category.ai_guardrails || '');
      setFramework(category.ai_framework || '');
    }
  }, [category]);

  const handleSave = async () => {
    if (!category) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('document_categories')
        .update({
          ai_prompt: prompt,
          ai_instructions: instructions,
          ai_guardrails: guardrails,
          ai_framework: framework
        })
        .eq('id', category.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "AI configuration saved successfully"
      });

      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving AI config:', error);
      toast({
        title: "Error",
        description: "Failed to save AI configuration",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (!category) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure SkAi Analysis for {category.name}</DialogTitle>
          <DialogDescription>
            Define how SkAi should analyze documents in this category
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="prompt">AI Prompt</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Define the main analysis prompt for this document category..."
              className="min-h-[120px]"
            />
            <p className="text-xs text-muted-foreground">
              The primary directive for SkAi when analyzing documents in this category
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Provide specific instructions for analysis..."
              className="min-h-[120px]"
            />
            <p className="text-xs text-muted-foreground">
              Step-by-step instructions for SkAi to follow during analysis
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="guardrails">Guardrails</Label>
            <Textarea
              id="guardrails"
              value={guardrails}
              onChange={(e) => setGuardrails(e.target.value)}
              placeholder="Define constraints and limitations..."
              className="min-h-[120px]"
            />
            <p className="text-xs text-muted-foreground">
              Safety constraints and boundaries for SkAi analysis
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="framework">Framework</Label>
            <Textarea
              id="framework"
              value={framework}
              onChange={(e) => setFramework(e.target.value)}
              placeholder="Define the analysis framework and methodology..."
              className="min-h-[120px]"
            />
            <p className="text-xs text-muted-foreground">
              The structured approach or methodology for document analysis
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Configuration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
