import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Plus, Sparkles, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SkaiActivityAssistantProps {
  projectId: string;
  companyId: string;
  onActivityCreated: () => void;
}

interface ActivitySuggestion {
  name: string;
  description: string;
  cost_est: number;
  start_date?: string;
  end_date?: string;
}

export const SkaiActivityAssistant = ({ projectId, companyId, onActivityCreated }: SkaiActivityAssistantProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<ActivitySuggestion[]>([]);
  const [isCreatingActivities, setIsCreatingActivities] = useState(false);

  const handleGenerateActivities = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { 
          message: `Generate activity suggestions for a construction project based on this request: "${prompt.trim()}". 
          
          Please respond with a JSON array of activity objects, each with:
          - name: string (activity name)
          - description: string (detailed description)
          - cost_est: number (estimated cost in dollars)
          - start_date: string (optional, format: YYYY-MM-DD)
          - end_date: string (optional, format: YYYY-MM-DD)
          
          Example format:
          [
            {
              "name": "Site Preparation",
              "description": "Clear and level the construction site",
              "cost_est": 5000,
              "start_date": "2024-01-15",
              "end_date": "2024-01-20"
            }
          ]
          
          Generate 3-5 relevant activities. Only respond with the JSON array, no other text.`,
          context: {
            currentPage: 'project-activities',
            projectId,
            visibleData: {
              screenType: 'activity_management'
            }
          }
        }
      });

      if (error) throw error;

      // Try to parse the AI response as JSON
      let generatedActivities = [];
      try {
        const responseText = data?.response || data?.message || '';
        // Extract JSON from response if it contains other text
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        const jsonText = jsonMatch ? jsonMatch[0] : responseText;
        generatedActivities = JSON.parse(jsonText);
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        // Fallback: create a single activity based on the prompt
        generatedActivities = [{
          name: prompt.trim(),
          description: `Activity generated based on: ${prompt.trim()}`,
          cost_est: 1000
        }];
      }

      setSuggestions(generatedActivities);

      toast({
        title: "Activities Generated",
        description: `Skai generated ${generatedActivities.length} activity suggestions`,
      });

    } catch (error) {
      console.error('Error generating activities:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate activities. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateActivities = async () => {
    if (suggestions.length === 0) return;

    setIsCreatingActivities(true);
    try {
      const activitiesToCreate = suggestions.map(suggestion => ({
        project_id: projectId,
        company_id: companyId,
        name: suggestion.name,
        description: suggestion.description,
        cost_est: suggestion.cost_est,
        start_date: suggestion.start_date || null,
        end_date: suggestion.end_date || null
      }));

      const { data, error } = await supabase
        .from('activities')
        .insert(activitiesToCreate)
        .select();

      if (error) throw error;

      toast({
        title: "Activities Created",
        description: `Successfully created ${data.length} activities`,
      });

      setSuggestions([]);
      setPrompt('');
      setIsOpen(false);
      onActivityCreated();

    } catch (error) {
      console.error('Error creating activities:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create activities. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingActivities(false);
    }
  };

  const handleRemoveSuggestion = (index: number) => {
    setSuggestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditSuggestion = (index: number, field: keyof ActivitySuggestion, value: any) => {
    setSuggestions(prev => prev.map((suggestion, i) => 
      i === index ? { ...suggestion, [field]: value } : suggestion
    ));
  };

  const quickPrompts = [
    "Add carpentry work for the project",
    "Create plumbing activities for the building",
    "Generate electrical work activities",
    "Add site preparation and excavation work",
    "Create finishing work activities"
  ];

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="flex items-center space-x-2 border-dashed border-primary/50 hover:border-primary"
      >
        <Bot className="h-4 w-4" />
        <Sparkles className="h-4 w-4" />
        <span>Ask Skai to create activities</span>
      </Button>

      {isOpen && (
        <Card className="absolute top-12 right-0 w-96 z-50 shadow-xl border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Bot className="h-5 w-5 text-primary" />
              <span>Skai Activity Assistant</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Describe the activities you need:
              </label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Add carpentry work including framing, drywall installation, and finish carpentry for the residential project"
                rows={3}
                className="mb-2"
              />
              <div className="flex justify-between items-center">
                <Button 
                  onClick={handleGenerateActivities}
                  disabled={!prompt.trim() || isGenerating}
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span>{isGenerating ? 'Generating...' : 'Generate Activities'}</span>
                </Button>
                <Button 
                  onClick={() => setIsOpen(false)}
                  variant="ghost"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>

            {/* Quick Prompts */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">
                Quick prompts:
              </label>
              <div className="space-y-1">
                {quickPrompts.map((quickPrompt, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => setPrompt(quickPrompt)}
                    className="w-full text-left justify-start text-xs h-auto py-1 px-2"
                  >
                    {quickPrompt}
                  </Button>
                ))}
              </div>
            </div>

            {/* Activity Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Generated Activities ({suggestions.length})</h4>
                  <Button
                    onClick={handleCreateActivities}
                    disabled={isCreatingActivities}
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    {isCreatingActivities ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Plus className="h-3 w-3" />
                    )}
                    <span>{isCreatingActivities ? 'Creating...' : 'Create All'}</span>
                  </Button>
                </div>

                {suggestions.map((suggestion, index) => (
                  <Card key={index} className="border-dashed">
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <Input
                          value={suggestion.name}
                          onChange={(e) => handleEditSuggestion(index, 'name', e.target.value)}
                          className="font-medium text-sm"
                          placeholder="Activity name"
                        />
                        <Button
                          onClick={() => handleRemoveSuggestion(index)}
                          variant="ghost"
                          size="sm"
                          className="ml-2 h-6 w-6 p-0"
                        >
                          ×
                        </Button>
                      </div>
                      
                      <Textarea
                        value={suggestion.description}
                        onChange={(e) => handleEditSuggestion(index, 'description', e.target.value)}
                        className="text-xs"
                        rows={2}
                        placeholder="Description"
                      />
                      
                      <div className="flex items-center space-x-2 text-xs">
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-muted-foreground">$</span>
                          <Input
                            type="number"
                            value={suggestion.cost_est}
                            onChange={(e) => handleEditSuggestion(index, 'cost_est', parseFloat(e.target.value) || 0)}
                            className="text-xs h-7 w-20"
                            min="0"
                            step="100"
                            placeholder="Cost"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};