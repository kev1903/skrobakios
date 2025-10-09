import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, X, CheckCircle, AlertTriangle, Info, AlertCircle, TrendingUp, DollarSign, Clock, Users, Shield, Target } from 'lucide-react';
import { useAiSuggestions, AiSuggestion } from '@/hooks/useAiSuggestions';
import { useNavigate } from 'react-router-dom';

interface AiSuggestionsPanelProps {
  projectId?: string;
  companyId?: string;
  userId?: string;
  compact?: boolean;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical': return 'destructive';
    case 'high': return 'default';
    case 'medium': return 'secondary';
    case 'low': return 'outline';
    default: return 'secondary';
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'alert': return AlertCircle;
    case 'warning': return AlertTriangle;
    case 'insight': return Sparkles;
    case 'suggestion': return Info;
    default: return Info;
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'budget': return DollarSign;
    case 'timeline': return Clock;
    case 'tasks': return CheckCircle;
    case 'resources': return Users;
    case 'risk': return Shield;
    case 'quality': return Target;
    default: return TrendingUp;
  }
};

export const AiSuggestionsPanel: React.FC<AiSuggestionsPanelProps> = ({
  projectId,
  companyId,
  userId,
  compact = false
}) => {
  const { suggestions, loading, generateSuggestions, dismissSuggestion, markAsActioned } = useAiSuggestions(projectId, companyId);
  const navigate = useNavigate();

  const handleGenerateSuggestions = async () => {
    if (projectId && companyId && userId) {
      await generateSuggestions(projectId, companyId, userId);
    }
  };

  const handleAction = (suggestion: AiSuggestion, actionLink: string | null) => {
    if (actionLink) {
      navigate(actionLink);
    }
    markAsActioned(suggestion.id);
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-20 bg-muted rounded"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>SkAI Insights</CardTitle>
          </div>
          {projectId && companyId && userId && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateSuggestions}
              className="text-xs"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Refresh
            </Button>
          )}
        </div>
        <CardDescription>
          AI-powered suggestions and alerts for your project
        </CardDescription>
      </CardHeader>
      <CardContent>
        {suggestions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No active suggestions at the moment.</p>
            <p className="text-xs mt-1">Check back later for AI-powered insights.</p>
          </div>
        ) : (
          <ScrollArea className={compact ? "h-[400px]" : "h-[600px]"}>
            <div className="space-y-3">
              {suggestions.map((suggestion) => {
                const TypeIcon = getTypeIcon(suggestion.suggestion_type);
                const CategoryIcon = getCategoryIcon(suggestion.category);
                
                return (
                  <Card 
                    key={suggestion.id} 
                    className={`relative border-l-4 ${
                      suggestion.priority === 'critical' ? 'border-l-red-500' :
                      suggestion.priority === 'high' ? 'border-l-orange-500' :
                      suggestion.priority === 'medium' ? 'border-l-yellow-500' :
                      'border-l-blue-500'
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2 flex-1">
                          <TypeIcon className={`h-5 w-5 mt-0.5 ${
                            suggestion.suggestion_type === 'alert' ? 'text-red-500' :
                            suggestion.suggestion_type === 'warning' ? 'text-orange-500' :
                            'text-primary'
                          }`} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <CardTitle className="text-sm">{suggestion.title}</CardTitle>
                              <Badge variant={getPriorityColor(suggestion.priority) as any} className="text-xs">
                                {suggestion.priority}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <CategoryIcon className="h-3 w-3" />
                              <span className="capitalize">{suggestion.category}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => dismissSuggestion(suggestion.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-3">
                        {suggestion.description}
                      </p>
                      {suggestion.action_items && suggestion.action_items.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {suggestion.action_items.map((item, idx) => (
                            <Button
                              key={idx}
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => handleAction(suggestion, item.link)}
                            >
                              {item.action}
                            </Button>
                          ))}
                        </div>
                      )}
                      {suggestion.actioned && (
                        <div className="flex items-center gap-1 text-xs text-green-600 mt-2">
                          <CheckCircle className="h-3 w-3" />
                          <span>Actioned</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};