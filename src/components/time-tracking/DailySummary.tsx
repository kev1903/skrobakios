import React from 'react';
import { Clock, Target, TrendingUp, List, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface DailySummaryProps {
  stats: {
    totalHours: number;
    productiveHours: number;
    focusScore: number;
    entryCount: number;
    topTasks: Array<{ task: string; minutes: number }>;
  };
}

export const DailySummary = ({ stats }: DailySummaryProps) => {
  const formatHours = (hours: number) => {
    return hours === 1 ? '1 hour' : `${hours} hours`;
  };

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Hours */}
      <Card className="border-white/20 bg-white/10 backdrop-blur-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white/90 font-helvetica">
            Total Hours
          </CardTitle>
          <Clock className="h-4 w-4 text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white font-playfair">
            {formatHours(stats.totalHours)}
          </div>
          <p className="text-xs text-white/60 font-helvetica">
            Tracked today
          </p>
        </CardContent>
      </Card>

      {/* Productive Hours */}
      <Card className="border-white/20 bg-white/10 backdrop-blur-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white/90 font-helvetica">
            Productive Hours
          </CardTitle>
          <Target className="h-4 w-4 text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white font-playfair">
            {formatHours(stats.productiveHours)}
          </div>
          <div className="mt-2">
            <Progress 
              value={stats.totalHours > 0 ? (stats.productiveHours / stats.totalHours) * 100 : 0}
              className="h-2"
            />
          </div>
          <p className="text-xs text-white/60 mt-2 font-helvetica">
            {stats.totalHours > 0 
              ? `${Math.round((stats.productiveHours / stats.totalHours) * 100)}% of total time`
              : 'No time tracked yet'
            }
          </p>
        </CardContent>
      </Card>

      {/* Focus Score */}
      <Card className="border-white/20 bg-white/10 backdrop-blur-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white/90 font-helvetica">
            Focus Score
          </CardTitle>
          <Award className="h-4 w-4 text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white font-playfair">
            {stats.focusScore}%
          </div>
          <div className="mt-2">
            <Progress 
              value={stats.focusScore}
              className="h-2"
            />
          </div>
          <p className="text-xs text-white/60 mt-2 font-helvetica">
            Time spent in deep work
          </p>
        </CardContent>
      </Card>

      {/* Entry Count */}
      <Card className="border-white/20 bg-white/10 backdrop-blur-xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white/90 font-helvetica">
            Time Entries
          </CardTitle>
          <List className="h-4 w-4 text-orange-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white font-playfair">
            {stats.entryCount}
          </div>
          <p className="text-xs text-white/60 font-helvetica">
            Logged today
          </p>
        </CardContent>
      </Card>

      {/* Top Tasks */}
      {stats.topTasks.length > 0 && (
        <Card className="border-white/20 bg-white/10 backdrop-blur-xl md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-white font-playfair flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-yellow-400" />
              Top Tasks by Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.topTasks.map((task, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-white text-xs font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-white font-medium font-helvetica truncate max-w-32">
                        {task.task}
                      </div>
                    </div>
                  </div>
                  <div className="text-white/80 text-sm font-helvetica">
                    {formatMinutes(task.minutes)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};