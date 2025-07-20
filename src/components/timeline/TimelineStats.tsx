import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, BarChart3, Target, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimelineStatsProps {
  totalEntries: number;
  totalDuration: number;
  stats: {
    totalHours: number;
    productiveHours: number;
    focusScore: number;
    entryCount: number;
    topTasks: { task: string; minutes: number }[];
  };
  screenSize: 'mobile' | 'tablet' | 'desktop';
}

export const TimelineStats = ({ totalEntries, totalDuration, stats, screenSize }: TimelineStatsProps) => {
  
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatHours = (hours: number) => {
    return `${hours}h`;
  };

  const getProgressColor = (score: number) => {
    if (score >= 70) return 'text-green-600 bg-green-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (screenSize === 'mobile') {
    return (
      <div className="grid grid-cols-2 gap-3">
        <Card className="backdrop-blur-xl bg-white/40 border-white/20">
          <CardContent className="p-4 text-center">
            <div className="flex flex-col items-center space-y-1">
              <Clock className="w-5 h-5 text-primary" />
              <div className="text-lg font-bold">{formatDuration(totalDuration)}</div>
              <div className="text-xs text-muted-foreground">Total Time</div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/40 border-white/20">
          <CardContent className="p-4 text-center">
            <div className="flex flex-col items-center space-y-1">
              <BarChart3 className="w-5 h-5 text-primary" />
              <div className="text-lg font-bold">{totalEntries}</div>
              <div className="text-xs text-muted-foreground">Entries</div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/40 border-white/20">
          <CardContent className="p-4 text-center">
            <div className="flex flex-col items-center space-y-1">
              <Target className="w-5 h-5 text-primary" />
              <div className="text-lg font-bold">{formatHours(stats.productiveHours)}</div>
              <div className="text-xs text-muted-foreground">Productive</div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/40 border-white/20">
          <CardContent className="p-4 text-center">
            <div className="flex flex-col items-center space-y-1">
              <TrendingUp className="w-5 h-5 text-primary" />
              <Badge className={cn("text-xs font-bold", getProgressColor(stats.focusScore))}>
                {stats.focusScore}%
              </Badge>
              <div className="text-xs text-muted-foreground">Focus Score</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn(
      "grid gap-4",
      screenSize === 'tablet' ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-4'
    )}>
      <Card className="backdrop-blur-xl bg-white/40 border-white/20 hover:shadow-lg transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Time</p>
              <p className="text-2xl font-bold">{formatDuration(totalDuration)}</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg">
              <Clock className="w-6 h-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-xl bg-white/40 border-white/20 hover:shadow-lg transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Entries</p>
              <p className="text-2xl font-bold">{totalEntries}</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-xl bg-white/40 border-white/20 hover:shadow-lg transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Productive Time</p>
              <p className="text-2xl font-bold">{formatHours(stats.productiveHours)}</p>
            </div>
            <div className="p-3 bg-green-500/10 rounded-lg">
              <Target className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-xl bg-white/40 border-white/20 hover:shadow-lg transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Focus Score</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold">{stats.focusScore}%</p>
                <Badge 
                  className={cn(
                    "text-xs",
                    getProgressColor(stats.focusScore)
                  )}
                >
                  {stats.focusScore >= 70 ? 'Excellent' : stats.focusScore >= 40 ? 'Good' : 'Needs Work'}
                </Badge>
              </div>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};