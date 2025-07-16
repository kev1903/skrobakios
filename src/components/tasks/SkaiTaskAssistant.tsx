import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Plus, Sparkles, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SkaiTaskAssistantProps {
  projectId: string;
  onTaskCreated: () => void;
}

interface TaskSuggestion {
  task_name: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  duration: number;
  dependencies?: string[];
}

export const SkaiTaskAssistant = ({ projectId, onTaskCreated }: SkaiTaskAssistantProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([]);
  const [isCreatingTasks, setIsCreatingTasks] = useState(false);

  const handleGenerateTasks = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-task-generator', {
        body: { 
          prompt: prompt.trim(),
          projectId,
          context: 'task_generation'
        }
      });

      if (error) throw error;

      const generatedTasks = data?.tasks || [];
      setSuggestions(generatedTasks);

      toast({
        title: "Tasks Generated",
        description: `Skai generated ${generatedTasks.length} task suggestions`,
      });

    } catch (error) {
      console.error('Error generating tasks:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate tasks. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateTasks = async () => {
    if (suggestions.length === 0) return;

    setIsCreatingTasks(true);
    try {
      const tasksToCreate = suggestions.map(suggestion => ({
        project_id: projectId,
        task_name: suggestion.task_name,
        description: suggestion.description,
        priority: suggestion.priority,
        category: suggestion.category,
        duration: suggestion.duration,
        status: 'todo',
        progress: 0,
        assigned_to_name: '',
        assigned_to_avatar: ''
      }));

      const { data, error } = await supabase
        .from('tasks')
        .insert(tasksToCreate)
        .select();

      if (error) throw error;

      toast({
        title: "Tasks Created",
        description: `Successfully created ${data.length} tasks`,
      });

      setSuggestions([]);
      setPrompt('');
      setIsOpen(false);
      onTaskCreated();

    } catch (error) {
      console.error('Error creating tasks:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create tasks. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingTasks(false);
    }
  };

  const handleRemoveSuggestion = (index: number) => {
    setSuggestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditSuggestion = (index: number, field: keyof TaskSuggestion, value: any) => {
    setSuggestions(prev => prev.map((suggestion, i) => 
      i === index ? { ...suggestion, [field]: value } : suggestion
    ));
  };

  const quickPrompts = [
    "Create tasks for setting up a new React project",
    "Generate tasks for a marketing campaign launch",
    "Create tasks for database migration",
    "Generate tasks for user testing phase",
    "Create tasks for mobile app deployment"
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
        <span>Ask Skai to create tasks</span>
      </Button>

      {isOpen && (
        <Card className="absolute top-12 right-0 w-96 z-50 shadow-xl border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Bot className="h-5 w-5 text-primary" />
              <span>Skai Task Assistant</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Describe the tasks you need:
              </label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Create tasks for building a user authentication system with email/password login, social login, and password reset functionality"
                rows={3}
                className="mb-2"
              />
              <div className="flex justify-between items-center">
                <Button 
                  onClick={handleGenerateTasks}
                  disabled={!prompt.trim() || isGenerating}
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span>{isGenerating ? 'Generating...' : 'Generate Tasks'}</span>
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

            {/* Task Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Generated Tasks ({suggestions.length})</h4>
                  <Button
                    onClick={handleCreateTasks}
                    disabled={isCreatingTasks}
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    {isCreatingTasks ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Plus className="h-3 w-3" />
                    )}
                    <span>{isCreatingTasks ? 'Creating...' : 'Create All'}</span>
                  </Button>
                </div>

                {suggestions.map((suggestion, index) => (
                  <Card key={index} className="border-dashed">
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <Input
                          value={suggestion.task_name}
                          onChange={(e) => handleEditSuggestion(index, 'task_name', e.target.value)}
                          className="font-medium text-sm"
                          placeholder="Task name"
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
                        <select
                          value={suggestion.priority}
                          onChange={(e) => handleEditSuggestion(index, 'priority', e.target.value)}
                          className="rounded border px-2 py-1 text-xs"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                        
                        <Input
                          type="text"
                          value={suggestion.category}
                          onChange={(e) => handleEditSuggestion(index, 'category', e.target.value)}
                          className="text-xs h-7"
                          placeholder="Category"
                        />
                        
                        <div className="flex items-center space-x-1">
                          <Input
                            type="number"
                            value={suggestion.duration}
                            onChange={(e) => handleEditSuggestion(index, 'duration', parseInt(e.target.value) || 1)}
                            className="text-xs h-7 w-12"
                            min="1"
                          />
                          <span className="text-xs text-muted-foreground">h</span>
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