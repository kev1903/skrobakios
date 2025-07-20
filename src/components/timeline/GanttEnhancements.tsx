import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Clock, 
  Target, 
  AlertTriangle,
  TrendingUp,
  FileText,
  Download,
  Settings
} from 'lucide-react';
import { format } from 'date-fns';

interface ProjectMetrics {
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  totalBudget: number;
  spentBudget: number;
  criticalPathLength: number;
  projectHealth: 'good' | 'warning' | 'critical';
}

interface GanttEnhancementsProps {
  metrics: ProjectMetrics;
  onExport?: (format: 'pdf' | 'excel' | 'mpp') => void;
  onSettings?: () => void;
}

export const GanttEnhancements = ({ 
  metrics, 
  onExport, 
  onSettings 
}: GanttEnhancementsProps) => {
  const [showMetrics, setShowMetrics] = useState(true);

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'good': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const progressPercentage = Math.round((metrics.completedTasks / metrics.totalTasks) * 100);
  const budgetUsagePercentage = Math.round((metrics.spentBudget / metrics.totalBudget) * 100);

  if (!showMetrics) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setShowMetrics(true)}
        className="fixed top-4 right-4 z-50"
      >
        <TrendingUp className="h-4 w-4 mr-2" />
        Show Metrics
      </Button>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50 w-80 space-y-4">
      {/* Project Health Card */}
      <Card className="backdrop-blur-xl bg-white/90 border-white/20 shadow-xl">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Project Health</CardTitle>
            <div className="flex items-center gap-2">
              <Badge className={getHealthColor(metrics.projectHealth)}>
                {metrics.projectHealth.toUpperCase()}
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowMetrics(false)}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Task Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span>Task Progress</span>
              </div>
              <span className="font-medium">{metrics.completedTasks}/{metrics.totalTasks}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {progressPercentage}% complete
            </div>
          </div>

          {/* Budget Usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span>Budget Usage</span>
              </div>
              <span className="font-medium">
                ${metrics.spentBudget.toLocaleString()}/${metrics.totalBudget.toLocaleString()}
              </span>
            </div>
            <Progress 
              value={budgetUsagePercentage} 
              className={`h-2 ${budgetUsagePercentage > 90 ? '[&>div]:bg-red-500' : budgetUsagePercentage > 75 ? '[&>div]:bg-yellow-500' : ''}`}
            />
            <div className="text-xs text-muted-foreground">
              {budgetUsagePercentage}% spent
            </div>
          </div>

          {/* Critical Issues */}
          {metrics.overdueTasks > 0 && (
            <div className="p-2 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-2 text-sm text-red-800">
                <AlertTriangle className="h-4 w-4" />
                <span>{metrics.overdueTasks} overdue tasks</span>
              </div>
            </div>
          )}

          {/* Critical Path */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-orange-600" />
              <span>Critical Path</span>
            </div>
            <span className="font-medium">{metrics.criticalPathLength} days</span>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Card */}
      <Card className="backdrop-blur-xl bg-white/90 border-white/20 shadow-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onExport?.('pdf')}
              className="text-xs"
            >
              <FileText className="h-3 w-3 mr-1" />
              PDF
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onExport?.('excel')}
              className="text-xs"
            >
              <Download className="h-3 w-3 mr-1" />
              Excel
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onExport?.('mpp')}
              className="text-xs"
            >
              <Calendar className="h-3 w-3 mr-1" />
              Project
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onSettings}
              className="text-xs"
            >
              <Settings className="h-3 w-3 mr-1" />
              Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Today's Focus */}
      <Card className="backdrop-blur-xl bg-white/90 border-white/20 shadow-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Today's Focus</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </div>
          <div className="mt-2 space-y-1">
            <div className="text-sm">• Review critical path tasks</div>
            <div className="text-sm">• Update task progress</div>
            <div className="text-sm">• Address overdue items</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};